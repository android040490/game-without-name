import "./ui";
import { Game } from "./core/Game";
import { Entity } from "./core/models/Entity";
import { PositionComponent } from "./core/components/PositionComponent";
import { PhysicsComponent } from "./core/components/PhysicsComponent";
import { RotationComponent } from "./core/components/RotationComponent";
import { MeshConfigComponent } from "./core/components/MeshConfigComponent";
import { TextureComponent } from "./core/components/TextureComponent";
import { EnvironmentComponent } from "./core/components/EnvironmentComponent";
import { PlayerComponent } from "./core/components/PlayerComponent";
import { PlayerControlComponent } from "./core/components/PlayerControlComponent";
import { PlayerConfigComponent } from "./core/components/PlayerConfigComponent";
import { InteractionGroups } from "./core/constants/InteractionGroups";

const game = new Game(
  document.querySelector("canvas.webgl") as HTMLCanvasElement,
);

// Environment
const createEnvironment = () => {
  const entity = new Entity();
  entity.addComponent(new EnvironmentComponent());
  game.entityManager.addEntity(entity);
};

// Mesh Entity
const createMesh = () => {
  const entity = new Entity();
  entity.addComponents([
    new MeshConfigComponent({
      geometry: { type: "box", params: [1, 2, 1] },
      material: { type: "standard", params: undefined },
    }),
    new TextureComponent({
      texturePaths: {
        map: "textures/color.jpg",
        normalMap: "textures/normal.jpg",
      },
    }),
    new RotationComponent(0, 0, 0, 2),
    new PositionComponent(10, 3, -15),
    new PhysicsComponent({
      colliderConfig: {
        shape: { type: "box", sizes: { x: 1, y: 2, z: 1 } },
        collisionGroups: InteractionGroups.DYNAMIC_OBJECT,
        density: 500,
        restitution: 0,
      },
      rigidBodyConfig: {
        rigidBodyType: "dynamic",
      },
    }),
  ]);

  game.entityManager.addEntity(entity);
};

const createPlayer = () => {
  const entity = new Entity();
  entity.addComponents([
    new PositionComponent(-40, 30, 150),
    new RotationComponent(0, 0, 0, 1),
    new PlayerConfigComponent({
      armsModelPath: "models/arms.glb",
    }),
    new PlayerComponent(),
    new PlayerControlComponent(),
  ]);

  game.entityManager.addEntity(entity);
};

createEnvironment();
createMesh();
createPlayer();
await game.levelManager.loadLevel("demo");

game.start();
