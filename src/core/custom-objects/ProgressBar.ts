import * as THREE from "three";

export class ProgressBar extends THREE.Sprite {
  private readonly _progress: THREE.Uniform;
  private readonly _maxValue: number;
  private _value: number;

  constructor(maxValue: number, value?: number) {
    super();
    this._value = value ?? maxValue;
    this._maxValue = maxValue;
    this._progress = new THREE.Uniform(this._value / this._maxValue);
    this.material = new THREE.SpriteMaterial();

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.progress = this._progress;
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

  set value(value: number) {
    if (value !== this._value) {
      this._value = value;
      this._progress.value = this._value / this._maxValue;
    }
  }
}
