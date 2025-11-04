export class HealthComponent {
  public damage = 0;
  public isDead = false;
  public hp: number;

  constructor(public readonly initialHealth: number) {
    this.hp = initialHealth;
  }
}
