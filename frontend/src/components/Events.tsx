import React, { useEffect, useState } from "react";
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
import { Role, Event, Paged } from "../interfaces";
import Pagination from "./Pagination";

export default function Events() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [role, setRole] = useState<Role>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      await axios
        .get<Role>(`/api/groups/${groupId}/role/`)
        .then((response) => setRole(response.data))
        .catch((error) => console.error("Error fetching role:", error));
    };

    fetchRole();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);

    await axios.get<Paged<Event>>(
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
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEvents();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (event_id: number) => {
    await axios
      .delete(`/api/events/${event_id}/`)
      .then(() => {
        console.log(`Successfully deleted event ${event_id}`);
        fetchEvents();
      })
      .catch((error) =>
        console.error(`Error deleting event ${event_id}:`, error)
      );
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("events.title")}
      </h1>

      {/* Search Bar */}
      <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("events.placeholder")}
          className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          {t("events.search")}
        </button>
      </div>

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
                  onClick={() =>
                    navigate(`/event-details/${event.event_id}`)
                  }
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
                      onClick={() => handleDelete(event.event_id)}
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

      {/* Add Event Button */}
      {role?.is_manager && (
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center mt-6"
          onClick={() => navigate(`/new-event/${groupId}`)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {t("events.add-event")}
        </button>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
