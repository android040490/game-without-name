import { HealthComponent } from "../components/HealthComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { Dead } from "../event/Dead";
import { EventBus } from "../event/EventBus";
import { GotDamaged } from "../event/GotDamaged";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class DamageSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent, MakeDamageComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { damage } = entity.getComponent(MakeDamageComponent)!;

      healthComponent.health -= damage;

      entity.removeComponent(MakeDamageComponent);

      if (healthComponent.health <= 0) {
        this.eventBus.emit(new Dead(entity));
      } else {
        this.eventBus.emit(new GotDamaged(entity));
      }
    }
  }
}
