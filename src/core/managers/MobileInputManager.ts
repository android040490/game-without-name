import { Camera, Euler, Vector3 } from "three";
import { InputManager } from "../models/InputManager";

export class MobileInputManager extends InputManager {
  private readonly _euler = new Euler(0, 0, 0, "YXZ");
  private readonly _PI_2 = Math.PI / 2;
  private readonly touchSensitivity = 0.004;
  private readonly maxPolarAngle = 2.3;
  private camera?: Camera;
  private fullscreenEnabled = document.fullscreenEnabled;

  private joyStartX = 0;
  private joyStartY = 0;
  private joyDeltaX = 0;
  private joyDeltaY = 0;
  private moveFingerId: number | null = null;
  private lookFingerId: number | null = null;
  private joystick: HTMLElement | null;
  private stick: HTMLElement | null;
  private jumpButton: HTMLElement | null;
  private attackButton: HTMLElement | null;
  private touchX = 0;
  private touchY = 0;
  private accelerate = false;

  constructor() {
    super();

    const mobileControlElement = document.getElementById("mobile-control");
    if (mobileControlElement) {
      mobileControlElement.style.display = "block";
    }
    this.joystick = document.getElementById("joystick");
    this.stick = document.getElementById("stick");
    this.jumpButton = document.getElementById("jump");
    this.attackButton = document.getElementById("attack");
    if (
      !this.joystick ||
      !this.stick ||
      !this.jumpButton ||
      !this.attackButton
    ) {
      throw new Error("Mobile control elements not found in the DOM");
    }

    this.startCameraRotation = this.startCameraRotation.bind(this);
    this.rotateCamera = this.rotateCamera.bind(this);
    this.stopCameraRotation = this.stopCameraRotation.bind(this);
    this.startMovement = this.startMovement.bind(this);
    this.move = this.move.bind(this);
    this.stopMovement = this.stopMovement.bind(this);
    this.dispatchJumpEvent = this.dispatchJumpEvent.bind(this);
    this.dispatchAttackEvent = this.dispatchAttackEvent.bind(this);
  }

  setup(camera: Camera): void {
    this.camera = camera;
    this.setListeners();
  }

  dispose(): void {
    this.removeListeners();
  }

  get playerLocalMovementDirection(): Vector3 {
    return new Vector3(this.joyDeltaX, 0, this.joyDeltaY);
  }

  private setListeners() {
    // === Camera look (right half of screen) ===
    window.addEventListener("touchstart", this.startCameraRotation);
    window.addEventListener("touchmove", this.rotateCamera);
    window.addEventListener("touchend", this.stopCameraRotation);

    // === Joystick movement (left side) ===
    this.joystick?.addEventListener("touchstart", this.startMovement);
    this.joystick?.addEventListener("touchmove", this.move);
    this.joystick?.addEventListener("touchend", this.stopMovement);

    // === Jump button ===
    this.jumpButton?.addEventListener("touchstart", this.dispatchJumpEvent);

    // === Attack button ===
    this.attackButton?.addEventListener("touchstart", this.dispatchAttackEvent);
  }

  private removeListeners() {
    window.removeEventListener("touchstart", this.startCameraRotation);
    window.removeEventListener("touchmove", this.rotateCamera);
    window.removeEventListener("touchend", this.stopCameraRotation);
    this.joystick?.removeEventListener("touchstart", this.startMovement);
    this.joystick?.removeEventListener("touchmove", this.move);
    this.joystick?.removeEventListener("touchend", this.stopMovement);
    this.jumpButton?.removeEventListener("touchstart", this.dispatchJumpEvent);
    this.attackButton?.removeEventListener(
      "touchstart",
      this.dispatchAttackEvent,
    );
  }

  private startCameraRotation(event: TouchEvent): void {
    if (this.fullscreenEnabled) {
      document.documentElement.requestFullscreen();
    }
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.clientX > window.innerWidth / 2 && this.lookFingerId === null) {
        this.lookFingerId = touch.identifier;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
    }
  }

  private rotateCamera(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.lookFingerId && this.camera) {
        const deltaX = touch.clientX - this.touchX;
        const deltaY = touch.clientY - this.touchY;

        this._euler.setFromQuaternion(this.camera.quaternion);
        this._euler.y -= deltaX * this.touchSensitivity;
        this._euler.x -= deltaY * this.touchSensitivity;
        this._euler.x = Math.max(
          this._PI_2 - this.maxPolarAngle,
          Math.min(this._PI_2, this._euler.x),
        );
        this.camera.quaternion.setFromEuler(this._euler);

        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
    }
  }

  private stopCameraRotation(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.lookFingerId) {
        this.lookFingerId = null;
      }
    }
  }

  private startMovement(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.moveFingerId = touch.identifier;
    this.joyStartX = touch.clientX;
    this.joyStartY = touch.clientY;
  }

  private move(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.moveFingerId) {
        this.joyDeltaX = touch.clientX - this.joyStartX;
        this.joyDeltaY = touch.clientY - this.joyStartY;

        const maxDist = 60;
        const dist = Math.min(
          Math.sqrt(this.joyDeltaX ** 2 + this.joyDeltaY ** 2),
          maxDist,
        );

        const accelerate = dist > maxDist * 0.9;
        if (accelerate !== this.accelerate) {
          this.dispatchEvent({ type: "accelerate", value: accelerate });
        }
        this.accelerate = accelerate;
        const angle = Math.atan2(this.joyDeltaY, this.joyDeltaX);

        this.stick!.style.transform = `translate(${Math.cos(angle) * dist}px, ${
          Math.sin(angle) * dist
        }px)`;
      }
    }
  }

  private stopMovement(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.moveFingerId) {
        this.joyDeltaX = 0;
        this.joyDeltaY = 0;
        this.moveFingerId = null;
        this.stick!.style.transform = "translate(0px, 0px)";
      }
    }
  }

  private dispatchJumpEvent(): void {
    this.dispatchEvent({ type: "jump" });
  }

  private dispatchAttackEvent(): void {
    this.dispatchEvent({ type: "attack" });
  }
}
