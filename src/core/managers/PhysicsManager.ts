const RAPIER = await import("@dimforge/rapier3d");
import type {
  ActiveEvents,
  Collider,
  ColliderDesc,
  ColliderShapeCastHit,
  EventQueue,
  ImpulseJoint,
  InteractionGroups,
  KinematicCharacterController,
  Quaternion,
  QueryFilterFlags,
  RayColliderHit,
  RigidBody,
  RigidBodyDesc,
  Shape,
  Vector,
  Vector3,
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

interface Capsule {
  type: "capsule";
  radius: number;
  height: number;
}

interface TrimeshShape {
  type: "trimesh";
  vertices: Float32Array;
  indices: Uint32Array;
}

export type ShapeConfig =
  | BoxShape
  | SphereShape
  | CylinderShape
  | Capsule
  | TrimeshShape;

interface ColliderConfig {
  shape: ShapeConfig;
  density?: number;
  restitution?: number;
  friction?: number;
  sensor?: boolean;
  collisionGroups?: number;
  activeEvents?: ActiveEvents;
}

export type RigidBodyType =
  | "dynamic"
  | "fixed"
  | "kinematicVelocityBased"
  | "kinematicPositionBased";

interface RigidBodyConfig {
  rigidBodyType: RigidBodyType;
  lockRotation?: boolean;
  lockTranslation?: boolean;
  gravityScale?: number;
  ccdEnabled?: boolean;
  linvel?: Vector3;
  position?: Vector3;
  rotation?: Quaternion;
}

export interface PhysicalObjectConfig {
  rigidBodyConfig?: RigidBodyConfig;
  colliderConfig: ColliderConfig;
}

export class PhysicsManager {
  private _instance: World;
  private _eventQueue: EventQueue;

  constructor() {
    this._instance = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this._eventQueue = new RAPIER.EventQueue(true);
  }

  get instance(): World {
    return this._instance;
  }

  get eventQueue(): EventQueue {
    return this._eventQueue;
  }

  update(deltaTime: number): void {
    this._instance.timestep = deltaTime;
    this._instance.step(this._eventQueue);
  }

  createObject(config: PhysicalObjectConfig): {
    collider: Collider;
    rigidBody?: RigidBody;
  } {
    const { colliderConfig, rigidBodyConfig } = config;
    let rigidBody: RigidBody | undefined;

    if (rigidBodyConfig) {
      const rigidBodyDesc = this.createRigidBodyDesc(rigidBodyConfig);
      rigidBody = this._instance.createRigidBody(rigidBodyDesc);
    }

    const collider: Collider = this.createCollider(colliderConfig, rigidBody);

    return { collider, rigidBody };
  }

  removeRigidBody(rigidBody: RigidBody): void {
    this._instance.removeRigidBody(rigidBody);
  }

  removeCollider(collider: Collider): void {
    this._instance.removeCollider(collider, true);
  }

  createCharacterController(offset: number): KinematicCharacterController {
    return this._instance.createCharacterController(offset);
  }

  castRay(
    origin: Vector,
    direction: Vector,
    maxToi: number = 1,
    solid: boolean = true,
    filterFlags?: QueryFilterFlags,
    filterGroups?: InteractionGroups,
    filterExcludeCollider?: Collider,
    filterExcludeRigidBody?: RigidBody,
    filterPredicate?: (collider: Collider) => boolean,
  ): RayColliderHit | null {
    let ray = new RAPIER.Ray(origin, direction);

    return this._instance.castRay(
      ray,
      maxToi,
      solid,
      filterFlags,
      filterGroups,
      filterExcludeCollider,
      filterExcludeRigidBody,
      filterPredicate,
    );
  }

  castShape(params: {
    position: Vector3;
    rotation: Quaternion;
    direction: Vector3;
    shapeConfig: ShapeConfig;
    targetDistance: number;
    maxToi: number;
    stopAtPenetration?: boolean;
    filterFlags?: QueryFilterFlags;
    filterGroups?: InteractionGroups;
    filterExcludeCollider?: Collider;
    filterExcludeRigidBody?: RigidBody;
  }): ColliderShapeCastHit | null {
    const {
      position,
      rotation,
      direction,
      shapeConfig,
      targetDistance,
      maxToi,
      stopAtPenetration = false,
      filterFlags,
      filterGroups,
      filterExcludeCollider,
      filterExcludeRigidBody,
    } = params;

    let shape: Shape;
    switch (shapeConfig.type) {
      case "box":
        const { x, y, z } = shapeConfig.sizes;
        shape = new RAPIER.Cuboid(x / 2, y / 2, z / 2);
        break;

      case "sphere":
        shape = new RAPIER.Ball(shapeConfig.radius);
        break;

      case "cylinder":
        shape = new RAPIER.Cylinder(shapeConfig.height / 2, shapeConfig.radius);
        break;

      case "capsule":
        shape = new RAPIER.Capsule(shapeConfig.height / 2, shapeConfig.radius);
        break;

      case "trimesh":
        shape = new RAPIER.TriMesh(shapeConfig.vertices, shapeConfig.indices);
        break;
    }

    return this._instance.castShape(
      position,
      rotation,
      direction,
      shape,
      targetDistance,
      maxToi,
      stopAtPenetration,
      filterFlags,
      filterGroups,
      filterExcludeCollider,
      filterExcludeRigidBody,
    );
  }

  private createRigidBodyDesc(config: RigidBodyConfig): RigidBodyDesc {
    const {
      rigidBodyType,
      lockRotation,
      gravityScale,
      lockTranslation,
      ccdEnabled,
      linvel,
      position,
      rotation,
    } = config;

    let bodyDesc: RigidBodyDesc;

    switch (rigidBodyType) {
      case "dynamic":
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;

      case "kinematicPositionBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;

      case "kinematicVelocityBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        break;

      case "fixed":
      default:
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
    }

    if (lockRotation) {
      bodyDesc.lockRotations();
    }

    if (lockTranslation) {
      bodyDesc.lockTranslations();
    }

    if (gravityScale) {
      bodyDesc.gravityScale = gravityScale;
    }

    if (ccdEnabled) {
      bodyDesc.ccdEnabled = true;
    }

    if (linvel) {
      bodyDesc.setLinvel(linvel.x, linvel.y, linvel.z);
    }

    if (position) {
      bodyDesc.setTranslation(position.x, position.y, position.z);
    }

    if (rotation) {
      bodyDesc.setRotation(rotation);
    }

    return bodyDesc;
  }

  createCollider(config: ColliderConfig, rigidBody?: RigidBody): Collider {
    return this._instance.createCollider(
      this.createColliderDesc(config),
      rigidBody,
    );
  }

  private createColliderDesc(params: ColliderConfig): ColliderDesc {
    const {
      shape,
      density,
      restitution,
      friction,
      sensor,
      collisionGroups,
      activeEvents,
    } = params;
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

      case "capsule":
        colliderDesc = RAPIER.ColliderDesc.capsule(
          shape.height / 2,
          shape.radius,
        );
        break;

      case "trimesh":
        colliderDesc = RAPIER.ColliderDesc.trimesh(
          shape.vertices,
          shape.indices,
        );
    }

    if (density !== undefined) {
      colliderDesc.setDensity(density);
    }
    if (restitution !== undefined) {
      colliderDesc.setRestitution(restitution);
    }
    if (friction) {
      colliderDesc.setFriction(friction);
    }
    if (sensor) {
      colliderDesc.setSensor(true);
    }
    if (collisionGroups) {
      colliderDesc.setCollisionGroups(collisionGroups);
    }
    if (activeEvents) {
      colliderDesc.setActiveEvents(activeEvents);
    }

    return colliderDesc;
  }

  createRevoluteJoint(
    anchorVec1: Vector,
    anchorVec2: Vector,
    rigidBody1: RigidBody,
    rigidBody2: RigidBody,
    axis: Vector,
  ): ImpulseJoint {
    const jointParams = RAPIER.JointData.revolute(anchorVec2, anchorVec1, axis);

    return this.instance.createImpulseJoint(
      jointParams,
      rigidBody2,
      rigidBody1,
      true,
    );
  }

  removeJoint(joint: ImpulseJoint): void {
    this._instance.removeImpulseJoint(joint, true);
  }
}
