import { useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { Event } from "../interfaces";

export default function EditEventPage() {
  const { t } = useLanguage();
  const { eventId } = useParams<{ eventId: string }>();
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState(false);

  const fetchEvent = () => {
    setLoading(true);
    setFormData({});
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "date" input (YYYY-MM-DD)
    setFormData((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [year, month, day] = value.split("-").map(Number);
      newDate.setFullYear(year, month - 1, day); // Update only the date part
      return { ...prevData, date: newDate };
    });
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "time" input (HH:MM)
    setFormData((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [hours, minutes] = value.split(":").map(Number);
      newDate.setHours(hours, minutes, 0, 0); // Update only the time part
      return { ...prevData, date: newDate };
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  const parsedEventId = eventId ? parseInt(eventId, 10) : undefined;

  if (!parsedEventId) {
    throw new Error("Event ID is required and must be a valid number");
  }

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("edit-event.title")}
      </h1>
      <label>
        {t("new-event.name")}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.description")}
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.place")}
        <input
          type="text"
          name="place"
          value={formData.place}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.date")}
        <input
          type="date"
          name="date"
          value={formData.date?.toISOString().split("T")[0] || ""}
          onChange={handleDateChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <label>
        {t("new-event.time")}
        <input
          type="time"
          name="time"
          value={
            formData.date
              ? formData.date.toTimeString().split(":").slice(0, 2).join(":")
              : ""
          }
          onChange={handleTimeChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        {t("edit-event.submit")}
      </button>
    </div>
  );
}
