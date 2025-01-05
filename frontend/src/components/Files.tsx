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
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("files.title")}
      </h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("files.placeholder")}
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {t("files.search")}
        </button>
      </div>

      {files.length > 0 ? (
        <ul></ul>
      ) : loading ? (
        <p>{t("files.loading")}</p>
      ) : (
        <p>{t("files.no-files")}</p>
      )}

      <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        {t("files.add-file")}
      </button>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
