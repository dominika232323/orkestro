import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import {
  faArrowLeft,
  faArrowRight,
  faCalendarAlt,
  faClock,
  faLocationDot,
  faPen,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    events: [
      {
        id: "1",
        name: "Concert",
        date: "2024-01-10",
        time: "18:00",
        description: "A great concert featuring talented musicians.",
        address: "123 Music Hall, Cityville",
      },
      {
        id: "2",
        name: "Rehearsal",
        date: "2024-01-08",
        time: "15:00",
        description: "Rehearsal for the upcoming concert.",
        address: "Music Room, School of Arts",
      },
    ],
  },
  {
    id: "2",
    name: "Group B",
    events: [
      {
        id: "3",
        name: "Workshop",
        date: "2024-01-12",
        time: "10:00",
        description: "A workshop on music composition.",
        address: "Auditorium, City Hall",
      },
    ],
  },
  {
    id: "3",
    name: "Group C",
    events: [],
  },
];

export default function Events() {
  const { t } = useLanguage();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const currentGroup = groups[currentGroupIndex];

  const handlePrevGroup = () => {
    setCurrentGroupIndex((prev) => (prev - 1 + groups.length) % groups.length);
    setSelectedEvent(null); // Reset selected event
  };

  const handleNextGroup = () => {
    setCurrentGroupIndex((prev) => (prev + 1) % groups.length);
    setSelectedEvent(null); // Reset selected event
  };

  const handleNewEvent = () => {};

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("events.title")}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handlePrevGroup}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-xl font-bold">{currentGroup.name}</h1>
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handleNextGroup}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* List of Events */}
      <ul className="space-y-4">
        {currentGroup.events.length > 0 ? (
          currentGroup.events.map((event) => (
            <li
              key={event.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-lg cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <p className="font-bold">{event.name}</p>
              <p className="text-gray-600">{event.date}</p>
            </li>
          ))
        ) : (
          <li>
            <p className="text-gray-600 text-center">{t("events.no-events")}</p>
          </li>
        )}
        <li>
          <button
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            onClick={handleNewEvent}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {t("events.add-event")}
          </button>
        </li>
      </ul>

      {/* Event Details */}
      {selectedEvent && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-bold mb-4">{selectedEvent.name}</h2>
          <p>
            <strong>
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </span>
              {t("events.date")}:
            </strong>{" "}
            {selectedEvent.date}
          </p>
          <p>
            <strong>
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faClock} />
              </span>
              {t("events.time")}:
            </strong>{" "}
            {selectedEvent.time}
          </p>
          <p>
            <strong>
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faPen} />
              </span>
              {t("events.description")}:
            </strong>{" "}
            {selectedEvent.description}
          </p>
          <p>
            <strong>
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faLocationDot} />
              </span>
              {t("events.address")}:
            </strong>{" "}
            {selectedEvent.address}
          </p>
        </div>
      )}
    </div>
  );
}
