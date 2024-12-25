import {FC, useEffect, useState} from 'react';
import useSWR from 'swr';
import Appointment, {getEndTime} from './Appointment';
import './Fahrplan.css'
import {Conference, Room, RoomsMap, Speaker, SpeakersMap, Talk} from "./models";
import {useLocalStorage} from "./utils";

interface ApiError extends Error {
    info: string
    status: number
}

const fetcher = async (...args: any[]) => {
    // @ts-ignore
    const res = await fetch(...args)

    console.log("STATUS", res.status)

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok || res.status != 200) {
        console.log("BLABLABLA")
        const error = new Error('An error occurred while fetching the data.') as ApiError
        // Attach extra info to the error object.
        error.info = await res.json()
        error.status = res.status
        throw error
    }

    return res.json()
}

function sortTalks(data: Conference): Talk[] {
    const now = new Date();
    const timestampNow = now.getTime()

    const talks = data.talks.filter((talk) => {
        const timestamp = getEndTime(talk)
        return timestampNow <= timestamp
    })
    talks.sort((a: Talk, b: Talk) => a.start > b.start ? 1 : a.start < b.start ? -1 : 0)
    return talks
}


const Fahrplan: FC = () => {
    const {
        data: loadedData,
        error,
        isLoading
    } = useSWR('https://fahrplan.events.ccc.de/congress/2024/fahrplan/schedule/v/1.0/widgets/schedule.json', fetcher)
    //const [data, setData] = useState<any>()
    //const [error, setError] = useState<any>()
    //const [isLoading, setIsLoading] = useState<boolean>(true)
    const [expanded, setExpanded] = useState<boolean>(false)
    const [speakersMap, setSpeakersMap] = useState<SpeakersMap>({})
    const [roomsMap, setRoomsMap] = useState<RoomsMap>({})
    const [data, setData] = useLocalStorage<Conference | boolean>('schedule', false)
    const [lastUpdated, setLastUpdated] = useLocalStorage<string>('schedule-last-updated', '')

    useEffect(() => {
        if (!isLoading) {
            if (typeof loadedData !== 'undefined') {
                setData(loadedData)
                setLastUpdated((new Date()).toISOString())
            }

            if (typeof data !== 'boolean') {
                const speakers: SpeakersMap = {}
                data.speakers.forEach((speaker: Speaker) => speakers[speaker.code] = speaker)
                setSpeakersMap(speakers)

                const rooms: RoomsMap = {}
                data.rooms.forEach((room: Room) => rooms[room.id] = room)
                setRoomsMap(rooms)
            }
        }
    }, [loadedData, isLoading]);

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

    if (isLoading || typeof data === 'boolean' || JSON.stringify(data) === '{}') return <div
        className="Fahrplan-Loading">loading ...</div>

    const talks = sortTalks(data)

    return <div className="Fahrplan">
        {error && (<div className="Fahrplan-Error">failed to load: {JSON.stringify(error)}</div>)}
        <p className="Fahrplan-LastUpdated">{lastUpdated}</p>
        <span className="Fahrplan-Expand" onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'Show'} hidden entries</span>
        {expanded &&
            <div className="RemovedEvents">
                {talks.map((talk) => {
                    return <Appointment key={talk.id} talk={talk} speakers={speakersMap} rooms={roomsMap}
                                        showRemoved={true}/>
                })}
                <hr/>
            </div>
        }
        {talks.map((talk) => {
            return <Appointment key={talk.id} talk={talk} speakers={speakersMap} rooms={roomsMap}/>
        })}
    </div>
};

export default Fahrplan;