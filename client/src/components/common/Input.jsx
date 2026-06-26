function Input({ label, id, ...props }) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...props} />
    </div>
  );
}

export default Input;
