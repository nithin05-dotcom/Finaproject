const BACKEND_ORIGIN = "http://127.0.0.1:5000";
function backendUrl(path) {
  try {
    if (window.location.protocol === "file:") return BACKEND_ORIGIN + path;
    if (window.location.origin !== BACKEND_ORIGIN) return BACKEND_ORIGIN + path;
  } catch (e) {
    return BACKEND_ORIGIN + path;
  }
  return path;
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
  });
