import * as THREE from "three";
import { System } from "../models/System";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { Renderer } from "../managers/Renderer";
import { RenderComponent } from "../components/RenderComponent";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";

export class RenderSystem extends System {
  private readonly renderer: Renderer;

  constructor(game: Game) {
    super(game);

    this.renderer = this.game.renderer;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(RenderComponent);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const { object } = entity.getComponent(RenderComponent) ?? {};

    if (object) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();

          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }

          // Cleanup textures
          const material = child.material as THREE.Material;
          Object.keys(material).forEach((key) => {
            const materialElem = (material as any)[key];
            if (materialElem && typeof materialElem.dispose === "function") {
              materialElem.dispose();
            }
            // or use the approach below
            // if (materialElem instanceof THREE.Texture) {
            //   materialElem.dispose();
            // }
          });
        }

        // Cleanup SkinnedMesh
        if (child instanceof THREE.SkinnedMesh) {
          // child.skeleton.boneTexture?.dispose();
          // child.skeleton.boneTexture = null;
          child.skeleton.dispose();
        }
      });

      // Remove object from the scene
      object.removeFromParent();
      // object.parent?.remove(object);
    }
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);
    const component = entity.getComponent(RenderComponent);
    if (component?.object) {
      this.renderer.scene.add(component.object);
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const { object } = entity.getComponent(RenderComponent) ?? {};

      if (position) {
        object?.position.copy(position);
      }
      if (rotation) {
        object?.rotation.setFromQuaternion(rotation);
      }
    }

    this.renderer.update();
  }
}
