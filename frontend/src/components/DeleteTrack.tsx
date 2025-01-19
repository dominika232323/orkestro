import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import SubmitOrBack from "./SubmitOrBack";

interface DeleteTrackProps {
  trackId: number;
  trackName: string;
  fetchTracks: () => void;
  setShowDeleteTrack: (arg0: boolean) => void;
}

export default function DeleteTrack({
  trackId,
  trackName,
  fetchTracks,
  setShowDeleteTrack,
}: DeleteTrackProps) {
  const { t } = useLanguage();

  const [error, setError] = useState("");
  const [typedTrackName, setTypedTrackName] = useState("");

  // Handle delete track
  const submitDelete = async () => {
    if (typedTrackName !== trackName) {
      setError(t("delete-track.name-mismatch"));
      return;
    }
    await axios
      .delete(`/api/tracks/${trackId}/`)
      .then(() => {
        fetchTracks();
        setShowDeleteTrack(false);
      })
      .catch((error) => {
        setError(t("delete-track.error"));
        console.error(`Error deleting track ${trackId}:`, error);
      });
  };
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("delete-track.title")}</h2>

        {/* Show error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Delete prompt */}
        <p className="mb-4">{t("delete-track.description")}</p>

        {/* Confirm track name field */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="group-name"
            value={typedTrackName}
            onChange={(e) => setTypedTrackName(e.target.value)}
            placeholder={t("delete-track.placeholder")}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Buttons */}
          <SubmitOrBack
            submitMethod={submitDelete}
            textSubmit={t("delete-event.delete")}
            textSubmiting={t("delete-event.deleting")}
            colorSubmit="red"
            onCancel={() => setShowDeleteTrack(false)}
            textCancel={t("delete-event.back")}
          />
        </div>
      </div>
    </div>
  );
}
