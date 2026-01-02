export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 8,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="label">
      <div className="labelTitle">
        {label} {required ? <span className="req">*</span> : null}
      </div>
      <textarea
        className="textarea"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </label>
  );
}
