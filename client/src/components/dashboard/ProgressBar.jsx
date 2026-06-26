import React from "react";

function ProgressBar({ value }) {
  return (
    <div className="progress-ring" style={{ "--progress": `${value * 3.6}deg` }}>
      <span>{value}%</span>
    </div>
  );
}

export default ProgressBar;
