import React from "react";
import styles from "./Header.module.css";
import UserPhoto from "../../../images/UserPhoto.png";
export default function Header({
  caption,
  setCaption,
  matchType,
  handleMatchTypeChange,
}) {
  return (
    <>
      <section
     className={`${styles.captionContainer} ${matchType === "1on1" ? styles.matchType1on1 : styles.matchTypeTeam}`}
      >
        <div className={`${styles.captionWrapper} ${matchType==='1on1' ? styles.matchType1on1Width : styles.matchTypeTeam}`}>
          <img
            src={UserPhoto}
            alt="User profile"
            className={styles.profileImage}
          />
          <input
            type="text"
            className={styles.captionInput}
            placeholder="Write caption here!"
            value={caption}
            style={{ minWidth: "0px" }}
            onChange={(e) => setCaption(e.target.value)}
            aria-label="Write caption"
          />
        </div>
        <div className={`${styles.captionWrapper} ${matchType==='1on1' ? styles.matchType1on1Width : styles.matchTypeTeam}`}>

          <div className={`${styles.matchTypeOptions} `}>
            <button
              className={`${styles.matchTypeButton} ${
                matchType === "1on1" ? styles.matchTypeButtonActive : ""
              } `}
              onClick={() => handleMatchTypeChange("1on1")}
              aria-pressed={matchType === "1on1"}
            >
              1 on 1
            </button>
            <button
              className={`${styles.matchTypeButton} ${
                matchType === "team" ? styles.matchTypeButtonActive : ""
              }`}
              onClick={() => handleMatchTypeChange("team")}
              aria-pressed={matchType === "team"}
            >
              Team Match
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
