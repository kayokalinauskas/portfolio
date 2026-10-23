// As datas no formato do terminal do macOS, em inglês, como o terminal de verdade.

function partes(data: Date, opcoes: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { hour12: false, ...opcoes }).formatToParts(data).map((x) => [x.type, x.value]),
  );
}

// "Thu Oct 22 09:14:07", a linha do Last login
export function formatarLogin(data: Date) {
  const p = partes(data, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${p.weekday} ${p.month} ${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

// "Fri Oct 23 15:49:12 GMT-3 2026", o formato do date
export function formatarData(data: Date) {
  const p = partes(data, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    year: "numeric",
  });
  return `${p.weekday} ${p.month} ${p.day.padStart(2)} ${p.hour}:${p.minute}:${p.second} ${p.timeZoneName} ${p.year}`;
}

// O uptime conta desde janeiro de 2015, o primeiro emprego na área (Hipertec Sistemas).
const PRIMEIRO_DIA = new Date(2015, 0, 1);

// "16:13  up 4313 days, 1 user"
export function formatarUptime(agora: Date) {
  const dias = Math.floor((agora.getTime() - PRIMEIRO_DIA.getTime()) / 86_400_000);
  const hora = agora.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${hora}  up ${dias} days, 1 user`;
}
