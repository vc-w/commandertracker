from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import requests
import re
from pathlib import Path

# -----------------------
# Database setup
# -----------------------
DB_PATH = Path("db/site.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI()

# -----------------------
# Models
# -----------------------
class PlayerCreate(BaseModel):
    name: str

class CommanderCreate(BaseModel):
    url: str

class PlayerMatchEntry(BaseModel):
    player_id: int
    commander_uuid: str
    place: int
    notes: str = ""
    hate_player_id: Optional[int] = None

class MatchCreate(BaseModel):
    players: List[PlayerMatchEntry]

# -----------------------
# Players endpoints
# -----------------------
@app.get("/api/players")
def get_players():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS Player (PlayerID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)")
    cur.execute("SELECT PlayerID, Name FROM Player ORDER BY Name")
    players = [{"PlayerID": row[0], "Name": row[1]} for row in cur.fetchall()]
    conn.close()
    return players

@app.post("/api/players")
def add_player(player: PlayerCreate):
    if not player.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be blank")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO Player (Name) VALUES (?)", (player.name.strip(),))
    conn.commit()
    player_id = cur.lastrowid
    conn.close()
    return {"PlayerID": player_id, "Name": player.name.strip()}

# -----------------------
# Commanders endpoints
# -----------------------
@app.get("/api/commanders")
def get_commanders():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """CREATE TABLE IF NOT EXISTS Commanders (
            UUID TEXT PRIMARY KEY,
            Name TEXT NOT NULL,
            CIDentity TEXT,
            mana TEXT,
            ScryfallURI TEXT NOT NULL
        )"""
    )
    cur.execute("SELECT UUID, Name, CIDentity, mana, ScryfallURI FROM Commanders ORDER BY Name")
    data = []
    for row in cur.fetchall():
        # Count usage in PlayerMatch
        cur2 = conn.cursor()
        cur2.execute("CREATE TABLE IF NOT EXISTS PlayerMatch (GameNumber INTEGER, PlayerID INTEGER, CommanderUUID TEXT, Place INTEGER)")
        cur2.execute("SELECT COUNT(*) FROM PlayerMatch WHERE CommanderUUID=?", (row[0],))
        usage_count = cur2.fetchone()[0] or 0
        data.append({
            "uuid": row[0],
            "name": row[1],
            "cidentity": row[2],
            "mana": row[3],
            "scryfall_uri": row[4],
            "usage_count": usage_count
        })
    conn.close()
    return data

@app.post("/api/commanders")
def add_commander(commander: CommanderCreate):
    scryfall_url = commander.url.strip()
    if not scryfall_url:
        raise HTTPException(status_code=400, detail="No URL provided")

    # Extract set code and collector number
    match = re.search(r"/card/([a-z0-9]+)/(\d+)/", scryfall_url, re.IGNORECASE)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid Scryfall card URL")

    set_code, collector_number = match.groups()
    api_url = f"https://api.scryfall.com/cards/{set_code}/{collector_number}"

    try:
        resp = requests.get(api_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Card not found")
        card_data = resp.json()

        uuid = card_data["id"]
        name = card_data["name"]
        cidentity = "".join(card_data.get("color_identity", []))

        # --- Fix mana cost for double-faced cards ---
        mana = card_data.get("mana_cost")
        if not mana and "card_faces" in card_data:
            mana = card_data["card_faces"][0].get("mana_cost", "")
        if not mana:
            mana = ""  # fallback

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(
            """CREATE TABLE IF NOT EXISTS Commanders (
                UUID TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                CIDentity TEXT,
                mana TEXT,
                ScryfallURI TEXT NOT NULL
            )"""
        )
        cur.execute(
            "INSERT OR IGNORE INTO Commanders (UUID, Name, CIDentity, mana, ScryfallURI) VALUES (?, ?, ?, ?, ?)",
            (uuid, name, cidentity, mana, scryfall_url)
        )
        conn.commit()
        conn.close()

        return {
            "uuid": uuid,
            "name": name,
            "cidentity": cidentity,
            "mana": mana,
            "scryfall_uri": scryfall_url
        }

    except requests.exceptions.RequestException:
        raise HTTPException(status_code=500, detail="Error fetching Scryfall data")


# -----------------------
# Matches endpoint
# -----------------------
@app.post("/api/matches")
def create_match(match: MatchCreate):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS Matches (
            GameNumber INTEGER PRIMARY KEY AUTOINCREMENT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS PlayerMatch (
            GameNumber INTEGER,
            PlayerID INTEGER,
            CommanderUUID TEXT,
            Place INTEGER,
            Notes TEXT DEFAULT "",
            HatePlayerID INTEGER DEFAULT NULL,
            PRIMARY KEY (GameNumber, PlayerID, CommanderUUID),
            FOREIGN KEY (GameNumber) REFERENCES Matches(GameNumber) ON DELETE CASCADE,
            FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
            FOREIGN KEY (CommanderUUID) REFERENCES Commanders(UUID) ON DELETE CASCADE,
            FOREIGN KEY (HatePlayerID) REFERENCES Player(PlayerID)
        )
    """)

    # Create a new match
    cur.execute("INSERT INTO Matches DEFAULT VALUES")
    game_number = cur.lastrowid

    for entry in match.players:
        cur.execute("""
            INSERT INTO PlayerMatch (GameNumber, PlayerID, CommanderUUID, Place, Notes, HatePlayerID)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (game_number, entry.player_id, entry.commander_uuid, entry.place, entry.notes, entry.hate_player_id))

    conn.commit()
    conn.close()

    return {"game_number": game_number, "players_added": len(match.players)}


@app.get("/api/matches")
def get_matches():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Ensure tables exist
    cur.execute("CREATE TABLE IF NOT EXISTS Matches (GameNumber INTEGER PRIMARY KEY AUTOINCREMENT, Notes TEXT)")
    cur.execute("""CREATE TABLE IF NOT EXISTS PlayerMatch (
        GameNumber INTEGER NOT NULL,
        PlayerID INTEGER NOT NULL,
        CommanderUUID TEXT NOT NULL,
        Place INTEGER,
        FOREIGN KEY(GameNumber) REFERENCES Matches(GameNumber),
        FOREIGN KEY(PlayerID) REFERENCES Player(PlayerID),
        FOREIGN KEY(CommanderUUID) REFERENCES Commanders(UUID)
    )""")

    # Query matches and join to Player + Commander
    cur.execute("""
        SELECT m.GameNumber, m.Notes, p.Name, c.Name, pm.Place
        FROM Matches m
        JOIN PlayerMatch pm ON m.GameNumber = pm.GameNumber
        JOIN Player p ON pm.PlayerID = p.PlayerID
        JOIN Commanders c ON pm.CommanderUUID = c.UUID
        ORDER BY m.GameNumber ASC, pm.Place ASC
    """)

    rows = cur.fetchall()
    conn.close()

    results = {}
    for game_number, notes, player_name, commander_name, place in rows:
        if game_number not in results:
            results[game_number] = {"id": game_number, "notes": notes, "players": []}
        results[game_number]["players"].append({
            "player_name": player_name,
            "commander_name": commander_name,
            "place": place
        })

    return list(results.values())

@app.post("/api/matches/edit")
def edit_match(data: dict):
    game_number = data.get("game_number")
    player_id = data.get("player_id")
    place = data.get("place")

    if not all([game_number, player_id, place]):
        raise HTTPException(status_code=400, detail="Missing fields")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE PlayerMatch SET Place=? WHERE GameNumber=? AND PlayerID=?",
        (place, game_number, player_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}


# -----------------------
# Mount static files last
# -----------------------
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")