import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";


interface ITopBarIcon {
  location: string | null;
  iconObject: IconDefinition;
}

export default function TopBarIcon({
  location,
  iconObject,
}: ITopBarIcon) {
  const navigate = useNavigate();

  return (
    <button
      className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
      onClick={() => {
        if (location) {
          navigate(location)
        }
      }}
    >
      <FontAwesomeIcon icon={iconObject} />
    </button>
  );
}
