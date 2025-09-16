import { AnimationComponent } from "../components/AnimationComponent";
import { PlayerControlComponent } from "../components/PlayerControlComponent";
import {
  PlayerState,
  PlayerStateComponent,
} from "../components/PlayerStateComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import { PlayerAnimations } from "../constants/PlayerAnimations";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class PlayerStateMachineSystem extends System {
  private entity?: Entity;

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(PlayerStateComponent);
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerStateMachineSystem: a game cannot have more than one entity with a PlayerStateComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }
    super.addEntity(entity);
    this.entity = entity;

    const animationComponent = this.entity.getComponent(AnimationComponent);
    const stateComponent = this.entity.getComponent(PlayerStateComponent);
    if (animationComponent && stateComponent) {
      animationComponent.completeHandler = () => {
        stateComponent.currentState = PlayerState.Idle;
      };
    }
  }

  update(): void {
    if (!this.entity) {
      return;
    }
    const stateComponent = this.entity.getComponent(PlayerStateComponent)!;
    const { velocity, onGround } =
      this.entity.getComponent(PlayerControlComponent) ?? {};

    if (
      stateComponent.currentState === PlayerState.Shot ||
      stateComponent.currentState === PlayerState.Reload
    ) {
      return;
    }

    if (this.entity.getComponent(WeaponComponent)?.isShotInitiated) {
      stateComponent.currentState = PlayerState.Shot;
    } else if (onGround && velocity && velocity.length() > 4) {
      stateComponent.currentState = PlayerState.Run;
    } else if (onGround && velocity && velocity.length() > 1) {
      stateComponent.currentState = PlayerState.Walk;
    } else {
      stateComponent.currentState = PlayerState.Idle;
    }

    this.setNextAnimation();
  }

  private setNextAnimation(): void {
    const animationComponent = this.entity?.getComponent(AnimationComponent);
    const stateComponent = this.entity?.getComponent(PlayerStateComponent)!;

    if (!animationComponent) {
      return;
    }

    if (stateComponent.currentState === PlayerState.Shot) {
      animationComponent.animation = PlayerAnimations.Remington_Shot;
    } else if (stateComponent.currentState === PlayerState.Idle) {
      animationComponent.animation = PlayerAnimations.Remington_Idle;
    } else if (stateComponent.currentState === PlayerState.Walk) {
      animationComponent.animation = PlayerAnimations.Remington_Walk;
    } else if (stateComponent.currentState === PlayerState.Run) {
      animationComponent.animation = PlayerAnimations.Remington_Run;
    }
  }
}
