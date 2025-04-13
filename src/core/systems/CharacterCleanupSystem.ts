import { DeadMarkerComponent } from "../components/DeadMarkerComponent";
import { DespawnTimerComponent } from "../components/DespawnTimerComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { TimeManager } from "../managers/TimeManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class CharacterCleanupSystem extends System {
  private readonly entityManager: EntityManager;
  private readonly timeManager: TimeManager;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.timeManager = this.game.timeManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(DeadMarkerComponent, DespawnTimerComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const timer = entity.getComponent(DespawnTimerComponent)!;
      timer.timeLeftInSeconds -= this.timeManager.timeStep;

      if (timer.timeLeftInSeconds <= 0) {
        this.entityManager.removeEntity(entity);
      }
    }
  }
}
