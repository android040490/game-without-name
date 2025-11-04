import { PlayerHUD } from "../../ui/PlayerHUD";
import { CameraComponent } from "../components/CameraComponent";
import { HealthComponent } from "../components/HealthComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { SoundAsset } from "../constants/Sounds";
import { PlayerDamageEffect } from "../custom-objects/PlayerDamageEffect";
import { EventBus } from "../event/EventBus";
import { PlaySound } from "../event/PlaySound";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class PlayerHealthSystem extends System {
  private entity?: Entity;
  private playerHUD: PlayerHUD | null;
  private playerDamageEffect: PlayerDamageEffect;
  private eventBus: EventBus;
  private readonly lowHPThreshold: number = 10;

  constructor(game: Game) {
    super(game);

    this.playerHUD = document.querySelector("player-hud");
    this.playerDamageEffect = new PlayerDamageEffect();
    this.eventBus = game.eventBus;
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
    const { damage } = healthComponent;

    if (damage) {
      healthComponent.hp -= damage;
      healthComponent.damage = 0;
      this.updateHealthBar(healthComponent.hp);
    }

    const isLowHP = healthComponent.hp < this.lowHPThreshold;
    if (damage && isLowHP) {
      this.eventBus.emit(
        new PlaySound(this.entity, SoundAsset.HeartBeat, true),
      );
    }

    if (damage || isLowHP) {
      this.playerDamageEffect.trigger(damage);
    }

    this.playerDamageEffect.update(elapsed);
  }

  private updateHealthBar(hp: number): void {
    this.playerHUD?.updateHealthBar(hp);
  }
}
