import { getDateKey, getLevel, type HeatmapWindow } from "./blog-heatmap";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type GitHubContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
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
    const rectPattern =
      /<rect\b[^>]*data-date="(?<date>[^"]+)"[^>]*data-count="(?<count>\d+)"[^>]*>/g;
    const days: GitHubContributionDay[] = [];

    for (const match of svg.matchAll(rectPattern)) {
      const date = match.groups?.date;
      const rawCount = match.groups?.count;

      if (!date || rawCount === undefined) {
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
