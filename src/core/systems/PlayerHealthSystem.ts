import gsap from "gsap";
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
import { MeshComponent } from "../components/MeshComponent";
import { PlayerMovementStateTransition } from "../event/PlayerMovementStateTransition";
import { PlayerTransitionEvent } from "../components/PlayerStateComponent";
import { StopSound } from "../event/StopSound";

export class PlayerHealthSystem extends System {
  private entity?: Entity;
  private playerHUD: PlayerHUD | null;
  private playerDamageEffect: PlayerDamageEffect;
  private eventBus: EventBus;
  private readonly lowHPThreshold: number = 15;

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
    if (camera) {
      camera.add(this.playerDamageEffect.mesh);
    }
  }

  update(elapsed: number): void {
    if (!this.entity) {
      return;
    }

    const healthComponent = this.entity.getComponent(HealthComponent)!;
    const { damage, isDead } = healthComponent;

    if (isDead) {
      return;
    }

    if (damage) {
      healthComponent.hp = Math.max(0, healthComponent.hp - damage);
      healthComponent.damage = 0;
      this.updateHealthBar(healthComponent.hp);

      if (healthComponent.hp === 0) {
        healthComponent.isDead = true;
        this.handlePlayerDeath();
        return;
      }

      this.shakeCamera(0.4, 0.5);
    }

    const isLowHP = healthComponent.hp < this.lowHPThreshold;
    if (damage && isLowHP) {
      this.eventBus.emit(
        new PlaySound(this.entity, SoundAsset.HeartBeat, true),
      );
      this.playerDamageEffect.trigger({
        fromIntensity: 0.8,
        toIntensity: 0,
        vignetteRadius: 0.6,
      });
    } else if (damage) {
      this.playerDamageEffect.trigger({
        duration: 3,
        fromIntensity: 1,
        toIntensity: 0,
        vignetteRadius: 0.6,
      });
    }

    this.playerDamageEffect.update(elapsed);
  }

  private updateHealthBar(hp: number): void {
    this.playerHUD?.updateHealthBar(hp);
  }

  private shakeCamera(intensity: number, duration: number): void {
    const camera = this.entity?.getComponent(CameraComponent)?.camera;
    if (!camera) return;

    gsap.killTweensOf(camera.rotation);

    const timeline = gsap.timeline();

    timeline.to(camera.rotation, {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
      duration: duration * 0.5,
      ease: "elastic.out",
    });

    timeline.to(camera.rotation, {
      x: 0,
      y: 0,
      duration: duration * 0.5,
      ease: "power2.inOut",
    });
  }

  private handlePlayerDeath(): void {
    const { camera } = this.entity?.getComponent(CameraComponent) ?? {};
    const player = this.entity;

    if (!camera || !player) return;

    this.eventBus.emit(
      new PlayerMovementStateTransition(player, PlayerTransitionEvent.Dying),
    );
    this.eventBus.emit(new StopSound(player, SoundAsset.HeartBeat));
    this.eventBus.emit(new PlaySound(player, SoundAsset.PlayerDeath));

    const armsHolder = player
      ?.getComponent(MeshComponent)
      ?.object.getObjectByName("ArmsHolder");

    if (armsHolder) {
      gsap.to(armsHolder.rotation, {
        x: -Math.PI / 2,
        duration: 1.5,
        ease: "power3.in",
      });

      gsap.to(armsHolder.position, {
        y: camera.position.y - 0.5,
        duration: 1.5,
        ease: "power3.in",
      });
    }

    gsap.to(camera.rotation, {
      y: Math.PI / 2,
      duration: 1.5,
      ease: "power3.in",
    });

    this.playerDamageEffect.trigger({
      fromIntensity: 0,
      toIntensity: 0.8,
      vignetteRadius: 0,
      duration: 3,
      hideOnComplete: false,
    });
  }
}
