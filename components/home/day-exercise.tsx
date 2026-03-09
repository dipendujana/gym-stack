"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Button } from "../ui/button";

export const dayExercises = [
  {
    day: "Monday",
    muscleGroupName: "CHEST + TRICEPS",
    muscleGroup2: "CHEST",
    muscleGroup3: "TRICEPS",
    exercises: {
      exercisesType1: [
        {
          name: "Bench Press",
          sets: "4",
          reps: "8-12",
          srcUrl: ["/home/chest/bench-press.mp4"],
        },
        {
          name: "Incline Dumbbell Press",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/chest/incline-dumbbell-press.mp4"],
        },
        {
          name: "Chest Fly",
          sets: "3",
          reps: "12",
          srcUrl: ["/home/chest/fly.mp4"],
        },
        {
          name: "Chest Press Machine",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/chest/chest-press.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Rope Pushdown",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/triceps/rope-pushdown.mp4"],
        },
        {
          name: "Overhead Tricep Extension",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/triceps/overhead-extension.mp4"],
        },
      ],
    },
  },

  {
    day: "Tuesday",
    muscleGroupName: "BACK + BICEPS",
    muscleGroup2: "BACK",
    muscleGroup3: "BICEPS",
    exercises: {
      exercisesType1: [
        {
          name: "Lat Pulldown",
          sets: "4",
          reps: "8-12",
          srcUrl: ["/home/back/lat-pulldown.mp4"],
        },
        {
          name: "Seated Cable Row",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/back/seated-row.mp4"],
        },
        {
          name: "Barbell Row",
          sets: "3",
          reps: "8-12",
          srcUrl: ["/home/back/barbell-bent-over.mp4"],
        },
        {
          name: " T-Bar Rows",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/back/t-bar-rows.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Barbell Bicep Curl",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/biceps/wide-barbell-curl1.png"],
        },
        {
          name: "Biceps + Forearm",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/biceps/biceps_forearm.mp4"],
        },
      ],
    },
  },

  {
    day: "Wednesday",
    muscleGroupName: "LEGS + CALVES",
    muscleGroup2: "LEGS",
    muscleGroup3: "CALVES",
    exercises: {
      exercisesType1: [
        {
          name: "Squats",
          sets: "4",
          reps: "8-12",
          srcUrl: ["/home/legs/squats.mp4"],
        },
        {
          name: "Leg Press",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/legs/leg-press.mp4"],
        },
        {
          name: "Leg Curl",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/legs/leg-curl.mp4"],
        },
        {
          name: "Leg Extension",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/legs/leg2.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Standing Calf Raise",
          sets: "4",
          reps: "12-15",
          srcUrl: ["/home/legs/squats2.mp4"],
        },
      ],
    },
  },

  {
    day: "Thursday",
    muscleGroupName: "SHOULDERS + ABS",
    muscleGroup2: "SHOULDERS",
    muscleGroup3: "CORE",
    exercises: {
      exercisesType1: [
        {
          name: "Shoulder Press",
          sets: "4",
          reps: "8-12",
          srcUrl: ["/home/shoulders/shoulder-press.mp4"],
        },
        {
          name: "Lateral Raise",
          sets: "3",
          reps: "12",
          srcUrl: ["/home/shoulders/lateral-raise.mp4"],
        },
        {
          name: "Front Raise",
          sets: "3",
          reps: "12",
          srcUrl: ["/home/shoulders/front-raise.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Abs",
          sets: "3",
          reps: "12-15",
          srcUrl: ["/home/abs/abs.mp4"],
        },
      ],
    },
  },

  {
    day: "Friday",
    muscleGroupName: "CHEST (LIGHT) + ARMS",
    muscleGroup2: "CHEST",
    muscleGroup3: "ARMS",
    exercises: {
      exercisesType1: [
        {
          name: "Incline Bench Press",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/chest/bench-press.mp4"],
        },
        {
          name: "Push-Ups",
          sets: "3",
          reps: "15",
          srcUrl: ["/exercise/push-up-1.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Tricep Dips",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/triceps/dips1.mp4"],
        },
        {
          name: "Concentration Curl",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/biceps/concentration-curl.mp4"],
        },
      ],
    },
  },

  {
    day: "Saturday",
    muscleGroupName: "BACK + REAR SHOULDER",
    muscleGroup2: "BACK",
    muscleGroup3: "REAR DELTS",
    exercises: {
      exercisesType1: [
        {
          name: "Deadlift",
          sets: "4",
          reps: "6-10",
          srcUrl: ["/home/back/deadlift.mp4"],
        },
        {
          name: "Lat Pulldown",
          sets: "3",
          reps: "10-12",
          srcUrl: ["/home/back/lat-pulldown.mp4"],
        },
      ],
      exercisesType2: [
        {
          name: "Face Pull",
          sets: "3",
          reps: "12-15",
          srcUrl: ["/home/shoulders/face-pull.mp4"],
        },
      ],
    },
  },

  {
    day: "Sunday",
    muscleGroupName: "REST / ACTIVE RECOVERY",
    muscleGroup2: "RECOVERY",
    muscleGroup3: "STRETCHING",
    exercises: {
      exercisesType1: [
        {
          name: "Light Walking",
          sets: "20-30 min",
          reps: "-",
          srcUrl: ["/home/legs/walking1.jpg"],
        },
      ],
    },
  },
];

export function DayExercise() {
  const [checkedExercises, setCheckedExercises] = useState<
    Record<string, boolean>
  >({});

  const [showMoreExercise, setShowMoreExercise] = useState(false);
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = weekDays[new Date().getDay()];
  const defaultOpenDay = dayExercises.some((day) => day.day === today)
    ? today
    : dayExercises[0]?.day;

  const toggleExercise = (
    exerciseId: string,
    checked: boolean | "indeterminate",
  ) => {
    setCheckedExercises((prev) => ({
      ...prev,
      [exerciseId]: checked === true,
    }));
  };

  return (
    <section className="">
      <div className="contain px-4 lg:px-10">
        <h2 className="py-6 mb-8 text-center text-xl lg:text-3xl shadow-xl shadow-blue-200/50 border-gray-200 pb-4 font-bold rounded-sm">
          Everyday Exercise Plan
        </h2>
        <div>
          <Accordion
            type="single"
            collapsible
            defaultValue={defaultOpenDay}
            className="w-full"
          >
            {dayExercises.map((day) => (
              <AccordionItem key={day.day} value={day.day}>
                <AccordionTrigger>{day.day}</AccordionTrigger>
                <AccordionContent className="border shadow-md rounded-md p-4 mb-4">
                  <div>
                    <div>
                      <h3 className="text-lg font-bold text-center mb-4 border-b pb-4">
                        {day.muscleGroupName}
                      </h3>
                      <h3 className="text-lg font-bold text-center mb-4">
                        {day.muscleGroup2}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {day.exercises.exercisesType1?.map(
                          (exercise, index) => (
                            <div
                              key={`${day.day}-${index}`}
                              className="shadow-md rounded-md border border-gray-200 overflow-hidden"
                            >
                              <Carousel className="w-full">
                                <CarouselContent>
                                  {exercise.srcUrl.map(
                                    (imageUrl, imageIndex) => (
                                      <CarouselItem
                                        key={`${exercise.name}-${imageIndex}`}
                                      >
                                        {imageUrl.endsWith(".mp4") ? (
                                          <video
                                            src={imageUrl}
                                            loop
                                            muted
                                            playsInline
                                            controls
                                            className="h-120 w-full object-cover"
                                          />
                                        ) : (
                                          <Image
                                            src={imageUrl}
                                            alt={exercise.name}
                                            width={1000}
                                            height={1000}
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        )}
                                      </CarouselItem>
                                    ),
                                  )}
                                </CarouselContent>
                                <CarouselPrevious className="absolute top-1/2 left-4" />
                                <CarouselNext className="absolute top-1/2 right-4" />
                              </Carousel>
                              <div className="p-2 space-y-4 bg-gray-100 rounded-b-md">
                                {(() => {
                                  const exerciseId = `${day.day}-${index}`;
                                  const isChecked =
                                    checkedExercises[exerciseId] ?? false;

                                  return (
                                    <div className="flex gap-2 items-center">
                                      <Checkbox
                                        id={exerciseId}
                                        checked={isChecked}
                                        className="border-black cursor-pointer"
                                        onCheckedChange={(checked) =>
                                          toggleExercise(exerciseId, checked)
                                        }
                                      />
                                      <h4
                                        className={cn(
                                          "text-lg font-bold text-center",
                                          isChecked &&
                                            "line-through text-foreground/80",
                                        )}
                                      >
                                        {exercise.name}
                                      </h4>
                                    </div>
                                  );
                                })()}
                                <div className="flex gap-4 justify-between">
                                  <p className="font-medium">
                                    Sets No: <span>{exercise.sets}</span>
                                  </p>
                                  <p className="font-medium">
                                    Reps:{" "}
                                    <span className="font-normal">
                                      {exercise.reps}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button
                          className="w-fit"
                          onClick={() => setShowMoreExercise((prev) => !prev)}
                        >
                          {showMoreExercise ? "Hide Exercise" : "More Exercise"}
                        </Button>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "mt-4",
                        showMoreExercise ? "block" : "hidden",
                      )}
                    >
                      <h3 className="text-lg font-bold text-center mb-4 border-b pb-4">
                        {day.muscleGroup3}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {day.exercises.exercisesType2?.map(
                          (exercise, index) => (
                            <div
                              key={`${day.day}-${index}`}
                              className="shadow-md rounded-md border border-gray-200"
                            >
                              <Carousel className="w-full">
                                <CarouselContent>
                                  {exercise.srcUrl.map(
                                    (imageUrl, imageIndex) => (
                                      <CarouselItem
                                        key={`${exercise.name}-${imageIndex}`}
                                      >
                                        {imageUrl.endsWith(".mp4") ? (
                                          <video
                                            src={imageUrl}
                                            muted
                                            controls
                                            playsInline
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        ) : (
                                          <Image
                                            src={imageUrl}
                                            alt={exercise.name}
                                            width={1000}
                                            height={1000}
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        )}
                                      </CarouselItem>
                                    ),
                                  )}
                                </CarouselContent>
                                <CarouselPrevious className="absolute top-1/2 left-4" />
                                <CarouselNext className="absolute top-1/2 right-4" />
                              </Carousel>
                              <div className="p-2 space-y-4 bg-gray-100 rounded-b-md">
                                {(() => {
                                  const exerciseId = `${day.day}-${index}`;
                                  const isChecked =
                                    checkedExercises[exerciseId] ?? false;

                                  return (
                                    <div className="flex gap-2 items-center">
                                      <Checkbox
                                        id={exerciseId}
                                        checked={isChecked}
                                        className="border-black cursor-pointer"
                                        onCheckedChange={(checked) =>
                                          toggleExercise(exerciseId, checked)
                                        }
                                      />
                                      <h4
                                        className={cn(
                                          "text-lg font-bold text-center",
                                          isChecked &&
                                            "line-through text-foreground/80",
                                        )}
                                      >
                                        {exercise.name}
                                      </h4>
                                    </div>
                                  );
                                })()}
                                <div className="flex gap-4 justify-between">
                                  <p className="font-medium">
                                    Sets No: <span>{exercise.sets}</span>
                                  </p>
                                  <p className="font-medium">
                                    Reps:{" "}
                                    <span className="font-normal">
                                      {exercise.reps}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
