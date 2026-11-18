/* Page d'inscription : crée le compte puis connecte directement l'utilisateur */

renderNavbar("register");

if (Auth.getUser()) {
  window.location.href = "index.html";
}

const form = document.getElementById("register-form");
const alertBox = document.getElementById("alert");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert(alertBox);
  submitBtn.disabled = true;

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await api("/auth/register", {
      method: "POST",
      auth: false,
      body: { username, email, password },
    });

    // Connexion automatique avec les mêmes identifiants
    const data = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: { username, password },
    });
    Auth.setToken(data.token);
    window.location.href = "index.html";
  } catch (err) {
    showAlert(alertBox, err.message);
    submitBtn.disabled = false;
  }
});
