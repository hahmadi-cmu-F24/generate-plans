export function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  isInvalid,
  helpText,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  isInvalid?: boolean;
  helpText?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <label className="label">
      <div className="labelTitle">
        {label} {required ? <span className="req">*</span> : null}
      </div>

      <input
        className={`input ${isInvalid ? "inputInvalid" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        maxLength={maxLength}
      />

      {isInvalid && helpText ? <div className="helpText">{helpText}</div> : null}
    </label>
  );
}
