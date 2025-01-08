import { useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import {User, Message} from "../interfaces";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {axiosInstance as axios, fetchUserOrRedirect} from "../auth";


export default function MessageNew() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const [user, setUser] = useState<User>();
  const [message, setMessage] = useState<Partial<Message>>({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  if (!parsedGroupId) {
    throw new Error("Group ID is required and must be a valid number");
  }

  useEffect(() => {
    fetchUserOrRedirect(navigate, setUser);
  }, []);

  useEffect(() => {
    setMessage({
      user: user?.user_id,
      group: parsedGroupId,
      title: "",
      content: "",
    });
  }, [user]);


  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setMessage((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!message.title || !message.content) {
      setError(true);
      return;
    }

    const encodedMessage = {
      ...message,
      date: new Date().toISOString(),
    };

    await axios
    .post("/api/messages/", encodedMessage)
    .then(() => navigate("/messages/"))
    .catch((error) => console.error("Error sending message:", error));
    setLoading(false);
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-message.title")}
      </h1>
      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-event.form-error")}
        </p>
      )}
      <label>
        {t("new-message.message-title")}
        <input
          type="text"
          name="title"
          value={message.title}
          onChange={handleChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-message.content")}
        <textarea
          name="content"
          value={message.content}
          onChange={handleChange}
          className="block w-full p-2 border mb-2"
          rows={4}
          required
        />
      </label>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        {t("new-message.submit")}
      </button>
    </div>
  );
}
