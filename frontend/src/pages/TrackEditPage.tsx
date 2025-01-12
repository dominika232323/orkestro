import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import {
  OrkestroFile,
  Paged,
  OrkestroTrack,
  OrkestroMember,
} from "../interfaces";
import { fetchUserOrRedirect } from "../auth";
import axios from "axios";
import Pagination from "../components/Pagination";
import Select, { MultiValue } from "react-select";

export default function TrackEditPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { trackId, groupId } = useParams();

  const [track, setTrack] = useState<Partial<OrkestroTrack>>({});
  const [files, setFiles] = useState<OrkestroFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const [showAddFiles, setShowAddFiles] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  console.log(file);

  const parsedTrackId = trackId ? parseInt(trackId, 10) : undefined;
  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  if (!parsedTrackId || !parsedGroupId) {
    throw new Error(
      "Track ID and Group ID is required and must be a valid number"
    );
  }

  useEffect(() => {
    fetchFiles();
  }, [currentPage]);

  useEffect(() => {
    fetchUserOrRedirect(navigate);
    reloadPage();
  }, []);

  const reloadPage = () => {
    fetchTrack();
    fetchFiles();
  };

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

  const handleUserSelectionChange = (
    selectedOptions: MultiValue<{ label: string; value: number }>
  ) => {
    setSelectedUserIds(selectedOptions.map((option) => option.value));
  };

  const fetchTrack = async () => {
    await axios
      .get<OrkestroTrack>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  };

  const fetchFiles = async () => {
    await axios
      .get<Paged<OrkestroFile>>(
        `/api/files/search/?track_id=${trackId}&page=${currentPage}`
      )
      .then((response) => {
        setFiles(response.data.items);
        setCurrentPage(response.data.page_number);
        setTotalPages(response.data.total_pages);
      })
      .catch((error) => console.error("Error fetching files: ", error));
  };

  const handleSubmit = async () => {
    if (!track.name || !track.artist) {
      return;
    }

    //loading

    await axios
      .put(`/api/tracks/${trackId}/`, track)
      .then(() => {
        console.log("Successfully edited event");
        navigate(-1);
      })
      .catch((error) => console.error("Error adding event:", error));
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTrack((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemoveFile = async (file_id: number) => {
    await axios.delete(`/api/files/${file_id}/`);
    fetchFiles();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddFile = async () => {
    if (!(file && trackId)) {
      console.error("File and trackId required");
      return;
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("track", trackId);
      formData.append("file", file);

      // Upload the file
      const fileResponse = await axios.post("/api/files/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const fileId = fileResponse.data.file_id;

      // Assign file to selected users
      const promises = selectedUserIds.map((userId) =>
        axios.post(`/api/file-allowed-members/`, {
          file: fileId,
          user: userId,
        })
      );
      await Promise.all(promises);
      // Clear states and refresh
      setSelectedUserIds([]);
      setShowAddFiles(false);
      fetchFiles();
    } catch (error) {
      console.error("Error in file upload or user assignment:", error);
    }
  };

  console.log(files);

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("edit-track.title")}
        </h1>
        <label>
          {t("edit-track.name")}
          <input
            type="text"
            name="name"
            value={track.name}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
        <label>
          {t("edit-track.artist")}
          <input
            type="text"
            name="artist"
            value={track.artist}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          {t("edit-track.submit")}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        >
          {t("edit-track.back")}
        </button>

        {/* Lista plików */}
        <h2 className="text-xl font-bold mt-4">{t("edit-track.files")}</h2>
        <ul className="list-disc pl-5">
          {files.length > 0 ? (
            files.map((file) => (
              <li
                key={file.file_id}
                className="flex justify-between items-center"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(file.file_id)}
                  className="text-red-500 hover:underline"
                >
                  {t("edit-track.remove-file")}
                </button>
              </li>
            ))
          ) : (
            <p>{t("edit-track.no-files")}</p>
          )}
        </ul>

        {/* Przycisk do dodawania utworów */}
        <button
          onClick={() => setShowAddFiles(true)}
          className="mt-4 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          {t("edit-track.add-file")}
        </button>

        {/*Pagination*/}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {showAddFiles && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-lg font-bold mb-4">
                {t("edit-track.add-file")}
              </h2>
              <input type="file" onChange={handleFileChange} />
              <label className="block mb-4">
                {t("new-message.recipients")}
                <Select
                  options={members.map((member) => ({
                    label: `${member.user_details.name} ${member.user_details.surname}`,
                    value: member.user_details.user_id,
                  }))}
                  value={selectedUserIds.map((id) => ({
                    label:
                      members.find(
                        (member) => member.user_details.user_id === id
                      )?.user_details.name +
                        " " +
                        members.find(
                          (member) => member.user_details.user_id === id
                        )?.user_details.surname || "",
                    value: id,
                  }))}
                  onChange={handleUserSelectionChange}
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </label>
              <button
                onClick={handleAddFile}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                {t("edit-event.confirm")}
              </button>
              <button
                onClick={() => setShowAddFiles(false)}
                className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                {t("edit-track.back")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return <p>{t("edit-track.fetching")}</p>;
  }
}
