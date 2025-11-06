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
  private readonly uniforms = {
    uTime: new Uniform(0),
    uIntensity: new Uniform(0),
    uVignetteRadius: new Uniform(0),
  };
  private material: ShaderMaterial;
  mesh: Mesh;

  constructor() {
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
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
    const { uIntensity, uVignetteRadius } = this.uniforms;
    uIntensity.value = fromIntensity;
    uVignetteRadius.value = vignetteRadius;
    gsap.killTweensOf(uIntensity);

    gsap.to(uIntensity, {
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
      this.uniforms.uTime.value = time;
    }
  }
}
