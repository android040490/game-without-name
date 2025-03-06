import * as THREE from "three";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { RenderComponent } from "../components/RenderComponent";
import { EntityManager } from "../managers/EntityManager";
import { ResourcesManager } from "../managers/ResourcesManager";
import { ModelComponent } from "../components/ModelComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";

export class ModelSystem extends System {
  private readonly entityManager: EntityManager;
  private readonly resourcesManager: ResourcesManager;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.resourcesManager = this.game.resourcesManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(ModelComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const { modelPath } = entity.getComponent(ModelComponent) ?? {};

    if (modelPath) {
      this.loadModel(entity, modelPath);
    }
  }

  private async loadModel(entity: Entity, path: string): Promise<void> {
    const model = await this.resourcesManager.loadModel(path);

    if (model) {
      const modelMesh = SkeletonUtils.clone(model.scene);
      const box = new THREE.Box3().setFromObject(model.scene);
      const size = new THREE.Vector3();
      box.getSize(size);

      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshBasicMaterial({
        // color: 0x00ff00,
        // wireframe: true,
        visible: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      modelMesh.position.y = -size.y / 2;
      mesh.add(modelMesh);

      const components: object[] = [
        new RenderComponent(mesh),
        new PhysicsComponent({
          shape: { type: "box", sizes: size },
          density: 10,
          rigidBodyType: "dynamic",
          restitution: 0.2,
        }),
      ];

      if (model.animations.length > 0) {
        components.push(new AnimationComponent(modelMesh, model.animations));
      }

      this.entityManager.addComponents(entity, components);
    }
  }
}
