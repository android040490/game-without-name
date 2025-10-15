import gsap from "gsap";
import { Mesh, PlaneGeometry, ShaderMaterial, Uniform } from "three";
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
      depthWrite: false,
      visible: false,
      vertexShader,
      fragmentShader,
    });

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
  }

  trigger(duration?: number) {
    this.material.visible = true;
    this.intensity.value = 1;
    gsap.killTweensOf(this.intensity);

    if (duration) {
      gsap.to(this.intensity, {
        value: 0,
        duration,
        ease: "power2.out",
        onComplete: () => {
          this.material.visible = false;
        },
      });
    }
  }

  update(time: number): void {
    if (this.material.visible) {
      this.time.value = time;
    }
  }
}
