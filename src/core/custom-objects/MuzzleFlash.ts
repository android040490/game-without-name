import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Object3D,
  PointLight,
  Points,
  ShaderMaterial,
  Uniform,
  Vector2,
} from "three";
import muzzleFlashVertexShader from "../shaders/muzzle-flash/vertex.glsl";
import muzzleFlashFragmentShader from "../shaders/muzzle-flash/fragment.glsl";
import { WindowSizeManager } from "../managers/WindowSizeManager";
import gsap from "gsap";

interface MuzzleFlashConfig {
  muzzleRef: Object3D;
  sparkCount?: number;
  duration?: number;
  sparkSize?: number;
}

export class MuzzleFlash {
  private readonly windowSizeManager;
  private sparks: Points;
  private flashLight: PointLight;
  private geometry!: BufferGeometry;
  private material!: ShaderMaterial;
  private muzzleRef: Object3D;
  private sparkCount: number;
  private sparkSize: number;
  private duration: number;

  constructor(config: MuzzleFlashConfig) {
    const {
      muzzleRef,
      sparkCount = 20,
      duration = 0.07,
      sparkSize = 0.7,
    } = config;
    this.muzzleRef = muzzleRef;
    this.sparkCount = sparkCount;
    this.duration = duration;
    this.sparkSize = sparkSize;

    this.windowSizeManager = new WindowSizeManager();

    this.sparks = this.createSparks();
    this.sparks.visible = false;
    this.muzzleRef.add(this.sparks);
    this.flashLight = new PointLight(0xffaa00, 10, 10, 0.1);
    this.flashLight.visible = false;
    this.muzzleRef.add(this.flashLight);
  }

  flash(): void {
    this.randomizeGeometry();
    this.sparks.visible = true;
    this.flashLight.visible = true;
    gsap.to(this.material.uniforms.uProgress, {
      value: 1,
      duration: this.duration,
      ease: "linear",
      onComplete: this.fade.bind(this),
    });
  }

  fade(): void {
    this.material.uniforms.uProgress.value = 0;
    this.sparks.visible = false;
    this.flashLight.visible = false;
  }

  dispose(): void {
    this.muzzleRef.remove(this.sparks);
    this.geometry.dispose();
    this.material.dispose();
    this.muzzleRef.remove(this.flashLight);
    this.flashLight.dispose();
  }

  private createSparks(): Points {
    this.createGeometry();
    this.randomizeGeometry();

    const resolution = new Vector2(
      this.windowSizeManager.windowWidth * this.windowSizeManager.pixelRatio,
      this.windowSizeManager.windowHeight * this.windowSizeManager.pixelRatio,
    );

    this.material = new ShaderMaterial({
      vertexShader: muzzleFlashVertexShader,
      fragmentShader: muzzleFlashFragmentShader,
      uniforms: {
        uSize: new Uniform(this.sparkSize),
        uResolution: new Uniform(resolution),
        uProgress: new Uniform(0),
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    return new Points(this.geometry, this.material);
  }

  private createGeometry(): void {
    this.geometry = new BufferGeometry();

    const positionArray = new Float32Array(this.sparkCount * 3);
    const sizesArray = new Float32Array(this.sparkCount);

    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positionArray, 3),
    );
    this.geometry.setAttribute(
      "aSize",
      new Float32BufferAttribute(sizesArray, 1),
    );
  }

  private randomizeGeometry(): void {
    const positionAttr = this.geometry.getAttribute(
      "position",
    ) as Float32BufferAttribute;
    const sizeAttr = this.geometry.getAttribute(
      "aSize",
    ) as Float32BufferAttribute;

    for (let i = 0; i < this.sparkCount; i++) {
      let x = 0;
      let y = 0;
      let z = 0.5;
      const angle = Math.random() * Math.PI * 2;

      x += Math.cos(angle) * Math.random() * 0.3;
      y += Math.sin(angle) * Math.random() * 0.3;
      z += Math.random() * 0.5 - 0.5;

      positionAttr.setXYZ(i, x, y, z);
      sizeAttr.setX(i, Math.random());
    }
    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  }
}
