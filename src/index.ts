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
import { PlayerControlComponent } from "./core/components/PlayerControlComponent";
import { PlayerConfigComponent } from "./core/components/PlayerConfigComponent";

const game = new Game(
  document.querySelector("canvas.webgl") as HTMLCanvasElement,
);

// Environment
const createEnvironment = () => {
  const entity = new Entity();
  entity.addComponent(new EnvironmentComponent());
  game.entityManager.addEntity(entity);
};

// Floor Entity
const createFloor = () => {
  const entity = new Entity();
  entity.addComponents(
    new MeshConfigComponent({
      geometry: { type: "cylinder", params: [50, 50, 0.5] },
      material: { type: "standard", params: { color: "#5b4" } },
    }),
    new PositionComponent(0, 0, 0),
    new PhysicsComponent({
      shape: { type: "cylinder", radius: 50, height: 0.5 },
      rigidBodyType: "fixed",
    }),
  );

  game.entityManager.addEntity(entity);
};

// Mesh Entity
const createMesh = () => {
  const entity = new Entity();
  entity.addComponents(
    new MeshConfigComponent({
      geometry: { type: "box", params: [1, 1, 1] },
      material: { type: "standard", params: undefined },
    }),
    new TextureComponent({
      texturePaths: {
        map: "textures/color.jpg",
        normalMap: "textures/normal.jpg",
      },
    }),
    new RotationComponent(0, 0, 1, 2),
    new PositionComponent(-10, 5, 15),
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
  entity.addComponents(
    new PositionComponent(3, 10, -4),
    new RotationComponent(0, 0, 0, 1),
    new CharacterMovementComponent(),
    new PlayerConfigComponent({ armsModelPath: "models/arms.glb" }),
    new CameraComponent({ offsetHeight: 0.8 }),
    new PointerLockControlsComponent(),
    new PlayerComponent(),
    new PlayerControlComponent(),
  );

  game.entityManager.addEntity(entity);
};

createEnvironment();
createFloor();
createMesh();
createPlayer();

game.start();
