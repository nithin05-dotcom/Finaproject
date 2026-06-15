const BACKEND_ORIGIN = "https://finaproject-backend.onrender.com";

function backendUrl(path) {
  return BACKEND_ORIGIN + path;
}

fetch(backendUrl("/cases"))
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("policeTable");
    table.innerHTML = "";

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
  });