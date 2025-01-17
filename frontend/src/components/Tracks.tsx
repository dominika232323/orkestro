import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBars,
  faPlus,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { OrkestroRole, OrkestroTrack, Paged } from "../interfaces";
import Pagination from "./Pagination";
import axios from "axios";
import { fetchUserOrRedirect } from "../auth";

export default function Tracks() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState<OrkestroRole>();
  const [tracks, setTracks] = useState<OrkestroTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTracks = async () => {
    setLoading(true);

    await axios
      .get<Paged<OrkestroTrack>>(
        `/api/tracks/search/?group_id=${groupId}&page=${currentPage}`
      )
      .then((response) => {
        setTracks(response.data.items);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error(error));

    setLoading(false);
  };

  console.log(tracks);

  useEffect(() => {
    fetchTracks();
  }, [currentPage]);

  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      await axios
        .get<OrkestroRole>(`/api/groups/${groupId}/role/`)
        .then((response) => setRole(response.data))
        .catch((error) => console.error("Error fetching role:", error));
    };

    fetchRole();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTracks();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (track_id: number) => {
    await axios.delete(`/api/tracks/${track_id}/`);
    fetchTracks();
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("tracks.title")}
      </h1>

      {/* Add Track Button */}
      <button
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
        onClick={() => navigate(`/new-track/${groupId}`)}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        {t("tracks.add-track")}
      </button>

      {/* Search Bar */}
      <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("tracks.placeholder")}
          className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          {t("tracks.search")}
        </button>
      </div>

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
                      onClick={() => handleDelete(track.track_id)}
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
    </div>
  );
}
