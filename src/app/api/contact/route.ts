import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/*  Walidacja                                                                  */
/* -------------------------------------------------------------------------- */

/** Akceptujemy zarówno wewnętrzne kody, jak i etykiety PL z formularza. */
const PURPOSE_LABELS: Record<string, "catalog" | "meeting" | "general"> = {
  catalog: "catalog",
  meeting: "meeting",
  general: "general",
  Katalog: "catalog",
  Spotkanie: "meeting",
  Ogólne: "general",
};

const PURPOSE_PL: Record<"catalog" | "meeting" | "general", string> = {
  catalog: "Katalog / próbki",
  meeting: "Spotkanie",
  general: "Zapytanie ogólne",
};

const schema = z.object({
  name: z.string().trim().min(2, "Imię jest za krótkie."),
  email: z.string().trim().email("Nieprawidłowy adres e-mail."),
  phone: z.string().trim().min(9, "Numer telefonu jest za krótki."),
  company: z.string().trim().optional().default(""),
  purpose: z
    .string()
    .transform((v) => PURPOSE_LABELS[v.trim()])
    .refine(
      (v): v is "catalog" | "meeting" | "general" => Boolean(v),
      "Nieprawidłowy cel kontaktu.",
    ),
  message: z.string().trim().min(10, "Wiadomość jest za krótka."),
  /** Honeypot — musi pozostać pusty. Boty zwykle go wypełniają. */
  website: z.string().max(0).optional().default(""),
});

/* -------------------------------------------------------------------------- */
/*  Pomocnicze                                                                 */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface MailData {
  name: string;
  email: string;
  phone: string;
  company: string;
  purpose: "catalog" | "meeting" | "general";
  message: string;
}

function buildHtml(d: MailData): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 16px 6px 0;color:#8a8a8f;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
        label,
      )}</td>
      <td style="padding:6px 0;color:#16161a;font-size:14px;">${value}</td>
    </tr>`;

  const safeMessage = escapeHtml(d.message).replace(/\n/g, "<br />");

  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e9;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 28px;border-bottom:1px solid #eee;border-top:3px solid #cf2e2e;">
        <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#cf2e2e;font-weight:600;">TermoProfi · Nowe zapytanie</div>
        <div style="margin-top:4px;font-size:18px;color:#16161a;font-weight:600;">${escapeHtml(
          PURPOSE_PL[d.purpose],
        )}</div>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Imię", escapeHtml(d.name))}
          ${row(
            "E-mail",
            `<a href="mailto:${escapeHtml(d.email)}" style="color:#cf2e2e;text-decoration:none;">${escapeHtml(
              d.email,
            )}</a>`,
          )}
          ${row(
            "Telefon",
            `<a href="tel:${escapeHtml(
              d.phone.replace(/\s+/g, ""),
            )}" style="color:#16161a;text-decoration:none;">${escapeHtml(d.phone)}</a>`,
          )}
          ${d.company ? row("Firma", escapeHtml(d.company)) : ""}
        </table>
        <div style="margin-top:20px;padding-top:18px;border-top:1px solid #eee;">
          <div style="font-size:13px;color:#8a8a8f;margin-bottom:8px;">Wiadomość</div>
          <div style="font-size:14px;line-height:1.6;color:#16161a;">${safeMessage}</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/*  Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Nieprawidłowe dane." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Nieprawidłowe dane.";
    return NextResponse.json(
      { success: false, error: firstIssue },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot wypełniony → udawany sukces, nic nie wysyłamy.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ success: true });
  }

  const mail: MailData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    purpose: data.purpose,
    message: data.message,
  };

  const resend = getResend();
  if (!resend) {
    console.error("[contact] RESEND_API_KEY missing — e-mail not configured");
    return NextResponse.json(
      {
        success: false,
        error:
          "Wysyłka e-mail nie jest jeszcze skonfigurowana. Napisz na info@termoprofi.com.",
      },
      { status: 503 },
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: "TermoProfi <onboarding@resend.dev>",
      to: process.env.CONTACT_TO || "info@termoprofi.com",
      replyTo: data.email,
      subject: `Zapytanie (${PURPOSE_PL[data.purpose]}) — ${data.name}`,
      html: buildHtml(mail),
    });

    if (error) {
      // Resend zwrócił błąd (np. placeholderowy klucz w dev).
      console.error("[contact] resend error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Nie udało się wysłać wiadomości. Spróbuj ponownie później lub napisz na info@termoprofi.com.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Wyjątek sieciowy / brak konfiguracji — nie wywracamy procesu.
    console.error("[contact] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później lub napisz na info@termoprofi.com.",
      },
      { status: 500 },
    );
  }
}
