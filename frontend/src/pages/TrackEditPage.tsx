import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useCallback, useEffect, useState } from "react";
import { OrkestroFile, Paged, OrkestroTrack } from "../interfaces";
import { fetchUserOrRedirect } from "../auth";
import axios from "axios";
import Pagination from "../components/Pagination";
import AddFiles from "../components/AddFiles";
import { parseId } from "../util";

// Editing chosen track
export default function TrackEditPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { trackId, groupId } = useParams();

  const [track, setTrack] = useState<Partial<OrkestroTrack>>({});
  const [files, setFiles] = useState<OrkestroFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddFiles, setShowAddFiles] = useState(false);

  const parsedTrackId = parseId(trackId);
  const parsedGroupId = parseId(groupId);

  // Fetch selected track
  const fetchTrack = useCallback(async () => {
    await axios
      .get<OrkestroTrack>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  }, [trackId]);

  // Fetch track's files
  const fetchFiles = useCallback(async () => {
    await axios
      .get<Paged<OrkestroFile>>(
        `/api/files/search/?track_id=${trackId}&page=${currentPage}`
      )
      .then((response) => {
        setFiles(response.data.items);
        setCurrentPage(response.data.page_number);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching files: ", error));
  }, [trackId, currentPage]);

  const reloadPage = useCallback(() => {
    fetchTrack();
    fetchFiles();
  }, [fetchTrack, fetchFiles]);

  useEffect(() => {
    fetchUserOrRedirect(navigate);
    reloadPage();
  }, [navigate, reloadPage]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSubmit = async () => {
    if (!track.name || !track.artist) {
      return;
    }

    //loading

    await axios
      .put(`/api/tracks/${trackId}/`, track)
      .then(() => {
        navigate(-1);
      })
      .catch((error) => console.error("Error adding event:", error));
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTrack((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemoveFile = async (file_id: number) => {
    await axios
      .delete(`/api/files/${file_id}/`)
      .catch((error) => console.error("Remove file failed"));
    fetchFiles();
  };

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("edit-track.title")}
        </h1>
        <label>
          {t("edit-track.name")}
          <input
            type="text"
            name="name"
            value={track.name}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
        <label>
          {t("edit-track.artist")}
          <input
            type="text"
            name="artist"
            value={track.artist}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          {t("edit-track.submit")}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        >
          {t("edit-track.back")}
        </button>

        {/* Lista plików */}
        <h2 className="text-xl font-bold mt-4">{t("edit-track.files")}</h2>
        <ul className="list-disc pl-5">
          {files.length > 0 ? (
            files.map((file) => (
              <li
                key={file.file_id}
                className="flex justify-between items-center"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(file.file_id)}
                  className="text-red-500 hover:underline"
                >
                  {t("edit-track.remove-file")}
                </button>
              </li>
            ))
          ) : (
            <p>{t("edit-track.no-files")}</p>
          )}
        </ul>

        {/* Przycisk do dodawania utworów */}
        <button
          onClick={() => setShowAddFiles(true)}
          className="mt-4 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          {t("edit-track.add-file")}
        </button>

        {/*Pagination*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {showAddFiles && (
          <AddFiles
            parsedTrackId={parsedTrackId}
            parsedGroupId={parsedGroupId}
            setShowAddFiles={setShowAddFiles}
            fetchFiles={fetchFiles}
          />
        )}
      </div>
    );
  } else {
    return <p>{t("edit-track.fetching")}</p>;
  }
}
