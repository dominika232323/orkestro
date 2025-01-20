import axios, { AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react";
import { OrkestroInstrument, OrkestroMember } from "../interfaces";
import Select, { MultiValue } from "react-select";
import { useLanguage } from "../LanguageContext";
import SubmitOrBack from "./SubmitOrBack";

interface AddFilesProps {
  parsedTrackId: number;
  parsedGroupId: number;
  setShowAddFiles: (arg0: boolean) => void;
  fetchFiles: () => void;
}

// Window to add new file to track
export default function AddFiles({
  parsedTrackId,
  parsedGroupId,
  setShowAddFiles,
  fetchFiles,
}: AddFilesProps) {
  const { t, currentLanguage } = useLanguage();
  const instrumentName = currentLanguage === "en" ? "name_en" : "name_pl";

  const [file, setFile] = useState<File | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [error, setError] = useState("");
  const [instruments, setInstruments] = useState<OrkestroInstrument[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([]);

  // Fetch group members to choose from when assigning to a file
  const fetchMembers = useCallback(async () => {
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
  }, [parsedGroupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Submit new file
  const handleSubmit = async () => {
    setError("");
    if (!(file && parsedTrackId)) {
      setError(t("add-file.no-file"));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("track", parsedTrackId.toString());
      formData.append("file", file);

      let fileResponse: AxiosResponse;
      try {
        fileResponse = await axios.post("/api/files/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 413) {
            setError(t("add-file.file-too-big"));
            return;
          } else {
            setError("Unexpected error");
            return;
          }
        } else {
          setError("Unexpected error");
          return;
        }
      }
      const fileId = fileResponse.data.file_id;

      // Assign file to selected users
      const promisesUsers = selectedUserIds.map((userId) =>
        axios.post(`/api/file-allowed-members/`, {
          file: fileId,
          user: userId,
        })
      );
      await Promise.all(promisesUsers);
      // Clear states and refresh
      setSelectedUserIds([]);
      setShowAddFiles(false);
      fetchFiles();

      const promisesInstruments = selectedInstruments.map((instrumentId) =>
        axios.post(`/api/file-instruments/`, {
          file: fileId,
          instrument: instrumentId,
        })
      );

      await Promise.all(promisesInstruments);
      setSelectedInstruments([]);
      setShowAddFiles(false);
      fetchFiles();
    } catch (error) {
      console.error("Error in file upload or user assignment:", error);
    }
  };

  // Handle file input field change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle selecting user to assign to file
  const handleUserSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedUserIds(selectedOptions.map((option) => option.value));
  };

  // Handle selecting instrument to assign to file
  const handleInstrumentSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedInstruments(selectedOptions.map((option) => option.value));
  };

  // Fetch list of instruments to choose from when assigning to file
  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = async () => {
    await axios
      .get<OrkestroInstrument[]>("/api/instruments/")
      .then((response) => setInstruments(response.data))
      .catch((error) => console.error("Error fetching instruments:", error));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-6 px-2 sm:px-6 rounded-lg max-w-lg w-full">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("add-file.title")}</h2>

        {/* Display error message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* File input field */}
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300"
        />

        {/* Assign users */}
        <label className="block mb-4">
          {t("add-file.users-allowed")}
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

        {/* Assign instruments */}
        <label className="block mb-4">
          {t("add-file.instruments")}
          <Select
            options={instruments.map((instrument) => ({
              label: instrument[instrumentName] || "Unknown",
              value: instrument.instrument_id,
            }))}
            value={selectedInstruments.map((id) => {
              const instrument = instruments.find(
                (instrument) => instrument.instrument_id === id
              );
              return {
                label: instrument?.[instrumentName] || "Unknown",
                value: id,
              };
            })}
            onChange={handleInstrumentSelectionChange}
            isMulti
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </label>

        {/* Buttons */}
        <SubmitOrBack
          submitMethod={handleSubmit}
          textSubmit={t("add-file.send")}
          textSubmiting={t("add-file.sending")}
          onCancel={() => setShowAddFiles(false)}
          textCancel={t("add-file.back")}
        />
      </div>
    </div>
  );
}
