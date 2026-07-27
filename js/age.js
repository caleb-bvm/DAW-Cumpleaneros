// Suma años y meses a una fecha sin generar días inválidos.
function sumDate(originalDate, years = 0, months = 0) {
  const targetYear = originalDate.getFullYear() + years;
  const targetMonth = originalDate.getMonth() + months;
  const originalDay = originalDate.getDate();

  // El día 0 del siguiente mes devuelve el último día del mes anterior.
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  // Usa el día original o el último día permitido.
  const validDay = Math.min(originalDay, lastDayOfMonth);

  return new Date(targetYear, targetMonth, validDay);
}

// Calcula la edad en años, meses y días completos.
export function calculateAge(birthDate, currentDate) {
  let years = currentDate.getFullYear() - birthDate.getFullYear();

  // Si todavía no ha llegado el cumpleaños, resta un año.
  if (sumDate(birthDate, years) > currentDate) {
    years--;
  }

  const dateAfterYears = sumDate(birthDate, years);

  let months =
    (currentDate.getFullYear() - dateAfterYears.getFullYear()) * 12 +
    currentDate.getMonth() -
    dateAfterYears.getMonth();

  // Si el último mes todavía no está completo, resta uno.
  if (sumDate(dateAfterYears, 0, months) > currentDate) {
    months--;
  }

  const dateAfterMonths = sumDate(dateAfterYears, 0, months);

  const startDate = Date.UTC(
    dateAfterMonths.getFullYear(),
    dateAfterMonths.getMonth(),
    dateAfterMonths.getDate()
  );

  const endDate = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((endDate - startDate) / millisecondsPerDay);

  return {
    years,
    months,
    days,
    hours: currentDate.getHours(),
    minutes: currentDate.getMinutes(),
    seconds: currentDate.getSeconds()
  };
}

// Comprueba si hoy coincide con el día y mes de nacimiento.
export function isBirthday(birthDate, currentDate) {
  const sameMonth = birthDate.getMonth() === currentDate.getMonth();
  const sameDay = birthDate.getDate() === currentDate.getDate();

  return sameMonth && sameDay;
}
