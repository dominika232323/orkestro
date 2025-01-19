import axios from "axios";
import {
  OrkestroFile,
  OrkestroFileInstrument,
  OrkestroInstrument,
} from "../interfaces";
import { useLanguage } from "../LanguageContext";
import { useCallback, useEffect, useState } from "react";

interface FileComponentProps {
  file: OrkestroFile;
}

// Element of file list in track details
export default function FileComponent({ file }: FileComponentProps) {
  const { t, currentLanguage } = useLanguage();
  const instrumentName = currentLanguage === "en" ? "name_en" : "name_pl";

  const [instruments, setInstruments] = useState<OrkestroInstrument[]>([]);

  // Fetching instruments assigned to file
  const fetchInstruments = useCallback(async () => {
    await axios
      .get<OrkestroFileInstrument[]>(
        `/api/file-instruments/by_file/?file_id=${file.file_id}`
      )
      .then((response) => {
        const instruments = response.data.map(
          (fileInstrument) => fileInstrument.instrument_details
        );
        setInstruments(instruments);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setInstruments([]);
        } else {
          console.error(err);
        }
      });
  }, [file.file_id]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Download a file
  const handleDownload = async (file_id: number, file_name: string) => {
    try {
      const response = await axios.get(`/api/files/${file_id}/download/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file_name); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <li
      key={file.file_id}
      className="flex justify-between items-center p-2 bg-gray-100 rounded-md shadow-sm mb-2 text-sm"
    >
      {/* File Name */}
      <div className="flex flex-col">
        <span className="font-medium text-gray-700">{file.name}</span>

        {/* Instruments List */}
        <ul className="text-gray-500 text-xs">
          {instruments.map((instrument) => (
            <li key={instrument.instrument_id} className="inline-block mr-2">
              {instrument[instrumentName]}
            </li>
          ))}
        </ul>
      </div>

      {/* Download Button */}
      <button
        className="text-blue-500 hover:underline focus:outline-none text-xs"
        onClick={() => handleDownload(file.file_id, file.name)}
      >
        {t("track-details.download")}
      </button>
    </li>
  );
}
