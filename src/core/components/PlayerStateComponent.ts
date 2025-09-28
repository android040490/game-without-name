export enum PlayerMovementState {
  Idle = "Idle",
  Walk = "Walk",
  Run = "Run",
  Airborne = "Airborne",
}

export enum PlayerActionState {
  None = "None",
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
  InAir = "inAir",
  Land = "land",
}

export class PlayerStateComponent {
  public movementTransitions: Record<
    PlayerMovementState,
    Partial<Record<PlayerTransitionEvent, PlayerMovementState>>
  > = {
    [PlayerMovementState.Idle]: {
      move: PlayerMovementState.Walk,
      run: PlayerMovementState.Run,
      inAir: PlayerMovementState.Airborne,
    },
    [PlayerMovementState.Walk]: {
      stop: PlayerMovementState.Idle,
      run: PlayerMovementState.Run,
      inAir: PlayerMovementState.Airborne,
    },
    [PlayerMovementState.Run]: {
      stop: PlayerMovementState.Idle,
      move: PlayerMovementState.Walk,
      inAir: PlayerMovementState.Airborne,
    },
    [PlayerMovementState.Airborne]: {
      land: PlayerMovementState.Idle,
    },
  };

  public actionTransitions: Record<
    PlayerActionState,
    Partial<Record<PlayerTransitionEvent, PlayerActionState>>
  > = {
    [PlayerActionState.None]: {
      shoot: PlayerActionState.Shoot,
      reload: PlayerActionState.Reload,
    },
    [PlayerActionState.Shoot]: {
      [PlayerTransitionEvent.Finished]: PlayerActionState.None,
    },
    [PlayerActionState.Reload]: {
      finished: PlayerActionState.None,
    },
  };

  constructor(
    public movementState: PlayerMovementState,
    public actionState: PlayerActionState,
  ) {}
}
