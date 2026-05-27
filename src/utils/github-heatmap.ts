import { getDateKey, getLevel, type HeatmapWindow } from "./blog-heatmap";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type GitHubContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type GitHubTooltipEntry = {
  count: number;
};

function parseGitHubUsername(profileUrl: string) {
  try {
    const url = new URL(profileUrl);
    const username = url.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];

    return username || null;
  } catch {
    return null;
  }
}

function clampDate(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function buildRange(weeks: number) {
  const today = clampDate(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - weeks * 7 + 1);

  return {
    from: getDateKey(start),
    to: getDateKey(today),
  };
}

function isDateInRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function getCurrentStreak(days: GitHubContributionDay[]) {
  let currentStreak = 0;

  for (const day of [...days].reverse()) {
    if (day.count === 0) {
      break;
    }

    currentStreak += 1;
  }

  return currentStreak;
}

function toHeatmapWindow(
  days: GitHubContributionDay[],
  weeks: number,
): HeatmapWindow {
  return {
    days: days.map((day) => ({
      date: day.date,
      count: day.count,
      level: day.level,
      posts: [],
    })),
    weeks,
    startDate: days[0]?.date ?? getDateKey(new Date()),
    totalPosts: days.reduce((total, day) => total + day.count, 0),
    activeDays: days.filter((day) => day.count > 0).length,
    currentStreak: getCurrentStreak(days),
    latestPosts: [],
  };
}

export async function createGitHubHeatmap(profileUrl: string, weeks = 24) {
  const username = parseGitHubUsername(profileUrl);

  if (!username) {
    return null;
  }

  const safeWeeks = Math.max(1, Math.floor(weeks));
  const { from, to } = buildRange(safeWeeks);

  try {
    const response = await fetch(
      `https://github.com/users/${username}/contributions?from=${from}&to=${to}`,
      {
        headers: {
          "user-agent": "Cyber-Machine.github.io heatmap",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const svg = await response.text();
    const legacyRectPattern =
      /<rect\b[^>]*data-date="(?<date>[^"]+)"[^>]*data-count="(?<count>\d+)"[^>]*>/g;
    const tooltipPattern =
      /<tool-tip\b[^>]*for="(?<id>[^"]+)"[^>]*>(?<text>[^<]+)<\/tool-tip>/g;
    const dayCellPattern =
      /<td\b[^>]*data-date="(?<date>[^"]+)"[^>]*id="(?<id>[^"]+)"[^>]*data-level="(?<level>[0-4])"[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*><\/td>/g;
    const days: GitHubContributionDay[] = [];
    const tooltipById = new Map<string, GitHubTooltipEntry>();

    for (const match of svg.matchAll(tooltipPattern)) {
      const id = match.groups?.id;
      const text = match.groups?.text?.trim();

      if (!id || !text) {
        continue;
      }

      const countMatch = text.match(
        /(?:(?<count>\d+)|No)\s+contributions?\s+on\s+(?<label>.+?)\./i,
      );

      if (!countMatch?.groups?.label) {
        continue;
      }

      tooltipById.set(id, {
        count: countMatch.groups.count ? Number(countMatch.groups.count) : 0,
      });
    }

    for (const match of svg.matchAll(legacyRectPattern)) {
      const date = match.groups?.date;
      const rawCount = match.groups?.count;

      if (!date || rawCount === undefined || !isDateInRange(date, from, to)) {
        continue;
      }

      const count = Number(rawCount);

      days.push({
        date,
        count,
        level: getLevel(count),
      });
    }

    if (days.length === 0) {
      for (const match of svg.matchAll(dayCellPattern)) {
        const date = match.groups?.date;
        const id = match.groups?.id;
        const rawLevel = match.groups?.level;

        if (
          !date ||
          !id ||
          rawLevel === undefined ||
          !isDateInRange(date, from, to)
        ) {
          continue;
        }

        const tooltip = tooltipById.get(id);
        const count = tooltip?.count ?? 0;

        days.push({
          date,
          count,
          level: Number(rawLevel) as 0 | 1 | 2 | 3 | 4,
        });
      }
    }

    if (days.length === 0) {
      return null;
    }

    return {
      username,
      profileUrl,
      heatmap: toHeatmapWindow(days, safeWeeks),
    };
  } catch {
    return null;
  }
}
