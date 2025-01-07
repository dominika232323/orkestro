import { useEffect, useState } from "react";

import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import { MessageRecipient, Paged } from "../interfaces";
import MessageComponent from "./MessageComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";

export default function Messages() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchMessages = async () => {
    setLoading(true);

    await axios
      .get<Paged<MessageRecipient>>(
        `/api/message-recipients/me/?page=${currentPage}&search=${searchQuery}`
      )
      .then((response) => {
        const parsedMessages = response.data.items.map((msg_recipient) => ({
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  console.log(messages);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("messages.title")}
      </h1>
      <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("messages.placeholder")}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          {t("messages.search")}
        </button>
      </div>
      {messages.length > 0 ? (
        <ul className="space-y-4">
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
