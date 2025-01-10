import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../LanguageContext";
import { Event } from "../interfaces";
import axios from "axios";

export default function Calendar() {
  const { t, currentLanguage } = useLanguage();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth()); // 0 = January, 11 = December
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  let daysOfWeek: string[] = [];

  if (currentLanguage === "pl") {
    daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
  } else if (currentLanguage === "en") {
    daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }

  const fetchEvents = useCallback(async () => {
    console.log(year, month);
    await axios
      .get<Event[]>(`/api/events/me/?year=${year}&month=${month + 1}`)
      .then((response) => {
        setEvents(response.data);
      });
  }, [year, month]);

  useEffect(() => {
    fetchEvents();
    setSelectedDay(null);
  }, [fetchEvents]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // adjust for Monday as the first day of the week

  const eventsForDay = (day: number) => {
    return events.filter(
      (event: Event) => new Date(event.date).getDate() === day
    );
  };

  const setCurrentMonth = () => {
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth());
    setSelectedDay(null);
  };

  const yearOptions = Array.from(
    { length: 101 },
    (_, i) => currentYear - 50 + i
  );

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("calendar.title")}
      </h1>
      <div className="flex items-center justify-between mb-6">
        <div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>
                {new Date(0, index).toLocaleString(currentLanguage, {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
        <button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={setCurrentMonth}
        >
          {t("calendar.current-month")}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Weekday Headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="font-semibold text-gray-600">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={index}></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const day = dayIndex + 1;
          const dayEvents = eventsForDay(day);

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`border rounded-md p-4 cursor-pointer hover:bg-blue-100 ${
                dayEvents.length > 0 ? "bg-blue-50" : ""
              }`}
            >
              <div className="text-lg font-bold">{day}</div>
              {dayEvents.length > 0 && (
                <div className="text-sm text-green-600">
                  {dayEvents.length}{" "}
                  {currentLanguage === "en"
                    ? "Event(s)"
                    : dayEvents.length === 1
                      ? "Wydarzenie"
                      : [2, 3, 4].includes(dayEvents.length % 10) &&
                          ![12, 13, 14].includes(dayEvents.length % 100)
                        ? "Wydarzenia"
                        : "Wydarzeń"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Events for Selected Day */}
      {selectedDay && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold">
            {t("calendar.events-for")} {selectedDay}{" "}
            {new Date(year, month).toLocaleString(currentLanguage, {
              month: "long",
            })}
            , {year}
          </h3>
          <ul className="mt-2">
            {eventsForDay(selectedDay).length > 0 ? (
              eventsForDay(selectedDay).map((event: Event, index) => (
                <li key={index} className="text-sm text-gray-800">
                  <strong>{event.name}</strong> -{" "}
                  {new Date(event.date).toLocaleTimeString()}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">
                {t("calendar.no-events")}
              </li>
            )}
          </ul>
          <button
            onClick={() => setSelectedDay(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t("calendar.close")}
          </button>
        </div>
      )}
    </div>
  );
}
