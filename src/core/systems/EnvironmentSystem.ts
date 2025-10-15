import * as THREE from "three";
import { TimeManager } from "../managers/TimeManager";
import { Game } from "../Game";
import { Renderer } from "../managers/Renderer";
import { EnvironmentComponent } from "../components/EnvironmentComponent";
import { System } from "../models/System";
import { Entity } from "../models/Entity";

export class EnvironmentSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly renderer: Renderer;

  constructor(game: Game) {
    super(game);

    this.renderer = game.renderer;
    this.timeManager = game.timeManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(EnvironmentComponent);
  }

  async addEntity(entity: Entity) {
    super.addEntity(entity);
    const env = entity.getComponent(EnvironmentComponent)!;

    this.setupLighting(env);
    this.setupSky(env);
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
    env.sky.dispose();
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
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      env.sunPhi,
      env.sunTheta,
    );
    env.sky.material.uniforms.sunPosition.value = sunPosition;
    env.sky.rotateZ(Math.PI * 0.5);
    this.renderer.scene.add(env.sky);
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
      const uDayNightMixFactor = THREE.MathUtils.smoothstep(
        sunCosine,
        -0.5,
        0.3,
      );

      env.sunLight.intensity = 4 * sunLightIntensity;
      env.sky.material.uniforms.sunPosition.value = sunPosition;
      env.sky.material.uniforms.uDayNightMixFactor.value = uDayNightMixFactor;
    }
  }
}
