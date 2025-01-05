import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faCalendarAlt,
  faClock,
  faPen,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { Event } from "../interfaces";
import Pagination from "./Pagination";

export default function Events() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async () => {
    setLoading(true);

    // API call

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

  const handleDelete = () => {};

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("events.title")}
      </h1>

      {/* List of Events */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("events.placeholder")}
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {t("events.search")}
        </button>
      </div>

      {events.length > 0 ? (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.event_id}>
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-lg font-bold mb-4">{event.name}</h2>
                <p>
                  <strong>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-gray-500"
                    />
                    {t("events.date")}:
                  </strong>{" "}
                  {event.date.toLocaleDateString(currentLanguage)}
                </p>
                <p>
                  <strong>
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-gray-500"
                    />
                    {t("events.time")}:
                  </strong>{" "}
                  {event.date.toLocaleTimeString(currentLanguage)}
                </p>
                <p>
                  <strong>
                    <FontAwesomeIcon
                      icon={faPen}
                      className="mr-2 text-gray-500"
                    />
                    {t("events.description")}:
                  </strong>{" "}
                  {event.description}
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
              <button
                onClick={() => {
                  navigate(`/edit-event/${event.event_id}`);
                }}
              >
                {t("events.edit")}
              </button>
              <button
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleDelete}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </li>
          ))}
        </ul>
      ) : loading ? (
        <p>{t("events.loading")}</p>
      ) : (
        <p>{t("events.no-events")}</p>
      )}

      <button
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        onClick={() => {
          navigate(`/new-event/`);
        }}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        {t("events.add-event")}
      </button>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
