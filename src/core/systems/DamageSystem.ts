import { DeadMarkerComponent } from "../components/DeadMarkerComponent";
import { HealthComponent } from "../components/HealthComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class DamageSystem extends System {
  private readonly entityManager: EntityManager;

  constructor(game: Game) {
    super(game);
    this.entityManager = game.entityManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent, MakeDamageComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { amount } = entity.getComponent(MakeDamageComponent)!;

      healthComponent.health -= amount;

      if (healthComponent.health <= 0) {
        this.entityManager.addComponent(entity, new DeadMarkerComponent());
      }

      this.entityManager.removeComponent(entity, MakeDamageComponent);
    }
  }
}
