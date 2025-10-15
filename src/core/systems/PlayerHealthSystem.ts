import { PlayerHUD } from "../../ui/PlayerHUD";
import { CameraComponent } from "../components/CameraComponent";
import { HealthComponent } from "../components/HealthComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { PlayerDamageEffect } from "../custom-objects/PlayerDamageEffect";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class PlayerHealthSystem extends System {
  private entity?: Entity;
  private playerHUD: PlayerHUD | null;
  private playerDamageEffect: PlayerDamageEffect;

  constructor(game: Game) {
    super(game);

    this.playerHUD = document.querySelector("player-hud");
    this.playerDamageEffect = new PlayerDamageEffect();
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(PlayerComponent, HealthComponent);
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerHealthSystem: a game cannot have more than one entity with a PlayerComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }

    super.addEntity(entity);
    this.entity = entity;
    const { camera } = entity.getComponent(CameraComponent) ?? {};
    camera?.add(this.playerDamageEffect.mesh);
  }

  update(elapsed: number): void {
    if (!this.entity) {
      return;
    }

    const healthComponent = this.entity.getComponent(HealthComponent)!;
    const { damage, health, initialHealth } = healthComponent;
    const hp = (health / initialHealth) * 100;

    if (damage) {
      healthComponent.health -= damage;
      healthComponent.damage = 0;
      this.updateHealthBar(hp);
    }

    const isLowHP = hp < 10;
    if (damage || isLowHP) {
      this.playerDamageEffect.trigger(damage);
    }

    this.playerDamageEffect.update(elapsed);
  }

  private updateHealthBar(hp: number): void {
    this.playerHUD?.updateHealthBar(hp);
  }
}
