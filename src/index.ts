import { Game } from "./core/Game";
import { Entity } from "./core/models/Entity";
import { PositionComponent } from "./core/components/PositionComponent";
import { PhysicsComponent } from "./core/components/PhysicsComponent";
import { RotationComponent } from "./core/components/RotationComponent";
import { MeshConfigComponent } from "./core/components/MeshConfigComponent";
import { TextureComponent } from "./core/components/TextureComponent";
import { EnvironmentComponent } from "./core/components/EnvironmentComponent";
import { CameraComponent } from "./core/components/CameraComponent";
import { PointerLockControlsComponent } from "./core/components/PointerLockControlsComponent";
import { PlayerComponent } from "./core/components/PlayerComponent";
import { CharacterMovementComponent } from "./core/components/CharacterMovementComponent";

const game = new Game(
  document.querySelector("canvas.webgl") as HTMLCanvasElement,
);

game.start();

// Environment
const createEnvironment = () => {
  const environmentEntity = new Entity();
  environmentEntity.addComponent(new EnvironmentComponent());
  game.entityManager.addEntity(environmentEntity);
};

// Floor Entity
const createFloor = () => {
  const floorEntity = new Entity();
  floorEntity.addComponent(
    new MeshConfigComponent({
      geometry: { type: "cylinder", params: [50, 50, 0.5] },
      material: { type: "standard", params: { color: "#5b4" } },
    }),
  );
  floorEntity.addComponent(new PositionComponent(0, 0, 0));
  floorEntity.addComponent(
    new PhysicsComponent({
      shape: { type: "cylinder", radius: 50, height: 0.5 },
      rigidBodyType: "fixed",
    }),
  );
  game.entityManager.addEntity(floorEntity);
};

// Mesh Entity
const createMesh = () => {
  const entity = new Entity();
  entity.addComponent(
    new MeshConfigComponent({
      geometry: { type: "box", params: [1, 1, 1] },
      material: { type: "standard", params: undefined },
    }),
  );
  entity.addComponent(
    new TextureComponent({
      texturePaths: {
        map: "textures/color.jpg",
        normalMap: "textures/normal.jpg",
      },
    }),
  );
  entity.addComponent(new RotationComponent(0, 0, 1, 2));
  entity.addComponent(new PositionComponent(-10, 5, 15));
  entity.addComponent(
    new PhysicsComponent({
      shape: { type: "box", sizes: { x: 1, y: 1, z: 1 } },
      density: 5,
      rigidBodyType: "dynamic",
      restitution: 0.2,
    }),
  );

  game.entityManager.addEntity(entity);
};

const createPlayer = () => {
  const entity = new Entity();
  entity.addComponent(new PositionComponent(3, 10, -4));
  entity.addComponent(new RotationComponent(0, 0, 0, 1));
  entity.addComponent(new CharacterMovementComponent());
  entity.addComponent(
    new MeshConfigComponent({
      geometry: { type: "box", params: [1, 2, 1] },
      material: { type: "standard", params: { visible: false } },
    }),
  );
  entity.addComponent(
    new PhysicsComponent({
      shape: { type: "box", sizes: { x: 1, y: 2, z: 1 } },
      density: 10,
      rigidBodyType: "dynamic",
      lockRotation: true,
      restitution: 0.5,
    }),
  );
  entity.addComponent(new CameraComponent({ offsetHeight: 0.5 }));
  entity.addComponent(new PointerLockControlsComponent());
  entity.addComponent(new PlayerComponent());
  game.entityManager.addEntity(entity);
};

createEnvironment();
createFloor();
createMesh();
createPlayer();
