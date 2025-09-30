document.addEventListener("DOMContentLoaded", async () => {
    const tableElement = document.getElementById("matchesTable");

    // Fetch matches data
    async function loadMatches() {
        try {
            const res = await fetch("/api/matches");
            if (!res.ok) throw new Error("Failed to fetch matches");
            const data = await res.json();

            // Clear existing table body
            const tbody = tableElement.querySelector("tbody");
            tbody.innerHTML = "";

            data.forEach(match => {
                match.players.forEach(player => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${match.id}</td>
                        <td>${player.player_name}</td>
                        <td>${player.commander_name}</td>
                        <td contenteditable="true" class="editable-place">${player.place}</td>
                        <td>${match.notes || ""}</td>
                    `;

                    tbody.appendChild(tr);
                });
            });

            initDataTable(); // Initialize DataTable after data load
        } catch (err) {
            console.error("Error loading matches:", err);
        }
    }

    // Initialize DataTable with export buttons
    function initDataTable() {
        $(tableElement).DataTable({
            destroy: true, // reinitialize if already exists
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
            columnDefs: [
                { targets: [3], className: "dt-center" } // Center Place column
            ]
        });

        // Inline editing
        tableElement.querySelectorAll(".editable-place").forEach(cell => {
            cell.addEventListener("blur", async () => {
                const newPlace = cell.textContent.trim();
                const row = cell.closest("tr");
                const gameId = row.cells[0].textContent;
                const playerName = row.cells[1].textContent;

                // Find PlayerID from playerName
                const playersRes = await fetch("/api/players");
                const players = await playersRes.json();
                const playerObj = players.find(p => p.Name === playerName);
                if (!playerObj) return;

                try {
                    const res = await fetch("/api/matches/edit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            game_number: parseInt(gameId),
                            player_id: playerObj.PlayerID,
                            place: parseInt(newPlace)
                        })
                    });
                    if (!res.ok) throw new Error("Failed to update place");
                } catch (err) {
                    console.error("Error updating place:", err);
                }
            });
        });
    }

    await loadMatches();
});
