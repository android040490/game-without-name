import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { EnemyComponent } from "../components/EnemyComponent";
import { CharacterConfigComponent } from "../components/CharacterConfigComponent";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { CharacterStateComponent } from "../components/CharacterStateComponent";
import { EnemyStates } from "../constants/EnemyStates";

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
    return Math.random() < 0.002;
  }

  private spawnEnemy() {
    const entity = new Entity();
    entity.addComponent(new EnemyComponent());
    entity.addComponent(
      new CharacterConfigComponent({
        modelPath: "models/animated-avatar.glb",
      }),
    );
    entity.addComponent(new PositionComponent(0, 4, 0));
    entity.addComponent(new RotationComponent(0, 0, 0, 1));
    entity.addComponent(new CharacterMovementComponent());
    entity.addComponent(new CharacterStateComponent(EnemyStates.Idle));
    this.entityManager.addEntity(entity);
  }
}
