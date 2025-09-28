import {
  PlayerActionState,
  PlayerMovementState,
} from "../components/PlayerStateComponent";
import { Weapon } from "../types/weapon";
import { PlayerAnimationData, PlayerAnimations } from "./PlayerAnimations";

type Variant = Weapon;

export const PlayerStateToAnimationMap: Record<
  Variant,
  Record<PlayerMovementState, Record<PlayerActionState, PlayerAnimationData>>
> = {
  [Weapon.Remington]: {
    [PlayerMovementState.Idle]: {
      [PlayerActionState.None]: PlayerAnimations.Remington_Idle,
      [PlayerActionState.Shoot]: PlayerAnimations.Remington_Shot,
      [PlayerActionState.Reload]: PlayerAnimations.Remington_Reload,
    },
    [PlayerMovementState.Walk]: {
      [PlayerActionState.None]: PlayerAnimations.Remington_Walk,
      [PlayerActionState.Shoot]: PlayerAnimations.Remington_Shot,
      [PlayerActionState.Reload]: PlayerAnimations.Remington_Reload,
    },
    [PlayerMovementState.Run]: {
      [PlayerActionState.None]: PlayerAnimations.Remington_Run,
      [PlayerActionState.Shoot]: PlayerAnimations.Remington_Shot,
      [PlayerActionState.Reload]: PlayerAnimations.Remington_Reload,
    },
    [PlayerMovementState.Airborne]: {
      [PlayerActionState.None]: PlayerAnimations.Remington_Idle,
      [PlayerActionState.Shoot]: PlayerAnimations.Remington_Shot,
      [PlayerActionState.Reload]: PlayerAnimations.Remington_Reload,
    },
  },
};
