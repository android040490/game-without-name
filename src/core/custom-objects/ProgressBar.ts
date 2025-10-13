import * as THREE from "three";

export class ProgressBar extends THREE.Sprite {
  private readonly _value: THREE.Uniform<number>;
  private readonly _maxValue: THREE.Uniform<number>;

  constructor(maxValue: number, value?: number) {
    super();
    this._value = new THREE.Uniform(value ?? maxValue);
    this._maxValue = new THREE.Uniform(value ?? maxValue);
    this.material = new THREE.SpriteMaterial();

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.maxValue = this._maxValue;
      shader.uniforms.value = this._value;
      shader.fragmentShader = `
          #define ss(a, b, c) smoothstep(a, b, c)
          uniform float maxValue;
          uniform float value;
          ${shader.fragmentShader}
        `.replace(
        `outgoingLight = diffuseColor.rgb;`,
        ` 
            float progress = value / maxValue;
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

  set value(value: number) {
    this._value.value = value;
  }
}
