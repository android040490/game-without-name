import { CharacterComponent } from "../components/CharacterComponent";
import { ModelComponent } from "../components/ModelComponent";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { TargetDirectionComponent } from "../components/TargetDirectionComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class EnemySpawnSystem extends System {
  private readonly entityManager: EntityManager;

  constructor(game: Game) {
    super(game);

    this.entityManager = game.entityManager;
  }

  update() {
    if (this.shouldSpawnEnemy()) {
      this.spawnEnemy();
    }
  }

  private shouldSpawnEnemy(): boolean {
    // TODO: add more complex logic
    return Math.random() < 0.001;
  }

  private spawnEnemy() {
    const entity = new Entity();
    entity.addComponent(new ModelComponent("models/animated-avatar.glb"));
    entity.addComponent(new PositionComponent(0, 4, 0));
    entity.addComponent(new RotationComponent(0, 0, 0, 1));
    entity.addComponent(new CharacterComponent());
    entity.addComponent(new VelocityComponent(6.5));
    entity.addComponent(
      new TargetDirectionComponent(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50,
      ),
    );
    this.entityManager.addEntity(entity);
  }
}
