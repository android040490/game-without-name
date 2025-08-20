import { Vector3 } from "three";

interface Config {
  minSpeed?: number;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
}

export class PlayerControlComponent {
  public minSpeed: number;
  public maxSpeed: number;
  public acceleration: number;
  public damping: number;
  public velocity: Vector3;
  public speed: number;

  constructor(config?: Config) {
    const {
      minSpeed = 4,
      maxSpeed = 8,
      acceleration = 12,
      damping = 0.13,
    } = config ?? {};

    this.speed = minSpeed;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.velocity = new Vector3();
    this.acceleration = acceleration;
    this.damping = damping;
  }
}
