import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useLanguage} from "../LanguageContext";
import {faPlus, faXmark, faCircleUser} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";

import {fetchUserOrRedirect} from "../auth";
import {User} from "../interfaces";


export default function Settings() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User>();
  const [person, setPerson] = useState({
    name: "Jan",
    surname: "Kowalski",
    email: "jan.kowalski@gmail.com",
    googleCalendar: "Google Calendar",
    instruments: ["Violin", "Flute", "Guitar"],
  });
  const [newInstrument, setNewInstrument] = useState("");

  useEffect(() => {
    fetchUserOrRedirect(setUser);
  }, []);

  const handleAddInstrument = () => {
    if (newInstrument.trim() !== "") {
      setPerson((prev) => ({
        ...prev,
        instruments: [...prev.instruments, newInstrument],
      }));
      setNewInstrument("");
    }
  };

  const handleRemoveInstrument = (instrumentToRemove: string) => {
    setPerson((prev) => ({
      ...prev,
      instruments: prev.instruments.filter(
        (instrument) => instrument !== instrumentToRemove
      ),
    }));
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("settings.title")}
      </h1>

      {/* Profile picture */}
      <div className="mb-4">
        {user && user.profile_picture_url ?
          <img
            className="h-32 rounded-full"
            src={user.profile_picture_url}
          />
          :
          <FontAwesomeIcon
            className="h-32 text-gray-700 rounded-full"
            icon={faCircleUser}
          />
        }
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.name")}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={user && user.name}
        />
      </div>

      {/* Surname */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.surname")}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={user && user.surname}
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.email")}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={user && user.email}
        />
      </div>

      {/* Google Calendar */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.google-calendar")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-300 rounded-lg"
            value={user && user.google_calendar_id}
          />
          <button
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Connect
          </button>
         </div>
      </div>

      {/* Instruments */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.add-instrument")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-300 rounded-lg"
            value={newInstrument}
            onChange={(e) => setNewInstrument(e.target.value)}
          />
          <button
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={handleAddInstrument}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Instrument List */}
      {person.instruments.length > 0 && (
        <ul className="space-y-2 mb-4">
          {person.instruments.map((instrument, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 bg-gray-300 border border-black rounded-lg"
            >
              <span>{instrument}</span>
              <button
                className="p-2 text-red-500 hover:text-red-600"
                onClick={() => handleRemoveInstrument(instrument)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
