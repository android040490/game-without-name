import { Camera, EventDispatcher, Vector3 } from "three";

export type InputManagerEvents = {
  attack: { type: "attack" };
  jump: { type: "jump" };
  accelerate: { type: "accelerate"; value: boolean };
};

export abstract class InputManager extends EventDispatcher<InputManagerEvents> {
  abstract setup(camera: Camera): void;
  abstract dispose(): void;
  abstract playerLocalMovementDirection: Vector3;
}
