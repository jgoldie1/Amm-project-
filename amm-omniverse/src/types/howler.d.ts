declare module 'howler' {
  export class Howl {
    constructor(options: Record<string, unknown>)
    play(id?: number | string): number
    pause(id?: number): this
    stop(id?: number): this
    unload(): void
    volume(volume?: number, id?: number): number | this
    loop(loop?: boolean, id?: number): boolean | this
  }

  export const Howler: {
    volume(volume?: number): number | void
    mute(muted: boolean): void
  }
}
