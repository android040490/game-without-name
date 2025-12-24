import * as THREE from "three";
import gsap from "gsap";
import { TimeManager } from "../managers/TimeManager";
import { Game } from "../Game";
import { Renderer } from "../managers/Renderer";
import { EnvironmentComponent } from "../components/EnvironmentComponent";
import { System } from "../models/System";
import { Entity } from "../models/Entity";

export class EnvironmentSystem extends System {
  private entity?: Entity;
  private readonly timeManager: TimeManager;
  private readonly renderer: Renderer;
  private readonly sunPosition = new THREE.Vector3();
  private readonly dayFogColor = new THREE.Color("#babdd8");
  private readonly nightFogColor = new THREE.Color("#313448");
  private readonly fogColor = new THREE.Color();
  private isFogVisible = false;
  private deltaPhi: number;

  constructor(game: Game) {
    super(game);

    this.renderer = game.renderer;
    this.timeManager = game.timeManager;
    this.deltaPhi = this.timeManager.timeStep * Math.PI * 0.005;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(EnvironmentComponent);
  }

  async addEntity(entity: Entity) {
    if (this.entity) {
      console.error(
        "EnvironmentSystem: a game cannot have more than one entity with a EnvironmentComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }

    super.addEntity(entity);
    this.entity = entity;

    const env = entity.getComponent(EnvironmentComponent)!;

    this.setupLighting(env);
    this.setupSky(env);

    this.renderer.scene.fog = new THREE.Fog(this.fogColor, 1, 1000000);

    this.showFog();
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
    const entity = this.entity;
    if (!entity) return;

    const env = entity.getComponent(EnvironmentComponent);
    if (!env) return;

    // Update sun position
    env.sunPhi -= this.deltaPhi;
    const sunCosine = Math.cos(env.sunPhi);
    this.sunPosition.setFromSphericalCoords(50, env.sunPhi, env.sunTheta);
    env.sunLight.position.copy(this.sunPosition);

    // Lighting intensity calculations
    const sunLightIntensity = THREE.MathUtils.smoothstep(sunCosine, -0.2, 0.1);
    const ambientIntensity = Math.max(1 * sunLightIntensity, 0.1);

    const uDayNightMixFactor = THREE.MathUtils.smoothstep(sunCosine, -0.5, 0.3);
    // Apply lighting
    env.sunLight.intensity = 4 * sunLightIntensity;
    env.ambientLight.intensity = ambientIntensity;

    // Update sky uniforms
    const uniforms = env.sky.material.uniforms;
    uniforms.sunPosition.value = this.sunPosition;
    uniforms.uDayNightMixFactor.value = uDayNightMixFactor;

    if (this.isFogVisible && this.renderer.scene.fog) {
      this.fogColor.lerpColors(
        this.nightFogColor,
        this.dayFogColor,
        sunLightIntensity,
      );
      this.renderer.scene.fog.color = this.fogColor;
    }
  }

  showFog(): void {
    this.isFogVisible = true;
    const timeline = gsap.timeline();

    timeline.to(this.renderer.scene.fog as THREE.Fog, {
      far: 500,
      duration: 10,
      ease: "expo.in",
    });
    timeline.to(this.renderer.scene.fog as THREE.Fog, {
      far: 40,
      duration: 10,
      ease: "expo.out",
      onComplete: () => {
        setTimeout(() => {
          this.hideFog();
        }, Math.random() * 180000 + 180000);
      },
    });
  }

  hideFog(): void {
    const timeline = gsap.timeline();

    timeline.to(this.renderer.scene.fog as THREE.Fog, {
      far: 500,
      duration: 30,
      ease: "expo.in",
    });
    timeline.to(this.renderer.scene.fog as THREE.Fog, {
      far: 1000000,
      duration: 10,
      ease: "power2.out",
      onComplete: () => {
        this.isFogVisible = false;
        setTimeout(() => {
          this.showFog();
        }, Math.random() * 180000 + 300000);
      },
    });
  }
}
