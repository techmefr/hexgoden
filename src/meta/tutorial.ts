import type { Progress } from "./store";

export const TUTORIAL_STEPS = 5;

export const tutorialActive = (progress: Progress): boolean => progress.tutorial < TUTORIAL_STEPS;

export const advanceTutorial = (progress: Progress, from: number): Progress =>
  progress.tutorial === from ? { ...progress, tutorial: from + 1 } : progress;

export const skipTutorial = (progress: Progress): Progress => ({ ...progress, tutorial: TUTORIAL_STEPS });

export const replayTutorial = (progress: Progress): Progress => ({ ...progress, tutorial: 0 });
