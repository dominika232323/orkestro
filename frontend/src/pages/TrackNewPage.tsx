import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import axios from "axios";

export default function TrackNewPage() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    name: undefined,
    artist: undefined,
  });

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.artist) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    await axios
      .post(`/api/tracks/`, { ...formData, group: groupId })
      .then(() => navigate(`/tracks/${groupId}`))
      .catch((error) => console.error("Error adding event:", error));
    setLoading(false);
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-track.title")}
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-track.form-error")}
        </p>
      )}

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

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        {t("new-track.submit")}
      </button>

      <button
        onClick={() => navigate(-1)}
        className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
      >
        {t("new-track.back")}
      </button>
    </div>
  );
}
