const RAPIER = await import("@dimforge/rapier3d");
import {
  Collider,
  ColliderDesc,
  KinematicCharacterController,
  RigidBody,
  RigidBodyDesc,
  World,
} from "@dimforge/rapier3d";

interface BoxShape {
  type: "box";
  sizes: {
    x: number;
    y: number;
    z: number;
  };
}

interface CylinderShape {
  type: "cylinder";
  radius: number;
  height: number;
}

interface SphereShape {
  type: "sphere";
  radius: number;
}

interface ColliderParams {
  shape: BoxShape | SphereShape | CylinderShape;
  density?: number;
  restitution?: number;
}

type RigidBodyType =
  | "dynamic"
  | "fixed"
  | "kinematicVelocityBased"
  | "kinematicPositionBased";

interface RigidBodyParams {
  rigidBodyType: RigidBodyType;
}

export type PhysicalObjectParams = RigidBodyParams & ColliderParams;

export class PhysicsManager {
  private _instance: World;

  constructor() {
    this._instance = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  }

  get instance(): World {
    return this._instance;
  }

  update(deltaTime: number): void {
    this.instance.timestep = (deltaTime || 16) / 1000;
    this._instance.step();
  }

  createObject(params: PhysicalObjectParams): {
    collider: Collider;
    rigidBody: RigidBody;
  } {
    const rigidBodyDesc = this.createRigidBodyDesc(params);
    const rigidBody = this._instance.createRigidBody(rigidBodyDesc);

    const collider: Collider = this._instance.createCollider(
      this.createColliderDesc(params),
      rigidBody,
    );

    return { collider, rigidBody };
  }

  removeRigidBody(rigidBody: RigidBody): void {
    this._instance.removeRigidBody(rigidBody);
  }

  createCharacterController(offset: number): KinematicCharacterController {
    return this._instance.createCharacterController(offset);
  }

  private createRigidBodyDesc(params: RigidBodyParams): RigidBodyDesc {
    const { rigidBodyType } = params;

    let bodyDesc: RigidBodyDesc;

    switch (rigidBodyType) {
      case "dynamic":
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;

      case "fixed":
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;

      case "kinematicPositionBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;

      case "kinematicVelocityBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        break;
    }

    return bodyDesc;
  }

  private createColliderDesc(params: ColliderParams): ColliderDesc {
    const { shape, density, restitution } = params;
    let colliderDesc: ColliderDesc;

    switch (shape.type) {
      case "box":
        const { x, y, z } = shape.sizes;
        colliderDesc = RAPIER.ColliderDesc.cuboid(x / 2, y / 2, z / 2);
        break;

      case "sphere":
        colliderDesc = RAPIER.ColliderDesc.ball(shape.radius);
        break;

      case "cylinder":
        colliderDesc = RAPIER.ColliderDesc.cylinder(
          shape.height / 2,
          shape.radius,
        );
        break;
    }

    if (density !== undefined) {
      colliderDesc.setDensity(density);
    }
    if (restitution !== undefined) {
      colliderDesc.setRestitution(restitution);
    }

    return colliderDesc;
  }
}
