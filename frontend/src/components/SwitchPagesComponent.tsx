import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

interface SwitchPagesProps {
  handlePrevPage: () => void;
  handleNextPage: () => void;
  currentPage: number;
  maxPage: number;
}

export default function SwitchPagesComponent({
  handlePrevPage,
  handleNextPage,
  currentPage,
  maxPage,
}: SwitchPagesProps) {
  const { t } = useLanguage();
  return (
    <div className="flex justify-center mt-4 space-x-4">
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handlePrevPage}
      >
        {<FontAwesomeIcon icon={faArrowLeft} />}
      </button>
      <span className="self-center font-medium">
        {t("messages.page")} {currentPage} / {maxPage}
      </span>
      <button
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleNextPage}
      >
        {<FontAwesomeIcon icon={faArrowRight} />}
      </button>
    </div>
  );
}
