document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("playerNameInput");
    const btn = document.getElementById("createPlayerBtn");
    const tableBody = document.querySelector("#playersTable tbody");

    // Load all players from the API and populate the table
    async function loadPlayers() {
        try {
            const response = await fetch("/api/players", { cache: "no-store" });
            if (!response.ok) {
                console.error("Failed to fetch players:", response.status);
                return;
            }

            const players = await response.json();
            console.log("Fetched players:", players); // debug

            tableBody.innerHTML = ""; // clear old rows

            players.forEach(player => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = player.Name;
            });
        } catch (err) {
            console.error("Error loading players:", err);
        }
    }

    // Add a new player via the API
    async function addPlayer() {
        const playerName = input.value.trim();
        if (!playerName) {
            alert("Please enter a player name");
            return;
        }

        try {
            const response = await fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: playerName })
            });

            if (!response.ok) {
                const err = await response.json();
                alert("Error adding player: " + (err.detail || response.status));
                return;
            }

            const newPlayer = await response.json();
            // Add to table immediately
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = newPlayer.name;

            input.value = ""; // clear input
        } catch (err) {
            console.error("Error creating player:", err);
        }
    }

    // Bind button click
    btn.addEventListener("click", addPlayer);

    // Initial load
    loadPlayers();
});
