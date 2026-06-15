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