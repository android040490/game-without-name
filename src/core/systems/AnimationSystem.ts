import { AnimationComponent } from "../components/AnimationComponent";
import { CharacterStateComponent } from "../components/CharacterStateComponent";
import { Game } from "../Game";
import { TimeManager } from "../managers/TimeManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class AnimationSystem extends System {
  private readonly timeManager: TimeManager;

  constructor(game: Game) {
    super(game);

    this.timeManager = this.game.timeManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(AnimationComponent, CharacterStateComponent);
  }

  addEntity(entity: Entity) {
    super.addEntity(entity);
  }

  play(entity: Entity) {
    const component = entity.getComponent(AnimationComponent);

    if (!component) {
      return;
    }

    const { currentAction, currentActionName, animationActions } = component;

    if (currentActionName && !currentAction) {
      // start first animation
      component.currentAction = animationActions.get(currentActionName);
      component.currentAction?.play().fadeIn(1);
    } else if (currentActionName && currentAction) {
      // transition between animations
      const newAction = animationActions?.get(currentActionName);
      const oldAction = currentAction;
      newAction?.reset().play().crossFadeFrom(oldAction, 1, true);
      component.currentAction = newAction;
    } else if (!currentActionName) {
      // stop animations
      currentAction?.reset().fadeOut(1);
      component.currentAction = undefined;
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const animationComponent = entity.getComponent(AnimationComponent)!;
      const { currentState } = entity.getComponent(CharacterStateComponent)!;

      if (animationComponent.currentActionName !== currentState.animation) {
        animationComponent.currentActionName = currentState.animation;
        this.play(entity);
      }

      animationComponent.animationMixer?.update(this.timeManager.timeStep);
    }
  }
}
