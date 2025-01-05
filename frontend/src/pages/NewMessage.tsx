import { useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { Message } from "../interfaces";
import { useState } from "react";

export default function NewMessage() {
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const [loading, setLoading] = useState(false);

  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  if (!parsedGroupId) {
    throw new Error("Group ID is required and must be a valid number");
  }

  const [formData, setFormData] = useState<Partial<Message>>({
    group: parsedGroupId,
    date: new Date(),
    // user_id trzeba skądś wziąć
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {};

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-message.title")}
      </h1>
      <label>
        {t("new-message.message-title")}
        <input
          type="text"
          name="message-title"
          value={formData.title}
          onChange={handleChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-message.content")}
        <input
          type="text"
          name="message-content"
          value={formData.content}
          onChange={handleChange}
          className="block w-full p-2 border mb-2"
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
