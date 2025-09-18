import { StateTransitionEvent } from "../systems/PlayerStateMachineSystem";

export enum PlayerState {
  Idle = "Idle",
  Walk = "Walk",
  Run = "Run",
  Shoot = "Shoot",
  Reload = "Reload",
}

// TODO: consider to make this component reusable for NPC
export class PlayerStateComponent {
  public transitions: Record<
    PlayerState,
    Partial<Record<StateTransitionEvent, PlayerState>>
  > = {
    [PlayerState.Idle]: {
      shoot: PlayerState.Shoot,
      reload: PlayerState.Reload,
      move: PlayerState.Walk,
      run: PlayerState.Run,
    },
    [PlayerState.Shoot]: {
      finished: PlayerState.Idle,
    },
    [PlayerState.Reload]: {
      finished: PlayerState.Idle,
    },
    [PlayerState.Walk]: {
      stop: PlayerState.Idle,
      reload: PlayerState.Reload,
      run: PlayerState.Run,
      shoot: PlayerState.Shoot,
    },
    [PlayerState.Run]: {
      stop: PlayerState.Idle,
      reload: PlayerState.Reload,
      move: PlayerState.Walk,
      shoot: PlayerState.Shoot,
    },
  };

  constructor(public currentState: PlayerState) {}
}
