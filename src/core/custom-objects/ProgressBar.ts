import * as THREE from "three";

export class ProgressBar extends THREE.Sprite {
  public readonly progress: THREE.Uniform<number>;

  constructor(progress: number = 1) {
    super();
    this.progress = new THREE.Uniform(progress);
    this.material = new THREE.SpriteMaterial();

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.progress = this.progress;
      shader.fragmentShader = `
          #define ss(a, b, c) smoothstep(a, b, c)
          uniform float progress;
          ${shader.fragmentShader}
        `.replace(
        `outgoingLight = diffuseColor.rgb;`,
        ` 
            outgoingLight = diffuseColor.rgb;
            vec3 backColor = vec3(0);
            float pb = step(progress, vUv.x);
            
            vec3 red = vec3(1.0, 0.0, 0.0);
            vec3 yellow = vec3(1.0, 1.0, 0.0);
            vec3 green = vec3(0.0, 1.0, 0.0);

            vec3 color = mix(red, yellow, clamp(progress * 2.0, 0.0, 1.0));
            color = mix(color, green, clamp((progress - 0.5) * 2.0, 0.0, 1.0));

            outgoingLight.rgb = mix(color, backColor, pb);
        `,
      );
    };
    this.material.defines = { USE_UV: "" };
    this.center.set(0.5, 0);
  }
}
