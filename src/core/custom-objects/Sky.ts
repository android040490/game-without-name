import * as THREE from "three";

import vertexShader from "../shaders/sky/vertex.glsl";
import fragmentShader from "../shaders/sky/fragment.glsl";

export default class Sky extends THREE.Mesh<
  THREE.BoxGeometry,
  THREE.ShaderMaterial
> {
  public isSky: boolean;

  constructor() {
    const material = new THREE.ShaderMaterial({
      name: "SkyShader",
      uniforms: {
        turbidity: { value: 3 },
        rayleigh: { value: 3 },
        mieCoefficient: { value: 0.1 },
        mieDirectionalG: { value: 0.9999 },
        sunPosition: { value: new THREE.Vector3() },
        up: { value: new THREE.Vector3(0, 1, 0) },
        uOpacity: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    super(new THREE.BoxGeometry(1, 1, 1), material);
    this.isSky = true;

    this.scale.setScalar(450000);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
