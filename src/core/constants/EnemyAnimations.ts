import { AnimationData } from "../components/AnimationComponent";

export type EnemyAnimationKey =
  | "idle"
  | "walk"
  | "walk_2"
  | "run"
  | "run_2"
  | "run_crawl"
  | "injured_run"
  | "reaction_hit"
  | "reaction_hit_2"
  | "death"
  | "death_2"
  | "scream"
  | "stand_up"
  | "stand_up_2"
  | "punch"
  | "punch_2";

export type EnemyAnimationData = AnimationData<EnemyAnimationKey>;

export class EnemyAnimations {
  static Idle(): EnemyAnimationData {
    return { actionName: "idle" };
  }
  static Scream(): EnemyAnimationData {
    return { actionName: "scream", repetitions: 1 };
  }
  static Walk(): EnemyAnimationData {
    return {
      actionName: Math.random() < 0.5 ? "walk" : "walk_2",
      timeScale: 1.5,
    };
  }
  static Run(): EnemyAnimationData {
    const random = Math.random();

    switch (true) {
      case random < 0.25:
        return { actionName: "run", timeScale: 1.25 };
      case random < 0.5:
        return { actionName: "run_2" };
      case random < 0.75:
        return { actionName: "run_crawl", timeScale: 1.35 };
      default:
        return { actionName: "injured_run", timeScale: 1.25 };
    }
  }
  static ReactionHit(): EnemyAnimationData {
    return {
      actionName: Math.random() < 0.5 ? "reaction_hit" : "reaction_hit_2",
      repetitions: 1,
      timeScale: 2,
    };
  }
  static Attack(): EnemyAnimationData {
    return {
      actionName: Math.random() < 0.5 ? "punch" : "punch_2",
      repetitions: 1,
      timeScale: 1.5,
    };
  }
  static Dying(): EnemyAnimationData {
    return {
      actionName: Math.random() < 0.5 ? "death" : "death_2",
      repetitions: 1,
    };
  }
  static StandUp(): EnemyAnimationData {
    return {
      actionName: Math.random() < 0.5 ? "stand_up" : "stand_up_2",
      repetitions: 1,
    };
  }
}
