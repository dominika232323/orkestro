import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import { OrkestroTrack } from "../interfaces";

interface AddTracksToEventProps {
  eventId: number;
  groupId: number;
  setShowAddTracksModal: (arg0: boolean) => void;
  reloadPage: () => void;
}

export default function AddTracksToEvent({
  eventId,
  groupId,
  setShowAddTracksModal,
  reloadPage,
}: AddTracksToEventProps) {
  const { t } = useLanguage();

  const [availableTracks, setAvailableTracks] = useState<OrkestroTrack[]>([]);
  const [tracksToAdd, setTracksToAdd] = useState<OrkestroTrack[]>([]);

  const toggleTrackSelection = (track: OrkestroTrack) => {
    // Adding or removing availableTracks from toAdd list
    if (tracksToAdd.some((t) => t.track_id === track.track_id)) {
      setTracksToAdd((prev) =>
        prev.filter((t) => t.track_id !== track.track_id)
      );
    } else {
      setTracksToAdd((prev) => [...prev, track]);
    }
  };

  const handleAddTracks = async () => {
    // API call to add event_track object for every track in tracksToAdd

    const promises = tracksToAdd.map((track) =>
      axios.post("/api/event-tracks/", {
        event: eventId,
        track: track.track_id,
      })
    );

    Promise.all(promises)
      .then((responses) => {
        console.log("All tracks added successfully:", responses);
        setTracksToAdd([]);
        setShowAddTracksModal(false);
        reloadPage();
      })
      .catch((error) => {
        console.error("Error adding some tracks:", error);
      });
  };

  // Fetch availableTracks (tracks that can be added)
  const fetchAvailableTracks = useCallback(async () => {
    await axios
      .get(`/api/tracks/leftover/?event_id=${eventId}&group_id=${groupId}`)
      .then((response) => {
        console.log(response);
        setAvailableTracks(response.data);
      })
      .catch((error) => console.error(error));
  }, [eventId, groupId]);

  useEffect(() => {
    fetchAvailableTracks();
  }, [fetchAvailableTracks]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">
          {t("edit-event.select-tracks")}
        </h2>
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
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setShowAddTracksModal(false)}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
          >
            {t("edit-event.cancel")}
          </button>
          <button
            onClick={handleAddTracks}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            {t("edit-event.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
