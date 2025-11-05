import gsap from "gsap";
import { Mesh, PlaneGeometry, ShaderMaterial, Uniform } from "three";
import vertexShader from "../shaders/damage-effect/vertex.glsl";
import fragmentShader from "../shaders/damage-effect/fragment.glsl";

interface EffectParams {
  fromIntensity: number;
  toIntensity: number;
  vignetteRadius: number;
  duration?: number;
  hideOnComplete?: boolean;
}

export class PlayerDamageEffect {
  private time: Uniform;
  private intensity: Uniform;
  private vignetteRadius: Uniform;
  private material: ShaderMaterial;
  mesh: Mesh;

  constructor() {
    this.time = new Uniform(0);
    this.intensity = new Uniform(0);
    this.vignetteRadius = new Uniform(0);

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: this.time,
        uIntensity: this.intensity,
        uVignetteRadius: this.vignetteRadius,
      },
      transparent: true,
      depthWrite: false,
      visible: false,
      vertexShader,
      fragmentShader,
    });

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
  }

  trigger(params: EffectParams): void {
    const {
      fromIntensity,
      toIntensity,
      vignetteRadius,
      duration = Infinity,
      hideOnComplete = true,
    } = params;
    this.material.visible = true;
    this.intensity.value = fromIntensity;
    this.vignetteRadius.value = vignetteRadius;
    gsap.killTweensOf(this.intensity);

    gsap.to(this.intensity, {
      value: toIntensity,
      duration,
      ease: "power2.out",
      onComplete: () => {
        if (hideOnComplete) {
          this.material.visible = false;
        }
      },
    });
  }

  update(time: number): void {
    if (this.material.visible) {
      this.time.value = time;
    }
  }
}
