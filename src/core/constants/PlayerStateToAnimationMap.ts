import { PlayerState } from "../components/PlayerStateComponent";
import { Weapon } from "../types/weapon";
import { PlayerAnimationData, PlayerAnimations } from "./PlayerAnimations";

type Variant = Weapon;

export const PlayerStateToAnimationMap: Record<
  Variant,
  Record<PlayerState, PlayerAnimationData>
> = {
  [Weapon.Remington]: {
    [PlayerState.Shoot]: PlayerAnimations.Remington_Shot,
    [PlayerState.Reload]: PlayerAnimations.Remington_Reload,
    [PlayerState.Idle]: PlayerAnimations.Remington_Idle,
    [PlayerState.Walk]: PlayerAnimations.Remington_Walk,
    [PlayerState.Run]: PlayerAnimations.Remington_Run,
  },
};
