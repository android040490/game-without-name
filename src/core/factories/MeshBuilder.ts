import * as THREE from "three";

// Geometry Config Types
interface BoxGeometryConfig {
  type: "box";
  params: ConstructorParameters<typeof THREE.BoxGeometry>;
}

interface CylinderGeometryConfig {
  type: "cylinder";
  params: ConstructorParameters<typeof THREE.CylinderGeometry>;
}

interface SphereGeometryConfig {
  type: "sphere";
  params: ConstructorParameters<typeof THREE.SphereGeometry>;
}

type GeometryConfig =
  | BoxGeometryConfig
  | CylinderGeometryConfig
  | SphereGeometryConfig;

// Material Config Types
interface StandardMaterialConfig {
  type: "standard";
  params: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0];
}
interface PhongMaterialConfig {
  type: "phong";
  params: ConstructorParameters<typeof THREE.MeshPhongMaterial>[0];
}
interface BasicMaterialConfig {
  type: "basic";
  params: ConstructorParameters<typeof THREE.MeshBasicMaterial>[0];
}

type MaterialConfig =
  | StandardMaterialConfig
  | PhongMaterialConfig
  | BasicMaterialConfig;

export type TextureKey =
  | "map"
  | "normalMap"
  | "aoMap"
  | "displacementMap"
  | "roughnessMap";

export type TexturePaths = {
  [key in TextureKey]?: string;
};

export interface TextureConfig {
  texturePaths: TexturePaths;
  useCache?: boolean;
  colorSpace?: string;
}

export type TextureMap = {
  [key in TextureKey]?: THREE.Texture;
};

export interface MeshConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
}

export class MeshBuilder {
  createMesh(config: MeshConfig): THREE.Mesh {
    const { geometry: geometryConfig, material: materialConfig } = config;

    const geometry = this.createGeometry(geometryConfig);
    const material = this.createMaterial(materialConfig);

    return new THREE.Mesh(geometry, material);
  }

  private createGeometry(geometryConfig: GeometryConfig): THREE.BufferGeometry {
    switch (geometryConfig.type) {
      case "box":
        return new THREE.BoxGeometry(...geometryConfig.params);

      case "sphere":
        return new THREE.SphereGeometry(...geometryConfig.params);

      case "cylinder":
        return new THREE.CylinderGeometry(...geometryConfig.params);
    }
  }

  private createMaterial(materialConfig: MaterialConfig): THREE.Material {
    switch (materialConfig.type) {
      case "standard":
        return new THREE.MeshStandardMaterial(materialConfig.params);

      case "phong":
        return new THREE.MeshPhongMaterial(materialConfig.params);

      case "basic":
        return new THREE.MeshBasicMaterial(materialConfig.params);
    }
  }
}
