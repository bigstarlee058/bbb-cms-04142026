

export const Textarea = ({ label, name, value, onChange, hasHeight ,placeholder}) => {

  return (
    <div className={`form-group py-2 valid`}>
      <label className="fieldLabel">{label}</label>
      <textarea
        placeholder={placeholder}
        name={name}
        className={`rounded-lg ${hasHeight ? 'h-[600px]' : 'h-[210px]'}`}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
};
