const BACKEND_ORIGIN = "https://finaproject-backend.onrender.com";

function backendUrl(path) {
  return BACKEND_ORIGIN + path;
}

fetch(backendUrl("/cases"))
  .then(async res => {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || "Failed to fetch cases");
    }
    return JSON.parse(text || "[]");
  })
  .then(data => {
    const table = document.getElementById("policeTable");
    
    if (!table) {
      console.error("policeTable element not found");
      return;
    }
    
    table.innerHTML = "";

    if (!data || data.length === 0) {
      table.innerHTML = "<tr><td colspan='2'>No cases found</td></tr>";
      return;
    }

    data.forEach(c => {
      table.innerHTML += `
        <tr>
          <td>${c.caseId}</td>
          <td>${c.status}</td>
        </tr>
      `;
    });
  })
  .catch(err => {
    console.error("Error loading cases:", err);
    const table = document.getElementById("policeTable");
    if (table) {
      table.innerHTML = "<tr><td colspan='2'>Failed to load cases</td></tr>";
    }
  });