import { CollisionGroups } from "./CollisionGroups";

export class InteractionGroups {
  static readonly GROUND = this.createMask(
    CollisionGroups.GROUND,
    CollisionGroups.ALL,
  );
  static readonly PLAYER = this.createMask(
    CollisionGroups.PLAYER,
    CollisionGroups.GROUND,
  );
  static readonly PLAYER_WEAPON = this.createMask(
    CollisionGroups.PLAYER | CollisionGroups.WEAPON,
    CollisionGroups.ENEMY,
  );
  static readonly ENEMY = this.createMask(
    CollisionGroups.ENEMY,
    CollisionGroups.GROUND | CollisionGroups.WEAPON,
  );
  static readonly DYNAMIC_OBJECT = this.createMask(
    CollisionGroups.DYNAMIC_OBJECT,
    CollisionGroups.ALL,
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
