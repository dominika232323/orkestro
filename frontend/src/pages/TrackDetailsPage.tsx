import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import {
  OrkestroFile,
  Paged,
  OrkestroTrack,
  OrkestroTrackEvent,
  OrkestroRole,
} from "../interfaces";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import FileComponent from "../components/FileComponent";
import { getRole } from "../util";
import SearchBar from "../components/SearchBar";

export default function TrackDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { trackId, groupId } = useParams();

  const [track, setTrack] = useState<OrkestroTrack | null>(null);
  const [files, setFiles] = useState<OrkestroFile[]>([]);
  const [events, setEvents] = useState<OrkestroTrackEvent[]>([]);
  const [role, setRole] = useState<OrkestroRole>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchRole = useCallback(() => getRole(setRole, groupId), [groupId]);

  const fetchTrack = useCallback(async () => {
    await axios
      .get<OrkestroTrack>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  }, [trackId]);

  const fetchFiles = useCallback(async () => {
    await axios
      .get<Paged<OrkestroFile>>(
        `/api/files/search/?track_id=${trackId}&page=${currentPage}${searchQuery ? `&search=${searchQuery}&search_language=${currentLanguage}` : ""}`
      )
      .then((response) => {
        setFiles(response.data.items);
        setCurrentPage(response.data.page_number);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching files: ", error));
  }, [trackId, currentPage, searchQuery, currentLanguage]);

  const fetchEvents = useCallback(async () => {
    await axios
      .get<OrkestroTrackEvent[]>(
        `/api/event-tracks/by_track/?track_id=${trackId}`
      )
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => console.error(error));
  }, [trackId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  useEffect(() => {
    fetchTrack();
    fetchEvents();
  }, [fetchTrack, fetchEvents]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">{track.name}</h1>
        {role?.is_manager && (
          <button
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            onClick={() => navigate(`/edit-track/${track.track_id}/${groupId}`)}
          >
            {t("track-details.edit")}
          </button>
        )}

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

        {/* Search Bar */}
        <SearchBar
          query={searchQuery}
          onQueryChange={(value) => setSearchQuery(value)}
          onSearch={fetchFiles}
          placeholder={t("track-details.placeholder")}
          setCurrentPage={setCurrentPage}
        />

        <ul className="list-disc pl-5">
          {files.length > 0 ? (
            files.map((file) => <FileComponent file={file} />)
          ) : (
            <p>{t("track-details.no-files")}</p>
          )}
        </ul>

        {/*File Pagination*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
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
      </div>
    );
  } else {
    return <p>{t("track-details.fetching")}</p>;
  }
}
