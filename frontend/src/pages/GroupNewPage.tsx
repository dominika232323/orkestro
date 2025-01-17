import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { OrkestroGroup } from "../interfaces";
import { parse } from "path";
import axios from "axios";

export default function GroupNewPage() {
  const { t } = useLanguage();
  const { userId, superGroupId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [group, setGroup] = useState<Partial<OrkestroGroup>>({});
  const [loading, setLoading] = useState(false);

  const parsedUserId = userId ? parseInt(userId, 10) : undefined;
  const parsedSupergroupId = superGroupId
    ? parseInt(superGroupId, 10)
    : undefined;

  if (!parsedUserId) throw new Error("User ID invalid");

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setGroup((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!group.name || !group.description) {
      setError(t("new-group.missing"));
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/groups/`, {
        ...group,
        user: parsedUserId,
        supergroup: parsedSupergroupId,
      });
      navigate(-1);
    } catch (err) {
      setError(t("new-group.fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-group.title")}
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <label>
        {t("new-group.name")}
        <input
          type="text"
          name="name"
          value={group.name}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>

      <label>
        {t("new-group.description")}
        <input
          type="text"
          name="description"
          value={group.description}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        {t("new-group.submit")}
      </button>

      <button
        onClick={() => navigate(-1)}
        className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        disabled={loading}
      >
        {t("new-group.back")}
      </button>
    </div>
  );
}
