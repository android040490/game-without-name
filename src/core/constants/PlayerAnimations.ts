import { AnimationData } from "../components/AnimationComponent";

export type PlayerAnimationKey =
  | "Remington_Idle"
  | "Remington_Reload"
  | "Remington_Shot"
  | "Remington_Walk";

export interface PlayerAnimationData extends AnimationData<PlayerAnimationKey> {
  type: "attack" | "idle" | "movement";
}

export class PlayerAnimations {
  static readonly Remington_Idle: PlayerAnimationData = {
    type: "idle",
    actionName: "Remington_Idle",
  };
  static readonly Remington_Shot: PlayerAnimationData = {
    type: "attack",
    actionName: "Remington_Shot",
    repetitions: 1,
  };
  static readonly Remington_Walk: PlayerAnimationData = {
    type: "movement",
    actionName: "Remington_Walk",
  };
  static readonly Remington_Run: PlayerAnimationData = {
    type: "movement",
    actionName: "Remington_Walk",
    timeScale: 2,
  };
  static readonly Remington_Reload: PlayerAnimationData = {
    type: "idle",
    actionName: "Remington_Reload",
    timeScale: 1.7,
    repetitions: 1,
  };
}
