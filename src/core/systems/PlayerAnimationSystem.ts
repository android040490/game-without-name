import { AnimationComponent } from "../components/AnimationComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { PlayerStateComponent } from "../components/PlayerStateComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import { PlayerStateToAnimationMap } from "../constants/PlayerStateToAnimationMap";
import { EventBus } from "../event/EventBus";
import { StateTransition } from "../event/StateTransition";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class PlayerAnimationSystem extends System {
  private readonly eventBus: EventBus;
  private entity?: Entity;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      PlayerComponent,
      AnimationComponent,
      PlayerStateComponent,
    );
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerAnimationSystem: a game cannot have more than one entity with a PlayerComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }
    super.addEntity(entity);

    this.entity = entity;

    const animationComponent = this.entity.getComponent(AnimationComponent)!;

    animationComponent.completeHandler = () => {
      this.eventBus.emit(new StateTransition(entity, "finished"));
    };
  }

  update(): void {
    if (!this.entity) {
      return;
    }

    const animationComponent = this.entity.getComponent(AnimationComponent)!;
    const weapon = this.entity.getComponent(WeaponComponent);
    const stateComponent = this.entity.getComponent(PlayerStateComponent)!;

    animationComponent.animation = weapon?.name
      ? PlayerStateToAnimationMap[weapon.name][stateComponent.currentState]
      : undefined;
  }
}
