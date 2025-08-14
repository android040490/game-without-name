import * as THREE from "three";
import { Entity } from "../models/Entity";
import { ResourcesManager } from "./ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { PositionComponent } from "../components/PositionComponent";
import { MeshComponent } from "../components/MeshComponent";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { RotationComponent } from "../components/RotationComponent";
import { ShapeConfig } from "./PhysicsManager";
import { JointComponent } from "../components/JointComponent";
import { jointTypes } from "../systems/JointSystem";

interface LevelItem {
  model: string;
  position: [number, number, number];
  scale?: number;
}

export class LevelParser {
  constructor(private readonly resourcesManager: ResourcesManager) {}

  async parseLevel(jsonPath: string): Promise<Entity[]> {
    const res = await fetch(jsonPath);
    const levelData = await res.json();

    const entityArrays: Entity[][] = await Promise.all(
      levelData.map((item: LevelItem) => this.createEntities(item)),
    );

    return entityArrays.flat();
  }

  private async createEntities(item: LevelItem): Promise<Entity[]> {
    const model = await this.resourcesManager.loadModel(item.model);
    const entities: Entity[] = [];

    if (model) {
      const entity = new Entity();
      const modelMesh = SkeletonUtils.clone(model.scene);

      if (item.scale) {
        modelMesh.scale.setScalar(item.scale);
        // modelMesh.updateMatrixWorld(true);
      }

      entity.addComponents([
        new MeshComponent(modelMesh),
        new PositionComponent(...item.position),
      ]);

      entities.push(entity);

      const colliderMeshes: THREE.Mesh[] = [];
      const jointMeshes: THREE.Mesh[] = [];

      modelMesh.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }
        if (child.userData.collider_type) {
          colliderMeshes.push(child);
        } else if (child.userData.joint_type !== undefined) {
          jointMeshes.push(child);
        }
      });

      for (const mesh of colliderMeshes) {
        entities.push(this.createEntityWithCollider(item, mesh));
      }
      for (const mesh of jointMeshes) {
        const jointEntity = this.createEntityWithJoint(mesh, entities);
        if (jointEntity) {
          entities.push(jointEntity);
        }
      }
    }
    return entities;
  }

  private createEntityWithCollider(item: LevelItem, mesh: THREE.Mesh): Entity {
    const entity = new Entity();

    const worldPosition = new THREE.Vector3();
    mesh.getWorldPosition(worldPosition);
    const worldQuaternion = new THREE.Quaternion();
    mesh.getWorldQuaternion(worldQuaternion);
    const scale = mesh.getWorldScale(new THREE.Vector3());
    mesh.scale.copy(scale);

    let components: object[] = [
      new PositionComponent(
        worldPosition.x + item.position[0],
        worldPosition.y + item.position[1],
        worldPosition.z + item.position[2],
      ),
      new RotationComponent(...worldQuaternion),
      this.createPhysicsComponent(mesh),
      new MeshComponent(mesh), // TODO: maybe add mesh only if dynamic collider
    ];

    entity.addComponents(components);

    return entity;
  }

  private createPhysicsComponent(mesh: THREE.Mesh): PhysicsComponent {
    let shape: ShapeConfig;

    switch (mesh.userData.collider_type) {
      case "trimesh":
        const geometry = mesh.geometry.clone();
        // geometry.applyMatrix4(mesh.matrixWorld);

        shape = {
          type: "trimesh",
          vertices: geometry.attributes.position.array as Float32Array,
          indices: geometry.index?.array as Uint32Array,
        };

        break;

      case "sphere":
        mesh.geometry.computeBoundingSphere();
        const sphere = mesh.geometry.boundingSphere!;
        let radius = sphere.radius;

        const scale = mesh.scale;
        radius *= Math.max(scale.x, scale.y, scale.z);
        shape = {
          type: "sphere",
          radius,
        };
        break;

      case "box":
      default:
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size).multiply(mesh.scale);

        shape = {
          type: "box",
          sizes: {
            x: size.x,
            y: size.y,
            z: size.z,
          },
        };
    }

    return new PhysicsComponent({
      colliderConfig: {
        shape,
      },
      rigidBodyConfig: {
        rigidBodyType: mesh.userData.rigid_body_type,
      },
    });
  }

  private createEntityWithJoint(
    mesh: THREE.Mesh,
    entities: Entity[],
  ): Entity | undefined {
    const { joint_mesh_1, joint_mesh_2, joint_axis, joint_type } =
      mesh.userData;

    if (!jointTypes.includes(joint_type)) {
      console.warn(`Unsupported joint type: ${joint_type}`);
      return undefined;
    }

    if (!joint_mesh_1 || !joint_mesh_2) {
      console.warn(
        `Joint needs two anchors. joint_mesh_1: ${joint_mesh_1}, joint_mesh_2: ${joint_mesh_2}`,
      );
      return undefined;
    }

    const anchor_entity_1 = entities.find(
      (entity) =>
        entity.getComponent(MeshComponent)?.object.name === joint_mesh_1,
    );
    const anchor_entity_2 = entities.find(
      (entity) =>
        entity.getComponent(MeshComponent)?.object.name === joint_mesh_2,
    );

    if (!anchor_entity_1 || !anchor_entity_2) {
      console.warn(
        `Joint anchors not found. anchor_entity_1: ${anchor_entity_1}, anchor_entity_2: ${anchor_entity_2}`,
      );
      return undefined;
    }
    const anchor2 = new THREE.Vector3().subVectors(
      mesh.position,
      anchor_entity_2.getComponent(MeshComponent)!.object.position,
    );

    let axis: THREE.Vector3;
    try {
      axis = new THREE.Vector3(...joint_axis);
      if (axis.length() === 0) {
        axis = new THREE.Vector3(0, 1, 0);
      }
    } catch (error) {
      console.warn(
        `Joint axis is not defined or invalid. Using default axis (0, 1, 0). Error: ${error}`,
      );
      axis = new THREE.Vector3(0, 1, 0);
    }

    const entity = new Entity();

    entity.addComponent(
      new JointComponent(
        joint_type,
        anchor_entity_1,
        anchor_entity_2,
        mesh.position,
        anchor2,
        axis.normalize(),
      ),
    );

    return entity;
  }
}
