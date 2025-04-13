interface WeaponConfig {
  damageAmount: number;
}
export class WeaponComponent {
  public damageAmount: number;

  constructor(config: WeaponConfig) {
    const { damageAmount } = config;

    this.damageAmount = damageAmount;
  }
}
