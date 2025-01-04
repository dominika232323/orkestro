import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

interface PaginationProps {
  currentPage: number;
  maxPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  maxPage,
  onPageChange,
}: PaginationProps) {
  const { t } = useLanguage();

  const handleNextPage = () => {
    if (currentPage < maxPage) {
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
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <span className="self-center font-medium">
        {t("pagination.page")} {currentPage} / {maxPage}
      </span>
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleNextPage}
        disabled={currentPage >= maxPage}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
}
