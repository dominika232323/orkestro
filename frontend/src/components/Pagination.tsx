import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Component with page number and page navigation
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useLanguage();

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex justify-center mt-4 space-x-4">
      {/* Previous page button */}
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      {/* Page information */}
      <span className="self-center font-medium">
        {t("pagination.page")} {currentPage} / {totalPages}
      </span>

      {/* Next page button */}
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
}
