import React, { useContext, useState } from "react";
import styles from "./ScoreModal.module.css";
import FormSection from "../ChallengeModal/FormSection";
import Modal from "../../../Reusable/Modal/Modal";
import { MatchContext } from "../../../../createContext/Match/MatchContext";

const ScoreModal = (props) => {
  const [matchName, setMatchName] = useState("");
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");
  const {setScore} = useContext(MatchContext);

  const formFields = [
    {
      label: "Match Name *",
      icon: "🏆",
      inputType: "text",
      placeholder: "Championship Final",
      value: matchName,
      onChange: (e) => setMatchName(e.target.value),
      type:"matches"
    },
    {
      label: "Team 1 Score *",
      icon: "💯",
      inputType: "number",
      placeholder: "Enter score",
      value: team1Score,
      onChange: (e) => setTeam1Score(e.target.value),
    },
    {
      label: "Team 2 Score *",
      icon: "💯",
      inputType: "number",
      placeholder: "Enter score",
      value: team2Score,
      onChange: (e) => setTeam2Score(e.target.value),
    }
  ];

  const handleSubmit = async () => {
    const scoreData = {
      matchId: matchName._id,
      score1 : team1Score,
      score2:team2Score,
    };
    await setScore(scoreData);
    props.onClose();
  };

  return (
    <Modal {...props} widthModalContent={styles.modalContentWidth}>
      {formFields.map((field, index) => (
        <FormSection
          key={index}
          label={field.label}
          icon={field.icon}
          inputType={field.inputType}
          placeholder={field.placeholder}
          value={field.value}
          onChange={field.onChange}
          type={field.type}
        />
      ))}
      <div className={styles.submitButtonWrapper}>
        <button 
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={
            !matchName || 
            team1Score === '' || 
            team2Score === ''
          }
        >
          Submit Score
        </button>
      </div>
    </Modal>
  );
};

export default ScoreModal;