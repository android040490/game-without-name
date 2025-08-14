import { PhysicsComponent } from "../components/PhysicsComponent";
import { JointComponent } from "../components/JointComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { PhysicsManager } from "../managers/PhysicsManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { JointType } from "@dimforge/rapier3d";

export const jointTypes: JointType[] = [JointType.Revolute];

export class JointSystem extends System {
  private readonly physicsManager: PhysicsManager;
  private readonly entityManager: EntityManager;

  constructor(game: Game) {
    super(game);

    this.physicsManager = this.game.physicsManager;
    this.entityManager = this.game.entityManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(JointComponent);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);

    this.physicsManager.removeJoint(
      entity.getComponent(JointComponent)!.joint!,
    );
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { joint, type } = entity.getComponent(JointComponent)!;

      if (joint) {
        continue;
      }

      switch (type) {
        case JointType.Revolute:
          this.createRevoluteJoint(entity);
          break;

        default:
          console.warn(
            `JointSystem: Unsupported joint type ${type} for entity ${entity.id}.`,
          );
          this.entityManager.removeEntity(entity);
      }
    }
  }

  private createRevoluteJoint(entity: Entity): void {
    const component = entity.getComponent(JointComponent)!;
    const { entity_1, entity_2, anchor_1, anchor_2, axis } = component;

    const rigidBody1 = entity_1.getComponent(PhysicsComponent)?.rigidBody;
    const rigidBody2 = entity_2.getComponent(PhysicsComponent)?.rigidBody;

    component.joint = this.physicsManager.createRevoluteJoint(
      anchor_1,
      anchor_2,
      rigidBody1!,
      rigidBody2!,
      axis,
    );
  }
}
