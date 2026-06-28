import "./LoadingIndicator.css";

const LoadingIndicator = ({
  size = "md",
  color = "primary",
  fullScreen = false,
  overlay = false,
  text = "",
  className = "",
}) => {
  const sizeClass = `loading-indicator--${size}`;
  const colorClass = `loading-indicator--${color}`;

  const spinner = (
    <div className={`loading-indicator ${sizeClass} ${colorClass} ${className}`}>
      <div className="loading-indicator__spinner">
        <svg viewBox="0 0 50 50" className="loading-indicator__svg">
          <circle
            className="loading-indicator__track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className="loading-indicator__circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {text && <span className="loading-indicator__text">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-indicator__fullscreen">{spinner}</div>;
  }

  if (overlay) {
    return <div className="loading-indicator__overlay">{spinner}</div>;
  }

  return spinner;
};

export default LoadingIndicator;