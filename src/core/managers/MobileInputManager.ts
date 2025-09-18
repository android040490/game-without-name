import { Vector3 } from "three";
import { InputManager, InputManagerConfig } from "../models/InputManager";
import {
  JoystickMoveEvent,
  LookMoveEvent,
  MobileControl,
} from "../../ui/MobileControl";

export class MobileInputManager extends InputManager {
  private readonly _PI_2 = Math.PI / 2;

  private mobileControlElement: MobileControl | null;
  private movement = new Vector3(0, 0, 0);

  public yaw = 0;
  public pitch = 0;

  constructor(config: InputManagerConfig) {
    super(config);

    document.body.appendChild(document.createElement("mobile-control"));
    this.mobileControlElement = document.querySelector("mobile-control");

    this.rotateCamera = this.rotateCamera.bind(this);
    this.handleJoystickMovement = this.handleJoystickMovement.bind(this);
    this.dispatchJumpEvent = this.dispatchJumpEvent.bind(this);
    this.dispatchAttackEvent = this.dispatchAttackEvent.bind(this);
  }

  setup(): void {
    this.setListeners();
  }

  dispose(): void {
    if (this.mobileControlElement) {
      document.body.removeChild(this.mobileControlElement as Node);
    }
    this.removeListeners();
  }

  get playerLocalMovementDirection(): Vector3 {
    return this.movement;
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
    const { x, y } = event.detail;
    this.yaw -= x;
    this.pitch -= y;
    this.pitch = Math.max(
      this._PI_2 - this.maxPolarAngle,
      Math.min(this._PI_2 - this.minPolarAngle, this.pitch),
    );
  }

  private handleJoystickMovement(event: JoystickMoveEvent): void {
    const { x, y, fullTilt } = event.detail;
    this.movement.set(x, 0, y);

    this.dispatchEvent({ type: "accelerate", value: !!fullTilt });
  }

  private dispatchJumpEvent(): void {
    this.dispatchEvent({ type: "jump" });
  }

  private dispatchAttackEvent(): void {
    this.dispatchEvent({ type: "attack" });
  }
}
