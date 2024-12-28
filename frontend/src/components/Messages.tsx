import {useEffect, useState} from "react";

import { useLanguage } from "../LanguageContext";
import {axiosInstance as axios, fetchUserOrRedirect} from "../auth";
import {MessageRecipient} from "../interfaces";
import MessageComponent from "./MessageComponent";

export default function Messages() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<MessageRecipient[]>([]);

  useEffect(() => {
    fetchUserOrRedirect();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      await axios.get<MessageRecipient[]>("/api/message-recipients/received/")
        .then((response) => {
          const parsedMessages = response.data.map((msg_recipient) => ({
            ...msg_recipient,
            message: {
              ...msg_recipient.message,
              date: new Date(msg_recipient.message.date), // parse date
            },
          }));

          setMessages(parsedMessages);
        })
        .catch((error) => console.error("Error fetching invitations:", error));
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("messages.title")}
      </h1>
      {messages.length > 0 ?
        <ul className="space-y-4">
          {messages.map((msg) => (
            <MessageComponent message_recipient={msg}/>
          ))}
        </ul>
        :
        <p>{t("messages.no-messages")}</p>
      }
    </div>
  );
}
