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

let libri = caricaLibri();

// === Render ===
function renderLibri() {
  const ul = document.getElementById("lista-libri");
  ul.innerHTML = "";

  const contatore = document.getElementById("contatore");
  contatore.textContent = libri.length;

  libri.forEach((libro) => {
    const li = document.createElement("li");
    li.classList.add("card-libro");
    li.classList.toggle("letto", libro.letto);
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

// === Eventi lista libri ===

const ul = document.getElementById("lista-libri");

ul.addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  const azione = bottone.dataset.azione;
  const card = bottone.closest("li");
  const id = parseInt(card.dataset.id);

  if (azione === "leggi") {
    const libro = libri.find((l) => l.id === id);
    libro.segnaComeLetto();
  } else if (azione === "rimuovi") {
    libri = libri.filter((l) => l.id !== id);
  }

  salvaLibri();
  renderLibri();
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

// === Spinner / Errore ===

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

// === Ricerca Open Library ===

async function cerca(query) {
  mostraSpinner();
  const url = `https://openlibrary.org/search.json?q=${query}&limit=10`;
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

      const anno = doc.first_publish_year ? doc.first_publish_year : "?";

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

let timeoutId;

const inputCerca = document.getElementById("cerca");
inputCerca.addEventListener("input", (e) => {
  const query = e.target.value.trim();
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
