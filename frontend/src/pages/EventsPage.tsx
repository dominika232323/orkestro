import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faCalendarAlt,
  faClock,
  faPen,
  faLocationDot,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance as axios, fetchUserOrRedirect } from "../auth";
import { OrkestroRole, OrkestroEvent, Paged } from "../interfaces";
import Pagination from "../components/Pagination";
import { getRole } from "../util";
import SearchBar from "../components/SearchBar";
import DeleteEvent from "../components/DeleteEvent";

// Page to show users events
export default function EventsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [role, setRole] = useState<OrkestroRole>();
  const [events, setEvents] = useState<OrkestroEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteEvent, setShowDeleteEvent] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [selectedEventName, setSelectedEventName] = useState("");

  // Fetch user
  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, [navigate]);

  // Fetch user role
  const fetchRole = useCallback(() => getRole(setRole, groupId), [groupId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Fetch users events
  const fetchEvents = useCallback(async () => {
    setLoading(true);

    await axios
      .get<Paged<OrkestroEvent>>(
        `/api/events/search/?page=${currentPage}&group_id=${groupId}&search=${searchQuery}`
      )
      .then((response) => {
        const parsedEvents = response.data.items.map((event) => ({
          ...event,
          date: new Date(event.date), // parse date
        }));

        setEvents(parsedEvents);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching events:", error));

    setLoading(false);
  }, [currentPage, groupId, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("events.title")}
      </h1>

      {/* Add Event Button */}
      {role?.is_manager && (
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
          onClick={() => navigate(`/new-event/${groupId}`)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {t("events.add-event")}
        </button>
      )}

      {/* Search Bar */}
      <SearchBar
        query={searchQuery}
        onQueryChange={(value) => setSearchQuery(value)}
        onSearch={fetchEvents}
        placeholder={t("events.placeholder")}
        setCurrentPage={setCurrentPage}
      />

      {/* Event List */}
      {events.length > 0 ? (
        <ul className="space-y-6">
          {events.map((event) => (
            <li
              key={event.event_id}
              className="flex justify-between bg-white p-6 rounded-lg shadow-md"
            >
              <div>
                <h2 className="text-lg font-bold mb-4">{event.name}</h2>
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
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-gray-500"
                    />
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
              </div>
              <div className="flex flex-col justify-evenly ml-2">
                <button
                  onClick={() => navigate(`/event-details/${event.event_id}`)}
                  className="px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors whitespace-nowrap"
                >
                  <FontAwesomeIcon className="mr-2" icon={faBars} />
                  <span>{t("events.details")}</span>
                </button>
                {role?.is_manager && (
                  <>
                    <button
                      onClick={() => navigate(`/edit-event/${event.event_id}`)}
                      className="px-2 py-2 my-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors whitespace-nowrap"
                    >
                      <FontAwesomeIcon className="mr-2" icon={faPen} />
                      <span>{t("events.edit")}</span>
                    </button>
                    <button
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      onClick={() => {
                        setSelectedEventId(event.event_id);
                        setSelectedEventName(event.name);
                        setShowDeleteEvent(true);
                      }}
                    >
                      <FontAwesomeIcon className="mr-2" icon={faTimes} />
                      <span>{t("events.delete")}</span>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : loading ? (
        <p className="text-gray-600 text-center">{t("events.loading")}</p>
      ) : (
        <p className="text-gray-600 text-center">{t("events.no-events")}</p>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Delete event window */}
      {showDeleteEvent && selectedEventId && (
        <DeleteEvent
          eventId={selectedEventId}
          eventName={selectedEventName}
          fetchEvents={fetchEvents}
          setShowDeleteEvent={setShowDeleteEvent}
        />
      )}
    </div>
  );
}
