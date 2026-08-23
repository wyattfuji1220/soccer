/**
 * 日本時間（JST = UTC+9、夏時間なし）に関する変換をここに集約する。
 *
 * 「観戦ナイト」という単位を導入している。
 * 欧州の夜の試合は日本時間だと翌日の未明〜早朝になるため、暦の日付で区切ると
 * 同じ夜の試合が2日に分断されてしまう。そこで JST 9:00 を1日の境界とし、
 * 9:00〜翌8:59 をひとつの「夜」として扱う。
 */

const JST_OFFSET_HOURS = 9;
/** 観戦ナイトの境界（JST） */
const NIGHT_START_HOUR = 9;

/** JSTの壁掛け時計の時刻から Date を作る */
export function fromJst(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - JST_OFFSET_HOURS, minute));
}

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** その時刻が属する観戦ナイトの識別子（例: "2026-08-23"） */
export function nightKey(date: Date): string {
  const shifted = new Date(date.getTime() - NIGHT_START_HOUR * 3600_000);
  return dayKeyFormatter.format(shifted);
}

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

/** "23:00" */
export function jstTime(date: Date): string {
  return timeFormatter.format(date);
}

/** "8月24日(月)" 相当の短縮形 "8/24(月)" */
export function jstDate(date: Date): string {
  return dateFormatter.format(date).replace(/\s/g, "");
}

/** 観戦ナイト識別子を見出し用の文字列にする */
export function nightLabel(key: string, today: string, tomorrow: string): string {
  if (key === today) return "今夜";
  if (key === tomorrow) return "明日の夜";
  const [y, m, d] = key.split("-").map(Number);
  return jstDate(fromJst(y, m, d, 12));
}

/** 翌日の観戦ナイト識別子 */
export function nextNightKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return nightKey(fromJst(y, m, d + 1, 12));
}

/** キックオフまでの残り時間。過ぎていれば null */
export function countdown(kickoff: Date, now: Date): { hours: number; minutes: number } | null {
  const diff = kickoff.getTime() - now.getTime();
  if (diff <= 0) return null;
  const totalMinutes = Math.floor(diff / 60_000);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/** キックオフから2時間はまだ試合中とみなす */
export function isLive(kickoff: Date, now: Date): boolean {
  const elapsed = now.getTime() - kickoff.getTime();
  return elapsed >= 0 && elapsed < 2 * 3600_000;
}
