import { Vector3 } from "three";

interface Config {
  minSpeed?: number;
  maxSpeed?: number;
  accelerationFactor?: number;
  decelerationRate?: number;
}

export class PlayerControlComponent {
  public minSpeed: number;
  public maxSpeed: number;
  public accelerationFactor: number;
  public decelerationRate: number;
  public velocity: Vector3;
  public speed: number;

  constructor(config?: Config) {
    const {
      minSpeed = 3,
      maxSpeed = 10,
      accelerationFactor = 0.2,
      decelerationRate = 10,
    } = config ?? {};

    this.speed = minSpeed;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.velocity = new Vector3();
    this.accelerationFactor = accelerationFactor;
    this.decelerationRate = decelerationRate;
  }

  set accelerate(value: boolean) {
    this.speed = value ? this.maxSpeed : this.minSpeed;
  }
}
