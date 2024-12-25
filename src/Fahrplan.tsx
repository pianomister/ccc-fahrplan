import {FC, useEffect, useState} from 'react';
import useSWR from 'swr';
import Appointment, {getEndTime} from './Appointment';
import './Fahrplan.css'
import {CEvent, Conference, Room, RoomsMap, Speaker, SpeakersMap, Talk} from "./models";

const fetcher = (...args: any[]) => {
    // @ts-ignore
    return fetch(...args).then(res => res.json());
}

function sortEvents(data: Conference): Talk[] {
    const now = new Date();
    const timestampNow = now.getTime()

    const talks = data.talks.filter((talk) => {
        const timestamp = getEndTime(talk)
        return timestampNow <= timestamp
    })
    talks.sort((a: CEvent, b: CEvent) => a.start > b.start ? 1 : a.start < b.start ? -1 : 0)
    return talks
}


const Fahrplan: FC = () => {
    const {
        data,
        error,
        isLoading
    } = useSWR('https://fahrplan.events.ccc.de/congress/2024/fahrplan/schedule/v/1.0/widgets/schedule.json', fetcher)
    //const [data, setData] = useState<any>()
    //const [error, setError] = useState<any>()
    //const [isLoading, setIsLoading] = useState<boolean>(true)
    const [expanded, setExpanded] = useState<boolean>(false)
    const [speakersMap, setSpeakersMap] = useState<SpeakersMap>({})
    const [roomsMap, setRoomsMap] = useState<RoomsMap>({})

    useEffect(() => {
        if (!isLoading) {
            const speakers: SpeakersMap = {}
            data.speakers.forEach((speaker: Speaker) => speakers[speaker.code] = speaker)
            setSpeakersMap(speakers)

            const rooms: RoomsMap = {}
            data.rooms.forEach((room: Room) => rooms[room.id] = room)
            setRoomsMap(rooms)
        }
    }, [data, isLoading]);

    /*
    useEffect(() => {
      axios.get(`https://corsproxy.io/?url=https%3A%2F%2Ffahrplan.events.ccc.de%2Fcongress%2F2024%2Ffahrplan%2Fschedule%2Fv%2F1.0%2Fwidgets%2Fschedule.json?rand=${(new Date()).getTime()}`, {
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
                    return <Appointment data={event} speakers={speakersMap} rooms={roomsMap} showRemoved={true}/>
                })}
                <hr/>
            </div>
        }
        {events.map((event) => {
            return <Appointment data={event} speakers={speakersMap} rooms={roomsMap}/>
        })}
    </div>
};

export default Fahrplan;