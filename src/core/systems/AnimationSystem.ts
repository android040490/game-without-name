import { AnimationComponent } from "../components/AnimationComponent";
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
    return entity.hasComponent(AnimationComponent);
  }

  addEntity(entity: Entity) {
    super.addEntity(entity);
    const component = entity.getComponent(AnimationComponent)!;

    component.animationMixer.addEventListener(
      "finished",
      component.handleComplete,
    );
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const component = entity.getComponent(AnimationComponent)!;

    component.animationMixer.removeEventListener(
      "finished",
      component.handleComplete,
    );
  }

  play(entity: Entity) {
    const component = entity.getComponent(AnimationComponent);

    if (!component) {
      return;
    }

    const {
      currentAction,
      currentActionName,
      animationActions,
      repetitions,
      timeScale,
    } = component;

    if (currentActionName && !currentAction) {
      // start first animation
      component.currentAction = animationActions.get(currentActionName);
      component.currentAction?.play().fadeIn(1);
    } else if (currentActionName && currentAction) {
      // transition between animations
      const newAction = animationActions?.get(currentActionName);
      const oldAction = currentAction;
      newAction?.reset().play().crossFadeFrom(oldAction, 0.2, true);
      component.currentAction = newAction;
    } else if (!currentActionName) {
      // stop animations
      currentAction?.reset().fadeOut(1);
      component.currentAction = undefined;
    }

    if (component.currentAction) {
      component.currentAction.setEffectiveTimeScale(timeScale);
      component.currentAction.repetitions = repetitions;
      component.currentAction.clampWhenFinished = true;
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { animationMixer, currentAction, currentActionName } =
        entity.getComponent(AnimationComponent) ?? {};

      if (currentActionName !== currentAction?.getClip().name) {
        this.play(entity);
      }

      animationMixer?.update(this.timeManager.timeStep);
    }
  }
}
