import * as THREE from "three";
import { Entity } from "../models/Entity";
import { ResourcesManager } from "./ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { PositionComponent } from "../components/PositionComponent";
import { MeshComponent } from "../components/MeshComponent";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { RotationComponent } from "../components/RotationComponent";
import { ShapeConfig } from "./PhysicsManager";

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
      modelMesh.traverse((child) => {
        if (child.userData.collider_type && child instanceof THREE.Mesh) {
          colliderMeshes.push(child);
        }
      });
      for (const mesh of colliderMeshes) {
        entities.push(this.createColliderEntityFromMesh(item, mesh));
      }
    }
    return entities;
  }

  private createColliderEntityFromMesh(
    item: LevelItem,
    mesh: THREE.Mesh,
  ): Entity {
    const entity = new Entity();

    const worldPosition = new THREE.Vector3();
    mesh.getWorldPosition(worldPosition);
    // const worldQuaternion = new THREE.Quaternion();
    // mesh.getWorldQuaternion(worldQuaternion);
    const scale = mesh.getWorldScale(new THREE.Vector3());
    mesh.scale.copy(scale);

    let components: object[] = [
      new PositionComponent(
        worldPosition.x + item.position[0],
        worldPosition.y + item.position[1],
        worldPosition.z + item.position[2],
      ),
      new RotationComponent(),
      //   new RotationComponent(...worldQuaternion),
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
        geometry.applyMatrix4(mesh.matrixWorld);

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
