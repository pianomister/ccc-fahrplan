import {FC, useState} from 'react';
import './Appointment.css';
import {useLocalStorage} from './utils';
import {XmlEvent} from "./models-xml";

const bigRooms = ['Saal 1', 'Saal GLITCH', 'Saal ZIGZAG']

function getSpeakers(talk: XmlEvent): string {
    if (Array.isArray(talk.persons.person))
        return talk.persons.person.map(person => {
            if (typeof person === 'string') {
               return person
            }
            return person.__text
        }).join(', ')
    else
        return talk.persons.person
}

export function getStartTime(event: XmlEvent): number {
    const date = new Date(event.date);
    return date.getTime();
}

export function getEndTime(event: XmlEvent): number {
    const [hours, minutes] = event.duration.split(':')
    return getStartTime(event) + (parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000);
}

function isRunning(event: XmlEvent): boolean {
    const date = new Date()
    const now = date.getTime()
    return now >= getStartTime(event) && now <= getEndTime(event)
}

function formatDescription(description: string): string {
    return description.split('&#13;').join('\n')
}

interface Props {
    talk: XmlEvent
    showRemoved?: boolean
}

const Appointment: FC<Props> = ({talk, showRemoved = false}: Props) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [isRemoved, setIsRemoved] = useLocalStorage<boolean>(`event-${talk.slug}-removed`, false)
    const [isFavorite, setIsFavorite] = useLocalStorage<boolean>(`event-${talk.slug}-favorite`, false)

    if ((isRemoved && !showRemoved) || (!isRemoved && showRemoved)) return null

    const start = new Date(talk.date)
    const hours = start.getHours()
    let minutes: number | string = start.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes

    const weekday = new Intl.DateTimeFormat(['en'], {
        weekday: 'short'
    }).format(start);

    const speaker = getSpeakers(talk)
    const room = talk.room
    const title = talk.title
    const duration = talk.duration

    const isBigTalk = room ? bigRooms.includes(room) : false
    const isCurrentlyRunning = isRunning(talk)

    const abstract = formatDescription(talk.abstract)
    const description = formatDescription(talk.description)

    function toggleDetails() {
        setIsExpanded(!isExpanded)
    }

    return <div
        className={`Appointment${isBigTalk ? ' isBigTalk' : ''}${isCurrentlyRunning ? ' isRunning' : ''}${isFavorite ? ' isFavorite' : ''}`}
        onClick={toggleDetails}>
        <h3 className="Appointment-Time">{hours}:{minutes}</h3>
        <h4 className="Appointment-Title">{title}</h4>
        <p className="Appointment-Meta">
            {weekday} | {duration}min
        </p>
        <p className="Appointment-Room">{room} {speaker && '—'} {speaker ?? ''}</p>
        {isExpanded && <>
            <span className="Appointment-Link"><a target="_blank" href={talk.url}>Event Link</a></span>
            <div className="Appointment-Buttons">
                <button className="Appointment-Button remove"
                        onClick={() => setIsRemoved(!isRemoved)}>{isRemoved ? 'Show' : 'Hide'}</button>
                <button className="Appointment-Button favorite" onClick={() => setIsFavorite(!isFavorite)}>Favorite
                </button>
            </div>
            <pre className="Appointment-Abstract"><br/>{abstract}<br/><br/>{description}</pre></>}
    </div>;
};

export default Appointment;