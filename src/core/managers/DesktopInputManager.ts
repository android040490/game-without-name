import { Camera, Vector3 } from "three";
import { Game } from "../Game";
import { CameraManager } from "./CameraManager";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { InputManager } from "../models/InputManager";

export class DesktopInputManager extends InputManager {
  private readonly cameraManager: CameraManager;
  private controls?: PointerLockControls;

  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;

  constructor(game: Game) {
    super();

    this.cameraManager = game.cameraManager;

    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  setup(camera: Camera): void {
    this.controls = this.cameraManager.createPointerLockControls(camera);
    this.controls.maxPolarAngle = 2.3;
    this.setListeners();
  }

  dispose(): void {
    this.controls?.dispose();
    this.removeListeners();
  }

  get playerLocalMovementDirection(): Vector3 {
    return new Vector3(
      Number(this.moveRight) - Number(this.moveLeft),
      0,
      Number(this.moveBackward) - Number(this.moveForward),
    );
  }

  private setListeners(): void {
    document.addEventListener("keydown", this.handleKeyboardEvent);
    document.addEventListener("keyup", this.handleKeyboardEvent);
    document.addEventListener("click", this.handleClick);
  }

  private removeListeners(): void {
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.removeEventListener("keyup", this.handleKeyboardEvent);
    document.removeEventListener("click", this.handleClick);
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
  }

  private handleClick(): void {
    if (!this.controls?.isLocked) {
      this.controls?.lock();
    } else {
      this.dispatchEvent({ type: "attack" });
    }
  }
}
