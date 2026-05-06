"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  subDays,
} from "date-fns";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  "evening-learn-podcast",
  "rec-dinner",
  "rec-rest",
  "rec-phone",
  "night-skill",
  "night-read",
  "night-reflect",
  "score-learned",
] as const;

type Energy = "low" | "medium" | "high" | "";

type ScheduleVariant = "eveningGym" | "morningGym";

/** Wed–Fri: morning gym on machines; Mon/Tue/weekends: evening gym after office. */
function getScheduleVariantForLocalDay(now = new Date()): ScheduleVariant {
  const w = now.getDay();
  if (w === 3 || w === 4 || w === 5) return "morningGym";
  return "eveningGym";
}

function todayKeyLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Display times per weekday pattern (local clock). Same tasks; order changes for gym. */
const PHASE_TIMES = {
  eveningGym: {
    morningFoundation: "6:00 – 6:30 AM",
    morningUpgrade: "6:30 – 7:00 AM",
    deepStudy: "7:00 – 8:00 AM",
    personalCare: "8:00 – 9:00 AM",
    preparation: "9:00 – 9:50 AM",
    workPhase: "10:00 AM – 7:00 PM",
    transition: "7:00 – 7:15 PM",
    fitness: "7:15 – 8:30 PM",
    recovery: "9:00 – 10:00 PM",
    skillGrowth: "10:30 – 11:15 PM",
    learning: "11:15 – 11:45 PM",
    reflection: "11:45 PM – 12:00 AM",
    /** Wed–Fri only shown in UI; unused for evening-gym variant. */
    eveningLearnPodcast: "",
  },
  morningGym: {
    morningFoundation: "6:00 – 6:30 AM",
    morningUpgrade: "6:30 – 7:00 AM",
    transition: "7:00 – 7:30 AM",
    fitness: "7:30 – 9:00 AM",
    deepStudy: "9:00 – 9:30 AM",
    personalCare: "9:30 – 9:45 AM",
    preparation: "9:45 – 10:00 AM",
    workPhase: "10:00 AM – 7:00 PM",
    eveningLearnPodcast: "7:30 – 9:00 PM",
    recovery: "9:00 – 10:00 PM",
    skillGrowth: "10:30 – 11:15 PM",
    learning: "11:15 – 11:45 PM",
    reflection: "11:45 PM – 12:00 AM",
  },
} as const;

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

const CHALLENGE_DAYS = 21;
const CHALLENGE_PASS_PCT = 80;

function parseLocalDateKey(dateKey: string): Date {
  const [y, mo, d] = dateKey.split("-").map(Number);
  return new Date(y, (mo ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

function countedTaskIdsForVariant(variant: ScheduleVariant): readonly string[] {
  return ROUTINE_TASK_IDS.filter(
    (id) => id !== "evening-learn-podcast" || variant === "morningGym",
  );
}

function completionPctForDateKey(dateKey: string): number {
  const variant = getScheduleVariantForLocalDay(parseLocalDateKey(dateKey));
  const ids = countedTaskIdsForVariant(variant);
  const s = loadStored(dateKey);
  if (!ids.length) return 0;
  const done = ids.filter((id) => s.tasks[id]).length;
  return Math.round((done / ids.length) * 100);
}

/** GitHub-style intensity: 0 empty, 4 = pass (≥80%). */
function challengeHeatmapTier(pct: number): 0 | 1 | 2 | 3 | 4 {
  if (pct <= 0) return 0;
  if (pct < 40) return 1;
  if (pct < 60) return 2;
  if (pct < CHALLENGE_PASS_PCT) return 3;
  return 4;
}

function challengeHeatmapCellClass(tier: 0 | 1 | 2 | 3 | 4) {
  return cn(
    "rounded-md border shadow-sm transition-[background-color,border-color]",
    tier === 0 &&
      "border-border/80 bg-muted/80 dark:bg-[#161b22] dark:border-zinc-800",
    tier === 1 &&
      "border-emerald-700/20 bg-emerald-200 dark:border-emerald-900 dark:bg-emerald-950",
    tier === 2 &&
      "border-emerald-700/35 bg-emerald-400 dark:border-emerald-800 dark:bg-emerald-900",
    tier === 3 &&
      "border-emerald-600/50 bg-emerald-500 dark:border-emerald-600 dark:bg-emerald-700",
    tier === 4 &&
      "border-lime-600/55 bg-[#39d353] shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)] dark:border-lime-300/55 dark:bg-lime-400 dark:shadow-none",
  );
}

/** Oldest → newest (today − 20 … today); order matches displayed strip left → right */
function buildChallengeContributionCells(): Array<{
  dateKey: string;
  pct: number;
  tier: 0 | 1 | 2 | 3 | 4;
}> {
  return Array.from({ length: CHALLENGE_DAYS }, (_, idx) => {
    const d = subDays(new Date(), CHALLENGE_DAYS - 1 - idx);
    const dateKey = format(d, "yyyy-MM-dd");
    const pct = completionPctForDateKey(dateKey);
    return {
      dateKey,
      pct,
      tier: challengeHeatmapTier(pct),
    };
  });
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

const WEEK_STARTS_ON = 1 as const;

function WeeklyRoutineStrip({
  selected,
  onSelect,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const weekStart = startOfWeek(selected, { weekStartsOn: WEEK_STARTS_ON });
  const weekEnd = endOfWeek(selected, { weekStartsOn: WEEK_STARTS_ON });

  const selectedKey = format(selected, "yyyy-MM-dd");

  return (
    <div className="border-border space-y-3 rounded-lg border px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          aria-label="Previous week"
          onClick={() => onSelect(addDays(selected, -7))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-muted-foreground px-1 text-center text-xs font-medium sm:text-sm">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          aria-label="Next week"
          onClick={() => onSelect(addDays(selected, 7))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const dayKey = format(d, "yyyy-MM-dd");
          const morningGymDay =
            getScheduleVariantForLocalDay(d) === "morningGym";
          const isSelected = dayKey === selectedKey;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "flex flex-col items-center rounded-md border py-2 text-center transition-colors",
                "hover:bg-muted/70",
                morningGymDay
                  ? "border-amber-500/35 bg-amber-500/[0.07]"
                  : "border-border",
                isSelected &&
                  "ring-primary/60 border-primary bg-primary/10 ring-2",
                isToday(d) && !isSelected && "border-foreground/25",
              )}
            >
              <span className="text-muted-foreground text-[0.65rem] font-medium uppercase">
                {format(d, "EEE")}
              </span>
              <span className="text-foreground text-sm tabular-nums font-semibold">
                {format(d, "d")}
              </span>
              <span
                className={cn(
                  "mt-1 max-w-full truncate rounded px-0.5 text-[10px] font-medium",
                  morningGymDay
                    ? "text-amber-900 dark:text-amber-100"
                    : "text-sky-900 dark:text-sky-100",
                )}
              >
                {morningGymDay ? "AM Gym" : "PM Gym"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DailyRoutine() {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    () => new Date(),
  );
  const viewingKey = useMemo(
    () => format(selectedCalendarDate, "yyyy-MM-dd"),
    [selectedCalendarDate],
  );

  const [stored, setStored] = useState<Stored>(() => SERVER_ROUTINE_SNAPSHOT);

  useEffect(() => {
    setStored(loadStored(viewingKey));
  }, [viewingKey]);

  const tasks = stored.tasks;
  const energy = stored.energy;

  const setTask = useCallback(
    (id: string, checked: boolean) => {
      const key = viewingKey;
      setStored((prev) => {
        const nextState: Stored = {
          ...prev,
          tasks: { ...prev.tasks, [id]: checked },
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey(key), JSON.stringify(nextState));
        }
        return nextState;
      });
    },
    [viewingKey],
  );

  const setEnergyLevel = useCallback(
    (level: Exclude<Energy, "">) => {
      const key = viewingKey;
      setStored((prev) => {
        const nextEnergy: Energy = prev.energy === level ? "" : level;
        const nextState: Stored = { ...prev, energy: nextEnergy };
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey(key), JSON.stringify(nextState));
        }
        return nextState;
      });
    },
    [viewingKey],
  );

  const scheduleVariant = getScheduleVariantForLocalDay(selectedCalendarDate);
  const t = PHASE_TIMES[scheduleVariant];
  const morningGym = scheduleVariant === "morningGym";

  const countedTaskIds = useMemo(
    () =>
      ROUTINE_TASK_IDS.filter(
        (id) => id !== "evening-learn-podcast" || morningGym,
      ),
    [morningGym],
  );

  const routineCheckedCount = useMemo(() => {
    return countedTaskIds.filter((id) => tasks[id]).length;
  }, [tasks, countedTaskIds]);

  const routineTotal = countedTaskIds.length;
  const pct = routineTotal
    ? Math.round((routineCheckedCount / routineTotal) * 100)
    : 0;
  const hitEightyPlus = pct >= 80;

  const todayKey = todayKeyLocal();
  const isViewingToday = viewingKey === todayKey;

  const [heatmapMounted, setHeatmapMounted] = useState(false);
  useEffect(() => {
    setHeatmapMounted(true);
  }, []);

  const contributionCells = useMemo(() => {
    void tasks;
    void viewingKey;
    void todayKey;
    if (!heatmapMounted) return null;
    return buildChallengeContributionCells();
  }, [heatmapMounted, tasks, viewingKey, todayKey]);

  return (
    <div
      className="contain relative mx-auto max-w-2xl px-4 pt-2 pb-16"
      suppressHydrationWarning
    >
      <div className="bg-background sticky top-0 z-10 mt-3 pb-4">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Daily Dream Life Checklist
          </h1>
          <div className="text-muted-foreground flex flex-wrap justify-between items-center gap-x-2 gap-y-1 text-sm">
            <span>{format(selectedCalendarDate, "EEEE, MMM d, yyyy")} · </span>
            {isViewingToday ? (
              <Button className="rounded-md" variant="outline">
                Today
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() => setSelectedCalendarDate(new Date())}
              >
                Jump to today
              </Button>
            )}
          </div>
        </header>
        <Card className="rounded-md">
          <div className="px-3">
            <WeeklyRoutineStrip
              selected={selectedCalendarDate}
              onSelect={setSelectedCalendarDate}
            />
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>
              {routineCheckedCount} / {routineTotal} tasks · {pct}%
              {hitEightyPlus ? " · On track for 80%+" : ""}
              {!isViewingToday
                ? ` · Tracking ${viewingKey} (pick another day above)`
                : null}
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
        {/* Full-width streak outside Card (Card uses overflow-hidden) */}
        <div
          className="border-border bg-background mt-3 w-screen border-y py-5 sm:mt-4 sm:py-7"
          style={{
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <div className="mx-auto flex flex-col items-center px-4 sm:px-6">
            <p className="text-foreground text-center text-sm font-semibold sm:text-base">
              {CHALLENGE_DAYS} Days Challenge
            </p>

            <div
              role="group"
              aria-label="Twenty-one-day completion strip, oldest left to today right"
              className="mt-5 grid w-full grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-5"
            >
              {(
                contributionCells ??
                Array.from({ length: CHALLENGE_DAYS }, () => null)
              ).map((cell, idx) => {
                const streakDayIndex = idx + 1;
                return cell ? (
                  <div
                    key={cell.dateKey}
                    aria-label={`Day ${streakDayIndex} of ${CHALLENGE_DAYS}, ${cell.dateKey}, ${cell.pct} percent complete`}
                    className={cn(
                      "flex aspect-square min-h-0 min-w-0 flex-col items-center justify-center",
                      challengeHeatmapCellClass(cell.tier),
                      cell.dateKey === todayKey &&
                        "ring-ring ring-2 ring-offset-2 ring-offset-background",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums sm:text-base",
                        cell.tier === 4
                          ? "text-green-950"
                          : cell.tier === 3
                            ? "text-white drop-shadow-sm dark:text-white"
                            : "text-foreground",
                      )}
                    >
                      {streakDayIndex}
                    </span>
                  </div>
                ) : (
                  <div
                    key={`contrib-skel-${idx}`}
                    aria-hidden
                    className="bg-muted/30 aspect-square min-h-0 min-w-0 rounded-md border border-transparent"
                  />
                );
              })}
            </div>

            <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span>Intensity</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((tier) => (
                  <span
                    key={tier}
                    aria-hidden
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded sm:size-5",
                      challengeHeatmapCellClass(tier as 0 | 1 | 2 | 3 | 4),
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-2 px-1">
        <Section
          emoji="🌅"
          title="Morning Foundation"
          time={t.morningFoundation}
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
          time={t.morningUpgrade}
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

        {morningGym ? (
          <>
            <Section
              emoji="🏃"
              title="Transition"
              time={t.transition}
              description="Gym prep before your machine session (fuel, gear, commute)."
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
              time={t.fitness}
              description="Machines / your gym routine — strength focus."
            >
              <CheckRow
                id="fit-workout"
                label="Gym workout — machines / programmed routine"
                checked={!!tasks["fit-workout"]}
                onCheckedChange={setTask}
              />
            </Section>
          </>
        ) : null}

        {/* <Section
          emoji="🧠"
          title="Deep Study"
          time={t.deepStudy}
          description={
            morningGym
              ? "After gym — JavaScript / problem solving, minimal distractions until office."
              : "JavaScript / problem solving — no distractions."
          }
        >
          <CheckRow
            id="deep-js"
            label="1 hour JavaScript / problem solving (no distractions)"
            checked={!!tasks["deep-js"]}
            onCheckedChange={setTask}
          />
        </Section> */}

        <Section
          emoji="🍽️"
          title="Personal Care"
          time={t.personalCare}
          description={
            morningGym
              ? "Breakfast + homework in a tighter window before work."
              : "Home work + breakfast (eat properly for weight gain)."
          }
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
          time={t.preparation}
          description={
            morningGym
              ? "Get ready + light planning — be out the door for office on time."
              : "Get ready + light planning — set 1 improvement goal for office."
          }
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
          time={t.workPhase}
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

        {!morningGym ? (
          <>
            <Section
              emoji="🏃"
              title="Transition"
              time={t.transition}
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
              time={t.fitness}
              description="Strength training focus."
            >
              <CheckRow
                id="fit-workout"
                label="Gym workout (strength training)"
                checked={!!tasks["fit-workout"]}
                onCheckedChange={setTask}
              />
            </Section>
          </>
        ) : (
          <Section
            emoji="🎧"
            title="Evening learning"
            time={t.eveningLearnPodcast}
            description={
              "After office — courses, deliberate study, podcast listening — keep the phone parked."
            }
          >
            <CheckRow
              id="evening-learn-podcast"
              label="Evening learning and/or podcasts (focused listen, notes if useful)"
              checked={!!tasks["evening-learn-podcast"]}
              onCheckedChange={setTask}
            />
          </Section>
        )}

        <Section
          emoji="🍽️"
          title="Recovery"
          time={t.recovery}
          description={
            morningGym
              ? "After evening learning — dinner + rest — high-calorie meal, skip doomscroll."
              : "Dinner + rest — high-calorie meal, avoid phone overload."
          }
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
          time={t.skillGrowth}
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
          time={t.learning}
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
          time={t.reflection}
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
