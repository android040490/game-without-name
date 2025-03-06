export interface CharacterConfig {
  modelPath?: string;
  height?: number;
  density?: number;
  isBoundingBoxVisible?: boolean;
}

export class CharacterModelComponent {
  constructor(public readonly config?: CharacterConfig) {}
}
