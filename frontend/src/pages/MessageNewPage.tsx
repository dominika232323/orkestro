import { useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { OrkestroUser, OrkestroMessage, OrkestroMember } from "../interfaces";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance as axios, fetchUserOrRedirect } from "../auth";
import Select, { MultiValue } from "react-select";
import { parseId } from "../util";
import SubmitOrBack from "../components/SubmitOrBack";

// Create new message
export default function MessageNewPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const [user, setUser] = useState<OrkestroUser>();
  const [message, setMessage] = useState<Partial<OrkestroMessage>>({
    title: "",
    content: "",
  });
  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [sendByEmail, setSendByEmail] = useState<boolean>(false);

  const parsedGroupId = parseId(groupId);

  // Fetch user
  useEffect(() => {
    fetchUserOrRedirect(navigate, setUser);
  }, [navigate]);

  useEffect(() => {
    setMessage({
      user: user?.user_id,
      group: parsedGroupId,
      title: "",
      content: "",
    });
  }, [parsedGroupId, user]);

  // Fetch members to send message to
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

  // Change message text fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setMessage((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle selecting users as recipients
  const handleUserSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedUserIds(selectedOptions.map((option) => option.value));
  };

  // Handle sending email
  const handleSend = async () => {
    // TODO: implement actual email-sending logic here
    console.log("Sending email...");
  };

  // Send message
  const handleSubmit = async () => {
    setError(false);
    if (!message.title || !message.content) {
      setError(true);
      return;
    }

    if (sendByEmail) {
      await handleSend();
    }

    const encodedMessage = {
      ...message,
      date: new Date().toISOString(),
    };

    const userIdsQuery = selectedUserIds.map((id) => `id=${id}`).join("&");
    const url = `/api/messages/?${userIdsQuery}`;

    await axios
      .post(url, encodedMessage)
      .then(() => navigate("/messages/"))
      .catch((error) => console.error("Error sending message:", error));
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("new-message.title")}
      </h1>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-center mb-4">
          {t("new-event.form-error")}
        </p>
      )}

      {/* Message form */}
      <div>
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

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sendByEmail}
              onChange={(e) => setSendByEmail(e.target.checked)}
            />
            <span>{t("new-message.send-by-email")}</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <SubmitOrBack
        submitMethod={handleSubmit}
        textSubmit={t("new-message.submit")}
        textSubmiting={t("new-message.submiting")}
        onCancel={() => navigate(-1)}
        textCancel={t("new-message.back")}
      />
    </div>
  );
}
