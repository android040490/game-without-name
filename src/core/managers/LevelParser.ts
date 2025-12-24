import * as THREE from "three";
import { Entity } from "../models/Entity";
import { ResourcesManager } from "./ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { PositionComponent } from "../components/PositionComponent";
import { MeshComponent } from "../components/MeshComponent";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { RotationComponent } from "../components/RotationComponent";
import { ShapeConfig } from "./PhysicsManager";
import { JointData } from "./JointManager";

interface LevelItem {
  model: string;
  position: [number, number, number];
}

interface ParsedData {
  entities: Entity[];
  jointData: JointData[];
}

export class LevelParser {
  constructor(private readonly resourcesManager: ResourcesManager) {}

  async parseLevel(jsonPath: string): Promise<ParsedData> {
    const res = await fetch(jsonPath);
    const levelData = await res.json();

    const parsedData: ParsedData[] = await Promise.all(
      levelData.map((item: LevelItem) => this.createEntities(item)),
    );

    return {
      entities: parsedData.flatMap((data) => data.entities),
      jointData: parsedData.flatMap((data) => data.jointData),
    };
  }

  private async createEntities(item: LevelItem): Promise<ParsedData> {
    const model = await this.resourcesManager.loadModel(item.model);
    const entities: Entity[] = [];
    const jointData: JointData[] = [];

    if (model) {
      const modelMesh = SkeletonUtils.clone(model.scene);
      const meshes: THREE.Mesh[] = [];

      modelMesh.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }
        if (child.userData.joint_type !== undefined) {
          const worldPosition = new THREE.Vector3();
          child.getWorldPosition(worldPosition);
          jointData.push({ ...child.userData, position: worldPosition });
        } else {
          meshes.push(child);
        }
      });

      for (const mesh of meshes) {
        entities.push(this.createEntity(item, mesh));
      }
    }
    return { entities, jointData };
  }

  private createEntity(item: LevelItem, mesh: THREE.Mesh): Entity {
    const entity = new Entity();

    const worldPosition = new THREE.Vector3();
    mesh.getWorldPosition(worldPosition);
    const worldQuaternion = new THREE.Quaternion();
    mesh.getWorldQuaternion(worldQuaternion);
    const scale = mesh.getWorldScale(new THREE.Vector3());
    mesh.scale.copy(scale);

    entity.addComponents([
      new PositionComponent(
        worldPosition.x + item.position[0],
        worldPosition.y + item.position[1],
        worldPosition.z + item.position[2],
      ),
      new RotationComponent(...worldQuaternion),
      new MeshComponent(mesh),
    ]);

    if (mesh.userData.collider_type) {
      entity.addComponent(this.createPhysicsComponent(mesh));
    }

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
}
