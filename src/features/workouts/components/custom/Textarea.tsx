

export const Textarea = ({ label, name, value, onChange }) => {

  return (
    <div className={`form-group py-2 valid`}>
      <label className="fieldLabel">{label}</label>
      <textarea
        placeholder={label}
        name={name}
        className='rounded-lg h-[250px]'
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
};
