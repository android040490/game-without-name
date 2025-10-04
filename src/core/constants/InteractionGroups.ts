import { CollisionGroups } from "./CollisionGroups";

export class InteractionGroups {
  static readonly GROUND = this.createMask(
    CollisionGroups.GROUND,
    CollisionGroups.ALL,
  );

  static readonly PLAYER = this.createMask(
    CollisionGroups.PLAYER,
    CollisionGroups.GROUND |
      CollisionGroups.WALL |
      CollisionGroups.DYNAMIC_OBJECT |
      CollisionGroups.TRIGGER_ZONE |
      CollisionGroups.ENEMY,
  );

  static readonly PLAYER_WEAPON = this.createMask(
    CollisionGroups.WEAPON,
    CollisionGroups.ENEMY | CollisionGroups.DYNAMIC_OBJECT,
  );

  static readonly DYNAMIC_OBJECT = this.createMask(
    CollisionGroups.DYNAMIC_OBJECT,
    CollisionGroups.ALL,
  );

  static readonly BOUNDING_BOX = this.createMask(
    CollisionGroups.DYNAMIC_OBJECT,
    CollisionGroups.DYNAMIC_OBJECT |
      CollisionGroups.WALL |
      CollisionGroups.GROUND |
      CollisionGroups.PLAYER,
  );

  static readonly PROJECTILE = this.createMask(
    CollisionGroups.PROJECTILE,
    CollisionGroups.ENEMY |
      CollisionGroups.PLAYER |
      CollisionGroups.WALL |
      CollisionGroups.GROUND |
      CollisionGroups.DYNAMIC_OBJECT |
      CollisionGroups.TRIGGER_ZONE,
  );

  static readonly HIT_BOX = this.createMask(
    CollisionGroups.TRIGGER_ZONE,
    CollisionGroups.PLAYER | CollisionGroups.DYNAMIC_OBJECT,
  );

  static readonly HURT_BOX = this.createMask(
    CollisionGroups.TRIGGER_ZONE | CollisionGroups.DYNAMIC_OBJECT,
    CollisionGroups.PROJECTILE | CollisionGroups.TRIGGER_ZONE,
  );

  /**
   * Utility method to create a packed 32-bit bitmask
   * @param membership - Groups the collider is part of
   * @param filter - Groups the collider can interact with
   * @returns Packed 32-bit bitmask
   */
  static createMask(membership: number, filter: number): number {
    return (membership << 16) | filter;
  }
}
