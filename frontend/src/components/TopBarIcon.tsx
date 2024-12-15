import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ITopBarIcon {
  handleChangePage: (pageName: string) => void;
  pageName: string;
  iconObject: IconDefinition;
}

export default function TopBarIcon({
  handleChangePage,
  pageName,
  iconObject,
}: ITopBarIcon) {
  return (
    <div
      className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
      onClick={() => handleChangePage(pageName)}
    >
      <FontAwesomeIcon icon={iconObject} />
    </div>
  );
}
