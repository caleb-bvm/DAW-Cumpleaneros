import { $ } from "./utils.js";

let serverTime = new Date();
let syncedAt = performance.now();
const liveClock = $("#liveClock");
const clockChip = $("#clockChip");
const timeSource = $("#timeSource");

// Mantiene avanzando la última hora recibida sin consultar la API cada segundo.
export const getNow = () =>
  new Date(serverTime.getTime() + performance.now() - syncedAt);

export async function initClock() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Guatemala";

  try {
    const url = `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(zone)}`;
    const response = await fetch(url);
    const data = await response.json();
    const fetchedTime = new Date(data.dateTime);

    if (Number.isNaN(fetchedTime.getTime())) throw new Error();

    serverTime = fetchedTime;
    clockChip?.classList.add("synced");
    if (timeSource) timeSource.textContent = `Hora verificada · ${zone}`;
  } catch {
    serverTime = new Date();
    if (timeSource) timeSource.textContent = `Hora del dispositivo · ${zone}`;
  }

  syncedAt = performance.now();
  updateClock();
}

export function updateClock() {
  if (!liveClock) return;

  liveClock.textContent = new Intl.DateTimeFormat("es-GT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(getNow());
}
