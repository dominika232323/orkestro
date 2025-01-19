import axios, { AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react";
import { OrkestroInstrument, OrkestroMember } from "../interfaces";
import Select, { MultiValue } from "react-select";
import { useLanguage } from "../LanguageContext";

interface AddFilesProps {
  parsedTrackId: number;
  parsedGroupId: number;
  setShowAddFiles: (arg0: boolean) => void;
  fetchFiles: () => void;
}

export default function AddFiles({
  parsedTrackId,
  parsedGroupId,
  setShowAddFiles,
  fetchFiles,
}: AddFilesProps) {
  const { t, currentLanguage } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [instruments, setInstruments] = useState<OrkestroInstrument[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([]);

  useEffect(() => {
    fetchInstruments();
  }, []);

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

  const handleSubmit = async () => {
    setError("");
    setSending(true);
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
        setSending(false);
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
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUserSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedUserIds(selectedOptions.map((option) => option.value));
  };

  const handleInstrumentSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedInstruments(selectedOptions.map((option) => option.value));
  };

  const fetchInstruments = async () => {
    await axios
      .get<OrkestroInstrument[]>("/api/instruments/")
      .then((response) => setInstruments(response.data))
      .catch((error) => console.error("Error fetching instruments:", error));
  };

  const instrumentName = currentLanguage === "en" ? "name_en" : "name_pl";

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">{t("add-file.title")}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300"
        />
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
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          disabled={sending}
        >
          {sending ? t("add-file.sending") : t("add-file.send")}
        </button>
        <button
          onClick={() => setShowAddFiles(false)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          disabled={sending}
        >
          {t("add-file.back")}
        </button>
      </div>
    </div>
  );
}
