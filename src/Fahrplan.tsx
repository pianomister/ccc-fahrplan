import {FC, useEffect, useState} from 'react';
import Appointment, {getEndTime} from './Appointment';
import './Fahrplan.css'
import {Conference, Talk} from "./models";
import {useLocalStorage} from "./utils";
import {XMLParser} from "fast-xml-parser";
import {XmlRoot} from "./models-xml";
import axios from "axios";

function fromXml(xml: string): XmlRoot {
    const parser = new XMLParser();
    return parser.parse(xml);
}

function getTalks(xml: XmlRoot): Talk[] {
    return xml.schedule.day
        .flatMap(day => day.room.flatMap(room => room.event))
}

function mapXmltoInternalModel(xml: XmlRoot): Conference {
    return {
        event_end: xml.schedule.conference.end,
        event_start: xml.schedule.conference.start,
        rooms: [], //getRooms(xml),
        talks: getTalks(xml),
        timezone: xml.schedule.conference.time_zone_name,
        tracks: [],
        version: xml.schedule.version
    }
}

function sortTalks(data: Conference): Talk[] {
    const now = new Date();
    const timestampNow = now.getTime()

    const talks = data.talks.filter((talk) => {
        const timestamp = getEndTime(talk)
        return timestampNow <= timestamp
    })
    talks.sort((a: Talk, b: Talk) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0)
    return talks
}


const Fahrplan: FC = () => {
    /*
    const {
        data: loadedData,
        error,
        isLoading
    //} = useSWR('https://api.events.ccc.de/congress/2024/schedule.xml', fetcher)
    } = useSWR(`https://corsproxy.io/?url=https://api.events.ccc.de/congress/2024/schedule.xml`, fetcher) // ?rand=${(new Date()).getTime()}
     */
    const [expanded, setExpanded] = useState<boolean>(false)
    const [data, setData] = useLocalStorage<Conference | boolean>('schedule-xml', false)
    const [error, setError] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [lastUpdated, setLastUpdated] = useLocalStorage<string>('schedule-xml-last-updated', '')

    /*
    useEffect(() => {
        if (!isLoading) {
            if (typeof loadedData !== 'undefined') {
                setData(loadedData)
                setLastUpdated((new Date()).toISOString())
            }
        }
    }, [loadedData, isLoading]);
    */

    useEffect(() => {
        axios.get(`https://corsproxy.io/?url=https%3A%2F%2Fapi.events.ccc.de%2Fcongress%2F2024%2Fschedule.xml?rand=${(new Date()).getTime()}`, {
            headers: {
               'Accept': 'text/xml',
             //   'Access-Control-Allow-Origin': '*'
            }
        }).then(res => {
            console.log('Received response', res.status, typeof res.data)
            const body = mapXmltoInternalModel(fromXml(res.data))
            setData(body)
            setLastUpdated((new Date()).toISOString())
            setError(undefined)
        })
            .catch(err => setError(err))
            .finally(() => setIsLoading(false))
    }, []);

    if (error) {
        return <div className="Fahrplan-Error">failed to load: {JSON.stringify(error)}</div>
    }

    if (isLoading || typeof data === 'boolean') return <div
        className="Fahrplan-Loading">loading ...</div>

    const talks = sortTalks(data)

    return <div className="Fahrplan">
        {error && (<div className="Fahrplan-Error">failed to load: {JSON.stringify(error)}</div>)}
        <p className="Fahrplan-LastUpdated">{lastUpdated}</p>
        <span className="Fahrplan-Expand" onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'Show'} hidden entries</span>
        {expanded &&
            <div className="RemovedEvents">
                {talks.map((talk) => {
                    return <Appointment key={talk.slug} talk={talk}
                                        showRemoved={true}/>
                })}
                <hr/>
            </div>
        }
        {talks.map((talk) => {
            return <Appointment key={talk.slug} talk={talk} showRemoved={false}/>
        })}
    </div>
};

export default Fahrplan;