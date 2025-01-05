import { useEffect, useState } from "react";

import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import { MessageRecipient } from "../interfaces";
import MessageComponent from "./MessageComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface MessageRecipientPaged {
  messages: MessageRecipient[];
  page_number: number;
  total_pages: number;
}

export default function Messages() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchMessages = async () => {
    setLoading(true);

    await axios
      .get<MessageRecipientPaged>(
        searchQuery ?
          `/api/message-recipients/me/?page=${currentPage}&search=${searchQuery}`
          :
          `/api/message-recipients/me/?page=${currentPage}`
      )
      .then((response) => {
        const parsedMessages = response.data.messages.map((msg_recipient) => ({
          ...msg_recipient,
          message_details: {
            ...msg_recipient.message_details,
            date: new Date(msg_recipient.message_details.date), // parse date
          },
        }));

        setMessages(parsedMessages);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching invitations:", error));
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage <= totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage >= 2) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages();
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("messages.title")}
      </h1>
      <div className="flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("messages.placeholder")}
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {t("messages.search")}
        </button>
      </div>
      {messages.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {messages.map((msg) => (
            <MessageComponent
              key={msg.message_recipient_id}
              message_recipient={msg}
            />
          ))}
        </ul>
      ) : loading ? (
        <p>{t("messages.loading")}</p>
      ) : (
        <p>{t("messages.no-messages")}</p>
      )}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={handlePrevPage}
        >
          {<FontAwesomeIcon icon={faArrowLeft} />}
        </button>
        <span className="self-center font-medium">
          {t("messages.page")} {currentPage} / {totalPages}
        </span>
        <button
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={handleNextPage}
        >
          {<FontAwesomeIcon icon={faArrowRight} />}
        </button>
      </div>
    </div>
  );
}
