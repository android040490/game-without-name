export enum SoundAsset {
  RemingtonShot = "sounds/remington-shot.wav",
  RemingtonReload = "sounds/remington-reload.wav",
  PlayerWalkGravel = "sounds/player-walk-gravel.wav",
  PlayerRunGravel = "sounds/player-run-gravel.wav",
  DangerEnvironment = "sounds/dark-horror-ambience-for-mystical-scenes.mp3",
  ZombieGroan = "sounds/zombie-groan.mp3",
  ZombieScream = "sounds/zombie-scream.wav",
  ZombieDying = "sounds/zombie-dying.wav",
}

export const PreloadSounds: SoundAsset[] = [
  SoundAsset.RemingtonShot,
  SoundAsset.RemingtonReload,
  SoundAsset.PlayerWalkGravel,
  SoundAsset.PlayerRunGravel,
  SoundAsset.DangerEnvironment,
  SoundAsset.ZombieGroan,
  SoundAsset.ZombieScream,
  SoundAsset.ZombieDying,
];
