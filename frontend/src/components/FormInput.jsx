export default function FormInput({ label, error, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className={error ? 'input error' : 'input'} {...props} />
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}