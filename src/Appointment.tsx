import {FC, useState} from 'react';
import './Appointment.css';
import {useLocalStorage} from './utils';
import {CEvent, Code, MaybeLocalized, RoomsMap, SpeakersMap} from "./models";

const bigRooms = ['Saal 1', 'Saal GLITCH', 'Saal ZIGZAG']

export function getLocalized(maybeLocalized: MaybeLocalized): string {
    return typeof maybeLocalized === 'string' ? maybeLocalized : maybeLocalized.de
}

export function getStartTime(event: CEvent): number {
    const start = new Date(event.start);
    return start.getTime();
}

export function getEndTime(event: CEvent): number {
    const end = new Date(event.end);
    return end.getTime();
}

export function getSpeakerNames(speakers: SpeakersMap, speakerCodes?: Code[]): string[] {
    return speakerCodes?.map(speakerCode => speakers[speakerCode])
        .filter(speaker => !!speaker)
        .map(speaker => speaker.name) ?? []
}

function isRunning(event: CEvent): boolean {
    const date = new Date()
    const now = date.getTime()
    return now >= getStartTime(event) && now <= getEndTime(event)
}

interface Props {
    data: CEvent
    rooms: RoomsMap
    speakers: SpeakersMap
    showRemoved?: boolean
}

const Appointment: FC<Props> = ({data, rooms, speakers, showRemoved = false}: Props) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [isRemoved, setIsRemoved] = useLocalStorage<boolean>(`event-${data.id}-removed`, false)
    const [isFavorite, setIsFavorite] = useLocalStorage<boolean>(`event-${data.id}-favorite`, false)

    if ((isRemoved && !showRemoved) || (!isRemoved && showRemoved)) return null

    const start = new Date(data.start)
    const hours = start.getHours()
    let minutes: number | string = start.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes

    const weekday = new Intl.DateTimeFormat(['en'], {
        weekday: 'short'
    }).format(start);

    const speaker = getSpeakerNames(speakers, data.speakers).join(', ')
    const room = data.room ? rooms[data.room] : undefined
    const title = getLocalized(data.title)

    const isBigTalk = room ? bigRooms.includes(room.name.de) : false
    const isCurrentlyRunning = isRunning(data)

    function toggleDetails() {
        setIsExpanded(!isExpanded)
    }

    return <div
        className={`Appointment${isBigTalk ? ' isBigTalk' : ''}${isCurrentlyRunning ? ' isRunning' : ''}${isFavorite ? ' isFavorite' : ''}`}
        onClick={toggleDetails}>
        <h3 className="Appointment-Time">{hours}:{minutes}</h3>
        <h4 className="Appointment-Title">{title}</h4>
        <p className="Appointment-Meta">{weekday} | {data.duration}min</p>
        <p className="Appointment-Room">{room && room.name.de} {speaker && '—'} {speaker ?? ''}</p>
        {isExpanded && <>
            <div className="Appointment-Buttons">
                <button className="Appointment-Button remove"
                        onClick={() => setIsRemoved(!isRemoved)}>{isRemoved ? 'Show' : 'Hide'}</button>
                <button className="Appointment-Button favorite" onClick={() => setIsFavorite(!isFavorite)}>Favorite
                </button>
            </div>
            <p className="Appointment-Abstract"><br/>{data.abstract}</p></>}
    </div>;
};

export default Appointment;