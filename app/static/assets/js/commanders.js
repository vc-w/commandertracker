document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("commanderInput");
    const btn = document.getElementById("createCommanderBtn");
    const tableBody = document.querySelector("#commanderTable tbody");

    async function loadCommanders() {
        const res = await fetch("/api/commanders");
        const data = await res.json();
        tableBody.innerHTML = "";
        data.forEach(c => {
            const row = `<tr>
                <td>${c.name}</td>
                <td>${c.mana || ""}</td>
                <td>${c.cidentity || ""}</td>
                <td>${c.usage_count || 0}</td>
                <td><a href="${c.scryfall_uri}" target="_blank">Link</a></td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    btn.addEventListener("click", async () => {
        const url = input.value.trim();
        if (!url) return;

        const res = await fetch("/api/commanders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        if (res.ok) {
            await loadCommanders();
            input.value = "";
        } else {
            const err = await res.json();
            alert(err.error || "Failed to add commander");
        }
    });

    loadCommanders();
});
