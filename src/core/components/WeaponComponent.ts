import { Object3D, Vector3 } from "three";
import { MuzzleFlash } from "../custom-objects/MuzzleFlash";

interface WeaponConfig {
  name: string;
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
  muzzleRef?: Object3D;
}

export class WeaponComponent {
  public name: string;
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
  public canShoot: boolean = true;
  public direction: Vector3 = new Vector3();
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
    if (muzzleRef) {
      this.muzzleFlash = new MuzzleFlash({ muzzleRef });
    }
  }
}
