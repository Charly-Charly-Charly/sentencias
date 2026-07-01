"use strict";

const CONFIG = {
  dataUrl: "./data/sentencias.json",
  allowedProtocols: new Set(["https:", "http:"]),
};

const state = {
  sentencias: [],
  lastFocusedElement: null,
};

const dom = {
  lista: document.getElementById("listaSentencias"),
  contador: document.getElementById("contadorSentencias"),
  modal: document.getElementById("modalSentencia"),
  backdrop: document.getElementById("modalBackdrop"),
  cerrar: document.getElementById("cerrarModal"),
  modalPanel: document.querySelector(".modal-panel"),
  titulo: document.getElementById("modalTitulo"),
  fecha: document.getElementById("modalFecha"),
  descripcion: document.getElementById("modalDescripcion"),
  medida: document.getElementById("modalMedida"),
  parrafo: document.getElementById("modalParrafo"),
  linkSentencia: document.getElementById("linkSentencia"),
  linkRealizado: document.getElementById("linkRealizado"),
  linkPendiente: document.getElementById("linkPendiente"),
  parrafos: document.getElementById("modalParrafos"),
};

document.addEventListener("DOMContentLoaded", iniciar);
dom.cerrar.addEventListener("click", cerrarModal);
dom.backdrop.addEventListener("click", cerrarModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !dom.modal.hidden) {
    cerrarModal();
  }

  if (event.key === "Tab" && !dom.modal.hidden) {
    controlarFocoModal(event);
  }
});

async function iniciar() {
  try {
    const response = await fetch(CONFIG.dataUrl, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("No fue posible cargar el archivo JSON.");
    }

    const data = await response.json();
    state.sentencias = normalizarSentencias(data);
    renderizarListado(state.sentencias);
  } catch (error) {
    mostrarError("No se pudo cargar la información de sentencias.");
  }
}

function normalizarSentencias(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.slice(0, 19).map((item, index) => ({
    id: Number.isInteger(item.id) ? item.id : index + 1,
    nombre: textoSeguro(item.nombre, `Sentencia ${index + 1}`),
    fecha: textoSeguro(item.fecha, "Fecha pendiente"),
    resumen: textoSeguro(item.resumen, "Resumen pendiente de completar."),
    medidaCumplimientoBusqueda: textoSeguro(
      item.medidaCumplimientoBusqueda,
      "Medida de cumplimiento pendiente de completar.",
    ),
    urlSentencia: urlSegura(item.urlSentencia),
    urlDocumentoCumplimientoRealizado: urlSegura(
      item.urlDocumentoCumplimientoRealizado,
    ),
    urlDocumentoCumplimientoPendiente: urlSegura(
      item.urlDocumentoCumplimientoPendiente,
    ),
    parrafos: textoSeguro(item.parrafos, "Párrafos pendientes de completar."),
  }));
}

function renderizarListado(sentencias) {
  limpiarElemento(dom.lista);
  dom.contador.textContent = `${sentencias.length} sentencias`;

  if (sentencias.length === 0) {
    mostrarError("No hay sentencias registradas en el JSON.");
    return;
  }

  const fragment = document.createDocumentFragment();

  sentencias.forEach((sentencia, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--card-index", String(index));

    const top = document.createElement("div");
    top.className = "card-top";

    const titleWrapper = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = sentencia.nombre;

    const date = document.createElement("p");
    date.className = "card-date";
    date.textContent = `Fecha: ${sentencia.fecha}`;

    titleWrapper.append(title, date);

    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = String(sentencia.id).padStart(2, "0");

    top.append(titleWrapper, number);

    const summary = document.createElement("p");
    summary.className = "card-summary";
    summary.textContent = sentencia.resumen;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "card-button";
    openButton.textContent = "Ver detalle";
    openButton.addEventListener("click", () => abrirModal(sentencia.id));

    actions.append(openButton);
    card.append(top, summary, actions);
    fragment.append(card);
  });

  dom.lista.append(fragment);
}

function abrirModal(sentenciaId) {
  const sentencia = state.sentencias.find((item) => item.id === sentenciaId);

  if (!sentencia) {
    return;
  }

  state.lastFocusedElement = document.activeElement;

  dom.titulo.textContent = sentencia.nombre;
  dom.fecha.textContent = `Fecha: ${sentencia.fecha}`;
  dom.descripcion.textContent = sentencia.resumen;
  dom.medida.textContent = sentencia.medidaCumplimientoBusqueda;

  if (dom.parrafo) {
    dom.parrafo.textContent = sentencia.parrafos;
  }

  configurarEnlace(dom.linkSentencia, sentencia.urlSentencia);
  configurarEnlace(
    dom.linkRealizado,
    sentencia.urlDocumentoCumplimientoRealizado,
  );
  configurarEnlace(
    dom.linkPendiente,
    sentencia.urlDocumentoCumplimientoPendiente,
  );

  if (dom.parrafos) {
    dom.parrafos.textContent = sentencia.parrafos;
  }

  dom.backdrop.hidden = false;
  dom.modal.hidden = false;
  document.body.style.overflow = "hidden";
  dom.modalPanel.focus();
}

function cerrarModal() {
  dom.modal.hidden = true;
  dom.backdrop.hidden = true;
  document.body.style.overflow = "";

  if (
    state.lastFocusedElement &&
    typeof state.lastFocusedElement.focus === "function"
  ) {
    state.lastFocusedElement.focus();
  }
}

function configurarEnlace(elemento, url) {
  if (url) {
    elemento.href = url;
    elemento.removeAttribute("aria-disabled");
    elemento.removeAttribute("tabindex");
  } else {
    elemento.href = "#";
    elemento.setAttribute("aria-disabled", "true");
    elemento.setAttribute("tabindex", "-1");
  }
}

function controlarFocoModal(event) {
  const focusable = dom.modal.querySelectorAll(
    'a[href]:not([aria-disabled="true"]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );

  const elementos = Array.from(focusable);
  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  if (!primero || !ultimo) {
    return;
  }

  if (event.shiftKey && document.activeElement === primero) {
    event.preventDefault();
    ultimo.focus();
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault();
    primero.focus();
  }
}

function textoSeguro(valor, respaldo) {
  if (typeof valor !== "string") {
    return respaldo;
  }

  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : respaldo;
}

function urlSegura(valor) {
  if (typeof valor !== "string" || valor.trim() === "") {
    return "";
  }

  try {
    const url = new URL(valor, window.location.origin);

    if (!CONFIG.allowedProtocols.has(url.protocol)) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function limpiarElemento(elemento) {
  while (elemento.firstChild) {
    elemento.removeChild(elemento.firstChild);
  }
}

function mostrarError(mensaje) {
  limpiarElemento(dom.lista);

  const alerta = document.createElement("p");
  alerta.className = "notice";
  alerta.textContent = mensaje;

  dom.lista.append(alerta);
}
