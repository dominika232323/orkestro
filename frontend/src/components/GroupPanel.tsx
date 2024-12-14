import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface IUser {
  name: string;
  role: string;
}

interface IGroup {
  id: string;
  name: string;
  description: string;
  events: string[];
  files: string[];
  members: IUser[];
}

const initialGroups: IGroup[] = [
  {
    id: "1",
    name: "Group 1",
    description: "Description of group 1",
    events: ["Concert", "Rehearsal"],
    files: ["racer_x_technical_difficulties", "megadeth_holy_wars"],
    members: [
      {
        name: "Jan Kowalski",
        role: "manager",
      },
      {
        name: "Maciej Nowak",
        role: "musician",
      },
      {
        name: "Aleksandra Marczak",
        role: "moderator",
      },
    ],
  },
  {
    id: "2",
    name: "Group 2",
    description: "Description of Group 2",
    events: ["Practice"],
    files: ["lady_pank_mala_wojna"],
    members: [
      {
        name: "Jan Kowalski",
        role: "manager",
      },
      {
        name: "Łukasz Jagnieża",
        role: "musician",
      },
    ],
  },
  {
    id: "3",
    name: "Group 3",
    description: "Description of Group 3",
    events: [],
    files: [],
    members: [],
  },
];

export default function GroupPanel() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState(initialGroups);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [groupName, setGroupName] = useState(groups[0].name);
  const [groupDescription, setGroupDescription] = useState(
    groups[0].description
  );
  const [currentPage, setCurrentPage] = useState(0);

  const membersPerPage = 5;
  const currentGroup = groups[currentGroupIndex];

  const handlePrevGroup = () => {
    const newIndex = (currentGroupIndex - 1 + groups.length) % groups.length;
    setCurrentGroupIndex(newIndex);
    setGroupName(groups[newIndex].name);
    setGroupDescription(groups[newIndex].description);
    setCurrentPage(0);
  };

  const handleNextGroup = () => {
    const newIndex = (currentGroupIndex + 1) % groups.length;
    setCurrentGroupIndex(newIndex);
    setGroupName(groups[newIndex].name);
    setGroupDescription(groups[newIndex].description);
    setCurrentPage(0);
  };

  const handleSaveChanges = () => {
    groups[currentGroupIndex].name = groupName;
    groups[currentGroupIndex].description = groupDescription;
    alert(t("group-panel.changes-saved"));
  };

  const handleDeleteMember = (index: number) => {
    const updatedGroups = [...groups];
    updatedGroups[currentGroupIndex].members.splice(index, 1);
    setGroups(updatedGroups);
    setCurrentPage(0);
  };

  const handleRoleChange = (index: number, newRole: string) => {
    const updatedGroups = [...groups];
    updatedGroups[currentGroupIndex].members[index].role = newRole;
    setGroups(updatedGroups);
  };

  const paginatedMembers = currentGroup.members.slice(
    currentPage * membersPerPage,
    currentPage * membersPerPage + membersPerPage
  );

  const totalPages = Math.ceil(currentGroup.members.length / membersPerPage);

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("group-panel.title")}
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

      {/* Group Name and Description */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          {t("group-panel.group-name")}
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <label className="block text-gray-700 font-medium">
          {t("group-panel.group-description")}
        </label>
        <textarea
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <button
          className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          onClick={handleSaveChanges}
        >
          {t("group-panel.save-changes")}
        </button>
      </div>

      {/* Members Section */}
      <h2 className="text-lg font-bold mt-6 mb-4">
        {t("group-panel.members")}
      </h2>
      {currentGroup.members.length > 0 ? (
        paginatedMembers.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
          >
            <p>{member.name}</p>
            <div className="flex items-center space-x-4">
              <select
                value={member.role}
                onChange={(e) =>
                  handleRoleChange(
                    index + currentPage * membersPerPage,
                    e.target.value
                  )
                }
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="manager">
                  {t("group-panel.roles.manager")}
                </option>
                <option value="musician">
                  {t("group-panel.roles.musician")}
                </option>
                <option value="moderator">
                  {t("group-panel.roles.moderator")}
                </option>
              </select>
              <button
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() =>
                  handleDeleteMember(index + currentPage * membersPerPage)
                }
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">
          {t("group-panel.no-members")}
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            {t("group-panel.previous")}
          </button>
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            {t("group-panel.next")}
          </button>
        </div>
      )}
    </div>
  );
}
