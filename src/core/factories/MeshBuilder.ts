import * as THREE from "three";

// Geometry Config Types
type GeometryConfig =
  | { type: "box"; params: ConstructorParameters<typeof THREE.BoxGeometry> }
  | {
      type: "cylinder";
      params: ConstructorParameters<typeof THREE.CylinderGeometry>;
    }
  | {
      type: "sphere";
      params: ConstructorParameters<typeof THREE.SphereGeometry>;
    }
  | {
      type: "capsule";
      params: ConstructorParameters<typeof THREE.CapsuleGeometry>;
    };

// Material Config Types
type MaterialConfig =
  | { type: "standard"; params?: THREE.MeshStandardMaterialParameters }
  | { type: "phong"; params?: THREE.MeshPhongMaterialParameters }
  | { type: "basic"; params?: THREE.MeshBasicMaterialParameters };

// Texture Types
export type TextureKey =
  | "map"
  | "normalMap"
  | "aoMap"
  | "displacementMap"
  | "roughnessMap";

export type TexturePaths = Partial<Record<TextureKey, string>>;

export interface TextureConfig {
  texturePaths: TexturePaths;
  useCache?: boolean;
  colorSpace?: string;
}

export type TextureMap = {
  [key in TextureKey]?: THREE.Texture;
};

const GEOMETRY_MAP: Record<
  GeometryConfig["type"],
  new (...args: any) => THREE.BufferGeometry
> = {
  box: THREE.BoxGeometry,
  sphere: THREE.SphereGeometry,
  cylinder: THREE.CylinderGeometry,
  capsule: THREE.CapsuleGeometry,
};

const MATERIAL_MAP: Record<
  MaterialConfig["type"],
  new (params?: any) => THREE.Material
> = {
  standard: THREE.MeshStandardMaterial,
  phong: THREE.MeshPhongMaterial,
  basic: THREE.MeshBasicMaterial,
};

export interface MeshConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
}

export class MeshBuilder {
  createMesh(config: MeshConfig): THREE.Mesh {
    const geometry = this.createGeometry(config.geometry);
    const material = this.createMaterial(config.material);

    return new THREE.Mesh(geometry, material);
  }

  private createGeometry(config: GeometryConfig): THREE.BufferGeometry {
    return new GEOMETRY_MAP[config.type](...config.params);
  }

  private createMaterial(config: MaterialConfig): THREE.Material {
    const material = new MATERIAL_MAP[config.type](config.params || {});

    return material;
  }
}
