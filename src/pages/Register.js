import React, { useState } from 'react';
import axios from 'axios';
import '../assets/css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser,faLock, faIdBadge, faEnvelope,faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';



const Register = () => {
  const [userID, setuserID] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      userID,
      name,
      email,
      password,
      role,
    };

    setuserID("");
    setName("");
    setEmail("");
    setPassword("");

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      if (response.data.message) {
        setMessage(response.data.message); 
        setError(''); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed!');
      setMessage(''); 
    }
  };

  return (
    <>

<div className="register-container">

      <div className="logo-area"> 
        <img src={require("../assets/img/logo.png")}  alt='alt="IIIT Kota Logo'  />
      </div>
      <div className="form-area"> 
      <div className='Auditorium-Booking-title'>Auditorium Booking</div>

        <form onSubmit={handleSubmit}>
     
          <div className="input-group" >
          <FontAwesomeIcon icon={faIdBadge} className="icon-inside"/>
            <input
               type="text"
               placeholder="Student ID"
               value={userID}
               onChange={(e) => setuserID(e.target.value)}
               required
               className="input-field-inside"
            />
          </div>
          <div className="input-group" >
          <FontAwesomeIcon icon={faUser} className="icon-inside"/>
              <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field-inside"
            />
          </div>
          <div className="input-group" >
          <FontAwesomeIcon icon={faEnvelope} className="icon-inside"/>
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field-inside"
          />
          </div>
          <div className="input-group">
          <FontAwesomeIcon icon={faLock} className="icon-inside"/>
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
              <input
              type="hidden"
              placeholder="Role (Optional)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field-inside"

            />
          <button type="submit">Register</button>
        </form>
        <div style={{textAlign:'center', width:'100%' }}>
     {error && <div className="error-message"><br/>{error}</div>}
     {message && <div className="success-message"><br/>{message}</div>}
     </div>
      </div>

    </div>





    </>
  );
};

export default Register;
