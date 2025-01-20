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
import SubmitOrBack from "../components/SubmitOrBack";

// Showing details of selected event
export default function EventDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState<OrkestroEvent | null>(null);
  const [tracks, setTracks] = useState<OrkestroTrackEvent[]>([]);
  const [role, setRole] = useState<OrkestroRole>();

  // Fetch user's role
  const fetchRole = useCallback(() => {
    event && getRole(setRole, event.group);
  }, [event]);

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

  // Fetch tracks for selected event
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
      <div className="bg-gray-200 py-6 px-2 sm:px-6 rounded-lg max-w-4xl mx-auto mt-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">{event.name}</h1>

        {/* Event details */}
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

        {/* Buttons */}
        {role && (
          <SubmitOrBack
            submitMethod={() => navigate(`/edit-event/${event.event_id}`)}
            textSubmit={t("event-details.edit")}
            textSubmiting=""
            showSubmit={role.is_manager}
            onCancel={() => navigate(-1)}
            textCancel={t("event-details.back")}
          />
        )}

        {/* Tracks list */}
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
