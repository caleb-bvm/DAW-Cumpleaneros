const $ = (selector) => document.querySelector(selector);
const pad = (value) => String(value).padStart(2, "0");
const dateValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const countForm = $("#countForm");
const countInput = $("#personCount");
const peopleForm = $("#peopleForm");
const peopleFields = $("#peopleFields");
const resultsGrid = $("#resultsGrid");
const template = $("#personTemplate");

const sections = {
  setup: $("#setupCard"),
  people: $("#peopleSection"),
  results: $("#resultsSection")
};

let people = [];
let timer;
let serverTime = new Date();
let syncedAt = performance.now();

const now = () => new Date(serverTime.getTime() + performance.now() - syncedAt);

function show(section) {
  Object.values(sections).forEach((item) => item.classList.add("is-hidden"));
  sections[section].classList.remove("is-hidden");
  sections[section].scrollIntoView({ behavior: "smooth", block: "start" });
}

async function syncTime() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Guatemala";

  try {
    const response = await fetch(`https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(zone)}`);
    const data = await response.json();
    const fetchedTime = new Date(data.dateTime);
    if (Number.isNaN(fetchedTime.getTime())) throw new Error();

    serverTime = fetchedTime;
    $("#clockChip").classList.add("synced");
    $("#timeSource").textContent = `Hora verificada · ${zone}`;
  } catch {
    serverTime = new Date();
    $("#timeSource").textContent = `Hora del dispositivo · ${zone}`;
  }

  syncedAt = performance.now();
  updateClock();
}

function updateClock() {
  $("#liveClock").textContent = new Intl.DateTimeFormat("es-GT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now());
}

function createFields(amount) {
  peopleFields.replaceChildren();

  for (let index = 0; index < amount; index += 1) {
    const fragment = template.content.cloneNode(true);
    const number = index + 1;
    const name = fragment.querySelector(".name-input");
    const birth = fragment.querySelector(".birth-input");

    fragment.querySelector(".person-number").textContent = pad(number);
    fragment.querySelector("h3").textContent = `Persona ${number}`;
    fragment.querySelector(".person-card").style.animationDelay = `${index * 45}ms`;

    name.id = name.name = `personName-${index}`;
    name.previousElementSibling.textContent = "Nombre de la persona";
    name.previousElementSibling.htmlFor = name.id;

    birth.id = birth.name = `birthDate-${index}`;
    birth.previousElementSibling.htmlFor = birth.id;
    birth.max = dateValue(now());

    peopleFields.appendChild(fragment);
  }
}

function fieldError(input, message = "") {
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", Boolean(message));
  input.parentElement.querySelector(".error").textContent = message;
}

function readPeople() {
  const list = [];
  let valid = true;

  for (const card of peopleFields.querySelectorAll(".person-card")) {
    const nameInput = card.querySelector(".name-input");
    const birthInput = card.querySelector(".birth-input");
    const name = nameInput.value.trim();
    const birth = birthInput.value ? new Date(`${birthInput.value}T00:00:00`) : null;

    fieldError(nameInput, name ? "" : "Ingresa el nombre.");
    fieldError(birthInput, !birth ? "Selecciona la fecha." : birth > now() ? "La fecha no puede estar en el futuro." : "");

    if (!name || !birth || birth > now()) valid = false;
    else list.push({ name, birth });
  }

  if (!valid) peopleFields.querySelector(".invalid")?.focus();
  return valid ? list : null;
}

function addDate(date, years = 0, months = 0) {
  // Convierte la fecha original a un número total de meses desde el año 0,
  // sumando los años y meses que se desean agregar.
  const totalMonths = (date.getFullYear() + years) * 12 + date.getMonth() + months;

  // Calcula el año y el mes resultante a partir del total de meses.
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths % 12;

  // Ajusta el día en caso de que el mes destino tenga menos días que el mes original.
  // Por ejemplo, si se suma un mes a una fecha 31 de enero, se ajusta a 28 o 29 de febrero.
  const day = Math.min(date.getDate(), new Date(year, month + 1, 0).getDate());

  return new Date(year, month, day);
}

function ageOf(birth, current) {
  let years = current.getFullYear() - birth.getFullYear();
  if (addDate(birth, years) > current) years -= 1;

  let cursor = addDate(birth, years);
  let months = (current.getFullYear() - cursor.getFullYear()) * 12 + current.getMonth() - cursor.getMonth();
  if (addDate(cursor, 0, months) > current) months -= 1;
  cursor = addDate(cursor, 0, months);

  const start = Date.UTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  const end = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());

  return {
    years,
    months,
    days: Math.floor((end - start) / 86400000),
    hours: current.getHours(),
    minutes: current.getMinutes(),
    seconds: current.getSeconds()
  };
}

const isBirthday = (birth, current) => birth.getMonth() === current.getMonth() && birth.getDate() === current.getDate();

function safeText(text) {
  const element = document.createElement("span");
  element.textContent = text;
  return element.innerHTML;
}

function renderResults() {
  const current = now();

  resultsGrid.innerHTML = people.map((person, index) => {
    const age = ageOf(person.birth, current);
    const birthday = isBirthday(person.birth, current);
    const units = [["months", "meses"], ["days", "días"], ["hours", "horas"], ["minutes", "min"], ["seconds", "seg"]];
    const name = safeText(person.name);
    const birth = person.birth.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });

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

function updateResults() {
  const current = now();

  resultsGrid.querySelectorAll(".result-card").forEach((card) => {
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

countForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(countInput.value);
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= 20;

  fieldError(countInput, valid ? "" : "Ingresa un número entero entre 1 y 20.");
  if (!valid) return;

  createFields(amount);
  show("people");
});

peopleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const list = readPeople();
  if (!list) return;

  people = list;
  renderResults();
  show("results");
  clearInterval(timer);
  timer = setInterval(updateResults, 1000);
});

peopleFields.addEventListener("input", ({ target }) => {
  if (target.matches("input")) fieldError(target);
});

$("#changeCount").addEventListener("click", () => show("setup"));
$("#editPeople").addEventListener("click", () => {
  clearInterval(timer);
  show("people");
});

$("#newCalculation").addEventListener("click", () => {
  clearInterval(timer);
  people = [];
  countForm.reset();
  peopleFields.replaceChildren();
  resultsGrid.replaceChildren();
  show("setup");
});

setInterval(updateClock, 1000);
syncTime();
