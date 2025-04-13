export class HealthComponent {
  public health: number;

  constructor(public readonly initialHealth: number) {
    this.health = initialHealth;
  }
}
