// Utilidades pequeñas compartidas por los demás módulos.

export const $ = (selector) => document.querySelector(selector);

export const pad = (value) => String(value).padStart(2, "0");

export const dateValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Convierte texto ingresado por el usuario en HTML seguro.
export function safeText(text) {
  const element = document.createElement("span");
  element.textContent = text;
  return element.innerHTML;
}
