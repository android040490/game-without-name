const { JointType: JT } = await import("@dimforge/rapier3d");
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import type { JointType, RigidBody } from "@dimforge/rapier3d";
import { MeshComponent } from "../components/MeshComponent";
import { Vector3 } from "three";
import { PositionComponent } from "../components/PositionComponent";

export const jointTypes: JointType[] = [JT.Revolute];

export interface JointData {
  position: Vector3;
  joint_mesh_1?: string;
  joint_mesh_2?: string;
  joint_axis?: [number, number, number];
  joint_type?: JointType;
}

export class JointManager {
  constructor(private readonly game: Game) {}

  addJoint(jointData: JointData): void {
    const {
      joint_mesh_1,
      joint_mesh_2,
      joint_axis = [],
      joint_type,
      position,
    } = jointData;

    if (joint_type === undefined || !jointTypes.includes(joint_type)) {
      console.warn(`Unsupported joint type: ${joint_type}`);
      return;
    }

    if (!joint_mesh_1 || !joint_mesh_2) {
      console.warn(
        `Joint needs two anchors. joint_mesh_1: ${joint_mesh_1}, joint_mesh_2: ${joint_mesh_2}`,
      );
      return;
    }

    const entity1 = this.findEntityByMeshName(joint_mesh_1);
    const entity2 = this.findEntityByMeshName(joint_mesh_2);

    if (!entity1 || !entity2) {
      console.warn(
        `Joint anchors not found. anchor_entity1: ${entity1}, anchor_entity2: ${entity2}`,
      );
      return;
    }
    const rigidBody1 = this.getRigidBody(entity1);
    const rigidBody2 = this.getRigidBody(entity2);

    if (!rigidBody1 || !rigidBody2) {
      console.warn(
        `RigidBody not found for joint anchors. rigidBody1: ${rigidBody1}, rigidBody2: ${rigidBody2}`,
      );
      return;
    }

    const anchor2 = new Vector3().subVectors(
      position,
      entity2.getComponent(PositionComponent)!.position,
    );
    const anchor1 = new Vector3().subVectors(
      position,
      entity1.getComponent(PositionComponent)!.position,
    );

    let axis: Vector3;
    try {
      axis = new Vector3(...joint_axis);
      if (axis.length() === 0) {
        axis = new Vector3(0, 1, 0);
      }
    } catch (error) {
      console.warn(
        `Joint axis is not defined or invalid. Using default axis (0, 1, 0). Error: ${error}`,
      );
      axis = new Vector3(0, 1, 0);
    }

    switch (joint_type as JointType) {
      case JT.Revolute:
        this.createRevoluteJoint({
          rigidBody1,
          rigidBody2,
          anchor1,
          anchor2,
          axis,
        });
        break;

      default:
        console.warn(`JointSystem: Unsupported joint type ${joint_type}`);
    }
  }

  private findEntityByMeshName(meshName: string): Entity | undefined {
    const entities = Array.from(this.game.entityManager.entities.values());

    return entities.find(
      (entity) => entity.getComponent(MeshComponent)?.object.name === meshName,
    );
  }

  private getRigidBody(entity: Entity): RigidBody | undefined {
    return entity.getComponent(PhysicsComponent)?.rigidBody;
  }

  private createRevoluteJoint({
    rigidBody1,
    rigidBody2,
    anchor1,
    anchor2,
    axis,
  }: {
    rigidBody1: RigidBody;
    rigidBody2: RigidBody;
    anchor1: Vector3;
    anchor2: Vector3;
    axis: Vector3;
  }): void {
    this.game.physicsManager.createRevoluteJoint(
      anchor1,
      anchor2,
      rigidBody1,
      rigidBody2,
      axis,
    );
  }
}
