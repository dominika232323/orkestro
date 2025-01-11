import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios, fetchUserOrRedirect } from "../auth";
import { OrkestroEvent, OrkestroMember } from "../interfaces";
import Select, { MultiValue } from "react-select";

export default function EventNewPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  if (!parsedGroupId) {
    throw new Error("Group ID is required and must be a valid number");
  }

  const [event, setEvent] = useState<Partial<OrkestroEvent>>({
    group: parsedGroupId,
    name: "",
    description: "",
    date: new Date(),
    place: "",
  });

  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchMembers = async () => {
      await axios
        .get(`/api/members/by_group/?group_id=${parsedGroupId}`)
        .then((response) => {
          setMembers(response.data);
          setSelectedUserIds(
            response.data.map(
              (member: OrkestroMember) => member.user_details.user_id
            )
          );
        })
        .catch((error) => console.error("Error fetching members:", error));
    };

    fetchMembers();
  }, [parsedGroupId]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "date" input (YYYY-MM-DD)
    setEvent((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [year, month, day] = value.split("-").map(Number);
      newDate.setFullYear(year, month - 1, day); // Update only the date part
      return { ...prevData, date: newDate };
    });
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; // The value from the "time" input (HH:MM)
    setEvent((prevData) => {
      const newDate = prevData.date ? new Date(prevData.date) : new Date();
      const [hours, minutes] = value.split(":").map(Number);
      newDate.setHours(hours, minutes, 0, 0); // Update only the time part
      return { ...prevData, date: newDate };
    });
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEvent((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedUserIds(selectedOptions.map((option) => option.value));
  };

  const handleSubmit = async () => {
    if (!event.name || !event.description || !event.place || !event.date) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    const encodedEvent = {
      ...event,
      date: event.date?.toISOString(),
    };

    const userIdsQuery = selectedUserIds.map((id) => `id=${id}`).join("&");
    const url = `/api/events/?${userIdsQuery}`;

    await axios
      .post(url, encodedEvent)
      .then(() => navigate(`/events/${groupId}`))
      .catch((error) => console.error("Error adding event:", error));
    setLoading(false);
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-event.title")}
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-event.form-error")}
        </p>
      )}

      <label className="block mb-4">
        {t("new-message.recipients")}
        <Select
          options={members.map((member) => ({
            label: `${member.user_details.name} ${member.user_details.surname}`,
            value: member.user_details.user_id,
          }))}
          value={selectedUserIds.map((id) => ({
            label:
              members.find((member) => member.user_details.user_id === id)
                ?.user_details.name +
                " " +
                members.find((member) => member.user_details.user_id === id)
                  ?.user_details.surname || "",
            value: id,
          }))}
          onChange={handleUserSelectionChange}
          isMulti
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </label>

      <label>
        {t("new-event.name")}
        <input
          type="text"
          name="name"
          value={event.name}
          onChange={handleTextChange}
          className="block w-full p-2 border mb-2"
          required
        />
      </label>

      <label>
        {t("new-event.description")}
        <textarea
          name="description"
          value={event.description}
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
          value={event.place}
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
          value={event.date?.toISOString().split("T")[0] || ""}
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
            event.date
              ? event.date.toTimeString().split(":").slice(0, 2).join(":")
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
        {t("new-event.submit")}
      </button>
    </div>
  );
}
