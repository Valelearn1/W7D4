// Mini-libreria — Settimana VII Giorno I
//
// Devi fare 4 cose:
// 1. Definire una classe Libro (titolo, autore, anno, letto)
// 2. Definire una classe LibroDigitale che estende Libro (aggiunge formato, dimensioneMb)
// 3. Aggiungere un listener al form che crea una nuova istanza e la aggiunge all'array
// 4. Renderizzare la lista nel <ul id="lista-libri"> via innerHTML
//
// Bonus: bottone "Segna come letto" su ogni elemento, gestito con event delegation.

// === Classi ===
class Libro {
  static contatore = 0;
  constructor(_titolo, _autore, _anno, _letto) {
    this.id = Libro.contatore++;
    this.titolo = _titolo;
    this.autore = _autore;
    this.anno = _anno;
    this.letto = false;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    this.type = "cartaceo";
  }
}

class LibroDigitale extends Libro {
  constructor(_titolo, _autore, _anno, _letto, _formato, _dimensioneMb) {
    super(_titolo, _autore, _anno, _letto);
    this.formato = _formato;
    this.dimensioneMb = _dimensioneMb;
  }

  formato() {
    // per fare override
    this.type = `digitale (${this.dimensioneMb} MB)`;
  }
}

// === Stato (array di libri) ===
const STORAGE_KEY = "libri";

let libri = caricaLibri(); // deve essere let perché "Svuota tutto" ricrea l'array - carica i libri salvati nel localStorage

// === Render ===
function renderLibri() {
  const ul = document.getElementById("lista-libri"); // creare la "libreria"
  ul.innerHTML = ""; // per svuotare il contenuto, per partire "puliti"

  const contatore = document.getElementById("contatore");
  contatore.textContent = libri.length;

  libri.forEach((libro) => {
    const li = document.createElement("li");
    li.classList.add("card-libro");
    li.classList.toggle("letto", libro.letto); // aggiunge classe "letto" se il libro è letto
    li.dataset.id = libro.id;

    // colonna sinistra: titolo + formato + autore/anno
    const info = document.createElement("div");

    const riga1 = document.createElement("div");
    riga1.classList.add("card-riga1");

    const titolo = document.createElement("strong");
    titolo.textContent = libro.titolo;

    const badge = document.createElement("span");
    badge.classList.add("badge");
    if (libro instanceof LibroDigitale) {
      badge.textContent = `digitale (${libro.dimensioneMb} MB)`;
    } else {
      badge.textContent = "cartaceo";
    }

    riga1.appendChild(titolo);
    riga1.appendChild(badge);

    const riga2 = document.createElement("div");
    riga2.classList.add("card-riga2");
    riga2.textContent = `${libro.autore} — ${libro.anno}`;

    info.appendChild(riga1);
    info.appendChild(riga2);

    // colonna destra: stato o bottone
    const azione = document.createElement("div");
    const stato = document.createElement("span");
    const bottone = document.createElement("button");
    const bottoneRimuovi = document.createElement("button");

    if (libro.letto) {
      stato.classList.add("stato-letto");
      stato.textContent = "✓ letto";
      bottoneRimuovi.dataset.azione = "rimuovi";
      bottoneRimuovi.classList.add("btn-rimuovi");
      bottoneRimuovi.textContent = "Rimuovi";
      azione.appendChild(stato);
      azione.appendChild(bottoneRimuovi);
    } else {
      bottone.textContent = "Segna come letto";
      bottone.classList.add("btn-letto");
      bottone.dataset.azione = "leggi";
      bottoneRimuovi.dataset.azione = "rimuovi";
      bottoneRimuovi.classList.add("btn-rimuovi");
      bottoneRimuovi.textContent = "Rimuovi";
      azione.appendChild(bottone);
      azione.appendChild(bottoneRimuovi);
    }

    li.appendChild(info);
    li.appendChild(azione);
    ul.appendChild(li);
  });
}

renderLibri();

// === Eventi ===

const ul = document.getElementById("lista-libri"); // trova la lista

ul.addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]"); // hai cliccato il bottone "Segna come letto"?
  const azione = bottone.dataset.azione;
  const card = bottone.closest("li"); // risali al <li> che contiene il bottone
  const id = parseInt(card.dataset.id); // leggi l'id del libro da data-id

  if (azione === "leggi") {
    const libro = libri.find((l) => l.id === id); // trova il libro nell'array con quell'id;
    libro.segnaComeLetto(); // segna il libro come letto
  } else if (azione === "rimuovi") {
    const arrayLibriFiltrato = libri.filter((l) => {
      // crea una copia dell'array Libri. rimuovendo l'id che non mi serve
      // prendo tutti i libri che non hanno quell'id
      return l.id !== id;
    });
    libri = arrayLibriFiltrato; // riassegniamo l'array "libri" x andare a salvare salvaLibri nello storage
  }

  salvaLibri(); // per salvare al click
  renderLibri(); // ridisegna la lista per mostrare la spunta aggiornata
});

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const saveData = localStorage.getItem(STORAGE_KEY);
  if (saveData === null) {
    return [];
  } else {
    return JSON.parse(saveData).map((d) => {
      let l;
      if (d.dimensioneMb !== undefined) {
        l = new LibroDigitale(
          d.titolo,
          d.autore,
          d.anno,
          d.letto,
          d.formato,
          d.dimensioneMb,
        );
      } else {
        l = new Libro(d.titolo, d.autore, d.anno, d.letto);
      }
      l.id = d.id;
      l.letto = d.letto;
      return l;
    });
  }
}

const svuotaListener = document.getElementById("svuota-tutto");
svuotaListener.addEventListener("click", (e) => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
});

const bottoneEsporta = document.getElementById("esporta");
bottoneEsporta.addEventListener("click", (e) => {
  window.open(
    "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(libri)),
  );
});

function mostraSpinner() {
  document.getElementById("spinner").classList.remove("hidden");
  document.getElementById("errore").classList.add("hidden");
}

function nascondiSpinner() {
  document.getElementById("spinner").classList.add("hidden");
}

function mostraErrore(msg) {
  document.getElementById("errore").textContent = msg;
  document.getElementById("errore").classList.remove("hidden");
}

async function cerca() {
  mostraSpinner();
  const url = `https://openlibrary.org/search.json?q=${inputCerca.value}&limit=10`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Errore HTTP " + response.status);
    }
    const dati = await response.json();
    renderRisultati(dati.docs);
  } catch (err) {
    mostraErrore("Impossibile completare la ricerca: " + err.message);
  } finally {
    nascondiSpinner();
  }
}

function renderRisultati(docs) {
  if (docs.length === 0) {
    const ul = document.getElementById("risultati");
    const newLi = document.createElement("li");
    newLi.classList.add("info");
    newLi.textContent = "Nessun risultato.";

    ul.appendChild(newLi);
  } else {
    docs.forEach((doc) => {
      const ul = document.getElementById("risultati");
      const newLi = document.createElement("li");

      const titolo = doc.title;
      const autore =
        doc.author_name && doc.author_name[0]
          ? doc.author_name[0]
          : "Autore sconosciuto";
      // se author_name esiste e il primo elemento dell'array esiste,
      // allora usa quel primo elemento, altrimenti scrivi Autore sconosciuto

      const anno = doc.first_publish_year ? doc.first_publish_year : "?"; // se first_publish_year esiste, usalo, altrimenti metti ?

      const spanTitolo = document.createElement("span");
      spanTitolo.classList.add("titolo");
      spanTitolo.textContent = `${titolo}`;

      const meta = document.createElement("div");
      meta.classList.add("meta");
      meta.textContent = `${autore} - ${anno}`;

      const btnData = document.createElement("button");
      btnData.dataset.titolo = titolo;
      btnData.dataset.autore = autore;
      btnData.dataset.anno = anno;
      btnData.textContent = "Aggiungi";

      newLi.appendChild(spanTitolo);
      newLi.appendChild(meta);
      newLi.appendChild(btnData);
      ul.appendChild(newLi);
    });
  }
}

let timeoutId; // variabile per il debounce

const inputCerca = document.getElementById("cerca");
inputCerca.addEventListener("input", (e) => {
  const query = e.target.value.trim(); // per salvare trim, bisogna assegnarlo a una variabile
  if (query.length < 3) {
    document.getElementById("risultati").innerHTML = "";
    return;
  } else {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => cerca(query), 400);
  }
});

const ulRisultati = document.getElementById("risultati");
ulRisultati.addEventListener("click", (e) => {
  const bottone = e.target.closest("button[data-titolo]");
  if (!bottone) {
    return;
  }

  const titolo = bottone.dataset.titolo;
  const autore = bottone.dataset.autore;
  const anno = parseInt(bottone.dataset.anno);

  const newBook = new Libro(titolo, autore, anno, false);
  libri.push(newBook);
  salvaLibri();
  renderLibri();

  bottone.textContent = "✓ Aggiunto";
  bottone.setAttribute("disabled", "");
});

fetch("https://dummyjson.com/test")
  .then((res) => res.json())
  .then(console.log);

function getToken() {
  return localStorage.getItem("auth.token"); // la funzione legge il valore e lo restituisce
}

// getUtente() ritorna l'oggetto utente oppure null se non esiste.
function getUtente() {
  return JSON.parse(localStorage.getItem("auth.user"));
}

// logout non deve ritornare nulla, no "return" needed.
function logout() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.user");
  document.getElementById("profilo-section").classList.add("hidden"); // Nascondere la sezione profilo
}

async function login(username, password) {
  try {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // Include cookies (e.g., accessToken) in the request
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
    btn.id = "btn-logout"; // creazione id
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
    box.innerHTML = ""; // svuota prima di aggiungere, così se renderAuthBox() viene chiamata più volte non accumula elementi duplicati.
    box.appendChild(form);
  }
}

async function gestisciLogin(e) {
  e.preventDefault();

  // legge i valori dai due input
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    await login(username, password); // login deve finire prima (serve il token)

    const [profilo, ricerca] = await Promise.all([
      caricaProfilo(), // parte
      cerca("harari"), // parte contemporaneamente
    ]);
    renderAuthBox();
    mostraProfilo();
  } catch (err) {
    // se login fallisce (credenziali errate, rete, ecc.) mostra l'errore
    alert(err.message);
  }
}

async function mostraProfilo() {
  if (!getToken()) {
    return;
  }
  try {
    const profilo = await caricaProfilo();

    // inserisce immagine e dati testuali nel div #profilo
    document.getElementById("profilo").innerHTML = `
      <img src="${profilo.image}">
      <div class="info">
        <p><strong>${profilo.firstName} ${profilo.lastName}</strong></p>
        <p>@${profilo.username} - ${profilo.email}</p>
      </div>
    `;

    // rende visibile la sezione profilo (rimuove l'attributo hidden)
    document.getElementById("profilo-section").removeAttribute("hidden");
  } catch (err) {
    console.error(err);
  }
}

async function avvio() {
  renderLibri(); // disegna la lista libri
  renderAuthBox(); // mostra login o saluto in base allo stato
  await mostraProfilo(); // se già loggato, mostra subito il profilo
}

avvio();
