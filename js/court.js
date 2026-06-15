const LOCAL_BACKEND_ORIGIN = "http://127.0.0.1:5000"; // local backend for development
const REMOTE_BACKEND_ORIGIN = "https://finaproject-backend.onrender.com"; // deployed backend

function backendUrl(path) {
  try {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const isFile = window.location.protocol === "file:";

    if (isLocalhost || isFile) {
      return LOCAL_BACKEND_ORIGIN + path;
    }
    return REMOTE_BACKEND_ORIGIN + path;
  } catch (e) {
    return LOCAL_BACKEND_ORIGIN + path;
  }
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
      table.innerHTML = "";

      if (!data || data.length === 0) {
        table.innerHTML =
          "<tr><td colspan='4'>No cases available</td></tr>";
        return;
      }

      data.forEach(c => {
        const statusClass = c.status ? c.status.toLowerCase() : "pending";

        table.innerHTML += `
          <tr data-case-id="${c.caseId}">
            <td>${c.caseId}</td>

            <td>
              <a class="view-link"
                 href="https://gateway.pinata.cloud/ipfs/${c.ipfsHash}"
                 target="_blank" rel="noopener noreferrer">
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
                type="button"
                onclick="updateStatus('${c.caseId}', 'Approved')">
                Approve
              </button>

              <button class="btn-reject"
                type="button"
                onclick="updateStatus('${c.caseId}', 'Rejected')">
                Reject
              </button>

              <button class="btn-clear"
                type="button"
                onclick="clearCase('${c.caseId}')">
                Clear
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error("Load cases error", err);
      const table = document.getElementById("caseTable");
      table.innerHTML =
        "<tr><td colspan='4'>Failed to load cases</td></tr>";
    });
}

loadCases();

/* ---------- UPDATE STATUS ---------- */
function updateStatus(caseId, status) {
  console.log("Updating case status", { caseId, status });
  const url = backendUrl("/update-status");
  console.log("Update status - POST", { url, caseId, status });

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ caseId, status })
  })
    .then(async res => {
      const text = await res.text();
      console.log("Update status response", { status: res.status, body: text });

      if (!res.ok) {
        let message = text || "Failed to update status.";
        try {
          const json = JSON.parse(text || "{}");
          message = json.message || json.error || message;
        } catch (e) {
          // ignore parse error
        }
        throw new Error(message);
      }

      let json = {};
      try {
        json = JSON.parse(text || "{}");
      } catch (e) {
        console.warn("Update status response is not valid JSON", e);
      }

      alert(json.message || "Status updated successfully.");
      location.reload();
    })
    .catch(err => {
      console.error("Update status error", err);
      alert("Could not update status: " + err.message);
    });
}

/* ---------- CLEAR CASE ---------- */
async function clearCase(caseId) {
  if (!confirm("Are you sure you want to clear this case?")) return;

  console.log("Clearing case", { caseId });
  const url = backendUrl("/case/delete");
  console.log("Clearing case - POST", { url, caseId });
  const body = JSON.stringify({ caseId });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });

    const text = await res.text();
    console.log("Clear case response", { url, status: res.status, body: text });

    if (!res.ok) {
      let message = text || "Failed to clear the case.";
      try {
        const json = JSON.parse(text || "{}");
        message = json.message || json.error || message;
      } catch (e) {
        // ignore parse error
      }
      throw new Error(message);
    }

    let json = {};
    try {
      json = JSON.parse(text || "{}");
    } catch (e) {
      console.warn("Clear case response is not valid JSON", e);
    }

    alert(json.message || "Case cleared successfully.");
    location.reload();
  } catch (err) {
    console.error("Clear case error", err);
    alert("Could not clear the case: " + err.message + "\nRequest URL: " + url);
  }
}