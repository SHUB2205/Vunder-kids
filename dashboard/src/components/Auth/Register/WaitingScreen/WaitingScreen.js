import React, { useContext, useEffect } from "react";
import "./WaitingScreen.css";
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import RegisterContext from "../../../../createContext/Register/RegisterContext";
function WaitingScreen() {
  const navigate = useNavigate();

  const { isVerified, checkVerification } =
    useContext(RegisterContext);
    toast.success("Registration successful! Verification email sent.");
  useEffect(() => {
    checkVerification();
  }, [checkVerification]);

  useEffect(() => {
    if (isVerified) {
      toast.success("Email verified successfully!");
      navigate("/register/about");
    }
  }, [isVerified, navigate]);

  return (
    <>
      
          <div className="header">
            <img src={Logo} alt="Fisko" className="Logo" />
          </div>
          <div className="waiting-page">
            <BackgroundSlider />
            <div className="waiting-box">
              <main className="waitingContainer">
                <header className="headerSection">
                  <h1 className="title">
                    Check your email for a verification link
                  </h1>
                  <h2 className="subtitle">
                    we have send you a link , please click on it and you will be
                    redirected to the dashboard
                  </h2>
                </header>
              </main>
            </div>
          </div>
          <ToastContainer />
        
    </>
  );
}

export default WaitingScreen;
