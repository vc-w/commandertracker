document.addEventListener("DOMContentLoaded", () => {
    const playerCountSelect = document.getElementById("playerCount");
    const playerFields = document.getElementById("playerFields");
    const createBtn = document.getElementById("createMatchBtn");

    let playersList = [];
    let commandersList = [];

    // Fetch all players and commanders on page load
    async function loadData() {
        const playersRes = await fetch("/api/players");
        playersList = await playersRes.json();
        playersList.sort((a, b) => a.Name.localeCompare(b.Name));

        const commandersRes = await fetch("/api/commanders");
        commandersList = await commandersRes.json();
        commandersList.sort((a, b) => a.name.localeCompare(b.name));
    }

    loadData();

    createBtn.addEventListener("click", async () => {
        const rows = playerFields.querySelectorAll("div.player-row");
        if (!rows.length) {
            alert("Select number of players first.");
            return;
        }

        const players = [];
        rows.forEach(row => {
            const selects = row.querySelectorAll("select");
            const textareas = row.querySelectorAll("textarea");

            const player_id = parseInt(selects[0].value);
            const commander_uuid = selects[1].value;
            const place = parseInt(selects[2].value);
            const notes = textareas[0].value.trim();

            let hate_player_id = selects[3].value;
            if (!hate_player_id || hate_player_id === "") {
                hate_player_id = null;
            } else {
                hate_player_id = parseInt(hate_player_id);
            }

            players.push({ player_id, commander_uuid, place, notes, hate_player_id });
        });

        const res = await fetch("/api/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Match #${data.game_number} created with ${data.players_added} players`);
            // Reset form
            playerFields.innerHTML = "";
            playerCountSelect.value = "";
        } else {
            const errText = await res.text();
            alert(errText || "Failed to create match");
        }
    });

    function buildPlayerRows(count) {
        playerFields.innerHTML = "";
        if (!count) return;

        // --- Header row ---
        const headerRow = document.createElement("div");
        headerRow.className = "row mb-2 fw-bold align-items-center";

        const labelHeader = document.createElement("div");
        labelHeader.className = "col-auto";
        labelHeader.textContent = "";
        headerRow.appendChild(labelHeader);

        const playerHeader = document.createElement("div");
        playerHeader.className = "col";
        playerHeader.textContent = "Player Name";
        headerRow.appendChild(playerHeader);

        const commanderHeader = document.createElement("div");
        commanderHeader.className = "col";
        commanderHeader.textContent = "Commander";
        headerRow.appendChild(commanderHeader);

        const placeHeader = document.createElement("div");
        placeHeader.className = "col";
        placeHeader.textContent = "Place";
        headerRow.appendChild(placeHeader);

        const notesHeader = document.createElement("div");
        notesHeader.className = "col";
        notesHeader.textContent = "Notes";
        headerRow.appendChild(notesHeader);

        const hateHeader = document.createElement("div");
        hateHeader.className = "col";
        hateHeader.textContent = "Hate";
        headerRow.appendChild(hateHeader);

        playerFields.appendChild(headerRow);

        // --- Player rows ---
        for (let i = 1; i <= count; i++) {
            const row = document.createElement("div");
            row.className = "mb-3 row align-items-center player-row";

            // Player # label
            const playerLabel = document.createElement("div");
            playerLabel.className = "col-auto fw-bold me-2";
            playerLabel.textContent = `Player ${i}:`;
            row.appendChild(playerLabel);

            // Player dropdown
            const playerSelectWrapper = document.createElement("div");
            playerSelectWrapper.className = "col me-2";
            const playerSelect = document.createElement("select");
            playerSelect.className = "form-select";
            playersList.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.PlayerID;
                opt.textContent = p.Name;
                playerSelect.appendChild(opt);
            });
            playerSelectWrapper.appendChild(playerSelect);
            row.appendChild(playerSelectWrapper);

            // Commander dropdown
            const commanderSelectWrapper = document.createElement("div");
            commanderSelectWrapper.className = "col me-2";
            const commanderSelect = document.createElement("select");
            commanderSelect.className = "form-select";
            commandersList.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.uuid;
                opt.textContent = c.name;
                commanderSelect.appendChild(opt);
            });
            commanderSelectWrapper.appendChild(commanderSelect);
            row.appendChild(commanderSelectWrapper);

            // Place dropdown
            const placeSelectWrapper = document.createElement("div");
            placeSelectWrapper.className = "col me-2";
            const placeSelect = document.createElement("select");
            placeSelect.className = "form-select";
            for (let p = 1; p <= count; p++) {
                const opt = document.createElement("option");
                opt.value = p;
                opt.textContent = p;
                if (p === i) {   // 👈 Default to this row's player number
                    opt.selected = true;
                }
                placeSelect.appendChild(opt);
            }
            placeSelectWrapper.appendChild(placeSelect);
            row.appendChild(placeSelectWrapper);

            // Notes textarea
            const notesWrapper = document.createElement("div");
            notesWrapper.className = "col me-2";
            const notesInput = document.createElement("textarea");
            notesInput.className = "form-control";
            notesInput.rows = 1;
            notesWrapper.appendChild(notesInput);
            row.appendChild(notesWrapper);

            // Hate dropdown
            const hateWrapper = document.createElement("div");
            hateWrapper.className = "col";
            const hateSelect = document.createElement("select");
            hateSelect.className = "form-select";

            // Blank option
            const blankOpt = document.createElement("option");
            blankOpt.value = "";
            blankOpt.textContent = "— None —";
            hateSelect.appendChild(blankOpt);

            playersList.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.PlayerID;
                opt.textContent = p.Name;
                hateSelect.appendChild(opt);
            });

            hateWrapper.appendChild(hateSelect);
            row.appendChild(hateWrapper);

            playerFields.appendChild(row);

            // Separator
            if (i < count) {
                const separator = document.createElement("hr");
                separator.className = "my-2";
                playerFields.appendChild(separator);
            }

            // Apply Choices.js for searchable dropdowns
            new Choices(playerSelect, { searchEnabled: true, shouldSort: false });
            new Choices(commanderSelect, { searchEnabled: true, shouldSort: false });
            new Choices(placeSelect, { searchEnabled: false });
            new Choices(hateSelect, { searchEnabled: true, shouldSort: true });
        }
    }

    // Build rows when dropdown changes
    playerCountSelect.addEventListener("change", () => {
        const count = parseInt(playerCountSelect.value);
        buildPlayerRows(count);
    });

    // Auto-build if value already set on page load
    if (playerCountSelect.value) {
        buildPlayerRows(parseInt(playerCountSelect.value));
    }
});
