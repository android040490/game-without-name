import { LifetimeComponent } from "../components/LifetimeComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { TimeManager } from "../managers/TimeManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class LifetimeSystem extends System {
  private readonly entityManager: EntityManager;
  private readonly timeManager: TimeManager;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.timeManager = this.game.timeManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(LifetimeComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const lifeTime = entity.getComponent(LifetimeComponent)!;
      lifeTime.timeLeft -= this.timeManager.timeStep;

      if (lifeTime.timeLeft <= 0) {
        this.entityManager.removeEntity(entity);
      }
    }
  }
}
