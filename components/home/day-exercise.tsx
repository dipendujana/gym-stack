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
          reps: "12",
          srcUrl: ["/home/chest/bench-press.mp4"],
        },
        {
          name: "Incline Dumbbell Press",
          sets: "3",
          reps: "12",
          srcUrl: [
            "/home/chest/incline-dumbbell-press.png",
            "/home/chest/incline-dumbbell-press.png",
          ],
        },
        {
          name: "Chest Fly",
          sets: "3",
          reps: "12",
          srcUrl: ["/home/chest/fly-1.png", "/home/chest/fly-2.png"],
        },
        {
          name: "Chest Press",
          sets: "3",
          reps: "12-15",
          srcUrl: [
            "/home/chest/chest-press1.png",
            "/home/chest/chest-press2.png",
          ],
        },
      ],
      exercisesType2: [
        {
          name: "Rope Pushdown",
          sets: "4",
          reps: "12",
          srcUrl: ["/home/triceps/rope-pushdown.mp4"],
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
          name: "Pull-Up",
          sets: "4",
          reps: "12",
          srcUrl: ["/home/back/pull-up.png", "/home/back/pull-up.png"],
        },
      ],
      exercisesType2: [
        {
          name: "Bicep Curl",
          sets: "4",
          reps: "12",
          srcUrl: [
            "/home/biceps/bicep-curl.png",
            "/home/biceps/bicep-curl.png",
          ],
        },
      ],
    },
  },
  {
    day: "Wednesday",
    muscleGroupName: "SHOULDERS + ABS",
    muscleGroup2: "SHOULDERS",
    muscleGroup3: "ABS",
    exercises: {
      shoulders: [],
      abs: [],
    },
  },
];

export function DayExercise() {
  const [checkedExercises, setCheckedExercises] = useState<
    Record<string, boolean>
  >({});

  const [showMoreExercise, setShowMoreExercise] = useState(false);

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
            defaultValue={dayExercises[0].day}
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
                                            autoPlay
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
                                            width={100}
                                            height={100}
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        )}
                                      </CarouselItem>
                                    ),
                                  )}
                                </CarouselContent>
                                <CarouselPrevious className="absolute top-1/2 left-4 border-amber-400" />
                                <CarouselNext className="absolute top-1/2 right-4 border-amber-400" />
                              </Carousel>
                              <div className="p-2 space-y-4 bg-gray-500 rounded-b-md">
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
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        ) : (
                                          <Image
                                            src={imageUrl}
                                            alt={exercise.name}
                                            width={100}
                                            height={100}
                                            className="h-120 w-full rounded-t-md object-cover"
                                          />
                                        )}
                                      </CarouselItem>
                                    ),
                                  )}
                                </CarouselContent>
                                <CarouselPrevious className="absolute top-1/2 left-4 border-amber-400" />
                                <CarouselNext className="absolute top-1/2 right-4 border-amber-400" />
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
