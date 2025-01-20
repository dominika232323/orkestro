import { useGoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LanguageSelector, useLanguage } from "../LanguageContext";
import {
  faPlus,
  faXmark,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { axiosInstance as axios, fetchUserOrRedirect } from "../auth";
import {
  OrkestroUser,
  OrkestroInstrument,
  OrkestroUserInstrument,
} from "../interfaces";

// Settings page
export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [user, setUser] = useState<OrkestroUser>();
  const [instruments, setInstruments] = useState<OrkestroInstrument[]>([]);
  const [userInstruments, setUserInstruments] = useState<
    OrkestroUserInstrument[]
  >([]);
  const [newInstrument, setNewInstrument] = useState<string>("");
  const [loadingGcalendar, setLoadingGcalendar] = useState<boolean>(false);
  const [justLinkedGcalendar, setJustLinkedGcalendar] = useState<boolean>(false);

  // Get instruments name in correct language
  const instrumentName = (instrument: OrkestroInstrument, language: string) => {
    if (language === "pl") {
      return instrument.name_pl;
    } else {
      return instrument.name_en;
    }
  };

  // Fetch user
  useEffect(() => {
    fetchUserOrRedirect(navigate, setUser);
  }, [navigate, justLinkedGcalendar]);

  // Fetch instruments
  useEffect(() => {
    const fetchInstruments = async () => {
      await axios
        .get<OrkestroInstrument[]>("/api/instruments/")
        .then((response) => setInstruments(response.data))
        .catch((error) => console.error("Error fetching instruments:", error));
    };

    const fetchUserInstruments = async () => {
      await axios
        .get<OrkestroUserInstrument[]>(
          `/api/user-instruments/by_user/?user_id=${user?.user_id}`
        )
        .then((response) => setUserInstruments(response.data))
        .catch((error) =>
          console.error("Error fetching user instruments:", error)
        );
    };

    if (user) {
      fetchInstruments();
      fetchUserInstruments();
    }
  }, [user]);

  // Add new instrument to user
  const handleAddInstrument = async () => {
    if (newInstrument.trim() !== "") {
      await axios
        .post("/api/user-instruments/", {
          user: user?.user_id,
          instrument: parseInt(newInstrument, 10),
        })
        .then((response) => {
          const newUserInstrument: OrkestroUserInstrument = response.data;
          setUserInstruments([...userInstruments, newUserInstrument]);
          setNewInstrument("");
        })
        .catch((error) =>
          console.error("Error adding user instrument:", error)
        );
    }
  };

  // Remove instrument from user
  const handleRemoveInstrument = async (user_instrument_id: number) => {
    await axios
      .delete(`/api/user-instruments/${user_instrument_id}/`)
      .then(() => {
        setUserInstruments((prev) =>
          prev.filter(
            (user_instrument) =>
              user_instrument.user_instrument_id !== user_instrument_id
          )
        );
      })
      .catch((error) =>
        console.error(
          `Error deleting user instrument ${user_instrument_id}:`,
          error
        )
      );
  };

  const linkGoogleCalendar = useGoogleLogin({
    flow: "auth-code", // use "auth-code" for backend exchange
    onSuccess: async (codeResponse) => {
      console.log("Google Calendar consent successful:", codeResponse);
      setLoadingGcalendar(true);

      // Send the authorization code to the backend
      await axios.post("/api/google-calendar-link/", {
        authorization_code: codeResponse.code,
      })
      .then((backendResponse) => {
        console.log("Backend Google Calendar link successful:", backendResponse.data);
        setLoadingGcalendar(false);
        setJustLinkedGcalendar(true);
      })
      .catch((error) => {
        console.error("Backend Google Calendar link failed:", error)
        setLoadingGcalendar(false);
      });
    },
    onError: () => console.log("Google Calendar login failed"),
    scope: "https://www.googleapis.com/auth/calendar",
  });

  const forceSyncGoogleCalendar = async () => {
    setLoadingGcalendar(true);
    await axios
    .get("/api/google-calendar-sync/")
    .catch((error) => console.error("Google Calendar force sync failed:", error))
    .finally(() => setLoadingGcalendar(false));
  };

  return (
    <div className="bg-gray-200 py-6 px-2 sm:px-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Language selector (only mobile devices) */}
      <div className="fixed right-6 inline sm:hidden">
          <LanguageSelector />
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("settings.title")}
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
        {/* User's profile picture */}
        <div className="h-32 w-32">
          {user && user.profile_picture_url ? (
            <img
              className="h-full w-full rounded-full"
              src={user.profile_picture_url}
              alt="profile-picture"
            />
          ) : (
            <FontAwesomeIcon
              className="h-full w-full text-gray-600 rounded-full"
              icon={faCircleUser}
            />
          )}
        </div>

        {/* User's info */}
        <div className="leading-relaxed">
          <p>
            <span className="text-gray-700">{t("settings.name")}: </span>
            {user && user.name}
          </p>
          <p>
            <span className="text-gray-700">{t("settings.surname")}: </span>
            {user && user.surname}
          </p>
          <p>
            <span className="text-gray-700">{t("settings.email")}: </span>
            {user && user.email}
          </p>
          <p>
            <span className="text-gray-700">
              {t("settings.google-calendar")}:{" "}
            </span>
            {user && user.gcalendar_is_linked ? (
              <>
                <span className="text-green-700">{t("settings.connected")}</span>
                <button
                  className="px-2 py-0.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-2 disabled:opacity-50"
                  onClick={forceSyncGoogleCalendar}
                >
                  {t("settings.force-sync")}
                </button>
              </>
            ) : (
              <>
                <span className="text-red-700">
                  {t("settings.unconnected")}
                </span>
                <button
                    className="px-2 py-0.5 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2"
                    onClick={linkGoogleCalendar}
                  >
                  {t("settings.connect")}
                </button>
              </>
            )}
            {loadingGcalendar && <span className="ml-2 text-gray-600">{t("general.loading")}</span>}
          </p>
        </div>
      </div>

      {/* Instruments */}
      <h2 className="text-lg text-gray-700 mb-1">
        {t("settings.user-instruments")}
      </h2>
      <ul className="space-y-2 mb-4">
        {userInstruments.map((user_instrument) => (
          <li
            key={user_instrument.user_instrument_id}
            className="flex justify-between items-center p-2 bg-gray-300 border border-black rounded-lg"
          >
            <span>
              {instrumentName(
                user_instrument.instrument_details,
                currentLanguage
              )}
            </span>
            <button
              className="p-2 text-red-500 hover:text-red-600"
              onClick={() =>
                handleRemoveInstrument(user_instrument.user_instrument_id)
              }
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </li>
        ))}
      </ul>

      {/* Add instrument */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          {t("settings.add-instrument")}
        </label>
        <div className="flex gap-2">
          <select
            className="flex-grow p-2 border border-gray-300 rounded-lg"
            value={newInstrument}
            onChange={(e) => setNewInstrument(e.target.value)}
          >
            <option value="">{t("settings.select-instrument")}</option>
            {instruments
              .filter(
                (instrument) =>
                  !userInstruments.some(
                    (userInstrument) =>
                      userInstrument.instrument === instrument.instrument_id
                  )
              )
              .map((instrument) => (
                <option
                  key={instrument.instrument_id}
                  value={instrument.instrument_id}
                >
                  {instrumentName(instrument, currentLanguage)}
                </option>
              ))}
          </select>
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
