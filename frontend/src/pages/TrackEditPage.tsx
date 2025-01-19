import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useCallback, useEffect, useState } from "react";
import { OrkestroFile, Paged, OrkestroTrack } from "../interfaces";
import { fetchUserOrRedirect } from "../auth";
import axios from "axios";
import Pagination from "../components/Pagination";
import AddFiles from "../components/AddFiles";
import { parseId } from "../util";
import SubmitOrBack from "../components/SubmitOrBack";

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

  // Reloading track's info and files
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

  // Submit track changes
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

  // Change track's text fields
  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTrack((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle removing file
  const handleRemoveFile = async (file_id: number) => {
    await axios
      .delete(`/api/files/${file_id}/`)
      .catch((error) => console.error("Remove file failed"));
    fetchFiles();
  };

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("edit-track.title")}
        </h1>

        {/* Form */}
        <div>
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
        </div>

        {/* Buttons */}
        <SubmitOrBack
          submitMethod={handleSubmit}
          textSubmit={t("edit-track.submit")}
          textSubmiting={t("edit-track.submiting")}
          onCancel={() => navigate(-1)}
          textCancel={t("edit-track.back")}
        />

        {/* File list */}
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

        {/* Adding files button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddFiles(true)}
            className="mt-4 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            {t("edit-track.add-file")}
          </button>
        </div>

        {/*Pagination*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {/* Add files window */}
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
