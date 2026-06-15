const BACKEND_ORIGIN = "http://127.0.0.1:5000"; // Match Court Panel backend
function backendUrl(path) {
  try {
    if (window.location.protocol === "file:") return BACKEND_ORIGIN + path;
    if (window.location.origin !== BACKEND_ORIGIN) return BACKEND_ORIGIN + path;
  } catch (e) {
    return BACKEND_ORIGIN + path;
  }
  return path;
}

function uploadEvidence() {
  const caseId = document.getElementById("caseId").value.trim();
  const file = document.getElementById("file").files[0];

  if (!caseId || !file) {
    alert("Please enter Case ID and select a file");
    return;
  }

  console.log("Uploading evidence", { caseId, fileName: file.name });

  const formData = new FormData();
  formData.append("caseId", caseId);
  formData.append("file", file);

  const url = backendUrl("/upload");
  console.log("Upload URL", { url });

  fetch(url, {
    method: "POST",
    body: formData
  })
    .then(async res => {
      const text = await res.text();
      console.log("Upload response", { status: res.status, statusText: res.statusText, body: text });

      if (!res.ok) {
        let message = "Upload failed.";
        try {
          const json = JSON.parse(text || "{}");
          message = json.message || json.error || message;
        } catch (e) {
          if (text) message = text;
        }
        throw new Error(message);
      }

      let data = {};
      try {
        data = JSON.parse(text || "{}");
      } catch (e) {
        console.warn("Upload response is not valid JSON", e);
      }

      alert(
        "Evidence uploaded successfully!\n\n" +
        "File: " + (data.fileName || file.name) + "\n" +
        "IPFS Hash: " + (data.ipfsHash || data.hash || "Saved successfully")
      );

      document.getElementById("caseId").value = "";
      document.getElementById("file").value = "";

      // Redirect to Court Panel to see the newly uploaded case
      console.log("Redirecting to Court Panel...");
      setTimeout(() => {
        window.location.href = "court.html";
      }, 500);
    })
    .catch(err => {
      console.error("Upload error", err);
      alert("Evidence upload failed: " + err.message);
    });
}
