import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

interface IFile {
  id: string;
  name: string;
  instrument: string;
}

interface IGroup {
  id: string;
  name: string;
  files: IFile[];
}

const groups: IGroup[] = [
  {
    id: "1",
    name: "Group A",
    files: [
      {
        id: "1",
        name: "racer_x_technical_difficulties.mp3",
        instrument: "Guitar",
      },
      {
        id: "2",
        name: "megadeth_holy_wars.pdf",
        instrument: "Drums",
      },
    ],
  },
  {
    id: "2",
    name: "Group B",
    files: [
      {
        id: "3",
        name: "lady_pank_mała_wojna.mp3",
        instrument: "Bass",
      },
    ],
  },
  {
    id: "3",
    name: "Group C",
    files: [],
  },
];

export default function Files() {
  const { t } = useLanguage();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const currentGroup = groups[currentGroupIndex];

  const handlePrevGroup = () => {
    setCurrentGroupIndex((prev) => (prev - 1 + groups.length) % groups.length);
  };

  const handleNextGroup = () => {
    setCurrentGroupIndex((prev) => (prev + 1) % groups.length);
  };

  const filteredFiles = currentGroup.files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.instrument.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewFile = () => {};

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("files.title")}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handlePrevGroup}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-xl font-bold">{currentGroup.name}</h1>
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handleNextGroup}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("files.search-placeholder")}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <ul className="space-y-4">
        {currentGroup.files.length > 0 ? (
          filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <li
                key={file.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-lg cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <p className="font-bold">{file.name}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500">{file.instrument}</p>
                  <button
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    onClick={() =>
                      console.log(`Downloading file: ${file.name}`)
                    }
                  >
                    {t("files.download")}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li>
              <p className="text-gray-600 text-center">
                {t("files.no-files-found")}
              </p>
            </li>
          )
        ) : (
          <li>
            <p className="text-gray-600 text-center">{t("files.no-files")}</p>
          </li>
        )}
        <li>
          <button
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            onClick={handleNewFile}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {t("files.add-file")}
          </button>
        </li>
      </ul>
    </div>
  );
}
