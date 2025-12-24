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
import { PreloadSounds } from "./core/constants/Sounds";
import * as THREE from "three";
import { MeshComponent } from "./core/components/MeshComponent";

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
        density: 1,
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
    new PositionComponent(-58, 35, 117),
    new RotationComponent(0, 0, 0, 1),
    new PlayerConfigComponent({
      armsModelPath: "models/arms.glb",
    }),
    new PlayerComponent(),
    new PlayerControlComponent(),
  ]);

  game.entityManager.addEntity(entity);
};

const getRandomSpawnPosition = (): THREE.Vector3 => {
  const terrain = game.renderer.scene.getObjectByName("terrain");
  if (!terrain || !(terrain instanceof THREE.Mesh)) {
    return new THREE.Vector3(0, 9, 0);
  }

  const posAttr = terrain.geometry.attributes.position;
  const idx = Math.floor(Math.random() * posAttr.count);

  const pos = new THREE.Vector3(
    posAttr.getX(idx),
    posAttr.getY(idx) - 0.3,
    posAttr.getZ(idx),
  );

  if (pos.x < -48 && pos.x > -68 && pos.z < 127 && pos.z > 107) {
    return getRandomSpawnPosition();
  }

  return pos;
};

const renderTrees = async () => {
  const model = await game.resourcesManager.loadModel("models/pine.glb");
  if (!model) return;

  const treeModel = model.scene;
  treeModel.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.frustumCulled = true;
      const material = object.material;
      if (material.map && material.map.image && material.transparent) {
        material.transparent = false;
        material.depthWrite = true;
        // material.depthTest = false;
        material.alphaTest = 0.5;
        material.side = THREE.DoubleSide;
        material.blending = THREE.NormalBlending;
      }
    }
  });
  const treeCount = 1000;
  const entities = [];
  for (let i = 0; i < treeCount; i++) {
    const tree = treeModel.clone(true);
    const scale = 0.8 + Math.random() * 2;
    tree.scale.set(scale, scale, scale);
    const position = getRandomSpawnPosition();
    const entity = new Entity();
    const rotation = new THREE.Euler(
      Math.random() * 0.1,
      Math.random(),
      Math.random() * 0.2,
    );
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(rotation);
    entity.addComponent(
      new PositionComponent(position.x, position.y, position.z),
    );
    entity.addComponent(
      new RotationComponent(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w,
      ),
    );
    entity.addComponent(
      new PhysicsComponent({
        colliderConfig: {
          shape: { type: "cylinder", radius: 0.05, height: 8 * scale },
        },
        rigidBodyConfig: {
          rigidBodyType: "fixed",
        },
      }),
    );
    entity.addComponent(new MeshComponent(tree));
    entities.push(entity);
  }
  entities.forEach((entity) => {
    game.entityManager.addEntity(entity);
  });
};

createEnvironment();
createMesh();
createPlayer();
await game.levelManager.loadLevel("demo");
await game.resourcesManager.loadAudios(PreloadSounds);
await renderTrees();

game.start();
