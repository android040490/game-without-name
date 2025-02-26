import { Game } from "./core/Game";
import { Entity } from "./core/models/Entity";
import { PositionComponent } from "./core/components/PositionComponent";
import { PhysicsComponent } from "./core/components/PhysicsComponent";
import { RotationComponent } from "./core/components/RotationComponent";
import { MeshConfigComponent } from "./core/components/MeshConfigComponent";
import { TextureComponent } from "./core/components/TextureComponent";
import { EnvironmentComponent } from "./core/components/EnvironmentComponent";
import { ModelComponent } from "./core/components/ModelComponent";
import { CharacterComponent } from "./core/components/CharacterComponent";
import { TargetDirectionComponent } from "./core/components/TargetDirectionComponent";
import { VelocityComponent } from "./core/components/VelocityComponent";

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

// 3D Model Entity
const create3DModel = () => {
  const entity = new Entity();
  entity.addComponent(new ModelComponent("models/animated-avatar.glb"));
  entity.addComponent(new PositionComponent(0, 4, 0));
  entity.addComponent(new RotationComponent(0, 0, 0, 1));
  entity.addComponent(new CharacterComponent());
  entity.addComponent(new VelocityComponent(6.5));
  entity.addComponent(new TargetDirectionComponent(5, 0, 2));
  game.entityManager.addEntity(entity);
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
  entity.addComponent(new PositionComponent(5, 0, 5));
  entity.addComponent(
    new PhysicsComponent({
      shape: { type: "box", sizes: { x: 1, y: 1, z: 1 } },
      density: 1,
      rigidBodyType: "dynamic",
      restitution: 0.9,
    }),
  );

  game.entityManager.addEntity(entity);
};

createEnvironment();
createFloor();
createMesh();
create3DModel();
