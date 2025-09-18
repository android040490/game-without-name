import { Object3D, Vector3 } from "three";
import { MuzzleFlash } from "../custom-objects/MuzzleFlash";
import { Weapon } from "../types/weapon";

interface WeaponConfig {
  name: Weapon;
  type: "melee" | "ranged";
  damage: number;
  range: number;
  fireRate: number;
  bulletCount: number;
  bulletSpread: number;
  projectileSpeed: number;
  lastAttackTime: number;
  bulletSize: number;
  bulletDensity: number;
  ammoInMagazine: number;
  magazineSize: number;
  totalAmmo: number;
  muzzleRef?: Object3D;
}

export class WeaponComponent {
  public name: Weapon;
  public type: "melee" | "ranged";
  public damage: number;
  public range: number;
  public fireRate: number;
  public bulletCount: number;
  public bulletSpread: number;
  public projectileSpeed: number;
  public lastAttackTime: number;
  public bulletSize: number;
  public bulletDensity: number;
  public isShotInitiated: boolean = false;
  public direction: Vector3 = new Vector3();
  public totalAmmo: number;
  public magazineSize: number;
  public ammoInMagazine: number;
  public isReloadInitiated: boolean = false;
  public muzzleFlash?: MuzzleFlash;

  constructor({
    name,
    type,
    damage,
    range,
    fireRate,
    bulletSize,
    muzzleRef,
    bulletDensity,
    ammoInMagazine,
    totalAmmo,
    magazineSize,
    bulletSpread = 0,
    bulletCount = 1,
    projectileSpeed = 0,
    lastAttackTime = 0,
  }: WeaponConfig) {
    this.name = name;
    this.type = type;
    this.damage = damage;
    this.range = range;
    this.fireRate = fireRate;
    this.bulletCount = bulletCount;
    this.bulletSpread = bulletSpread;
    this.projectileSpeed = projectileSpeed;
    this.lastAttackTime = lastAttackTime;
    this.bulletSize = bulletSize;
    this.bulletDensity = bulletDensity;
    this.ammoInMagazine = ammoInMagazine;
    this.totalAmmo = totalAmmo;
    this.magazineSize = magazineSize;
    if (muzzleRef) {
      this.muzzleFlash = new MuzzleFlash({ muzzleRef });
    }
  }

  get isMagazineEmpty(): boolean {
    return this.ammoInMagazine <= 0;
  }
}
