import { FC } from 'react';
import { CEvent } from './Fahrplan';
import './Appointment.css';

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
}

const Appointment: FC<Props> = ({ data }: Props) => {

  const date = new Date(data.date)
  const hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  minutes = minutes === 0 ? '00' : minutes

  const weekday = new Intl.DateTimeFormat(['en'], {
    weekday: 'short'
  }).format(date);

  const isBigTalk = bigRooms.includes(data.room)
  const isCurrentlyRunning = isRunning(data)

  return <div className={`Appointment${isBigTalk ? ' isBigTalk' : ''}${isCurrentlyRunning ? ' isRunning' : ''}`}>
    <h3 className="Appointment-Time">{hours}:{minutes}</h3>
    <h4 className="Appointment-Title"><a href={data.url}>{data.title}</a></h4>
    <p className="Appointment-Meta">{weekday} | {data.duration}h</p>
    <p className="Appointment-Room">{data.room}</p>
    <p className="Appointment-Abstract">{data.abstract}</p>
  </div>;
};

export default Appointment;