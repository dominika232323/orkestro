import axios from "axios";
import { OrkestroRole } from "./interfaces";

export const parseId = (id: string | number | undefined) => {
  if (!id) {
    throw new Error("Id missing");
  }

  if (typeof id === "number") {
    return id;
  }

  const parsedId = parseInt(id, 10);

  if (!parsedId) {
    throw new Error("Id provided invalid");
  }
  return parsedId;
};

export const getRole = async (
  setRole: (arg0: OrkestroRole) => void,
  groupId: string | number | undefined
) => {
  await axios
    .get<OrkestroRole>(`/api/groups/${groupId}/role/`)
    .then((response) => setRole(response.data))
    .catch((error) => console.error("Error getting role:", error));
};
