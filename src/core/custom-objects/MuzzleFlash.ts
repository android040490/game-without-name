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
  Vector3,
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
    this.flashLight = new PointLight(0xffaa00, 10, 10, 0.1);
    this.muzzleRef.add(this.flashLight);
    this.muzzleRef.add(this.sparks);

    gsap.to(this.material.uniforms.uProgress, {
      value: 1,
      duration: this.duration,
      ease: "linear",
      onComplete: this.dispose.bind(this),
    });
  }

  private createSparks(): Points {
    const positionArray = new Float32Array(this.sparkCount * 3);
    const sizesArray = new Float32Array(this.sparkCount);

    for (let i = 0; i < this.sparkCount; i++) {
      const position = new Vector3(0, 0, 0.5);
      const angle = Math.random() * Math.PI * 2;

      position.x += Math.cos(angle) * Math.random() * 0.3;
      position.y += Math.sin(angle) * Math.random() * 0.3;
      position.z += Math.random() * 0.5 - 0.5;

      positionArray[i * 3] = position.x;
      positionArray[i * 3 + 1] = position.y;
      positionArray[i * 3 + 2] = position.z;

      sizesArray[i] = Math.random();
    }

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positionArray, 3),
    );
    this.geometry.setAttribute(
      "aSize",
      new Float32BufferAttribute(sizesArray, 1),
    );

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

  dispose(): void {
    this.muzzleRef.remove(this.sparks);
    this.geometry.dispose();
    this.material.dispose();
    this.muzzleRef.remove(this.flashLight);
    this.flashLight.dispose();
  }
}
