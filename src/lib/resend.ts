import { Resend } from "resend";

/**
 * Skonfigurowany klient Resend.
 * Klucz pobierany jest z RESEND_API_KEY (server-side, route handler).
 * Pusty fallback pozwala na build bez sekretu — wysyłka i tak działa
 * tylko po stronie serwera, gdzie zmienna środowiskowa jest dostępna.
 */
export const resend = new Resend(process.env.RESEND_API_KEY ?? "");
