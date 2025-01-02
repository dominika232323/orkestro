import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useLanguage} from "../LanguageContext";
import {faPlus, faXmark, faCircleUser} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";

import {axiosInstance as axios, fetchUserOrRedirect} from "../auth";
import {User, UserInstrument} from "../interfaces";


export default function Settings() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User>();
  const [userInstruments, setUserInstruments] = useState<UserInstrument[]>([]);
  const [newInstrument, setNewInstrument] = useState<string>("");

  useEffect(() => {
    fetchUserOrRedirect(setUser);
  }, []);

  useEffect(() => {
    const fetchUserInstruments = async () => {
      await axios.get<UserInstrument[]>(`/api/user-instruments/by_user/?user_id=${user?.user_id}`)
        .then((response) => {
          setUserInstruments(response.data);
        })
        .catch((error) => console.error("Error fetching user instruments:", error));
    };

    if (user) {
      fetchUserInstruments();
    }
  }, [user]);

  const handleAddInstrument = async () => {
    if (newInstrument.trim() !== "") {
      await axios.post(
        "/api/user-instruments/",
        {
          "user": user?.user_id,
          "instrument": newInstrument,
        }
      )
      .then((response) => {
        const newUserInstrument: UserInstrument = response.data;
        console.log(`Successfully added user instrument ${newUserInstrument.user_instrument_id}`);
        setUserInstruments([...userInstruments, newUserInstrument]);
        setNewInstrument("");
      })
      .catch((error) => console.error("Error adding user instrument:", error));
    }
  };

  const handleRemoveInstrument = async (user_instrument_id: number) => {
    await axios.delete(`/api/user-instruments/${user_instrument_id}/`)
    .then(() => {
      console.log(`Successfully deleted user instrument ${user_instrument_id}`);
      setUserInstruments((prev) => (
        prev.filter(
          (user_instrument) => user_instrument.user_instrument_id !== user_instrument_id
        )
      ))
    })
    .catch((error) => console.error(`Error deleting user instrument ${user_instrument_id}:`, error));
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("settings.title")}
      </h1>

      <div className="flex items-center gap-8 mb-6">
        <div className="h-32 w-32">
          {user && user.profile_picture_url ?
            <img
              className="h-full w-full rounded-full"
              src={user.profile_picture_url}
              alt="profile-picture"
            />
            :
            <FontAwesomeIcon
              className="h-full w-full text-gray-600 rounded-full"
              icon={faCircleUser}
            />
          }
        </div>
        <div className="leading-relaxed">
          <p><span className="text-gray-700">{t("settings.name")}: </span>{user && user.name}</p>
          <p><span className="text-gray-700">{t("settings.surname")}: </span>{user && user.surname}</p>
          <p><span className="text-gray-700">{t("settings.email")}: </span>{user && user.email}</p>
          <p>
            <span className="text-gray-700">{t("settings.google-calendar")}: </span>
            {user && user.google_calendar_id ?
              <span className="text-green-700">{t("settings.connected")}</span>
              :
              <>
                <span className="text-red-700">{t("settings.unconnected")}</span>
                <button
                  className="px-2 py-0.5 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2"
                >
                  {t("settings.connect")}
                </button>
              </>
            }
          </p>
        </div>
      </div>

      <h2 className="text-lg text-gray-700 mb-1">{t("settings.user-instruments")}</h2>
      <ul className="space-y-2 mb-4">
        {userInstruments.map((user_instrument) => (
          <li
            key={user_instrument.user_instrument_id}
            className="flex justify-between items-center p-2 bg-gray-300 border border-black rounded-lg"
          >
            <span>{user_instrument.instrument_details.name_en}</span> {/* TODO: language */}
            <button
              className="p-2 text-red-500 hover:text-red-600"
              onClick={() => handleRemoveInstrument(user_instrument.user_instrument_id)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.add-instrument")}
        </label>
        <div className="flex gap-2">
          {/* TODO: select instrument conveniently instead of typing its id */}
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
    </div>
  );
}
