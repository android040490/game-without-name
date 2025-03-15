import { AnimationData } from "./AnimationComponent";

export interface CharacterState {
  speed: number;
  animation: AnimationData;
}

export class CharacterStateComponent {
  public currentState: CharacterState;

  constructor(initialState: CharacterState) {
    this.currentState = initialState;
  }
}
