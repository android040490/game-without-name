import * as THREE from "three";
import { TimeManager } from "../managers/TimeManager";
import { Game } from "../Game";
import { Renderer } from "../managers/Renderer";
import { EnvironmentComponent } from "../components/EnvironmentComponent";
import { ResourcesManager } from "../managers/ResourcesManager";
import { System } from "../models/System";
import { Entity } from "../models/Entity";

export class EnvironmentSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly renderer: Renderer;
  private readonly resourcesManager: ResourcesManager;

  constructor(game: Game) {
    super(game);

    this.renderer = game.renderer;
    this.timeManager = game.timeManager;
    this.resourcesManager = game.resourcesManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(EnvironmentComponent);
  }

  async addEntity(entity: Entity) {
    super.addEntity(entity);
    const env = entity.getComponent(EnvironmentComponent);
    if (!env) {
      return;
    }
    this.setupLighting(env);
    this.setupSky(env);
    await this.loadTexture(env);
    this.setupNightMap(env);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const env = entity.getComponent(EnvironmentComponent);
    if (!env) {
      return;
    }
    this.renderer.scene.remove(env.sunLight);
    this.renderer.scene.remove(env.ambientLight);
    this.renderer.scene.remove(env.sky);
    env.sky.geometry.dispose();
    if (env.texture) {
      this.renderer.scene.background = null;
      env.texture.dispose();
    }
  }

  setupLighting(env: EnvironmentComponent) {
    // env.sunLight.castShadow = true;
    // env.sunLight.shadow.camera.left = -20;
    // env.sunLight.shadow.camera.right = 20;
    // env.sunLight.shadow.camera.top = 20;
    // env.sunLight.shadow.camera.bottom = -20;
    // env.sunLight.shadow.camera.near = 1;
    // env.sunLight.shadow.camera.far = 200;
    // env.sunLight.shadow.normalBias = 0.08;
    this.renderer.scene.add(env.sunLight);
    // const helper = new THREE.CameraHelper(env.sunLight.shadow.camera);
    // this.renderer.scene.add(helper);
    this.renderer.scene.add(env.ambientLight);
  }

  setupSky(env: EnvironmentComponent) {
    env.sky.scale.setScalar(450000);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      env.sunPhi,
      env.sunTheta,
    );
    env.sky.material.uniforms.sunPosition.value = sunPosition;
    env.sky.material.uniforms.turbidity.value = 10;
    env.sky.material.uniforms.rayleigh.value = 3;
    env.sky.material.uniforms.mieCoefficient.value = 0.005;
    env.sky.material.uniforms.mieDirectionalG.value = 0.7;
    env.sky.material.transparent = true;
    this.renderer.scene.add(env.sky);
  }

  async loadTexture(env: EnvironmentComponent) {
    env.texture = await this.resourcesManager.loadTexture(
      env.nightMapTexturePath,
    );
  }

  setupNightMap(env: EnvironmentComponent) {
    if (env.texture) {
      env.texture.colorSpace = THREE.SRGBColorSpace;
      env.texture.mapping = THREE.EquirectangularReflectionMapping;
      this.renderer.scene.background = env.texture;
      this.renderer.scene.backgroundRotation = new THREE.Euler(
        0,
        0,
        Math.PI * 0.5,
      );
    }
  }

  update() {
    for (const [_, entity] of this.entities) {
      const env = entity.getComponent(EnvironmentComponent);
      if (!env) {
        continue;
      }
      env.sunPhi -= this.timeManager.timeStep * Math.PI * 0.005;
      const sunCosine = Math.cos(env.sunPhi);

      const sunPosition = new THREE.Vector3().setFromSphericalCoords(
        1,
        env.sunPhi,
        env.sunTheta,
      );
      env.sunLight.position.copy(sunPosition.clone().multiplyScalar(50));

      const sunLightIntensity = THREE.MathUtils.smoothstep(
        sunCosine,
        -0.2,
        0.1,
      );
      const skyOpacity = THREE.MathUtils.smoothstep(sunCosine, -0.5, 0.2);

      env.sunLight.intensity = 4 * sunLightIntensity;
      env.sky.material.uniforms.sunPosition.value = sunPosition;
      env.sky.material.uniforms.uOpacity.value = skyOpacity;
    }
  }
}
