import { useEffect, useState, useCallback } from "react";

import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import { OrkestroMessageRecipient, Paged } from "../interfaces";
import MessageComponent from "../components/MessageComponent";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

export default function MessagesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<OrkestroMessageRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchMessages = useCallback(async () => {
    setLoading(true);

    await axios
      .get<Paged<OrkestroMessageRecipient>>(
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
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages();
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("messages.title")}
      </h1>
      <SearchBar
        query={searchQuery}
        onQueryChange={(value) => setSearchQuery(value)}
        onSearch={handleSearch}
        placeholder={t("messages.placeholder")}
      />
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
