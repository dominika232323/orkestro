import { useLanguage } from "../LanguageContext";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBars,
  faPlus,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { OrkestroRole, OrkestroTrack, Paged } from "../interfaces";
import Pagination from "../components/Pagination";
import axios from "axios";
import { fetchUserOrRedirect } from "../auth";
import { getRole } from "../util";
import SearchBar from "../components/SearchBar";
import DeleteTrack from "../components/DeleteTrack";

// Page to show users tracks
export default function TracksPage() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState<OrkestroRole>();
  const [tracks, setTracks] = useState<OrkestroTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDeleteTrack, setShowDeleteTrack] = useState(false);

  const [selectedTrackId, setSelectedTrackId] = useState<number>(0);
  const [selectedTrackName, setSelectedTrackName] = useState("");

  // Fetch user's tracks
  const fetchTracks = useCallback(async () => {
    setLoading(true);

    await axios
      .get<Paged<OrkestroTrack>>(
        `/api/tracks/search/?group_id=${groupId}&page=${currentPage}${searchQuery ? `&name=${searchQuery}` : ""}`
      )
      .then((response) => {
        setTracks(response.data.items);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error(error));

    setLoading(false);
  }, [groupId, currentPage, searchQuery]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, [navigate]);

  // FetchRole
  const fetchRole = useCallback(() => getRole(setRole, groupId), [groupId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("tracks.title")}
      </h1>

      {/* Add Track Button */}
      {role?.is_manager && (
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
          onClick={() => navigate(`/new-track/${groupId}`)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {t("tracks.add-track")}
        </button>
      )}

      {/* Search Bar */}
      <SearchBar
        query={searchQuery}
        onQueryChange={(value) => setSearchQuery(value)}
        onSearch={fetchTracks}
        placeholder={t("tracks.placeholder")}
        setCurrentPage={setCurrentPage}
      />

      {/* Track List or Loading/Empty State */}
      {tracks && tracks.length > 0 ? (
        <ul className="space-y-4">
          {tracks.map((track) => (
            <li
              key={track.track_id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="flex flex-col">
                <h2 className="text-lg font-bold">{track.name}</h2>
                <p>{track.artist}</p>
              </div>
              <div className="flex flex-col justify-evenly ml-2">
                <button
                  onClick={() =>
                    navigate(`/track-details/${track.track_id}/${groupId}`)
                  }
                  className="px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors whitespace-nowrap"
                >
                  <FontAwesomeIcon className="mr-2" icon={faBars} />
                  <span>{t("events.details")}</span>
                </button>
                {role?.is_manager && (
                  <>
                    <button
                      onClick={() =>
                        navigate(`/edit-track/${track.track_id}/${groupId}`)
                      }
                      className="px-2 py-2 my-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors whitespace-nowrap"
                    >
                      <FontAwesomeIcon className="mr-2" icon={faPen} />
                      <span>{t("tracks.edit")}</span>
                    </button>
                    <button
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      onClick={() => {
                        setSelectedTrackId(track.track_id);
                        setSelectedTrackName(track.name);
                        setShowDeleteTrack(true);
                      }}
                    >
                      <FontAwesomeIcon className="mr-2" icon={faTimes} />
                      <span>{t("tracks.delete")}</span>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : loading ? (
        <p className="text-gray-600 text-center">{t("tracks.loading")}</p>
      ) : (
        <p className="text-gray-600 text-center">{t("tracks.no-tracks")}</p>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Delete Track window */}
      {showDeleteTrack && selectedTrackId && (
        <DeleteTrack
          trackId={selectedTrackId}
          trackName={selectedTrackName}
          fetchTracks={fetchTracks}
          setShowDeleteTrack={setShowDeleteTrack}
        />
      )}
    </div>
  );
}
