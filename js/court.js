const BACKEND_ORIGIN = "https://finaproject-backend.onrender.com";

function backendUrl(path) {
  return BACKEND_ORIGIN + path;
}

function loadCases() {
  console.log("Loading court cases...");

  fetch(backendUrl("/cases"))
    .then(async res => {
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Failed to fetch cases");
      }

      return JSON.parse(text || "[]");
    })
    .then(data => {
      const table = document.getElementById("caseTable");

      if (!table) {
        console.error("caseTable not found");
        return;
      }

      table.innerHTML = "";

      if (!data || data.length === 0) {
        table.innerHTML =
          "<tr><td colspan='4'>No cases available</td></tr>";
        return;
      }

      data.forEach(c => {
        const statusClass = c.status
          ? c.status.toLowerCase()
          : "pending";

        table.innerHTML += `
          <tr>
            <td>${c.caseId}</td>

            <td>
              <a href="https://gateway.pinata.cloud/ipfs/${c.ipfsHash}"
                 target="_blank">
                 View Evidence
              </a>
            </td>

            <td>
              <span class="status ${statusClass}">
                ${c.status}
              </span>
            </td>

            <td>
              <button class="btn-approve"
                onclick="updateStatus('${c.caseId}','Approved')">
                Approve
              </button>

              <button class="btn-reject"
                onclick="updateStatus('${c.caseId}','Rejected')">
                Reject
              </button>

              <button class="btn-clear"
                onclick="clearCase('${c.caseId}')">
                Clear
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error("Load cases error:", err);

      const table = document.getElementById("caseTable");

      if (table) {
        table.innerHTML =
          "<tr><td colspan='4'>Failed to load cases</td></tr>";
      }
    });
}

/* ---------- UPDATE STATUS ---------- */
function updateStatus(caseId, status) {
  fetch(backendUrl("/update-status"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      caseId,
      status
    })
  })
    .then(async res => {
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Failed to update status");
      }

      return text ? JSON.parse(text) : {};
    })
    .then(data => {
      alert(data.message || "Status updated successfully");
      loadCases();
    })
    .catch(err => {
      console.error(err);
      alert("Error: " + err.message);
    });
}

/* ---------- CLEAR CASE ---------- */
function clearCase(caseId) {
  if (!confirm("Are you sure you want to clear this case?")) {
    return;
  }

  fetch(backendUrl("/case/delete"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      caseId
    })
  })
    .then(async res => {
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Failed to clear case");
      }

      return text ? JSON.parse(text) : {};
    })
    .then(data => {
      alert(data.message || "Case cleared successfully");
      loadCases();
    })
    .catch(err => {
      console.error(err);
      alert("Error: " + err.message);
    });
}

loadCases();