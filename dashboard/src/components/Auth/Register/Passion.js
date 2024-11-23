import React, { useState } from "react";
import "./Register.css";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import Logo from "../../images/Logo.png";
import { InputField } from "./Reuseable/InputField";
import { Divider } from "./Reuseable/Divider";

function Passion() {

  return (
    <>
      <div className="header">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="register-page">
        <BackgroundSlider />
        <div className="register-box">
          <main className="registerContainer">
            <header className="headerSection">
              <h1 className="title">Choose Your Passion</h1>
              <h2 className="subtitle">Select the area you're most interested in</h2>
            </header>


          </main>
        </div>
      </div>
    </>
  );
}

export default Passion;
