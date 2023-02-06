import { credentials, Credentials } from "./credentials";

export interface UserData {
  profile: { name: string };
  _id: string;
}

export interface Habit {
  up: boolean;
  down: boolean;
  counterUp: number;
  counterDown: number;
  frequency: string;
  notes: string;
  value: number;
  priority: number;
  attribute: string;
  _id: string;
  text: string;
}

export type SortKey = "priority" | "value";
export type SortDirection = "asc" | "desc";
export type SortOrder = [SortKey, SortDirection];

export const compareHabits =
  ([key, dir]: SortOrder) =>
  (a: Habit, b: Habit) => {
    const byValue = a.value - b.value;
    const byPriority = b.priority - a.priority;

    let primarySort = 0;
    let secondarySort = 0;

    if (key === "value") {
      primarySort = dir === "asc" ? byValue : -byValue;
      secondarySort = secondarySort;
    } else {
      primarySort = dir === "asc" ? byPriority : -byPriority;
      secondarySort = byValue;
    }

    return primarySort || secondarySort;
  };

export const calculateAverageScore = (habits: Habit[]) => {
  const total = habits.reduce((acc, h) => acc + h.value, 0);
  const score = total / habits.length;
  return score.toFixed(1);
};

export const getUser = async () => {
  console.warn("Fetching user data...");
  const creds = credentials();
  if (!creds) return;

  const res = await fetch(
    `https://habitica.com/api/v3/user?userFields=profile.name`,
    {
      headers: {
        "x-api-user": creds.userId,
        "x-api-key": creds.token,
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return data.data as UserData;
};

export const getHabits = async () => {
  console.warn("Fetching habits...");
  const creds = credentials();
  if (!creds) return;
  const res = await fetch(
    `https://habitica.com/api/v3/tasks/user?type=habits`,
    {
      headers: {
        "x-api-user": creds.userId,
        "x-api-key": creds.token,
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return data.data as Habit[];
};

export const scoreTask = async ({
  taskId,
  direction,
}: {
  taskId: string;
  direction: "up" | "down";
}) => {
  console.warn(`Scoring task ${taskId} ${direction}...`);
  const creds = credentials();
  if (!creds) return;

  const res = await fetch(
    `https://habitica.com/api/v3/tasks/${taskId}/score/${direction}`,
    {
      method: "POST",
      headers: {
        "x-api-user": creds.userId,
        "x-api-key": creds.token,
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return data.data as Habit;
};
