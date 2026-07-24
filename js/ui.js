import { ageOf, isBirthday } from "./age.js";
import { $, dateValue, pad, safeText } from "./utils.js";

export const elements = {
  countForm: $("#countForm"),
  countInput: $("#personCount"),
  peopleForm: $("#peopleForm"),
  peopleFields: $("#peopleFields"),
  resultsGrid: $("#resultsGrid"),
  template: $("#personTemplate"),
  changeCount: $("#changeCount"),
  editPeople: $("#editPeople"),
  newCalculation: $("#newCalculation")
};

const sections = {
  setup: $("#setupCard"),
  people: $("#peopleSection"),
  results: $("#resultsSection")
};

export function showSection(name) {
  Object.values(sections).forEach((section) => section.classList.add("is-hidden"));
  sections[name].classList.remove("is-hidden");
  sections[name].scrollIntoView({ behavior: "smooth", block: "start" });
}

export function fieldError(input, message = "") {
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", Boolean(message));
  input.parentElement.querySelector(".error").textContent = message;
}

// Genera una tarjeta por persona usando el template del HTML.
export function createPersonFields(amount, current) {
  elements.peopleFields.replaceChildren();

  for (let index = 0; index < amount; index++) {
    const fragment = elements.template.content.cloneNode(true);
    const name = fragment.querySelector(".name-input");
    const birth = fragment.querySelector(".birth-input");
    const number = index + 1;

    fragment.querySelector(".person-number").textContent = pad(number);
    fragment.querySelector("h3").textContent = `Persona ${number}`;
    fragment.querySelector(".person-card").style.animationDelay = `${index * 45}ms`;

    name.id = name.name = `personName-${index}`;
    name.previousElementSibling.textContent = "Nombre de la persona";
    name.previousElementSibling.htmlFor = name.id;

    birth.id = birth.name = `birthDate-${index}`;
    birth.previousElementSibling.htmlFor = birth.id;
    birth.max = dateValue(current);

    elements.peopleFields.appendChild(fragment);
  }
}

// Valida solamente los campos esenciales y devuelve los datos capturados.
export function readPeople(current) {
  const people = [];
  let valid = true;

  for (const card of elements.peopleFields.querySelectorAll(".person-card")) {
    const nameInput = card.querySelector(".name-input");
    const birthInput = card.querySelector(".birth-input");
    const name = nameInput.value.trim();
    const birth = birthInput.value ? new Date(`${birthInput.value}T00:00:00`) : null;

    fieldError(nameInput, name ? "" : "Ingresa el nombre.");
    fieldError(birthInput, !birth
      ? "Selecciona la fecha."
      : birth > current ? "La fecha no puede estar en el futuro." : "");

    if (!name || !birth || birth > current) valid = false;
    else people.push({ name, birth });
  }

  if (!valid) elements.peopleFields.querySelector(".invalid")?.focus();
  return valid ? people : null;
}

// Crea las tarjetas una sola vez. Luego updateResults cambia solo sus números.
export function renderResults(people, current) {
  const units = [
    ["months", "meses"],
    ["days", "días"],
    ["hours", "horas"],
    ["minutes", "min"],
    ["seconds", "seg"]
  ];

  elements.resultsGrid.innerHTML = people.map((person, index) => {
    const age = ageOf(person.birth, current);
    const birthday = isBirthday(person.birth, current);
    const name = safeText(person.name);
    const birth = person.birth.toLocaleDateString("es-GT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    return `
      <article class="result-card" data-index="${index}" style="animation-delay:${index * 60}ms">
        <div class="result-top">
          <div><h3 class="result-name">${name}</h3><p class="birth-label">Nació el ${birth}</p></div>
          <div class="age-orbit" aria-label="${age.years} años"><span data-value="years">${age.years}</span></div>
        </div>
        <div class="age-main"><strong data-value="years">${age.years}</strong><span data-year-label>${age.years === 1 ? "año" : "años"}</span></div>
        <div class="birthday-banner ${birthday ? "" : "is-hidden"}">🎉 ¡Feliz cumpleaños, ${name}!</div>
        <div class="time-details">
          ${units.map(([key, label]) => `<div class="time-unit"><strong data-value="${key}">${pad(age[key])}</strong><span>${label}</span></div>`).join("")}
        </div>
        <div class="birthday-sparkle ${birthday ? "" : "is-hidden"}" aria-hidden="true">✦</div>
      </article>`;
  }).join("");
}

export function updateResults(people, current) {
  elements.resultsGrid.querySelectorAll(".result-card").forEach((card) => {
    const person = people[card.dataset.index];
    const age = ageOf(person.birth, current);

    card.querySelectorAll("[data-value]").forEach((element) => {
      const key = element.dataset.value;
      element.textContent = key === "years" ? age[key] : pad(age[key]);
    });

    card.querySelector("[data-year-label]").textContent = age.years === 1 ? "año" : "años";
    const hidden = !isBirthday(person.birth, current);
    card.querySelector(".birthday-banner").classList.toggle("is-hidden", hidden);
    card.querySelector(".birthday-sparkle").classList.toggle("is-hidden", hidden);
  });
}

export function resetInterface() {
  elements.countForm.reset();
  elements.peopleFields.replaceChildren();
  elements.resultsGrid.replaceChildren();
}
