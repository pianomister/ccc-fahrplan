import { FC } from 'react';
import { CEvent } from './Fahrplan';
import './Appointment.css';

interface Props {
  data: CEvent
}

const Appointment: FC<Props> = ({ data }: Props) => {

  const date = new Date(data.date)
  const hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  minutes = minutes === 0 ? "00" : minutes

  return <div className="Appointment">
    <h3 className="Appointment-Title"><a href={data.url}>{data.title}</a></h3>
    <p className="Appointment-Time">{hours}:{minutes} | {data.duration}h</p>
    <p className="Appointment-Room">{data.room}</p>
    <p className="Appointment-Abstract">{data.abstract}</p>
  </div>;
};

export default Appointment;