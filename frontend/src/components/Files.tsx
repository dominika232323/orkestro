import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { File } from "../interfaces";
import Pagination from "./Pagination";

export default function Files() {
  const { t } = useLanguage();
  const { groupId } = useParams();

  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);

    // API call

    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFiles();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleNewFile = () => {};

  const handleDelete = () => {};

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("files.title")}
      </h1>

      {/* Search Bar */}
      <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("files.placeholder")}
          className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          {t("files.search")}
        </button>
      </div>

      {/* File List or Loading/Empty State */}
      {files.length > 0 ? (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file.file_id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-bold">{file.name}</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  onClick={handleDelete}
                >
                  {t("files.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : loading ? (
        <p className="text-gray-600 text-center">{t("files.loading")}</p>
      ) : (
        <p className="text-gray-600 text-center">{t("files.no-files")}</p>
      )}

      {/* Add File Button */}
      <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center mt-6">
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        {t("files.add-file")}
      </button>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
