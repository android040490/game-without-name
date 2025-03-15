export class CollisionGroups {
  static readonly NONE = 0b0000000000000000; // 0
  static readonly WALL = 0b0000000000000001; // 1
  static readonly GROUND = 0b0000000000000010; // 2
  static readonly ENEMY = 0b0000000000000100; // 3
  static readonly PLAYER = 0b0000000000001000; // 4
  static readonly WEAPON = 0b0000000000010000; // 5
  static readonly BREAKABLE = 0b0000000000100000; // 6
  static readonly COLLECTIBLE = 0b0000000001000000; // 7
  static readonly EXPLOSION = 0b0000000010000000; // 8
  static readonly DYNAMIC_OBJECT = 0b0000000100000000; // 9
  static readonly VEHICLE = 0b0000001000000000; // 10
  static readonly PROJECTILE = 0b0000010000000000; // 11
  static readonly WATER = 0b0000100000000000; // 12
  static readonly TRIGGER_ZONE = 0b0001000000000000; // 13
  static readonly NPC = 0b0010000000000000; // 14
  static readonly LADDER = 0b0100000000000000; // 15
  static readonly ALL = 0b0111111111111111;
}
