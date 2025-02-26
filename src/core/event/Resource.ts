export class ResourcesReady {}

export class ResourcesLoading {
  constructor(public readonly progress: number) {}
}
