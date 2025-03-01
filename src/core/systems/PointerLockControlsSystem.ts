import { CameraComponent } from "../components/CameraComponent";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { PointerLockControlsComponent } from "../components/PointerLockControlsComponent";
import { Game } from "../Game";
import { CameraManager } from "../managers/CameraManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

// TODO: maybe combine this with the player control system
export class PointerLockControlsSystem extends System {
  private readonly cameraManager: CameraManager;

  constructor(game: Game) {
    super(game);

    this.cameraManager = game.cameraManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(PointerLockControlsComponent, CameraComponent);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const component = entity.getComponent(PointerLockControlsComponent);
    component?.controls?.dispose();
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const controlsComponent = entity.getComponent(
      PointerLockControlsComponent,
    )!;
    const cameraComponent = entity.getComponent(CameraComponent);

    if (!cameraComponent?.camera) {
      console.error(
        "PointerLockControlsSystem: to use PointerLockControls, a camera must be added to this entity. Entity: ",
        entity,
      );
      return;
    }

    controlsComponent.controls = this.cameraManager.createPointerLockControls(
      cameraComponent.camera,
    );

    document.addEventListener("click", () => {
      controlsComponent.controls?.lock();
    });
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { camera } = entity.getComponent(CameraComponent)!;
      const characterMovementComponent = entity.getComponent(
        CharacterMovementComponent,
      )!;

      const rotation = camera.quaternion;
      characterMovementComponent.rotation = rotation;
    }
  }
}
