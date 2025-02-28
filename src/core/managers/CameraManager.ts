import * as THREE from "three";
import { OrbitControls, PointerLockControls } from "three/addons/Addons.js";
import { WindowSizeManager } from "./WindowSizeManager";
import { Game } from "../Game";
import eventBus, { EventBus } from "../event/EventBus";
import { WindowResized } from "../event/WindowResized";

export class CameraManager {
  private readonly windowSizeManager: WindowSizeManager;
  private readonly canvas: HTMLCanvasElement;
  private readonly eventBus: EventBus;
  private readonly defaultCamera: THREE.PerspectiveCamera;
  private _camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  constructor(game: Game) {
    this.windowSizeManager = game.windowSizeManager;
    this.canvas = game.canvas;
    this.eventBus = eventBus;

    this.defaultCamera = this.createPerspectiveCamera();
    this.defaultCamera.position.set(0, 2, 15);
    this.defaultCamera.lookAt(0, 0, 0);

    this.setCamera(this.defaultCamera);
    this.setControls();

    this.resize = this.resize.bind(this);

    this.eventBus.on(WindowResized, this.resize);
  }

  resize(): void {
    this._camera.aspect =
      this.windowSizeManager.windowWidth / this.windowSizeManager.windowHeight;
    this._camera.updateProjectionMatrix();
  }

  update(): void {
    this.controls.update();
  }

  dispose(): void {
    this.eventBus.off(WindowResized, this.resize);
    this.controls.dispose();
  }

  resetToDefaultCamera(): void {
    this._camera = this.defaultCamera;
  }

  createPerspectiveCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(
      50,
      this.windowSizeManager.windowWidth / this.windowSizeManager.windowHeight,
      0.1,
      1000,
    );
  }

  get camera(): THREE.Camera {
    return this._camera;
  }

  setCamera(camera: THREE.PerspectiveCamera): void {
    this._camera = camera;
  }

  createPointerLockControls(camera: THREE.Camera): PointerLockControls {
    return new PointerLockControls(camera, this.canvas);
  }

  private setControls(): void {
    this.controls = new OrbitControls(this._camera, this.canvas);
    this.controls.enableDamping = true;
  }
}
