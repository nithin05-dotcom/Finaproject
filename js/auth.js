function login() {
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!role || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  fetch("https://evidence-backend.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role, email, password })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      return res.json();
    })
    .then(data => {
      // save role
      sessionStorage.setItem("role", data.role);

      // redirect based on role
      if (data.role === "police") {
        window.location.href = "police.html";
      } else if (data.role === "court") {
        window.location.href = "court.html";
      }
    })
    .catch(err => {
      alert(err.message);
    });
}
