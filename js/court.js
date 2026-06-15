/* ---------- UPDATE STATUS ---------- */
function updateStatus(caseId, status) {
  console.log("Updating case status", { caseId, status });

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
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Status updated successfully");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to update status");
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
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Case cleared successfully");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to clear case");
    });
}