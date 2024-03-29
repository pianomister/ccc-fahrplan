import { FC, useState } from 'react';
import { CEvent } from './Fahrplan';
import './Appointment.css';
import { useLocalStorage } from './utils';

const bigRooms = ['Saal 1', 'Saal Zuse', 'Saal Granville']

export function getStartTime(event: CEvent): number {
  const date = new Date(event.date);
  return date.getTime();
}

export function getEndTime(event: CEvent): number {
  const [hours, minutes] = event.duration.split(':')
  return getStartTime(event) + (parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000);
}

function isRunning(event: CEvent): boolean {
  const date = new Date()
  const now = date.getTime()
  return now >= getStartTime(event) && now <= getEndTime(event)
}


interface Props {
  data: CEvent
  showRemoved?: boolean
}

const Appointment: FC<Props> = ({ data, showRemoved = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isRemoved, setIsRemoved] = useLocalStorage<boolean>(`event-${data.id}-removed`, false)
  const [isFavorite, setIsFavorite] = useLocalStorage<boolean>(`event-${data.id}-favorite`, false)

  if ((isRemoved && !showRemoved) || (!isRemoved && showRemoved)) return null

  const date = new Date(data.date)
  const hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  minutes = minutes < 10 ? `0${minutes}` : minutes

  const weekday = new Intl.DateTimeFormat(['en'], {
    weekday: 'short'
  }).format(date);

  const speakers = data.persons.map(person => person.name).join(', ')

  const isBigTalk = bigRooms.includes(data.room)
  const isCurrentlyRunning = isRunning(data)

  function toggleDetails() {
    setIsExpanded(!isExpanded)
  }

  return <div className={`Appointment${isBigTalk ? ' isBigTalk' : ''}${isCurrentlyRunning ? ' isRunning' : ''}${isFavorite ? ' isFavorite' : ''}`}
              onClick={toggleDetails}>
    <h3 className="Appointment-Time">{hours}:{minutes}</h3>
    <h4 className="Appointment-Title">{data.title}</h4>
    <p className="Appointment-Meta">{weekday} | {data.duration}h</p>
    <p className="Appointment-Room">{data.room} {speakers && '—'} {speakers}</p>
    {isExpanded && <>
      <span className="Appointment-Link"><a target="_blank" href={data.url}>Event Link</a></span>
      <div className="Appointment-Buttons">
        <button className="Appointment-Button remove" onClick={() => setIsRemoved(!isRemoved)}>{isRemoved ? 'Show' : 'Hide'}</button>
        <button className="Appointment-Button favorite" onClick={() => setIsFavorite(!isFavorite)}>Favorite</button>
      </div>
      <p className="Appointment-Abstract"><br/>{data.abstract}<br/><br/>{data.description}</p></>}
  </div>;
};

export default Appointment;