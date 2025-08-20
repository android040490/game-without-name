import * as THREE from "three";
import { CameraComponent } from "../components/CameraComponent";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { CameraManager } from "../managers/CameraManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
// import { PointerLockControlsComponent } from "../components/PointerLockControlsComponent";

export class CameraSystem extends System {
  private readonly cameraManager: CameraManager;

  constructor(game: Game) {
    super(game);

    this.cameraManager = game.cameraManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(CameraComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const component = entity.getComponent(CameraComponent)!;
    this.cameraManager.setCamera(component.camera);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const component = entity.getComponent(CameraComponent)!;
    component.camera?.removeFromParent();
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { camera, offsetDistance, offsetHeight } =
        entity.getComponent(CameraComponent)!;
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};

      if (camera && position && rotation) {
        const cameraDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(
          rotation,
        ); // set camera direction

        const newCameraPosition = position
          .clone()
          .addScaledVector(cameraDirection, offsetDistance) // set the camera slightly in front of the character
          .add(new THREE.Vector3(0, offsetHeight, 0)); // set the camera a little higher
        camera.position.copy(newCameraPosition);

        // set camera direction if no PointerLockControls
        // if (!entity.hasComponent(PointerLockControlsComponent)) {
        //   const target = newCameraPosition.clone().add(cameraDirection);
        //   camera.lookAt(target);
        // }
      }
    }
  }
}
