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
  type,
  maxDate
  
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
  type?: React.HTMLInputTypeAttribute;
  maxDate?: string;
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
        type={type}
        max={maxDate}
      />

      {isInvalid && helpText ? <div className="helpText">{helpText}</div> : null}
    </label>
  );
}
