import axios from "axios";
import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import SubmitOrBack from "./SubmitOrBack";

interface DeleteEventProps {
  eventId: number;
  eventName: string;
  fetchEvents: () => void;
  setShowDeleteEvent: (arg0: boolean) => void;
}
export default function DeleteEvent({
  eventId,
  eventName,
  fetchEvents,
  setShowDeleteEvent,
}: DeleteEventProps) {
  const { t } = useLanguage();

  const [error, setError] = useState("");
  const [typedEventName, setTypedEventName] = useState("");

  // Handle delete event
  const submitDelete = async () => {
    if (typedEventName !== eventName) {
      setError(t("delete-event.name-mismatch"));
      return;
    }
    await axios
      .delete(`/api/events/${eventId}/`)
      .then(() => {
        fetchEvents();
        setShowDeleteEvent(false);
      })
      .catch((error) => {
        setError(t("delete-event.error"));
        console.error(`Error deleting event ${eventId}:`, error);
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("delete-event.title")}</h2>

        {/* Show error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Delete prompt */}
        <p className="mb-4">{t("delete-event.description")}</p>

        {/* Confirm event name field */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="group-name"
            value={typedEventName}
            onChange={(e) => setTypedEventName(e.target.value)}
            placeholder={t("delete-event.placeholder")}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Buttons */}
          <SubmitOrBack
            submitMethod={submitDelete}
            textSubmit={t("delete-event.delete")}
            textSubmiting={t("delete-event.deleting")}
            colorSubmit="red"
            onCancel={() => setShowDeleteEvent(false)}
            textCancel={t("delete-event.back")}
          />
        </div>
      </div>
    </div>
  );
}
