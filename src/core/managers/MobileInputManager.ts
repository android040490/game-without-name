import { Camera, Euler, Vector3 } from "three";
import { InputManager } from "../models/InputManager";
import {
  JoystickMoveEvent,
  LookMoveEvent,
  MobileControl,
} from "../../ui/MobileControl";

export class MobileInputManager extends InputManager {
  private readonly _euler = new Euler(0, 0, 0, "YXZ");
  private readonly _PI_2 = Math.PI / 2;
  private readonly maxPolarAngle = 2.3;
  private camera?: Camera;

  private mobileControlElement: MobileControl | null;
  private movementX = 0;
  private movementY = 0;

  constructor() {
    super();

    document.body.appendChild(document.createElement("mobile-control"));
    this.mobileControlElement = document.querySelector("mobile-control");

    this.rotateCamera = this.rotateCamera.bind(this);
    this.handleJoystickMovement = this.handleJoystickMovement.bind(this);
    this.dispatchJumpEvent = this.dispatchJumpEvent.bind(this);
    this.dispatchAttackEvent = this.dispatchAttackEvent.bind(this);
  }

  setup(camera: Camera): void {
    this.camera = camera;
    this.setListeners();
  }

  dispose(): void {
    if (this.mobileControlElement) {
      document.body.removeChild(this.mobileControlElement as Node);
    }
    this.removeListeners();
  }

  get playerLocalMovementDirection(): Vector3 {
    return new Vector3(this.movementX, 0, this.movementY);
  }

  private setListeners() {
    this.mobileControlElement?.addEventListener("look-move", this.rotateCamera);
    this.mobileControlElement?.addEventListener(
      "joystick-move",
      this.handleJoystickMovement,
    );
    this.mobileControlElement?.addEventListener(
      "jump-click",
      this.dispatchJumpEvent,
    );
    this.mobileControlElement?.addEventListener(
      "attack-click",
      this.dispatchAttackEvent,
    );
  }

  private removeListeners() {
    this.mobileControlElement?.removeEventListener(
      "look-move",
      this.rotateCamera,
    );
    this.mobileControlElement?.removeEventListener(
      "joystick-move",
      this.handleJoystickMovement,
    );
    this.mobileControlElement?.removeEventListener(
      "jump-click",
      this.dispatchJumpEvent,
    );
    this.mobileControlElement?.removeEventListener(
      "attack-click",
      this.dispatchAttackEvent,
    );
  }

  private rotateCamera(event: LookMoveEvent): void {
    if (this.camera) {
      const { x, y } = event.detail;
      this._euler.setFromQuaternion(this.camera.quaternion);
      this._euler.y -= x;
      this._euler.x -= y;
      this._euler.x = Math.max(
        this._PI_2 - this.maxPolarAngle,
        Math.min(this._PI_2, this._euler.x),
      );
      this.camera.quaternion.setFromEuler(this._euler);
    }
  }

  private handleJoystickMovement(event: JoystickMoveEvent): void {
    const { x, y, fullTilt } = event.detail;
    this.movementX = x;
    this.movementY = y;

    this.dispatchEvent({ type: "accelerate", value: !!fullTilt });
  }

  private dispatchJumpEvent(): void {
    this.dispatchEvent({ type: "jump" });
  }

  private dispatchAttackEvent(): void {
    this.dispatchEvent({ type: "attack" });
  }
}
