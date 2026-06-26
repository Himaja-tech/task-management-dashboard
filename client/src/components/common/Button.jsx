function Button({ children, className = "primary-button", type = "button", ...props }) {
  return (
    <button className={className} type={type} {...props}>
      {children}
    </button>
  );
}

export default Button;
