// Suma años y meses ajustando fechas especiales, como el 29 de febrero.
function addDate(date, years = 0, months = 0) {
  const totalMonths = (date.getFullYear() + years) * 12 + date.getMonth() + months;
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

// Calcula años y meses completos; después obtiene los días restantes.
export function ageOf(birth, current) {
  let years = current.getFullYear() - birth.getFullYear();
  if (addDate(birth, years) > current) years--;

  let cursor = addDate(birth, years);
  let months = (current.getFullYear() - cursor.getFullYear()) * 12
    + current.getMonth() - cursor.getMonth();

  if (addDate(cursor, 0, months) > current) months--;
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

export const isBirthday = (birth, current) =>
  birth.getMonth() === current.getMonth() && birth.getDate() === current.getDate();
