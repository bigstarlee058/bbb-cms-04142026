type ToggleFieldProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export const ToggleField = ({ label, value, onChange }: ToggleFieldProps) => {
  const isEnabled = !value;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex items-center gap-2"
      >
        <div
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${isEnabled ? 'bg-bbb' : 'bg-gray-300'}
          `}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? 'translate-x-4' : 'translate-x-1'}
            `}
          />
        </div>

        <span
          className={`text-sm font-medium ${
            isEnabled ? 'text-bbb' : 'text-gray-900'
          }`}
        >
          {isEnabled ? 'Yes' : 'No'}
        </span>
      </button>
    </div>
  );
};