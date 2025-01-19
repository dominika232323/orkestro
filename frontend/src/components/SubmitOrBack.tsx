import { useState } from "react";

interface SubmitOrBackProps {
  submitMethod: () => void;
  textSubmit: string;
  textSubmiting: string;
  colorSubmit?: string;
  onCancel: () => void;
  textCancel: string;
}

export default function SubmitOrBack({
  submitMethod,
  textSubmit,
  textSubmiting,
  colorSubmit = "blue",
  onCancel,
  textCancel,
}: SubmitOrBackProps) {
  const [submiting, setSubmiting] = useState<boolean>(false);

  const onSubmit = async () => {
    setSubmiting(true);
    try {
      await submitMethod();
    } finally {
      setSubmiting(false);
    }
  };
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <button
        onClick={onCancel}
        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
        disabled={submiting}
      >
        {textCancel}
      </button>
      <button
        onClick={onSubmit}
        className={`bg-${colorSubmit}-500 text-white p-2 rounded-lg hover:bg-${colorSubmit}-600`}
        disabled={submiting}
      >
        {submiting ? textSubmiting : textSubmit}
      </button>
    </div>
  );
}
