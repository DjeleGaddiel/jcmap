import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatEventDate(isoString: string): string {
  try {
    const date = parseISO(isoString);
    // e.g. "Sam 28 Nov"
    const formatted = format(date, "EEE d MMM", { locale: fr });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (e) {
    return isoString;
  }
}

export function formatEventTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "HH:mm");
  } catch (e) {
    return "";
  }
}

export function formatEventRange(startIso: string, endIso: string): string {
  const start = formatEventTime(startIso);
  const end = formatEventTime(endIso);
  return `${start} - ${end}`;
}
