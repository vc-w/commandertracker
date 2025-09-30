from pathlib import Path
import sqlite3

# Path inside container
DB_PATH = Path(__file__).parent / "db" / "site.db"

# Ensure folder exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    # Create tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS Matches (
        GameNumber INTEGER PRIMARY KEY AUTOINCREMENT,
        Notes TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS Player (
        PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS Commanders (
        UUID TEXT PRIMARY KEY,
        Name TEXT NOT NULL,
        CIDentity TEXT,
        mana TEXT,
        ScryfallURI TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS PlayerMatch (
        GameNumber INTEGER,
        PlayerID INTEGER,
        CommanderUUID TEXT,
        Place INTEGER,
        PRIMARY KEY (GameNumber, PlayerID, CommanderUUID),
        FOREIGN KEY (GameNumber) REFERENCES Matches(GameNumber) ON DELETE CASCADE,
        FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
        FOREIGN KEY (CommanderUUID) REFERENCES Commanders(UUID) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()
    print("Database initialized at", DB_PATH)

if __name__ == "__main__":
    init_db()
