import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { File, Paged, Track } from "../interfaces";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function TrackDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { trackId } = useParams();

  const [track, setTrack] = useState<Track | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTrack();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [currentPage]);

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

  console.log(files);

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">{track.name}</h1>
        <button
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          onClick={() => navigate(`/edit-track/${track.track_id}`)}
        >
          {t("track-details.edit")}
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
              </li>
            ))
          ) : (
            <p>{t("track-details.no-files")}</p>
          )}
        </ul>

        {/*Pagination*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    );
  } else {
    return <p>{t("track-details.fetching")}</p>;
  }
}
