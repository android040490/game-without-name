export type CharacterStateKey = "idle" | "walk" | "run";

const CharacterStateKeys: CharacterStateKey[] = ["idle", "walk", "run"];

interface CharacterState {
  speed: number;
  animation: CharacterStateKey;
}

type CharacterStates = Record<CharacterStateKey, CharacterState>;

const CHARACTER_STATES: CharacterStates = {
  idle: { speed: 0, animation: "idle" },
  walk: { speed: 2, animation: "walk" },
  run: { speed: 7, animation: "run" },
};

export class CharacterStateComponent {
  public currentState: CharacterState;

  constructor(initialStateKey: CharacterStateKey) {
    this.currentState = CHARACTER_STATES[initialStateKey];

    setInterval(() => {
      this.currentState =
        CHARACTER_STATES[CharacterStateKeys[Math.floor(Math.random() * 3)]];
    }, 3000);
  }
}
