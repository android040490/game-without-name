import { Vector3 } from "three";
import { InputManager, InputManagerConfig } from "../models/InputManager";

export class DesktopInputManager extends InputManager {
  private readonly domElement = document.body;
  private readonly _PI_2 = Math.PI / 2;
  private readonly sensitivity = 0.002;
  private isLocked = false;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;
  private movement = new Vector3(0, 0, 0);

  public yaw = 0;
  public pitch = 0;

  constructor(config: InputManagerConfig) {
    super(config);

    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerlockChange = this.onPointerlockChange.bind(this);
    this.onPointerlockError = this.onPointerlockError.bind(this);
  }

  setup(): void {
    this.setListeners();
  }

  dispose(): void {
    this.domElement.ownerDocument.exitPointerLock();
    this.removeListeners();
  }

  get playerLocalMovementDirection(): Vector3 {
    return this.movement;
  }

  private setListeners(): void {
    document.addEventListener("keydown", this.handleKeyboardEvent);
    document.addEventListener("keyup", this.handleKeyboardEvent);
    document.addEventListener("click", this.handleClick);
    this.domElement.ownerDocument.addEventListener(
      "mousemove",
      this.onMouseMove,
    );
    this.domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this.onPointerlockChange,
    );
    this.domElement.ownerDocument.addEventListener(
      "pointerlockerror",
      this.onPointerlockError,
    );
  }

  private removeListeners(): void {
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.removeEventListener("keyup", this.handleKeyboardEvent);
    document.removeEventListener("click", this.handleClick);
    this.domElement.ownerDocument.removeEventListener(
      "mousemove",
      this.onMouseMove,
    );
    this.domElement.ownerDocument.removeEventListener(
      "pointerlockchange",
      this.onPointerlockChange,
    );
    this.domElement.ownerDocument.removeEventListener(
      "pointerlockerror",
      this.onPointerlockError,
    );
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    const isKeyDown = event.type === "keydown";

    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = isKeyDown;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = isKeyDown;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = isKeyDown;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = isKeyDown;
        break;

      case "Space":
        if (isKeyDown) this.dispatchEvent({ type: "jump" });
        break;

      case "ShiftLeft":
        this.dispatchEvent({ type: "accelerate", value: isKeyDown });
    }

    this.movement.set(
      Number(this.moveRight) - Number(this.moveLeft),
      0,
      Number(this.moveBackward) - Number(this.moveForward),
    );
  }

  private handleClick(): void {
    if (!this.isLocked) {
      this.lock();
    } else {
      this.dispatchEvent({ type: "attack" });
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isLocked) return;

    this.yaw -= event.movementX * this.sensitivity;
    this.pitch -= event.movementY * this.sensitivity;

    this.pitch = Math.max(
      this._PI_2 - this.maxPolarAngle,
      Math.min(this._PI_2 - this.minPolarAngle, this.pitch),
    );
  }

  private lock() {
    this.domElement.requestPointerLock();
  }

  private onPointerlockChange() {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.isLocked = true;
    } else {
      this.isLocked = false;
    }
  }

  private onPointerlockError() {
    console.error("DesktopInputManager: Unable to use Pointer Lock API");
  }
}
