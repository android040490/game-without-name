import { AnimationData } from "../components/AnimationComponent";

export type PlayerAnimationKey =
  | "Idle"
  | "Attack_01"
  | "Attack_02"
  | "Attack_03"
  | "Attack_04";

interface PlayerAnimationData extends AnimationData<PlayerAnimationKey> {
  type: "attack" | "idle" | "movement";
}

export class PlayerAnimations {
  static readonly Idle: PlayerAnimationData = {
    actionName: "Idle",
    type: "idle",
  };
  static readonly Attack_01: PlayerAnimationData = {
    type: "attack",
    actionName: "Attack_01",
    nextAnimation: PlayerAnimations.Idle,
    repetitions: 1,
  };
  static readonly Attack_02: PlayerAnimationData = {
    type: "attack",
    actionName: "Attack_02",
    nextAnimation: PlayerAnimations.Idle,
    repetitions: 1,
  };
  static readonly Attack_03: PlayerAnimationData = {
    type: "attack",
    actionName: "Attack_03",
    nextAnimation: PlayerAnimations.Idle,
    repetitions: 1,
  };
  static readonly Attack_04: PlayerAnimationData = {
    type: "attack",
    actionName: "Attack_04",
    nextAnimation: PlayerAnimations.Idle,
    repetitions: 1,
  };

  static readonly ALL: Record<PlayerAnimationKey, PlayerAnimationData> = {
    Idle: PlayerAnimations.Idle,
    Attack_01: PlayerAnimations.Attack_01,
    Attack_02: PlayerAnimations.Attack_02,
    Attack_03: PlayerAnimations.Attack_03,
    Attack_04: PlayerAnimations.Attack_04,
  };

  static get ATTACKS(): PlayerAnimationData[] {
    return Object.values(this.ALL).filter(
      (animationData) => animationData.type === "attack",
    );
  }
}
