import { getNow, initClock, updateClock } from "./js/clock.js";
import {
  createPersonFields,
  elements,
  fieldError,
  readPeople,
  renderResults,
  resetInterface,
  showSection,
  updateResults
} from "./js/ui.js";

let people = [];
let resultsTimer;

// Paso 1: valida la cantidad y crea un formulario para cada persona.
elements.countForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(elements.countInput.value);
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= 20;

  fieldError(elements.countInput, valid ? "" : "Ingresa un número entero entre 1 y 20.");
  if (!valid) return;

  createPersonFields(amount, getNow());
  showSection("people");
});

// Paso 2: obtiene los datos y muestra las edades calculadas.
elements.peopleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const list = readPeople(getNow());
  if (!list) return;

  people = list;
  renderResults(people, getNow());
  showSection("results");

  clearInterval(resultsTimer);
  resultsTimer = setInterval(() => updateResults(people, getNow()), 1000);
});

// El error visual desaparece cuando el usuario corrige el campo.
elements.peopleFields.addEventListener("input", ({ target }) => {
  if (target.matches("input")) fieldError(target);
});

elements.changeCount.addEventListener("click", () => showSection("setup"));

elements.editPeople.addEventListener("click", () => {
  clearInterval(resultsTimer);
  showSection("people");
});

elements.newCalculation.addEventListener("click", () => {
  clearInterval(resultsTimer);
  people = [];
  resetInterface();
  showSection("setup");
});

// Inicializa la hora y mantiene actualizado el reloj de la cabecera.
initClock();
setInterval(updateClock, 1000);
