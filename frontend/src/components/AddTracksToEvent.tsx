import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import { OrkestroTrack } from "../interfaces";
import SubmitOrBack from "./SubmitOrBack";

interface AddTracksToEventProps {
  eventId: number;
  groupId: number;
  setShowAddTracksModal: (arg0: boolean) => void;
  reloadPage: () => void;
}

// Window to assign track to the event
export default function AddTracksToEvent({
  eventId,
  groupId,
  setShowAddTracksModal,
  reloadPage,
}: AddTracksToEventProps) {
  const { t } = useLanguage();

  const [availableTracks, setAvailableTracks] = useState<OrkestroTrack[]>([]);
  const [tracksToAdd, setTracksToAdd] = useState<OrkestroTrack[]>([]);

  // Fetch availableTracks (tracks that can be added to that event)
  const fetchAvailableTracks = useCallback(async () => {
    await axios
      .get(`/api/tracks/leftover/?event_id=${eventId}&group_id=${groupId}`)
      .then((response) => {
        setAvailableTracks(response.data);
      })
      .catch((error) => console.error(error));
  }, [eventId, groupId]);

  useEffect(() => {
    fetchAvailableTracks();
  }, [fetchAvailableTracks]);

  // Submit adding tracks to event
  const submitAddTracks = async () => {
    const promises = tracksToAdd.map((track) =>
      axios.post("/api/event-tracks/", {
        event: eventId,
        track: track.track_id,
      })
    );

    Promise.all(promises)
      .then((responses) => {
        setTracksToAdd([]);
        setShowAddTracksModal(false);
        reloadPage();
      })
      .catch((error) => {
        console.error("Error adding some tracks:", error);
      });
  };

  // Adding or removing availableTracks from toAdd list
  const toggleTrackSelection = (track: OrkestroTrack) => {
    if (tracksToAdd.some((t) => t.track_id === track.track_id)) {
      setTracksToAdd((prev) =>
        prev.filter((t) => t.track_id !== track.track_id)
      );
    } else {
      setTracksToAdd((prev) => [...prev, track]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">
          {t("edit-event.select-tracks")}
        </h2>

        {/* List of available tracks */}
        <ul className="list-disc pl-5">
          {availableTracks.length > 0 ? (
            availableTracks.map((track) => (
              <li key={track.track_id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`track-${track.track_id}`}
                  checked={tracksToAdd.some(
                    (t) => t.track_id === track.track_id
                  )}
                  onChange={() => toggleTrackSelection(track)}
                  className="mr-2"
                />
                <label htmlFor={`track-${track.track_id}`}>
                  {track.name} - {track.artist}
                </label>
              </li>
            ))
          ) : (
            <p>{t("edit-event.no-tracks")}</p>
          )}
        </ul>

        {/* Buttons */}
        <SubmitOrBack
          submitMethod={submitAddTracks}
          textSubmit={t("edit-event.confirm")}
          textSubmiting={t("edit-event.confirming")}
          onCancel={() => setShowAddTracksModal(false)}
          textCancel={t("edit-event.cancel")}
        />
      </div>
    </div>
  );
}
