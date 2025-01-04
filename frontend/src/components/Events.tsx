import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faPlus,
  faCalendarAlt,
  faClock,
  faPen,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

interface IEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  address: string;
}

interface IGroup {
  id: string;
  name: string;
  events: IEvent[];
}

const groups: IGroup[] = [
  {
    id: "1",
    name: "Group A",
    events: Array.from({ length: 12 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Event ${i + 1}`,
      date: `2024-01-${(i + 1).toString().padStart(2, "0")}`,
      time: "18:00",
      description: `Description for Event ${i + 1}`,
      address: `Location ${i + 1}`,
    })),
  },
  {
    id: "2",
    name: "Group B",
    events: Array.from({ length: 7 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Event ${i + 1}`,
      date: `2024-02-${(i + 1).toString().padStart(2, "0")}`,
      time: "15:00",
      description: `Description for Event ${i + 1}`,
      address: `Location ${i + 1}`,
    })),
  },
  {
    id: "3",
    name: "Group C",
    events: [],
  },
];

export default function Events() {
  const { t } = useLanguage();

  // States for managing current group, pagination, and selected event
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsPerPage = 5;

  // Current Group and its events
  const currentGroup = groups[currentGroupIndex];
  const totalPages = Math.ceil(currentGroup.events.length / eventsPerPage);

  // Paginated Events
  const paginatedEvents = currentGroup.events.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Selected Event Details
  const selectedEvent = currentGroup.events.find(
    (event) => event.id === selectedEventId
  );

  // Group Navigation Handlers
  const handlePrevGroup = () => {
    setCurrentGroupIndex((prev) => (prev - 1 + groups.length) % groups.length);
    setCurrentPage(1); // Reset page to 1
    setSelectedEventId(null); // Reset selected event
  };

  const handleNextGroup = () => {
    setCurrentGroupIndex((prev) => (prev + 1) % groups.length);
    setCurrentPage(1);
    setSelectedEventId(null);
  };

  // Pagination Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("events.title")}
      </h1>

      {/* Group Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handlePrevGroup}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className="text-xl font-bold">{currentGroup.name}</h2>
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handleNextGroup}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* List of Events */}
      <ul className="space-y-4">
        {paginatedEvents.length > 0 ? (
          paginatedEvents.map((event) => (
            <li
              key={event.id}
              className={`bg-white p-4 rounded-lg shadow border hover:shadow-lg cursor-pointer ${
                selectedEventId === event.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedEventId(event.id)}
            >
              <p className="font-bold">{event.name}</p>
              <p className="text-gray-600">{event.date}</p>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-600">{t("events.no-events")}</li>
        )}
        {/* Add Event Button */}
        <li>
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {t("events.add-event")}
          </button>
        </li>
      </ul>

      {/* Pagination Buttons */}
      {currentGroup.events.length > eventsPerPage && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            className={
              "p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            }
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            {t("events.prev")}
          </button>
          <span className="self-center font-medium">
            {t("events.page")} {currentPage} / {totalPages}
          </span>
          <button
            className={
              "p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            }
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            {t("events.next")}
          </button>
        </div>
      )}

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-bold mb-4">{selectedEvent.name}</h2>
          <p>
            <strong>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-gray-500"
              />
              {t("events.date")}:
            </strong>{" "}
            {selectedEvent.date}
          </p>
          <p>
            <strong>
              <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-500" />
              {t("events.time")}:
            </strong>{" "}
            {selectedEvent.time}
          </p>
          <p>
            <strong>
              <FontAwesomeIcon icon={faPen} className="mr-2 text-gray-500" />
              {t("events.description")}:
            </strong>{" "}
            {selectedEvent.description}
          </p>
          <p>
            <strong>
              <FontAwesomeIcon
                icon={faLocationDot}
                className="mr-2 text-gray-500"
              />
              {t("events.address")}:
            </strong>{" "}
            {selectedEvent.address}
          </p>
        </div>
      )}
    </div>
  );
}
