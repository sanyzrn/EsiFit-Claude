import type { Program } from '../types';

export const PROGRAMS: Program[] = [
  {
    id: 'prog1', slug: 'beginner-full-body', title: 'Beginner Full Body', description: 'A perfect starting point for gym newcomers. This 3-day per week program covers all major muscle groups with fundamental compound movements. Each session takes about 45-60 minutes.', goal: 'GENERAL_FITNESS', level: 'Beginner', daysPerWeek: 3, requiredTier: 'FREE',
    days: [
      { id: 'pd1', dayNumber: 1, title: 'Full Body A', exercises: [
        { id: 'pe1', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '8-10', restSeconds: 120, order: 1 },
        { id: 'pe2', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '8-10', restSeconds: 90, order: 2 },
        { id: 'pe3', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '8-10', restSeconds: 90, order: 3 },
        { id: 'pe4', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90, order: 4 },
        { id: 'pe5', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '30-45s', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd2', dayNumber: 2, title: 'Full Body B', exercises: [
        { id: 'pe6', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 3, reps: '6-8', restSeconds: 150, order: 1 },
        { id: 'pe7', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe8', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '6-10', restSeconds: 90, order: 3 },
        { id: 'pe9', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 4 },
        { id: 'pe10', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '30-45s', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd3', dayNumber: 3, title: 'Full Body C', exercises: [
        { id: 'pe11', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '10-12', restSeconds: 120, order: 1 },
        { id: 'pe12', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe13', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe14', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '10-12', restSeconds: 90, order: 4 },
        { id: 'pe15', exerciseId: 'ex10', exerciseName: 'Treadmill Running', sets: 1, reps: '15 min', restSeconds: 0, order: 5 },
      ]},
    ],
  },
  {
    id: 'prog2', slug: 'hypertrophy-upper-lower', title: 'Hypertrophy Upper/Lower Split', description: 'A 4-day upper/lower split designed for intermediate lifters chasing muscle growth. Emphasizes progressive overload in the 8-12 rep range with strategic volume distribution.', goal: 'MUSCLE_GAIN', level: 'Intermediate', daysPerWeek: 4, requiredTier: 'ECONOMY',
    days: [
      { id: 'pd4', dayNumber: 1, title: 'Upper Body A', exercises: [
        { id: 'pe16', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 120, order: 1 },
        { id: 'pe17', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe18', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90, order: 3 },
        { id: 'pe19', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '8-12', restSeconds: 90, order: 4 },
        { id: 'pe20', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 5 },
      ]},
      { id: 'pd5', dayNumber: 2, title: 'Lower Body A', exercises: [
        { id: 'pe21', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, order: 1 },
        { id: 'pe22', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe23', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 3, reps: '6-8', restSeconds: 150, order: 3 },
        { id: 'pe24', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '45-60s', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd6', dayNumber: 3, title: 'Upper Body B', exercises: [
        { id: 'pe25', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 3, reps: '10-12', restSeconds: 90, order: 1 },
        { id: 'pe26', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 4, reps: '6-10', restSeconds: 90, order: 2 },
        { id: 'pe27', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe28', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '10-12', restSeconds: 90, order: 4 },
      ]},
      { id: 'pd7', dayNumber: 4, title: 'Lower Body B', exercises: [
        { id: 'pe29', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 4, reps: '5-6', restSeconds: 180, order: 1 },
        { id: 'pe30', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '10-12', restSeconds: 120, order: 2 },
        { id: 'pe31', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '15-20', restSeconds: 90, order: 3 },
      ]},
    ],
  },
  {
    id: 'prog3', slug: 'strength-powerlifting', title: 'Strength Powerlifting Program', description: 'An advanced 5-day powerlifting-focused program designed for maximum strength gains on the big three lifts. Includes periodized intensity and volume with specific accessory work.', goal: 'STRENGTH', level: 'Advanced', daysPerWeek: 5, requiredTier: 'VIP',
    days: [
      { id: 'pd8', dayNumber: 1, title: 'Heavy Squat Day', exercises: [
        { id: 'pe32', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 5, reps: '3-5', restSeconds: 240, order: 1 },
        { id: 'pe33', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 4, reps: '8-10', restSeconds: 120, order: 2 },
        { id: 'pe34', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '60s', restSeconds: 60, order: 3 },
      ]},
      { id: 'pd9', dayNumber: 2, title: 'Heavy Bench Day', exercises: [
        { id: 'pe35', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 5, reps: '3-5', restSeconds: 240, order: 1 },
        { id: 'pe36', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe37', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, order: 3 },
      ]},
      { id: 'pd10', dayNumber: 3, title: 'Heavy Deadlift Day', exercises: [
        { id: 'pe38', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 5, reps: '2-4', restSeconds: 300, order: 1 },
        { id: 'pe39', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120, order: 2 },
        { id: 'pe40', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '8-12', restSeconds: 90, order: 3 },
      ]},
      { id: 'pd11', dayNumber: 4, title: 'Volume Squat/Bench', exercises: [
        { id: 'pe41', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 4, reps: '8-10', restSeconds: 120, order: 1 },
        { id: 'pe42', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '8-10', restSeconds: 120, order: 2 },
      ]},
      { id: 'pd12', dayNumber: 5, title: 'Accessory Day', exercises: [
        { id: 'pe43', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 4, reps: '10-15', restSeconds: 90, order: 1 },
        { id: 'pe44', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20', restSeconds: 60, order: 2 },
        { id: 'pe45', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '60-90s', restSeconds: 60, order: 3 },
      ]},
    ],
  },
  {
    id: 'prog4', slug: 'fat-loss-circuit', title: 'Fat Loss Full Body Circuit', description: 'A 3-day conditioning-focused plan pairing compound lifts with short rest intervals and finishers. Built to preserve muscle while improving work capacity and calorie burn.', goal: 'FAT_LOSS', level: 'Intermediate', daysPerWeek: 3, requiredTier: 'ECONOMY',
    days: [
      { id: 'pd13', dayNumber: 1, title: 'Circuit A', exercises: [
        { id: 'pe46', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 3, reps: '12-15', restSeconds: 60, order: 1 },
        { id: 'pe47', exerciseId: 'ex11', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '12-15', restSeconds: 60, order: 2 },
        { id: 'pe48', exerciseId: 'ex13', exerciseName: 'Lat Pulldown', sets: 3, reps: '12-15', restSeconds: 60, order: 3 },
        { id: 'pe49', exerciseId: 'ex10', exerciseName: 'Treadmill Running', sets: 1, reps: '10 min', restSeconds: 0, order: 4 },
      ]},
      { id: 'pd14', dayNumber: 2, title: 'Circuit B', exercises: [
        { id: 'pe50', exerciseId: 'ex18', exerciseName: 'Walking Lunge', sets: 3, reps: '12/leg', restSeconds: 60, order: 1 },
        { id: 'pe51', exerciseId: 'ex15', exerciseName: 'Tricep Rope Pushdown', sets: 3, reps: '15-20', restSeconds: 45, order: 2 },
        { id: 'pe52', exerciseId: 'ex14', exerciseName: 'Barbell Curl', sets: 3, reps: '12-15', restSeconds: 45, order: 3 },
        { id: 'pe53', exerciseId: 'ex9', exerciseName: 'Plank', sets: 3, reps: '45s', restSeconds: 45, order: 4 },
      ]},
      { id: 'pd15', dayNumber: 3, title: 'Circuit C', exercises: [
        { id: 'pe54', exerciseId: 'ex20', exerciseName: 'Barbell Hip Thrust', sets: 3, reps: '12-15', restSeconds: 60, order: 1 },
        { id: 'pe55', exerciseId: 'ex19', exerciseName: 'Cable Chest Fly', sets: 3, reps: '15-20', restSeconds: 45, order: 2 },
        { id: 'pe56', exerciseId: 'ex17', exerciseName: 'Face Pull', sets: 3, reps: '15-20', restSeconds: 45, order: 3 },
        { id: 'pe57', exerciseId: 'ex16', exerciseName: 'Standing Calf Raise', sets: 3, reps: '15-20', restSeconds: 45, order: 4 },
      ]},
    ],
  },
  {
    id: 'prog5', slug: 'push-pull-legs', title: 'Push Pull Legs Hypertrophy', description: 'A classic 6-day PPL split for lifters who can train frequently and recover well. High volume across pressing, pulling, and leg patterns with targeted accessories.', goal: 'MUSCLE_GAIN', level: 'Advanced', daysPerWeek: 6, requiredTier: 'VIP',
    days: [
      { id: 'pd16', dayNumber: 1, title: 'Push A', exercises: [
        { id: 'pe58', exerciseId: 'ex1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 120, order: 1 },
        { id: 'pe59', exerciseId: 'ex11', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
        { id: 'pe60', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90, order: 3 },
        { id: 'pe61', exerciseId: 'ex15', exerciseName: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd17', dayNumber: 2, title: 'Pull A', exercises: [
        { id: 'pe62', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120, order: 1 },
        { id: 'pe63', exerciseId: 'ex5', exerciseName: 'Pull-Up', sets: 3, reps: '8-12', restSeconds: 90, order: 2 },
        { id: 'pe64', exerciseId: 'ex13', exerciseName: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe65', exerciseId: 'ex14', exerciseName: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd18', dayNumber: 3, title: 'Legs A', exercises: [
        { id: 'pe66', exerciseId: 'ex2', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, order: 1 },
        { id: 'pe67', exerciseId: 'ex12', exerciseName: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 120, order: 2 },
        { id: 'pe68', exerciseId: 'ex8', exerciseName: 'Leg Press', sets: 3, reps: '12-15', restSeconds: 90, order: 3 },
        { id: 'pe69', exerciseId: 'ex16', exerciseName: 'Standing Calf Raise', sets: 4, reps: '15-20', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd19', dayNumber: 4, title: 'Push B', exercises: [
        { id: 'pe70', exerciseId: 'ex19', exerciseName: 'Cable Chest Fly', sets: 4, reps: '12-15', restSeconds: 60, order: 1 },
        { id: 'pe71', exerciseId: 'ex7', exerciseName: 'Dumbbell Lateral Raise', sets: 3, reps: '15-20', restSeconds: 60, order: 2 },
        { id: 'pe72', exerciseId: 'ex4', exerciseName: 'Overhead Press', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe73', exerciseId: 'ex15', exerciseName: 'Tricep Rope Pushdown', sets: 3, reps: '15-20', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd20', dayNumber: 5, title: 'Pull B', exercises: [
        { id: 'pe74', exerciseId: 'ex3', exerciseName: 'Conventional Deadlift', sets: 3, reps: '5-6', restSeconds: 180, order: 1 },
        { id: 'pe75', exerciseId: 'ex17', exerciseName: 'Face Pull', sets: 3, reps: '15-20', restSeconds: 60, order: 2 },
        { id: 'pe76', exerciseId: 'ex6', exerciseName: 'Barbell Bent-Over Row', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe77', exerciseId: 'ex14', exerciseName: 'Barbell Curl', sets: 3, reps: '12-15', restSeconds: 60, order: 4 },
      ]},
      { id: 'pd21', dayNumber: 6, title: 'Legs B', exercises: [
        { id: 'pe78', exerciseId: 'ex20', exerciseName: 'Barbell Hip Thrust', sets: 4, reps: '8-10', restSeconds: 120, order: 1 },
        { id: 'pe79', exerciseId: 'ex18', exerciseName: 'Walking Lunge', sets: 3, reps: '12/leg', restSeconds: 90, order: 2 },
        { id: 'pe80', exerciseId: 'ex12', exerciseName: 'Romanian Deadlift', sets: 3, reps: '10-12', restSeconds: 90, order: 3 },
        { id: 'pe81', exerciseId: 'ex16', exerciseName: 'Standing Calf Raise', sets: 4, reps: '20', restSeconds: 45, order: 4 },
      ]},
    ],
  },
];
