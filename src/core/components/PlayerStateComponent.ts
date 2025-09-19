export enum PlayerState {
  Idle = "Idle",
  Walk = "Walk",
  Run = "Run",
  Shoot = "Shoot",
  Reload = "Reload",
}

export enum PlayerTransitionEvent {
  Shoot = "shoot",
  Reload = "reload",
  Stop = "stop",
  Move = "move",
  Run = "run",
  Finished = "finished",
}

export class PlayerStateComponent {
  public transitions: Record<
    PlayerState,
    Partial<Record<PlayerTransitionEvent, PlayerState>>
  > = {
    [PlayerState.Idle]: {
      shoot: PlayerState.Shoot,
      reload: PlayerState.Reload,
      move: PlayerState.Walk,
      run: PlayerState.Run,
    },
    [PlayerState.Shoot]: {
      [PlayerTransitionEvent.Finished]: PlayerState.Idle,
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
