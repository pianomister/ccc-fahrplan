import { FC, useEffect, useState } from 'react';
// import useSWR from 'swr';
import axios from 'axios';
import Appointment, { getEndTime } from './Appointment';
import { schedule } from './schedule';
import './Fahrplan.css'

export interface CEvent {
  abstract: string
  date: string
  description: string
  duration: string
  guid: string
  id: number
  language: string
  links: string[]
  logo: string
  persons: any[]
  room: string
  slug: string
  start: string
  subtitle: string | null
  title: string
  track: string | null
  type: string
  url: string
}

const fetcher = (...args: any[]) => {
  // @ts-ignore
  return fetch(...args).then(res => res.json());
}

function sortEvents(data: any): CEvent[] {
  const now = new Date();
  const timestampNow = now.getTime()

  const days = data.schedule.conference.days
  const events = days.reduce((list: any[], day: any) => {
    const rooms = day.rooms
    for (const [roomName, roomEvents] of Object.entries<any[]>(rooms)) {
      roomEvents.forEach((roomEvent) => {

        // filter past events
        const timestamp = getEndTime(roomEvent)

        if (timestampNow <= timestamp) {
          list.push({
            ...roomEvent,
            room: roomName
          })
        }
      })
    }
    return list
  }, [])

  events.sort((a: CEvent, b: CEvent) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0)

  return events
}

const Fahrplan: FC = () => {
  //const { data, error, isLoading } = useSWR('https://fahrplan.events.ccc.de/congress/2023/fahrplan/schedule.json', fetcher)
  const [data, setData] = useState<any>()
  const [error, setError] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [expanded, setExpanded] = useState<boolean>(false)

  //*
  useEffect(() => {
    axios.get('https://corsproxy.io/?https%3A%2F%2Ffahrplan.events.ccc.de%2Fcongress%2F2023%2Ffahrplan%2Fschedule.json', {
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).then(res => {
      console.log('Received response', res.status)
      const body = res.data
      setData(body)
    })
      .catch(err => setError(err))
      .finally(() => setIsLoading(false))
  }, []);
  //*/
  /*
  useEffect(() => {
    setData(schedule)
    setIsLoading(false)
  }, []);
  //*/

  if (error) return <div>failed to load with status {error.status}</div>
  if (isLoading) return <div>loading ...</div>

  const events = sortEvents(data)

  return <div className="Fahrplan">
    <span className="Fahrplan-Expand" onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'Show'} hidden entries</span>
    {expanded &&
      <div className="RemovedEvents">
        {events.map((event) => {
          return <Appointment data={event} showRemoved={true}/>
        })}
        <hr/>
      </div>
    }
    {events.map((event) => {
      return <Appointment data={event}/>
    })}
  </div>
};

export default Fahrplan;