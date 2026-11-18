/* Page de connexion */

renderNavbar("login");

if (Auth.getUser()) {
  window.location.href = "index.html";
}

const form = document.getElementById("login-form");
const alertBox = document.getElementById("alert");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert(alertBox);
  submitBtn.disabled = true;

  try {
    const data = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value,
      },
    });
    Auth.setToken(data.token);
    window.location.href = "index.html";
  } catch (err) {
    showAlert(alertBox, err.message);
    submitBtn.disabled = false;
  }
});
