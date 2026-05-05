"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ROUTINE_TASK_IDS = [
  "morning-wake",
  "morning-water",
  "morning-stretch",
  "morning-plan",
  "upgrade-english",
  "upgrade-revise",
  "deep-js",
  "care-homework",
  "care-breakfast",
  "prep-office",
  "prep-goal",
  "office-focus",
  "office-learn",
  "office-observe",
  "office-quality",
  "fit-ready",
  "fit-workout",
  "rec-dinner",
  "rec-rest",
  "rec-phone",
  "night-skill",
  "night-read",
  "night-reflect",
  "score-learned",
] as const;

type Energy = "low" | "medium" | "high" | "";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(date: string) {
  return `gym-stack-daily-routine:${date}`;
}

type Stored = {
  tasks: Record<string, boolean>;
  energy: Energy;
};

/** Stable reference for SSR; `getServerSnapshot` must not return a new object each call. */
const SERVER_ROUTINE_SNAPSHOT: Stored = { tasks: {}, energy: "" };

function loadStored(date: string): Stored {
  if (typeof window === "undefined") {
    return SERVER_ROUTINE_SNAPSHOT;
  }
  try {
    const raw = localStorage.getItem(storageKey(date));
    if (!raw) return SERVER_ROUTINE_SNAPSHOT;
    const parsed = JSON.parse(raw) as Stored;
    return {
      tasks: parsed.tasks ?? {},
      energy: parsed.energy ?? "",
    };
  } catch {
    return SERVER_ROUTINE_SNAPSHOT;
  }
}

let routineStoreVersion = 0;
const routineListeners = new Set<() => void>();

let cachedRoutineSnapshot: Stored | undefined;
let cachedSnapshotVersion = -1;
let cachedSnapshotDate: string | null = null;

function subscribeRoutine(onStoreChange: () => void) {
  routineListeners.add(onStoreChange);
  return () => routineListeners.delete(onStoreChange);
}

function bumpRoutineStore() {
  routineStoreVersion += 1;
  routineListeners.forEach((l) => l());
}

/** Must return the same object reference when store & day are unchanged (React `useSyncExternalStore`). */
function getRoutineSnapshot(): Stored {
  void routineStoreVersion;
  const date = todayKey();
  if (
    cachedRoutineSnapshot !== undefined &&
    cachedSnapshotVersion === routineStoreVersion &&
    cachedSnapshotDate === date
  ) {
    return cachedRoutineSnapshot;
  }
  cachedSnapshotVersion = routineStoreVersion;
  cachedSnapshotDate = date;
  cachedRoutineSnapshot = loadStored(date);
  return cachedRoutineSnapshot;
}

function getServerRoutineSnapshot(): Stored {
  return SERVER_ROUTINE_SNAPSHOT;
}

function persistRoutine(next: Stored) {
  localStorage.setItem(storageKey(todayKey()), JSON.stringify(next));
  bumpRoutineStore();
}

function CheckRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (id: string, next: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(id, v === true)}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="cursor-pointer font-normal leading-snug">
        {label}
      </Label>
    </div>
  );
}

export function DailyRoutine() {
  const { tasks, energy } = useSyncExternalStore(
    subscribeRoutine,
    getRoutineSnapshot,
    getServerRoutineSnapshot,
  );

  const date = todayKey();

  const setTask = useCallback((id: string, next: boolean) => {
    const prev = loadStored(todayKey());
    persistRoutine({
      ...prev,
      tasks: { ...prev.tasks, [id]: next },
    });
  }, []);

  const setEnergyLevel = useCallback((level: Exclude<Energy, "">) => {
    const prev = loadStored(todayKey());
    const nextEnergy: Energy = prev.energy === level ? "" : level;
    persistRoutine({ ...prev, energy: nextEnergy });
  }, []);

  const routineCheckedCount = useMemo(() => {
    return ROUTINE_TASK_IDS.filter((id) => tasks[id]).length;
  }, [tasks]);

  const routineTotal = ROUTINE_TASK_IDS.length;
  const pct = routineTotal
    ? Math.round((routineCheckedCount / routineTotal) * 100)
    : 0;
  const hitEightyPlus = pct >= 80;

  return (
    <div
      className="contain mx-auto max-w-2xl px-4 pb-16 pt-2 relative"
      suppressHydrationWarning
    >
      <div className="sticky top-0 mt-3 z-10 pb-4 bg-background">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Daily Dream Life Checklist
          </h1>
          <p className="text-muted-foreground text-sm">{date}</p>
        </header>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>
              {routineCheckedCount} / {routineTotal} tasks · {pct}%
              {hitEightyPlus ? " · On track for 80%+" : ""}
            </CardDescription>
            <div
              className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-primary h-full transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6 pt-2">
        <Section
          emoji="🌅"
          title="Morning Foundation"
          time="6:00 – 6:30 AM"
          description="Wake up, drink water, stretching / light walk, 5 min planning."
        >
          <CheckRow
            id="morning-wake"
            label="Wake up (~6:00 AM)"
            checked={!!tasks["morning-wake"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="morning-water"
            label="Drink water"
            checked={!!tasks["morning-water"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="morning-stretch"
            label="Stretch / light walk (5–10 min)"
            checked={!!tasks["morning-stretch"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="morning-plan"
            label="Plan your day (5 min)"
            checked={!!tasks["morning-plan"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🚀"
          title="Morning Upgrade"
          time="6:30 – 7:00 AM"
          description="English speaking practice OR revise yesterday’s learning."
        >
          <CheckRow
            id="upgrade-english"
            label="English speaking practice"
            checked={!!tasks["upgrade-english"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="upgrade-revise"
            label="Revise yesterday’s learning"
            checked={!!tasks["upgrade-revise"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🧠"
          title="Deep Study"
          time="7:00 – 8:00 AM"
          description="JavaScript / problem solving — no distractions."
        >
          <CheckRow
            id="deep-js"
            label="1 hour JavaScript / problem solving (no distractions)"
            checked={!!tasks["deep-js"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🍽️"
          title="Personal Care"
          time="8:00 – 9:00 AM"
          description="Home work + breakfast (eat properly for weight gain)."
        >
          <CheckRow
            id="care-homework"
            label="Complete home work"
            checked={!!tasks["care-homework"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="care-breakfast"
            label="Eat proper breakfast (weight gain focus)"
            checked={!!tasks["care-breakfast"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🧑‍💻"
          title="Preparation"
          time="9:00 – 9:50 AM"
          description="Get ready + light planning — set 1 improvement goal for office."
        >
          <CheckRow
            id="prep-office"
            label="Get ready for office"
            checked={!!tasks["prep-office"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="prep-goal"
            label="Set 1 improvement goal for today"
            checked={!!tasks["prep-goal"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="💼"
          title="Work Phase"
          time="10:00 AM – 7:00 PM"
          description="Office work + active learning: observe seniors, improve code quality, learn, ask questions."
        >
          <CheckRow
            id="office-focus"
            label="Stay focused on tasks"
            checked={!!tasks["office-focus"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="office-learn"
            label="Learn something new"
            checked={!!tasks["office-learn"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="office-observe"
            label="Observe senior developers"
            checked={!!tasks["office-observe"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="office-quality"
            label="Improve code quality"
            checked={!!tasks["office-quality"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🏃"
          title="Transition"
          time="7:00 – 7:15 PM"
          description="Gym preparation."
        >
          <CheckRow
            id="fit-ready"
            label="Ready for gym (gear, commute, warmup mindset)"
            checked={!!tasks["fit-ready"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="💪"
          title="Fitness"
          time="7:15 – 8:30 PM"
          description="Strength training focus."
        >
          <CheckRow
            id="fit-workout"
            label="Gym workout (strength training)"
            checked={!!tasks["fit-workout"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="🍽️"
          title="Recovery"
          time="9:00 – 10:00 PM"
          description="Dinner + rest — high-calorie meal, avoid phone overload."
        >
          <CheckRow
            id="rec-dinner"
            label="Eat high-calorie dinner"
            checked={!!tasks["rec-dinner"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="rec-rest"
            label="Take proper rest"
            checked={!!tasks["rec-rest"]}
            onCheckedChange={setTask}
          />
          <CheckRow
            id="rec-phone"
            label="Avoid excessive phone use"
            checked={!!tasks["rec-phone"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="⚡"
          title="Skill Growth"
          time="10:30 – 11:15 PM"
          description="JavaScript / TypeScript / project work."
        >
          <CheckRow
            id="night-skill"
            label="Focused skill block (~45 min): JS / TS / project"
            checked={!!tasks["night-skill"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="📚"
          title="Learning"
          time="11:15 – 11:45 PM"
          description="Reading — tech, mindset, or career."
        >
          <CheckRow
            id="night-read"
            label="Reading (~30 min): tech / mindset / career"
            checked={!!tasks["night-read"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="📝"
          title="Reflection"
          time="11:45 PM – 12:00 AM"
          description="Review the day + plan improvements."
        >
          <CheckRow
            id="night-reflect"
            label="Review day & plan improvements (~15 min)"
            checked={!!tasks["night-reflect"]}
            onCheckedChange={setTask}
          />
        </Section>

        <Section
          emoji="📊"
          title="Daily Score"
          description="Quick end-of-day check-in."
        >
          <div className="flex items-start gap-3 py-1.5">
            <Checkbox
              id="score-80"
              checked={hitEightyPlus}
              disabled
              className="mt-0.5"
              aria-readonly
            />
            <Label
              htmlFor="score-80"
              className={cn(
                "leading-snug",
                hitEightyPlus ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Completed 80%+ tasks
              {hitEightyPlus ? " ✅" : " (unlocks at 80% of checklist above)"}
            </Label>
          </div>

          <div className="space-y-2 py-2">
            <p className="text-muted-foreground text-sm font-medium">
              Energy level
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { v: "low" as const, label: "Low" },
                { v: "medium" as const, label: "Medium" },
                { v: "high" as const, label: "High" },
              ].map(({ v, label: lb }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEnergyLevel(v)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    energy === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted/80",
                  )}
                >
                  {lb}
                </button>
              ))}
            </div>
          </div>

          <CheckRow
            id="score-learned"
            label="Learned something valuable today"
            checked={!!tasks["score-learned"]}
            onCheckedChange={setTask}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({
  emoji,
  title,
  time,
  description,
  children,
}: {
  emoji: string;
  title: string;
  time?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-md">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <span aria-hidden>{emoji}</span>
            <span>{title}</span>
          </CardTitle>
          {time ? (
            <span className="text-muted-foreground shrink-0 font-mono text-xs font-medium tracking-tight sm:text-sm">
              {time}
            </span>
          ) : null}
        </div>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        <Separator className="mb-3" />
        {children}
      </CardContent>
    </Card>
  );
}
