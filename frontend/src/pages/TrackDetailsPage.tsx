import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { File, Track } from "../interfaces";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TrackDetailsPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { trackId } = useParams();

  const [track, setTrack] = useState<Track | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchTrack();
    fetchFiles();
  }, []);

  const fetchTrack = async () => {
    await axios
      .get<Track>(`/api/tracks/${trackId}/`)
      .then((response) => {
        setTrack(response.data);
      })
      .catch((error) => console.error("Error fetching track:", error));
  };
  const fetchFiles = async () => {};

  if (track) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">{track.name}</h1>
      </div>
    );
  } else {
    return <p>{t("track-details.fetching")}</p>;
  }
}
