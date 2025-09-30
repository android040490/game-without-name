export enum EnemyState {
  Idle = "Idle",
  ChaseWalk = "ChaseWalk",
  ChaseRun = "ChaseRun",
  Damaged = "Damaged",
  Dying = "Dying",
  Dead = "Dead",
  Scream = "Scream",
  StandUp = "StandUp",
}

export enum EnemyTransitionEvent {
  SeePlayer = "seePlayer",
  Die = "die",
  TakeDamage = "takeDamage",
  Finished = "finished",
}

export class EnemyStateComponent {
  public transitions: Record<
    EnemyState,
    Partial<Record<EnemyTransitionEvent, EnemyState>>
  > = {
    [EnemyState.Idle]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
      finished: EnemyState.ChaseWalk,
    },
    [EnemyState.ChaseWalk]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
    },
    [EnemyState.ChaseRun]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
    },
    [EnemyState.Damaged]: {
      die: EnemyState.Dying,
      finished: EnemyState.Scream,
    },
    [EnemyState.Scream]: {
      die: EnemyState.Dying,
      finished: EnemyState.ChaseRun,
    },
    [EnemyState.StandUp]: {
      die: EnemyState.Dying,
      finished: EnemyState.ChaseWalk,
    },
    [EnemyState.Dying]: {
      finished: EnemyState.Dead,
    },
    [EnemyState.Dead]: {},
  };

  constructor(public currentState: EnemyState) {}
}
