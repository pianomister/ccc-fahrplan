export interface XmlRoot {
    schedule: XmlSchedule
}

export interface XmlSchedule {
    version: string
    conference: XmlConference
    day: XmlDay[]
    "_xmlns:xsi": string
    "_xsi:noNamespaceSchemaLocation": string
}

export interface XmlConference {
    acronym: string
    title: string
    start: string
    end: string
    days: string
    timeslot_duration: string
    time_zone_name: string
    url: string
    track: XmlTrack[]
    base_url: string
}

export interface XmlTrack {
    _name: string
    _color: string
    _slug: string
}

export interface XmlDay {
    room: XmlRoom[]
    _index: string
    _date: string
    _start: string
    _end: string
}

export interface XmlRoom {
    event: XmlEvent[]
    _name: string
    _guid: string
}

export interface XmlEvent {
    date: string
    start: string
    duration: string
    room: string
    slug: string
    url: string
    title: string
    subtitle: string
    language: string
    track: string
    type: string
    abstract: string
    description: string
    logo: string
    persons: XmlPersons
    links: string
    _guid: string
    _id: string
}

export interface XmlPersons {
    person: XmlPerson[] | string[] | string
}

export interface XmlPerson {
    _guid: string
    __text: string
}

