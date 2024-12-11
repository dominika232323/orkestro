interface IInvitation {
  text: string;
}

export default function Invitation({ text }: IInvitation) {
  return (
    <li>
      <div className="flex items-center justify-between">
        <p>{text}</p>

        <div className="items-center justify-between">
          <div className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center">
            <i className="fas fa-thumbs-up"></i>
          </div>
          <div className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center">
            <i className="fas fa-thumbs-down"></i>
          </div>
        </div>
      </div>
    </li>
  );
}
