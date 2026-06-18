// === Auth helpers ===

function getToken() {
  return localStorage.getItem("auth.token");
}

function getUtente() {
  return JSON.parse(localStorage.getItem("auth.user"));
}

function logout() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.user");
  document.getElementById("profilo-section").classList.add("hidden");
}

async function login(username, password) {
  try {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const dati = await response.json();
    if (!response.ok) {
      throw new Error("Credenziali non valide");
    }
    localStorage.setItem("auth.token", dati.accessToken);
    localStorage.setItem("auth.user", JSON.stringify(dati));
  } catch (err) {
    throw err;
  }
}

async function caricaProfilo() {
  const token = getToken();
  if (!token) {
    return null;
  }
  const response = await fetch("https://dummyjson.com/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Sessione scaduta");
  }
  return response.json();
}

function renderAuthBox() {
  const utente = getUtente();
  if (utente) {
    const span = document.createElement("span");
    span.classList.add("saluto");
    span.textContent = `Ciao ${utente.firstName}`;

    const btn = document.createElement("button");
    btn.classList.add("btn-logout");
    btn.id = "btn-logout";
    btn.textContent = "Esci";

    btn.addEventListener("click", (e) => {
      logout();
      renderAuthBox();
    });

    const box = document.getElementById("auth-box");
    box.innerHTML = "";
    box.appendChild(span);
    box.appendChild(btn);
  } else {
    const form = document.createElement("form");
    form.id = "form-login";

    const inputName = document.createElement("input");
    inputName.id = "login-username";
    inputName.value = "emilys";

    const inputPass = document.createElement("input");
    inputPass.id = "login-password";
    inputPass.type = "password";
    inputPass.value = "emilyspass";

    const btnSubmit = document.createElement("button");
    btnSubmit.type = "submit";
    btnSubmit.textContent = "Accedi";

    form.appendChild(inputName);
    form.appendChild(inputPass);
    form.appendChild(btnSubmit);

    form.addEventListener("submit", gestisciLogin);

    const box = document.getElementById("auth-box");
    box.innerHTML = "";
    box.appendChild(form);
  }
}

async function gestisciLogin(e) {
  e.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    await login(username, password);

    const [profilo, ricerca] = await Promise.all([
      caricaProfilo(),
      cerca("harari"),
    ]);
    renderAuthBox();
    mostraProfilo();
  } catch (err) {
    alert(err.message);
  }
}

async function mostraProfilo() {
  if (!getToken()) {
    return;
  }
  try {
    const profilo = await caricaProfilo();

    document.getElementById("profilo").innerHTML = `
      <img src="${profilo.image}">
      <div class="info">
        <p><strong>${profilo.firstName} ${profilo.lastName}</strong></p>
        <p>@${profilo.username} - ${profilo.email}</p>
      </div>
    `;

    document.getElementById("profilo-section").removeAttribute("hidden");
  } catch (err) {
    console.error(err);
  }
}
