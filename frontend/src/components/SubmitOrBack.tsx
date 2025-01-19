import { useState } from "react";

interface SubmitOrBackProps {
  submitMethod: () => void;
  textSubmit: string;
  textSubmiting: string;
  colorSubmit?: string;
  showSubmit?: boolean;
  onCancel: () => void;
  textCancel: string;
}

// Two buttons to submit or go cance
export default function SubmitOrBack({
  submitMethod,
  textSubmit,
  textSubmiting,
  colorSubmit = "blue",
  showSubmit = true,
  onCancel,
  textCancel,
}: SubmitOrBackProps) {
  const [submiting, setSubmiting] = useState<boolean>(false);

  // Manage disabling buttons if submitting
  const onSubmit = async () => {
    setSubmiting(true);
    try {
      await submitMethod();
    } finally {
      setSubmiting(false);
    }
  };

  return (
    <div className="flex justify-center space-x-2 mt-4">
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
        disabled={submiting}
      >
        {textCancel}
      </button>

      {/* Submit button */}
      {showSubmit && (
        <button
          onClick={onSubmit}
          className={`bg-${colorSubmit}-500 text-white p-2 rounded-lg hover:bg-${colorSubmit}-600`}
          disabled={submiting}
        >
          {submiting ? textSubmiting : textSubmit}
        </button>
      )}
    </div>
  );
}
