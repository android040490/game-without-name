export class HealthComponent {
  public damage = 0;
  public isDead = false;
  public health: number;

  constructor(public readonly initialHealth: number) {
    this.health = initialHealth;
  }
}
