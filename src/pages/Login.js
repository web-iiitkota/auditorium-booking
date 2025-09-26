import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/style.css';
import { useNavigate} from "react-router-dom";
import { ClipLoader } from "react-spinners";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("https://auditorium-api.iiitkota.ac.in/api/auth/me", {
          withCredentials: true, 
        });
  
        if (response.status === 200) {
          // console.log("User logged in:", response.data);
          navigate("/dashboard"); 
        } 
      } catch (error) {
        console.warn("Not authenticated, stay on login page.");
      }
      finally {
        setIsLoading(false); 
      }
    };
  
    checkAuth();
  }, [navigate]);


  return (
    <>
    {isLoading ? (
            <div className="loader" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <ClipLoader color={"#276afb"} loading={isLoading} size={150} />
            </div>
    ) : (
            <div>
            <div className="login-container">
              <div className="logo-area">
                <img src={require("../assets/img/logo.png")} alt='alt="IIIT Kota Logo' />
              </div>
              <div className="form-area">
                <div className='Auditorium-Booking-title'>Auditorium Booking</div>
                <br/>      
              <a href="https://auditorium-api.iiitkota.ac.in/api/auth/google">
                  <button className="btn btn-danger">
                    <i className="bi bi-google"></i> Continue with IIIT kota Gmail ID
                  </button>
                </a>
                <br/>
            
              </div>
            </div>
          </div>
    )}

    </>
  );
};

export default Login;
