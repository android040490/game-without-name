import gsap from "gsap";
import {
  AdditiveBlending,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
} from "three";
import vertexShader from "../shaders/damage-effect/vertex.glsl";
import fragmentShader from "../shaders/damage-effect/fragment.glsl";

export class PlayerDamageEffect {
  private time: Uniform;
  private intensity: Uniform;
  private material: ShaderMaterial;
  mesh: Mesh;

  constructor() {
    this.time = new Uniform(0);
    this.intensity = new Uniform(0);

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: this.time,
        uIntensity: this.intensity,
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      visible: false,
      vertexShader,
      fragmentShader,
    });

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
  }

  trigger(duration = 3, intensity = 1.0) {
    this.material.visible = true;
    gsap.killTweensOf(this.intensity);
    this.intensity.value = intensity;

    gsap.to(this.intensity, {
      value: 0,
      duration,
      ease: "power2.out",
      onComplete: () => {
        this.material.visible = false;
      },
    });

    gsap.killTweensOf(this.time);
    gsap.fromTo(
      this.time,
      { value: 0 },
      { value: duration * 1.5, duration, ease: "none" },
    );
  }
}
