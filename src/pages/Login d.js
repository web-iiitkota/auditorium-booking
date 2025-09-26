import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate} from "react-router-dom";
import { ClipLoader } from "react-spinners";

const Login = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      userID,
      password,
    };
    try {
      const response = await axios.post(
        "https://auditorium-api.iiitkota.ac.in/api/auth/login",
        userData,
        {
          withCredentials: true, 
        }
      );

      if (response.data.token) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Student ID or Password!");
      setMessage(""); 
    }
  };

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
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <FontAwesomeIcon icon={faUser} className="icon-inside" />
                    <input
                      type="text"
                      placeholder="User ID"
                      value={userID}
                      onChange={(e) => setUserID(e.target.value)}
                      required
                      className="input-field-inside"
                    />
                  </div>
                  <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="icon-inside" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-field-inside"
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="icon-eye"
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                  <button type="submit">Login</button>
                </form>
                <br/>
              <a href="https://auditorium-api.iiitkota.ac.in/api/auth/google">
                  <button className="btn btn-danger">
                    <i className="bi bi-google"></i> Continue with IIIT kota Gmail ID
                  </button>
                </a>
                <br/>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  {error && <div className="error-message"><br />{error}</div>}
                  {message && <div className="success-message"><br />{message}</div>}
                </div>
              </div>
            </div>
          </div>
    )}

    </>
  );
};

export default Login;
