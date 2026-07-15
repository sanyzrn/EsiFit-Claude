import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type CalculatorModule = Record<string, ComponentType<unknown>>;

function lazyNamed<T extends CalculatorModule>(
  loader: () => Promise<T>,
  name: keyof T & string,
): LazyExoticComponent<ComponentType> {
  return lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })));
}

export const BmiCalculator = lazyNamed(() => import('./BodyCompositionCalculators'), 'BmiCalculator');
export const BodyFatCalculator = lazyNamed(() => import('./BodyCompositionCalculators'), 'BodyFatCalculator');
export const FfmiCalculator = lazyNamed(() => import('./BodyCompositionCalculators'), 'FfmiCalculator');
export const WhrCalculator = lazyNamed(() => import('./BodyCompositionCalculators'), 'WhrCalculator');
export const BodyTypeQuiz = lazyNamed(() => import('./BodyCompositionCalculators'), 'BodyTypeQuiz');

export const BmrCalculator = lazyNamed(() => import('./EnergyNutritionCalculators'), 'BmrCalculator');
export const TdeeCalculator = lazyNamed(() => import('./EnergyNutritionCalculators'), 'TdeeCalculator');
export const MacrosCalculator = lazyNamed(() => import('./EnergyNutritionCalculators'), 'MacrosCalculator');
export const WaterIntakeCalculator = lazyNamed(() => import('./EnergyNutritionCalculators'), 'WaterIntakeCalculator');

export const OneRepMaxCalculator = lazyNamed(() => import('./StrengthTrainingCalculators'), 'OneRepMaxCalculator');
export const VolumeLoadCalculator = lazyNamed(() => import('./StrengthTrainingCalculators'), 'VolumeLoadCalculator');

export const GoalDateCalculator = lazyNamed(() => import('./HealthLifestyleCalculators'), 'GoalDateCalculator');
export const CaloriesBurnedCalculator = lazyNamed(() => import('./HealthLifestyleCalculators'), 'CaloriesBurnedCalculator');

export const CALC_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  bmi: BmiCalculator,
  'body-fat': BodyFatCalculator,
  bmr: BmrCalculator,
  tdee: TdeeCalculator,
  macros: MacrosCalculator,
  'one-rep-max': OneRepMaxCalculator,
  ffmi: FfmiCalculator,
  whr: WhrCalculator,
  'water-intake': WaterIntakeCalculator,
  'goal-date': GoalDateCalculator,
  'calories-burned': CaloriesBurnedCalculator,
  'body-type-quiz': BodyTypeQuiz,
  'volume-load': VolumeLoadCalculator,
  'rep-max-table': OneRepMaxCalculator,
};

export const BodyCompositionTab = lazy(() =>
  import('./BodyCompositionCalculators').then((module) => ({
    default: function BodyCompositionTab() {
      return (
        <div className="space-y-8">
          <module.BmiCalculator />
          <module.BodyFatCalculator />
          <module.FfmiCalculator />
          <module.WhrCalculator />
          <module.BodyTypeQuiz />
        </div>
      );
    },
  })),
);

export const EnergyNutritionTab = lazy(() =>
  import('./EnergyNutritionCalculators').then((module) => ({
    default: function EnergyNutritionTab() {
      return (
        <div className="space-y-8">
          <module.BmrCalculator />
          <module.TdeeCalculator />
          <module.MacrosCalculator />
          <module.WaterIntakeCalculator />
        </div>
      );
    },
  })),
);

export const StrengthTrainingTab = lazy(() =>
  import('./StrengthTrainingCalculators').then((module) => ({
    default: function StrengthTrainingTab() {
      return (
        <div className="space-y-8">
          <module.OneRepMaxCalculator />
          <module.VolumeLoadCalculator />
        </div>
      );
    },
  })),
);

export const HealthLifestyleTab = lazy(() =>
  import('./HealthLifestyleCalculators').then((module) => ({
    default: function HealthLifestyleTab() {
      return (
        <div className="space-y-8">
          <module.GoalDateCalculator />
          <module.CaloriesBurnedCalculator />
        </div>
      );
    },
  })),
);
