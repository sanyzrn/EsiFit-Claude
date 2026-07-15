import type { Article, DietPlan, Exercise, Program } from './types';
import type { Language } from './i18n';
import {
  ARTICLE_FA,
  DIET_FA,
  EXERCISE_FA,
  PROGRAM_FA,
  VOCAB_FA,
} from './seed/content-fa';

export function pickLocalized(lang: Language, en: string, fa?: string): string {
  return lang === 'fa' && fa ? fa : en;
}

export function localizedMuscleGroup(lang: Language, value: string): string {
  return pickLocalized(lang, value, VOCAB_FA.muscleGroups[value as keyof typeof VOCAB_FA.muscleGroups]);
}

export function localizedEquipment(lang: Language, value: string): string {
  return pickLocalized(lang, value, VOCAB_FA.equipment[value as keyof typeof VOCAB_FA.equipment]);
}

export function localizedDifficulty(lang: Language, value: Exercise['difficulty']): string {
  return pickLocalized(lang, value, VOCAB_FA.difficulty[value]);
}

export function localizedExerciseType(lang: Language, value: Exercise['type']): string {
  return pickLocalized(lang, value, VOCAB_FA.exerciseType[value]);
}

export function localizedCategory(lang: Language, value: string): string {
  return pickLocalized(lang, value, VOCAB_FA.categories[value as keyof typeof VOCAB_FA.categories]);
}

export function localizedExercise(exercise: Exercise, lang: Language) {
  const fa = EXERCISE_FA[exercise.id];
  return {
    name: pickLocalized(lang, exercise.name, fa?.name),
    instructions: pickLocalized(lang, exercise.instructions, fa?.instructions),
    commonMistakes: exercise.commonMistakes
      ? pickLocalized(lang, exercise.commonMistakes, fa?.commonMistakes)
      : undefined,
    muscleGroups: exercise.muscleGroups.map((mg) => localizedMuscleGroup(lang, mg)),
    equipment: exercise.equipment.map((eq) => localizedEquipment(lang, eq)),
    difficulty: localizedDifficulty(lang, exercise.difficulty),
    type: localizedExerciseType(lang, exercise.type),
  };
}

export function localizedProgram(program: Program, lang: Language) {
  const fa = PROGRAM_FA[program.id];
  return {
    title: pickLocalized(lang, program.title, fa?.title),
    description: pickLocalized(lang, program.description, fa?.description),
    level: pickLocalized(lang, program.level, fa?.level ?? VOCAB_FA.programLevel[program.level as keyof typeof VOCAB_FA.programLevel]),
    days: program.days.map((day) => ({
      ...day,
      title: pickLocalized(lang, day.title, fa?.days?.[day.id]),
    })),
  };
}

export function localizedDietPlan(plan: DietPlan, lang: Language) {
  const fa = DIET_FA[plan.id];
  return {
    title: pickLocalized(lang, plan.title, fa?.title),
    description: pickLocalized(lang, plan.description, fa?.description),
    meals: plan.meals.map((meal) => ({
      ...meal,
      name: pickLocalized(lang, meal.name, fa?.meals?.[meal.id]),
      items: meal.items.map((item) => ({
        ...item,
        foodName: pickLocalized(lang, item.foodName, fa?.foods?.[item.id]),
      })),
    })),
  };
}

export function localizedArticle(article: Article, lang: Language) {
  const fa = ARTICLE_FA[article.id];
  return {
    title: pickLocalized(lang, article.title, fa?.title),
    excerpt: pickLocalized(lang, article.excerpt, fa?.excerpt),
    content: pickLocalized(lang, article.content, fa?.content),
    category: localizedCategory(lang, article.category),
  };
}
