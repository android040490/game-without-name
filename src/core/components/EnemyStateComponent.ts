export enum EnemyState {
  Idle = "Idle",
  ChaseWalk = "ChaseWalk",
  ChaseRun = "ChaseRun",
  Damaged = "Damaged",
  Dying = "Dying",
  Dead = "Dead",
  Scream = "Scream",
  StandUp = "StandUp",
  Attack = "Attack",
}

export enum EnemyTransitionEvent {
  SeePlayer = "seePlayer",
  Die = "die",
  TakeDamage = "takeDamage",
  Finished = "finished",
  StartAttack = "startAttack",
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
      startAttack: EnemyState.Attack,
    },
    [EnemyState.ChaseWalk]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
      startAttack: EnemyState.Attack,
    },
    [EnemyState.ChaseRun]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
      startAttack: EnemyState.Attack,
    },
    [EnemyState.Attack]: {
      takeDamage: EnemyState.Damaged,
      die: EnemyState.Dying,
      finished: EnemyState.ChaseWalk,
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
