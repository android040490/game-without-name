import { AnimationComponent } from "../components/AnimationComponent";
import { EnemyComponent } from "../components/EnemyComponent";
import { EnemyStateComponent } from "../components/EnemyStateComponent";
import { EnemyStateToAnimationMap } from "../constants/EnemyStateToAnimationMap";
import { AnimationFinished } from "../event/AnimationFinished";
import { EventBus } from "../event/EventBus";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class EnemyAnimationSystem extends System {
  private readonly eventBus: EventBus;
  private entity?: Entity;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      EnemyComponent,
      AnimationComponent,
      EnemyStateComponent,
    );
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    this.entity = entity;

    const animationComponent = this.entity.getComponent(AnimationComponent)!;

    animationComponent.completeHandler = () => {
      this.eventBus.emit(new AnimationFinished(entity));
    };
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const animationComponent = entity.getComponent(AnimationComponent)!;
      const stateComponent = entity.getComponent(EnemyStateComponent)!;

      animationComponent.animation =
        EnemyStateToAnimationMap[stateComponent.currentState];
    }
  }
}
