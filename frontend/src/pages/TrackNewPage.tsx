import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import axios from "axios";
import SubmitOrBack from "../components/SubmitOrBack";

export default function TrackNewPage() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    name: undefined,
    artist: undefined,
  });

  // Change form text fields
  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // New Track
  const handleSubmit = async () => {
    if (!formData.name || !formData.artist) {
      setError(true);
      return;
    }

    setError(false);

    await axios
      .post(`/api/tracks/`, { ...formData, group: groupId })
      .then(() => navigate(`/tracks/${groupId}`))
      .catch((error) => console.error("Error adding event:", error));
  };

  return (
    <div className="bg-gray-200 py-6 px-2 sm:px-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-track.title")}
      </h1>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-track.form-error")}
        </p>
      )}

      {/* Form */}
      <div>
        <label className="block mb-4">
          {t("new-track.name")}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
        <label className="block mb-4">
          {t("new-track.artist")}
          <input
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
      </div>

      {/* Buttons */}
      <SubmitOrBack
        submitMethod={handleSubmit}
        textSubmit={t("new-track.submit")}
        textSubmiting={t("new-track.submiting")}
        onCancel={() => navigate(-1)}
        textCancel={t("new-track.back")}
      />
    </div>
  );
}
