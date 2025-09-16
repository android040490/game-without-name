export enum PlayerState {
  Idle,
  Walk,
  Run,
  Shot,
  Reload,
}

export class PlayerStateComponent {
  constructor(public currentState: PlayerState) {}
}
