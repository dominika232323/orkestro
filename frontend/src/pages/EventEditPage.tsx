import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import { OrkestroEvent, OrkestroTrackEvent } from "../interfaces";
import AddTracksToEvent from "../components/AddTracksToEvent";
import { parseId } from "../util";

export default function EventEditPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Partial<OrkestroEvent>>({});
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [tracks, setTracks] = useState<OrkestroTrackEvent[]>([]);

  const parsedEventId = parseId(eventId);
  const parsedGroupId = event.group ? parseId(event.group) : undefined;

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    await axios
      .get<OrkestroEvent>(`/api/events/${eventId}/`)
      .then((response) => {
        const parsedEvent = {
          ...response.data,
          date: new Date(response.data.date), // parse date
        };
        setEvent(parsedEvent);
      })
      .catch((error) => console.error("Error fetching event:", error));
    setLoading(false);
  }, [eventId]);

  // Fetch tracks that are in event
  const fetchTracks = useCallback(async () => {
    await axios
      .get(`/api/event-tracks/by_event/?event_id=${eventId}`)
      .then((response) => {
        setTracks(response.data);
      })
      .catch((error) =>
        console.error("Fetching tracks for event failed: ", error)
      );
  }, [eventId]);

  const reloadPage = useCallback(() => {
    fetchEvent();
    fetchTracks();
  }, [fetchEvent, fetchTracks]);

  useEffect(() => {
    reloadPage();
  }, [reloadPage]);

  const [showAddTracksModal, setShowAddTracksModal] = useState(false);

  const handleRemoveTrack = async (event_track_id: number) => {
    setRemoving(true);
    try {
      await axios.delete(`/api/event-tracks/${event_track_id}/`);
    } catch (error) {
      console.error(error);
    } finally {
      setRemoving(false);
      fetchTracks();
    }
  };

  // Editing event fields

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "date" input (YYYY-MM-DD)
    setEvent((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [year, month, day] = value.split("-").map(Number);
      newDate.setFullYear(year, month - 1, day); // Update only the date part
      return { ...prevData, date: newDate };
    });
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "time" input (HH:MM)
    setEvent((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [hours, minutes] = value.split(":").map(Number);
      newDate.setHours(hours, minutes, 0, 0); // Update only the time part
      return { ...prevData, date: newDate };
    });
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEvent((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!event.name || !event.description || !event.place || !event.date) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    const encodedEvent = {
      ...event,
      date: event.date?.toISOString(),
    };

    await axios
      .put(`/api/events/${eventId}/`, encodedEvent)
      .then(() => {
        navigate(-1);
      })
      .catch((error) => console.error("Error adding event:", error));
    setLoading(false);
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("edit-event.title")}
      </h1>
      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-event.form-error")}
        </p>
      )}
      <label>
        {t("new-event.name")}
        <input
          type="text"
          name="name"
          value={event.name}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.description")}
        <textarea
          name="description"
          value={event.description}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.place")}
        <input
          type="text"
          name="place"
          value={event.place}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.date")}
        <input
          type="date"
          name="date"
          value={event.date?.toISOString().split("T")[0] || ""}
          onChange={handleDateChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.time")}
        <input
          type="time"
          name="time"
          value={
            event.date
              ? event.date.toTimeString().split(":").slice(0, 2).join(":")
              : ""
          }
          onChange={handleTimeChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        {t("edit-event.submit")}
      </button>
      <button
        onClick={() => navigate(-1)}
        className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
      >
        {t("edit-event.back")}
      </button>

      {/* Lista utworów */}
      <h2 className="text-xl font-bold mt-4">{t("edit-event.tracks")}</h2>
      <ul className="list-disc pl-5">
        {tracks.length > 0 ? (
          tracks.map((event_track) => (
            <li
              key={event_track.event_track_id}
              className="flex justify-between items-center"
            >
              <span>{event_track.track_details.name}</span>
              <button
                onClick={() => handleRemoveTrack(event_track.event_track_id)}
                className="text-red-500 hover:underline"
                disabled={removing}
              >
                {t("edit-event.remove-track")}
              </button>
            </li>
          ))
        ) : (
          <p>{t("edit-event.no-tracks")}</p>
        )}
      </ul>

      {/* Przycisk do dodawania utworów */}
      <button
        onClick={() => setShowAddTracksModal(true)}
        className="mt-4 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
      >
        {t("edit-event.add-tracks")}
      </button>

      {/* Okienko (modal) do dodawania utworów */}
      {showAddTracksModal && parsedEventId && parsedGroupId && (
        <AddTracksToEvent
          eventId={parsedEventId}
          groupId={parsedGroupId}
          reloadPage={reloadPage}
          setShowAddTracksModal={setShowAddTracksModal}
        />
      )}
    </div>
  );
}
