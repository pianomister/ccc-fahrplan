export type RoomId = number
export type Code = string
export type MaybeLocalized = string | Localized

export interface Conference {
    talks: Talk[]
    version: string
    timezone: string
    event_start: string
    event_end: string
    tracks: Track[]
    rooms: Room[]
    speakers: Speaker[]
}

export interface Talk {
    code?: string
    id: number
    title: MaybeLocalized
    abstract?: string
    speakers?: Code[]
    track?: number
    start: string
    end: string
    room: RoomId
    duration?: number
    updated?: string
    state: any
    do_not_record?: boolean
}

export interface Track {
    id: number
    name: Name
    description: Localized
    color: string
}

export interface Name {
    de: string
    en: string
}

export interface Room {
    id: RoomId
    name: RoomName
    description: Localized
}

export interface RoomName {
    de: string
    en: string
}

export interface Localized {
    de: string
    en: string
}

export interface Speaker {
    code: Code
    name: string
    avatar: string
    avatar_thumbnail_default: string
    avatar_thumbnail_tiny?: string
}

export type RoomsMap = Record<RoomId, Room>
export type SpeakersMap = Record<Code, Speaker>

export type CEvent = Talk