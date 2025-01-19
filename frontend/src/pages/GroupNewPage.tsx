import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { OrkestroGroup } from "../interfaces";
import axios from "axios";
import { parseId } from "../util";
import SubmitOrBack from "../components/SubmitOrBack";

// Create new group
export default function GroupNewPage() {
  const { t } = useLanguage();
  const { userId, superGroupId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [group, setGroup] = useState<Partial<OrkestroGroup>>({});

  const parsedUserId = parseId(userId);
  const parsedSupergroupId = superGroupId ? parseId(superGroupId) : undefined; // SuperGroup not mandatory

  // Edit groups text fields
  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setGroup((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Create new group
  const handleSubmit = async () => {
    setError("");
    if (!group.name || !group.description) {
      setError(t("new-group.missing"));
      return;
    }

    try {
      await axios.post(`/api/groups/`, {
        ...group,
        user: parsedUserId,
        supergroup: parsedSupergroupId,
      });
      navigate(-1);
    } catch (err) {
      setError(t("new-group.fail"));
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-group.title")}
      </h1>

      {/* Error message */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Form */}
      <div>
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
      </div>

      {/* Buttons */}
      <SubmitOrBack
        submitMethod={handleSubmit}
        textSubmit={t("new-group.submit")}
        textSubmiting={t("new-group.submiting")}
        onCancel={() => navigate(-1)}
        textCancel={t("new-group.back")}
      />
    </div>
  );
}
