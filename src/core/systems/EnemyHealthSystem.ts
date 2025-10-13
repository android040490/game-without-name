const { RigidBodyType } = await import("@dimforge/rapier3d");
import { EnemyComponent } from "../components/EnemyComponent";
import { EnemyTransitionEvent } from "../components/EnemyStateComponent";
import { EnergyBarComponent } from "../components/EnergyBarComponent";
import { HealthComponent } from "../components/HealthComponent";
import { MeshComponent } from "../components/MeshComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { EventBus } from "../event/EventBus";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { EnemyStateTransition } from "../event/EnemyStateTransition";

export class EnemyHealthSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent, EnemyComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);
    const meshComponent = entity.getComponent(MeshComponent);
    const energyBarComponent = entity.getComponent(EnergyBarComponent);

    if (meshComponent && energyBarComponent) {
      meshComponent.object.add(energyBarComponent.progressBar);
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { health, damage, isDead } = healthComponent;

      if (isDead) {
        continue;
      }

      const energyBarComponent = entity.getComponent(EnergyBarComponent);
      if (energyBarComponent) {
        energyBarComponent.progressBar.value = health;
      }

      if (healthComponent.health <= 0 && !isDead) {
        healthComponent.isDead = true;
        this.handleDead(entity);
        continue;
      }

      if (damage) {
        this.handleGotDamage(entity);
      }
    }
  }

  private handleGotDamage(entity: Entity): void {
    this.eventBus.emit(
      new EnemyStateTransition(entity, EnemyTransitionEvent.TakeDamage),
    );
  }

  private handleDead(entity: Entity): void {
    const { rigidBody, collider } = entity.getComponent(PhysicsComponent) ?? {};

    rigidBody?.setBodyType(RigidBodyType.KinematicPositionBased, true);
    collider?.setSensor(true);

    this.eventBus.emit(
      new EnemyStateTransition(entity, EnemyTransitionEvent.Die),
    );
  }
}
