const { ActiveEvents } = await import("@dimforge/rapier3d");
import { Mesh, Quaternion, Vector3 } from "three";
import { EnemyComponent } from "../components/EnemyComponent";
import { MeshComponent } from "../components/MeshComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { Game } from "../Game";
import { PhysicsManager } from "../managers/PhysicsManager";
import { CollisionManager } from "../managers/CollisionManager";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Hurtbox, HurtboxComponent } from "../components/HurtboxComponent";

export class HurtBoxSystem extends System {
  private readonly physicsManager: PhysicsManager;
  private readonly collisionManager: CollisionManager;

  constructor(game: Game) {
    super(game);

    this.physicsManager = game.physicsManager;
    this.collisionManager = game.collisionManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(EnemyComponent, MeshComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const mesh = entity.getComponent(MeshComponent)?.object;

    const hurtBoxes: Hurtbox[] = [];

    mesh?.traverse((object) => {
      if (object.name.startsWith("Hurtbox")) {
        if (!(object instanceof Mesh)) {
          return;
        }
        if (!object.geometry.boundingBox) {
          object.geometry.computeBoundingBox();
        }

        const size = new Vector3();
        object.geometry.boundingBox.getSize(size);

        object.visible = false;
        // object.material.wireframe = true;

        const collider = this.physicsManager.createCollider({
          shape: {
            type: "box",
            sizes: { x: size.x, y: size.y, z: size.z },
          },
          sensor: true,
          activeEvents: ActiveEvents.COLLISION_EVENTS,
          collisionGroups: InteractionGroups.HURT_BOX,
        });
        this.collisionManager.registerCollider(entity, collider);

        hurtBoxes.push({ mesh: object, collider });
      }
    });

    if (hurtBoxes.length) {
      entity.addComponent(new HurtboxComponent(hurtBoxes));
    }
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const { hurtboxes } = entity.getComponent(HurtboxComponent) ?? {};
    if (!hurtboxes) {
      return;
    }

    for (const { collider } of hurtboxes) {
      this.collisionManager.unregisterCollider(collider);
      this.physicsManager.removeCollider(collider);
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { hurtboxes } = entity.getComponent(HurtboxComponent) ?? {};
      if (!hurtboxes) {
        continue;
      }

      for (const { mesh, collider } of hurtboxes) {
        if (!collider.isValid()) {
          continue;
        }
        const position = new Vector3();
        mesh.getWorldPosition(position);

        const rotation = new Quaternion();
        mesh.getWorldQuaternion(rotation);

        collider.setRotation(rotation);
        collider.setTranslation(position);
      }
    }
  }
}
