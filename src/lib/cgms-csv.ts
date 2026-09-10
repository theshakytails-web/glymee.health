export interface CgmReading {
  ts: number | null;
  value: number | null;
}

export interface CgmParseResult {
  readings: CgmReading[];
  validCount: number;
  duplicates: number;
  invalid: number;
  outOfRange: number;
  fileName: string;
  startDate: string;
  endDate: string;
  days: number;
  maxGapMinutes: number;
  coverage: number;
  hasGaps: boolean;
  metrics: {
    avgGlucose: string;
    gmi: string;
    tir: string;
    tar: string;
    tbr: string;
    cv: string;
    lowest: string;
    highest: string;
  };
  period: string;
  duration: string;
}

function parseCsvCell(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1).replace(/""/g, "\"");
  }
  return trimmed;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === "\"") {
        if (line[i + 1] === "\"") {
          current += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === "\"") {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

export function parseCgmCsv(text: string, fileName: string): CgmParseResult {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = rawLines.slice(0, 200000).map(parseCsvLine);
  if (parsed.length === 0) {
    throw new Error("The file appears to be empty.");
  }

  const header = parsed[0].map((c) => c.toLowerCase());
  let glucoseIdx = header.findIndex((h) => /gluc|sugar|bg\b|glucose\s*level|mmol/i.test(h));
  if (glucoseIdx === -1) {
    glucoseIdx = header.findIndex((h) => /value|reading/i.test(h));
  }
  if (glucoseIdx === -1) {
    const firstData = parsed.slice(1, 20);
    const numeric = firstData[0]?.map((_, ci) =>
      firstData.filter((row) => {
        const n = parseFloat(row[ci]);
        return !isNaN(n) && n >= 40 && n <= 600;
      }).length
    );
    glucoseIdx = numeric ? numeric.indexOf(Math.max(...numeric)) : -1;
    if (glucoseIdx === -1) {
      throw new Error(
        "Could not find a glucose column in the file. Expected a 'Glucose' or 'Value' column (mg/dL)."
      );
    }
  }

  let timeIdx = header.findIndex((h) => /timestamp|datetime/i.test(h));
  if (timeIdx === -1) {
    timeIdx = header.findIndex((h) => /time/i.test(h));
  }
  if (timeIdx === -1) {
    timeIdx = header.findIndex((h) => /date/i.test(h));
  }

  const readings: CgmReading[] = [];
  for (let r = 1; r < parsed.length; r++) {
    const row = parsed[r];
    if (!row[glucoseIdx]) continue;
    let value: number | null = null;
    const raw = parseCsvCell(row[glucoseIdx]);
    const match = raw.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (match) value = parseFloat(match[0]);

    let ts: number | null = null;
    if (timeIdx !== -1 && row[timeIdx]) {
      const dt = new Date(parseCsvCell(row[timeIdx]));
      if (!isNaN(dt.getTime())) ts = dt.getTime();
    }
    readings.push({ ts, value });
  }

  const seen = new Set<string>();
  const valid: CgmReading[] = [];
  let duplicates = 0;
  let invalid = 0;
  let outOfRangeCount = 0;

  for (const reading of readings) {
    if (reading.value === null || isNaN(reading.value)) {
      invalid++;
      continue;
    }
    if (reading.value < 40 || reading.value > 600) {
      outOfRangeCount++;
      continue;
    }
    const key = reading.ts !== null ? `${reading.ts}` : "";
    if (key && seen.has(key)) {
      duplicates++;
      continue;
    }
    if (key) seen.add(key);
    valid.push(reading);
  }

  const withTs = valid.filter((r) => r.ts !== null).sort((a, b) => (a.ts! > b.ts! ? 1 : -1)) as {
    ts: number;
    value: number;
  }[];

  let maxGapMinutes = 0;
  for (let i = 1; i < withTs.length; i++) {
    const gap = Math.round((withTs[i].ts - withTs[i - 1].ts) / 60000);
    if (gap > maxGapMinutes) maxGapMinutes = gap;
  }

  const start = withTs.length ? new Date(withTs[0].ts) : null;
  const end = withTs.length ? new Date(withTs[withTs.length - 1].ts) : null;
  const dayKeys = new Set(
    withTs.map((r) => {
      const d = new Date(r.ts);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const distinctDays = Math.max(1, dayKeys.size);
  const elapsedDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000)) : distinctDays;
  const coverage = Math.min(100, Math.round((valid.length / (distinctDays * 288)) * 100));

  const values = valid.map((r) => r.value as number);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length);
  const cv = (sd / avg) * 100;
  const gmi = 3.31 + 0.02392 * avg;
  const tir = (values.filter((v) => v >= 70 && v < 180).length / values.length) * 100;
  const tar = (values.filter((v) => v >= 180).length / values.length) * 100;
  const tbr = (values.filter((v) => v < 70).length / values.length) * 100;

  const fmt = (n: number, d: number) =>
    d === 0 ? `${Math.round(n)}` : n.toFixed(d);

  const startLabel = start
    ? start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";
  const endLabel = end
    ? end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";

  return {
    readings,
    validCount: valid.length,
    duplicates,
    invalid: invalid + outOfRangeCount,
    outOfRange: outOfRangeCount,
    fileName,
    startDate: start ? start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
    endDate: end ? end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
    days: elapsedDays,
    maxGapMinutes,
    coverage,
    hasGaps: maxGapMinutes > 60,
    metrics: {
      avgGlucose: fmt(avg, 1),
      gmi: fmt(gmi, 2),
      tir: fmt(tir, 1),
      tar: fmt(tar, 1),
      tbr: fmt(tbr, 1),
      cv: fmt(cv, 1),
      lowest: fmt(Math.min(...values), 0),
      highest: fmt(Math.max(...values), 0),
    },
    period: start && end ? `${startLabel} to ${endLabel}` : "",
    duration: elapsedDays > 1 ? `${elapsedDays} Days` : `${elapsedDays} Day`,
  };
}