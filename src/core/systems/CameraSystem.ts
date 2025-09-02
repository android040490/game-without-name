import { CameraComponent } from "../components/CameraComponent";
import { Game } from "../Game";
import { CameraManager } from "../managers/CameraManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

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

    const { camera, cameraHolder, offsetDistance, offsetHeight } =
      entity.getComponent(CameraComponent)!;
    camera.position.z = offsetDistance;
    camera.position.y = offsetHeight;
    cameraHolder.add(camera);
    this.cameraManager.setCamera(camera);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const component = entity.getComponent(CameraComponent)!;
    component.camera?.removeFromParent();
  }
}
