import {FC, useState} from 'react';
import './Appointment.css';
import {useLocalStorage} from './utils';
import {Code, MaybeLocalized, RoomsMap, SpeakersMap, Talk} from "./models";

const bigRooms = ['Saal 1', 'Saal GLITCH', 'Saal ZIGZAG']

export function getLocalized(maybeLocalized: MaybeLocalized): string {
    return typeof maybeLocalized === 'string' ? maybeLocalized : maybeLocalized.de
}

export function getStartTime(talk: Talk): number {
    const start = new Date(talk.start);
    return start.getTime();
}

export function getEndTime(talk: Talk): number {
    const end = new Date(talk.end);
    return end.getTime();
}

export function getDuration(talk: Talk): number {
    return talk.duration ?? ((getEndTime(talk) - getStartTime(talk)) / 1000 / 60)
}

export function getSpeakerNames(speakers: SpeakersMap, speakerCodes?: Code[]): string[] {
    return speakerCodes?.map(speakerCode => speakers[speakerCode])
        .filter(speaker => !!speaker)
        .map(speaker => speaker.name) ?? []
}

function isRunning(talk: Talk): boolean {
    const date = new Date()
    const now = date.getTime()
    return now >= getStartTime(talk) && now <= getEndTime(talk)
}

interface Props {
    talk: Talk
    rooms: RoomsMap
    speakers: SpeakersMap
    showRemoved?: boolean
}

const Appointment: FC<Props> = ({talk, rooms, speakers, showRemoved = false}: Props) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [isRemoved, setIsRemoved] = useLocalStorage<boolean>(`event-${talk.id}-${talk.code}-removed`, false)
    const [isFavorite, setIsFavorite] = useLocalStorage<boolean>(`event-${talk.id}-${talk.code}-favorite`, false)

    if ((isRemoved && !showRemoved) || (!isRemoved && showRemoved)) return null

    const start = new Date(talk.start)
    const hours = start.getHours()
    let minutes: number | string = start.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes

    const weekday = new Intl.DateTimeFormat(['en'], {
        weekday: 'short'
    }).format(start);

    const speaker = getSpeakerNames(speakers, talk.speakers).join(', ')
    const room = talk.room ? rooms[talk.room] : undefined
    const title = getLocalized(talk.title)
    const duration = getDuration(talk)

    const isBigTalk = room ? bigRooms.includes(room.name.de) : false
    const isCurrentlyRunning = isRunning(talk)

    function toggleDetails() {
        setIsExpanded(!isExpanded)
    }

    return <div
        className={`Appointment${isBigTalk ? ' isBigTalk' : ''}${isCurrentlyRunning ? ' isRunning' : ''}${isFavorite ? ' isFavorite' : ''}`}
        onClick={toggleDetails}>
        <h3 className="Appointment-Time">{hours}:{minutes}</h3>
        <h4 className="Appointment-Title">{title}</h4>
        <p className="Appointment-Meta">
            {talk.do_not_record && (
                <svg className="Appointment-DoNotRecord" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/>
                    <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
                    <path d="m2 2 20 20"/>
                </svg>
            )}
            {weekday} | {duration}min
        </p>
        <p className="Appointment-Room">{room && room.name.de} {speaker && '—'} {speaker ?? ''}</p>
        {isExpanded && <>
            <div className="Appointment-Buttons">
                <button className="Appointment-Button remove"
                        onClick={() => setIsRemoved(!isRemoved)}>{isRemoved ? 'Show' : 'Hide'}</button>
                <button className="Appointment-Button favorite" onClick={() => setIsFavorite(!isFavorite)}>Favorite
                </button>
            </div>
            <p className="Appointment-Abstract"><br/>{talk.abstract}</p></>}
    </div>;
};

export default Appointment;