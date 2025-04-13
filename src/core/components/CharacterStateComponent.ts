import { AnimationData } from "./AnimationComponent";

export interface CharacterState {
  name: string;
  speed: number;
  animation: AnimationData;
  nextState?: CharacterState;
}

export class CharacterStateComponent {
  public currentState: CharacterState;

  constructor(initialState: CharacterState) {
    this.currentState = initialState;
  }
}
