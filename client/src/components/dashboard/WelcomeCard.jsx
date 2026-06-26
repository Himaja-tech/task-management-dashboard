import React from "react";
import ProgressBar from "./ProgressBar.jsx";

function WelcomeCard({ focusScore, progress }) {
  return (
    <section className="insight-band">
      <div>
        <p className="eyebrow">Productivity insight</p>
        <h2>{focusScore >= 75 ? "Strong work rhythm today." : "Protect one focused block next."}</h2>
        <p>
          Your focus score is {focusScore}. Complete high-priority tasks first, then clear anything overdue before adding
          new work.
        </p>
      </div>
      <ProgressBar value={progress} />
    </section>
  );
}

export default WelcomeCard;
