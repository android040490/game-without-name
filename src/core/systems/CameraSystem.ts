import { CameraComponent } from "../components/CameraComponent";
import { CameraAdded } from "../event/CameraAdded";
import { EventBus } from "../event/EventBus";
import { Game } from "../Game";
import { CameraManager } from "../managers/CameraManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class CameraSystem extends System {
  private readonly cameraManager: CameraManager;
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.cameraManager = game.cameraManager;
    this.eventBus = game.eventBus;
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
    this.eventBus.emit(new CameraAdded(camera));
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const component = entity.getComponent(CameraComponent)!;
    component.camera?.removeFromParent();
  }
}
