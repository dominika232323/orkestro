import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { OrkestroEvent, OrkestroRole, OrkestroTrackEvent } from "../interfaces";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faLocationDot,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { getRole } from "../util";

// Showing details of selected event
export default function EventDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState<OrkestroEvent | null>(null);
  const [tracks, setTracks] = useState<OrkestroTrackEvent[]>([]);
  const [role, setRole] = useState<OrkestroRole>();

  // Fetch user's role
  const fetchRole = useCallback(() => getRole(setRole, event?.group), [event]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Fetch selected event
  const fetchEvent = useCallback(async () => {
    await axios
      .get<OrkestroEvent>(`/api/events/${eventId}/`)
      .then((response) => {
        let event = response.data;
        event.date = new Date(response.data.date);
        setEvent(event);
      })
      .catch((error) => console.error("Error fetching event:", error));
  }, [eventId]);

  const fetchTracks = useCallback(async () => {
    await axios
      .get(`/api/event-tracks/by_event/?event_id=${eventId}`)
      .then((response) => {
        setTracks(response.data);
      })
      .catch((error) =>
        console.error("Fetching tracks for event failed: ", error)
      );
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchTracks();
  }, [fetchEvent, fetchTracks]);

  if (event) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">{event.name}</h1>
        {role?.is_manager && (
          <button
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            onClick={() => navigate(`/edit-event/${event.event_id}`)}
          >
            {t("event-details.edit")}
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        >
          {t("event-details.back")}
        </button>
        <p>
          <strong>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-2 text-gray-500"
            />
            {t("events.date")}:
          </strong>{" "}
          {event.date.toLocaleDateString(currentLanguage, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <p>
          <strong>
            <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-500" />
            {t("events.time")}:
          </strong>{" "}
          {event.date.toLocaleTimeString(currentLanguage, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          <strong>
            <FontAwesomeIcon
              icon={faLocationDot}
              className="mr-2 text-gray-500"
            />
            {t("events.address")}:
          </strong>{" "}
          {event.place}
        </p>
        <p>
          <strong>
            <FontAwesomeIcon icon={faPen} className="mr-2 text-gray-500" />
            {t("events.description")}:
          </strong>{" "}
          {event.description}
        </p>

        {/* Lista utworów */}
        <h2 className="text-xl font-bold mt-4">{t("edit-event.tracks")}</h2>
        <ul className="list-disc pl-5">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <li
                key={track.event_track_id}
                className="flex justify-between items-center hover:underline"
                onClick={() =>
                  navigate(`/track-details/${track.track}/${event.group}`)
                }
              >
                <p>{track.track_details.name}</p>
              </li>
            ))
          ) : (
            <p>{t("event-details.no-tracks")}</p>
          )}
        </ul>
      </div>
    );
  } else {
    return <p>{t("event-details.fetching")}</p>;
  }
}
