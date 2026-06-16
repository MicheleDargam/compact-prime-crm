import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TZ = "America/Sao_Paulo";

function isConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
}

function buildEventBody(params: {
  title: string;
  description?: string;
  dataEvento: Date;
  horario?: Date | null;
}) {
  const { title, description, dataEvento, horario } = params;
  const dateStr = dataEvento.toISOString().split("T")[0];

  if (horario) {
    const h = new Date(horario).getUTCHours();
    const m = new Date(horario).getUTCMinutes();
    const start = new Date(`${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
    const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
    return {
      summary: title,
      description: description ?? undefined,
      start: { dateTime: start.toISOString(), timeZone: TZ },
      end: { dateTime: end.toISOString(), timeZone: TZ },
    };
  }

  const nextDay = new Date(dateStr);
  nextDay.setDate(nextDay.getDate() + 1);
  return {
    summary: title,
    description: description ?? undefined,
    start: { date: dateStr },
    end: { date: nextDay.toISOString().split("T")[0] },
  };
}

export async function createCalendarEvent(params: {
  title: string;
  description?: string;
  dataEvento: Date;
  horario?: Date | null;
}): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    const calendar = google.calendar({ version: "v3", auth: getAuth() });
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: buildEventBody(params),
    });
    return res.data.id ?? null;
  } catch (err) {
    console.error("[google-calendar] createCalendarEvent:", err);
    return null;
  }
}

export async function updateCalendarEvent(
  gcalEventId: string,
  params: {
    title: string;
    description?: string;
    dataEvento: Date;
    horario?: Date | null;
  }
): Promise<void> {
  if (!isConfigured()) return;
  try {
    const calendar = google.calendar({ version: "v3", auth: getAuth() });
    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: gcalEventId,
      requestBody: buildEventBody(params),
    });
  } catch (err) {
    console.error("[google-calendar] updateCalendarEvent:", err);
  }
}

export async function deleteCalendarEvent(gcalEventId: string): Promise<void> {
  if (!isConfigured()) return;
  try {
    const calendar = google.calendar({ version: "v3", auth: getAuth() });
    await calendar.events.delete({ calendarId: CALENDAR_ID, eventId: gcalEventId });
  } catch (err) {
    console.error("[google-calendar] deleteCalendarEvent:", err);
  }
}

export interface GCalEvent {
  id: string;
  summary: string;
  description?: string | null;
  date: string;
  dateTime?: string | null;
}

export async function listCalendarEvents(timeMin?: string, timeMax?: string): Promise<GCalEvent[]> {
  if (!isConfigured()) return [];
  try {
    const calendar = google.calendar({ version: "v3", auth: getAuth() });
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin ?? new Date(2020, 0, 1).toISOString(),
      timeMax: timeMax ?? new Date(2030, 11, 31).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
    });

    return (res.data.items ?? [])
      .filter(e => e.id && e.summary && (e.start?.date || e.start?.dateTime))
      .map(e => ({
        id: e.id!,
        summary: e.summary!,
        description: e.description ?? null,
        date: (e.start?.date ?? e.start?.dateTime?.split("T")[0])!,
        dateTime: e.start?.dateTime ?? null,
      }));
  } catch (err) {
    console.error("[google-calendar] listCalendarEvents:", err);
    return [];
  }
}
