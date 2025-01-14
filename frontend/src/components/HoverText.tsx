interface IHoverText {
  textToShow: string;
  children: any;
}

export default function HoverText({ textToShow, children }: IHoverText) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded px-2 py-1 text-center select-none shadow">
        {textToShow}
      </div>
    </div>
  );
}
