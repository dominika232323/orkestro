import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { File, Paged, Track } from "../interfaces";
import { fetchUserOrRedirect } from "../auth";
import axios from "axios";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function TrackEditPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { trackId } = useParams();

  const [track, setTrack] = useState<Partial<Track>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const parsedTrackId = trackId ? parseInt(trackId, 10) : undefined;

  if (!parsedTrackId) {
    throw new Error("Track ID is required and must be a valid number");
  }

  useEffect(() => {
    fetchUserOrRedirect(navigate);
    reloadPage();
  }, []);

  const reloadPage = () => {
    fetchTrack();
    fetchFiles();
  };

  const fetchTrack = async () => {
    await axios
      .get<Track>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  };

  const fetchFiles = async () => {
    await axios
      .get<Paged<File>>(`/api/files/search/?track_id=${trackId}`)
      .then((response) => {
        setFiles(response.data.items);
        setCurrentPage(response.data.page_number);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching files: ", error));
  };

  const handleSubmit = async () => {};

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTrack((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemoveFile = async (file_id: number) => {};

  const handleAddFile = async () => {};

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("edit-track.title")}
        </h1>
        <form onSubmit={handleSubmit}>
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
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            {t("edit-track.submit")}
          </button>
        </form>

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
          onClick={handleAddFile}
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
      </div>
    );
  } else {
    return <p>{t("edit-track.fetching")}</p>;
  }
}
