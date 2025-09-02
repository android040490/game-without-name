import { EventDispatcher, Vector3 } from "three";

export type InputManagerEvents = {
  attack: { type: "attack" };
  jump: { type: "jump" };
  accelerate: { type: "accelerate"; value: boolean };
};

export interface InputManagerConfig {
  minPolarAngle: number;
  maxPolarAngle: number;
}

export abstract class InputManager extends EventDispatcher<InputManagerEvents> {
  protected minPolarAngle: number;
  protected maxPolarAngle: number;

  constructor({ minPolarAngle, maxPolarAngle }: InputManagerConfig) {
    super();

    this.minPolarAngle = minPolarAngle;
    this.maxPolarAngle = maxPolarAngle;
  }

  abstract setup(): void;
  abstract dispose(): void;
  abstract playerLocalMovementDirection: Vector3;
  abstract pitch: number;
  abstract yaw: number;
}
