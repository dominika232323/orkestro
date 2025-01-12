import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import {
  OrkestroFile,
  Paged,
  OrkestroTrack,
  OrkestroEvent,
  OrkestroTrackEvent,
} from "../interfaces";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function TrackDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { trackId, groupId } = useParams();

  const [track, setTrack] = useState<OrkestroTrack | null>(null);
  const [files, setFiles] = useState<OrkestroFile[]>([]);
  const [events, setEvents] = useState<OrkestroTrackEvent[]>([]);

  const [currentPageFiles, setCurrentPageFiles] = useState(1);
  const [totalPagesFiles, setTotalPagesFiles] = useState(1);
  const [currentPageEvents, setCurrentPageEvents] = useState(1);
  const [totalPagesEvents, setTotalPagesEvents] = useState(1);

  useEffect(() => {
    fetchTrack();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [currentPageFiles]);

  const handleDownload = async (file_id: number, file_name: string) => {
    try {
      const response = await axios.get(`/api/files/${file_id}/download/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file_name); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const fetchTrack = async () => {
    await axios
      .get<OrkestroTrack>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  };
  const fetchFiles = async () => {
    await axios
      .get<Paged<OrkestroFile>>(
        `/api/files/search/?track_id=${trackId}&page=${currentPageFiles}`
      )
      .then((response) => {
        setFiles(response.data.items);
        setCurrentPageFiles(response.data.page_number);
        setTotalPagesFiles(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching files: ", error));
  };

  const fetchEvents = async () => {
    await axios
      .get<Paged<OrkestroTrackEvent>>(
        `/api/event-tracks/by_track/?track_id=${trackId}&page=${currentPageEvents}`
      )
      .then((response) => {
        setEvents(response.data.items);
        setTotalPagesFiles(response.data.total_pages);
      })
      .catch((error) => console.error(error));
  };

  console.log(events);

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">{track.name}</h1>
        <button
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          onClick={() => navigate(`/edit-track/${track.track_id}/${groupId}`)}
        >
          {t("track-details.edit")}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        >
          {t("track-details.back")}
        </button>
        <p>
          <strong>
            <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
            {t("track-details.artist")}:
          </strong>{" "}
          {track.artist}
        </p>

        {/* Lista plików */}
        <h2 className="text-xl font-bold mt-4">{t("track-details.files")}</h2>
        <ul className="list-disc pl-5">
          {files.length > 0 ? (
            files.map((file) => (
              <li
                key={file.file_id}
                className="flex justify-between items-center"
              >
                <span>{file.name}</span>
                <button
                  className="hover:underline"
                  onClick={() => handleDownload(file.file_id, file.name)}
                >
                  {t("track-details.download")}
                </button>
              </li>
            ))
          ) : (
            <p>{t("track-details.no-files")}</p>
          )}
        </ul>

        {/*File Pagination*/}
        <Pagination
          currentPage={currentPageFiles}
          totalPages={totalPagesFiles}
          onPageChange={(page) => setCurrentPageFiles(page)}
        />

        {/* Lista wydarzeń */}
        <h2 className="text-xl font-bold mt-4">
          {t("track-details.upcoming-events")}
        </h2>
        <ul className="list-disc pl-5">
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.event} className="flex justify-between">
                <span
                  className="hover:underline"
                  onClick={() => navigate(`/event-details/${event.event}`)}
                >
                  {event.event_details.name}
                </span>
                <span>
                  {new Date(event.event_details.date).toLocaleDateString()}
                </span>
              </li>
            ))
          ) : (
            <p>{t("track-details.no-upcoming-events")}</p>
          )}
        </ul>

        {/*Event Pagination*/}
        <Pagination
          currentPage={currentPageEvents}
          totalPages={totalPagesEvents}
          onPageChange={(page) => setCurrentPageEvents(page)}
        />
      </div>
    );
  } else {
    return <p>{t("track-details.fetching")}</p>;
  }
}
