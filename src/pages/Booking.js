import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";
import { faCalendar, faClock, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import '../assets/css/style.css';
import { ClipLoader } from "react-spinners";
import { BeatLoader } from "react-spinners";


const Booking = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setstartTime] = useState('');
  const [endTime, setendTime] = useState('');
  const [description, setDescription] = useState('');
  const [status] = useState('Pending'); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [Demail, setDEmail] = useState("");
  const navigate = useNavigate();
  const [today] = useState(new Date().toISOString().split("T")[0]);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
     const [isBookingLoading, setIsBookingLoading] = useState(false);

//   useEffect(() => {
//     setTimeout(() => {
//         console.log("All Cookies:", document.cookie); // Debugging
//         const token = Cookies.get("authToken");
//         console.log("Checking token after delay:", token); // Debugging
//         if (!token) {
//             navigate("/login");
//         }
//     }, 500);
// }, [navigate]);



useEffect(() => {
  let progressInterval;
  let startTime = Date.now();

  const checkAuth = async () => {
    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev)); 
      }, 300); 

      const response = await axios.get("https://auditorium-api.iiitkota.ac.in/api/auth/me", {
        withCredentials: true,
      });

      if (response.data) {
        setUser(response.data);
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      navigate("/login");
    } finally {
      clearInterval(progressInterval);
      let endTime = Date.now();
      let totalTime = endTime - startTime;
      
 
      let remainingTime = totalTime > 2000 ? 500 : 2000 - totalTime;

      setTimeout(() => {
        setProgress(100); 
        setTimeout(() => setIsLoading(false), 500); 
      }, remainingTime);
    }
  };

  checkAuth();

  return () => clearInterval(progressInterval);
}, [navigate]);


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsBookingLoading(true);
  try {
   
    const responseAuth = await axios.get("https://auditorium-api.iiitkota.ac.in/api/auth/me", {
      withCredentials: true,
    });

    // console.log("Auth response:", responseAuth.data);
    
    const userID = responseAuth.data._id;
    const collegeID = responseAuth.data.userID;
    // console.log("Extracted userID:", userID);
    // console.log("Extracted collegeID:", collegeID);
    const bookingData = {
          title,
          date,
          startTime,
          endTime,
          description,
          Demail,
          userID,
          collegeID,
          status,
    };

 
    const response = await axios.post(
      "https://auditorium-api.iiitkota.ac.in/api/events/book",
      bookingData,
      {
        withCredentials: true
      },

    );
      setTitle("");
      setDate("");
      setstartTime("");
      setendTime("");
      setDescription("");
      setDEmail("");

    if (response.data) {
      setMessage("Booking request & email sent successfully.");
      setError("");
       setIsBookingLoading(false);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  } catch (err) {
    console.log("Booking Error:", err.response || err.message); // 👈 add this
  setError(err.response?.data?.message || 'Booking failed!');
  setMessage('');
  }
};

const emailOptions = [
  { label: "test, DIS", value: "mohammadjeeshan9917@gmail.com" },
  // { label: "Associate Dean, Alumni & Industry Outreach", value: "ad.aio@iiitkota.ac.in" },
  // { label: "Associate Dean, Digital Infrastructure and Services", value: "ad.dis@iiitkota.ac.in" },
  // { label: "Associate Dean, Administration", value: "ad.admin@iiitkota.ac.in" },
  // { label: "Associate Dean, Academic", value: "ad.acad@iiitkota.ac.in" },
  // { label: "Associate Dean, Faculty Welfare", value: "ad.fw@iiitkota.ac.in" },
  // { label: "Associate Dean, Planning and Development", value: "ad.pnd@iiitkota.ac.in" },
  // { label: "Associate Dean, Research and Consultancy", value: "ad.rnc@iiitkota.ac.in" },
  // { label: "Associate Dean, Student Welfare", value: "ad.sw@iiitkota.ac.in" },
];

  return (
    <>
      {isLoading ? (
                <div className="loader" style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                }}>
                  <ClipLoader color={"#0E407C"} loading={isLoading} size={150} />
                  <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold", color: "#0E407C" }}>
                    Loading... {progress}%
                  </p>
                </div>
        ) : (

          <div className="booking-container">
          <div className="logo-area"> 
            <img src={require("../assets/img/logo.png")} alt='alt="IIIT Kota Logo' />
          </div>
          <div className="form-area"> 
            <div className='Auditorium-Booking-title'>Book Event</div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <FontAwesomeIcon icon={faCalendar} className="icon-inside"/>
                <input
                  type="text"
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field-inside"
                />
              </div>
              <div className="input-group">
                <FontAwesomeIcon icon={faCalendarDays} className="icon-inside"/>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  required
                  className="input-field-inside"
                />
              </div>
              <div className="input-group" style={{position:"relative"}}>
                <FontAwesomeIcon icon={faClock} className="icon-inside"/>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setstartTime(e.target.value)}
                  required
                  className="input-field-inside"
                />
                <label 
                style={{position: "absolute",
                right: "45px",
                top: "23px"}}>Start</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setendTime(e.target.value)}
                  required
                  className="input-field-inside"
                />
                <label 
                style={{position: "absolute",
                right: "45px",
                top: "50px"}}>End</label>
              </div>
              <div className="input-group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event Description"
                className="input-field-inside"
              />
            </div>
              {/* <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field-inside"
                />
              </div> */}
               <div className="input-group">
              <select
                value={Demail}
                onChange={(e) => setDEmail(e.target.value)}
                className="input-field-inside"
  
              >
                <option value="">Select an email</option>
                {emailOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </select>
            </div>
               <button type="submit">
              {isBookingLoading ? (
                <span style={{ textAlign: "center" }}>
                  <span >
                    <BeatLoader size={9} color="#fff" loading={true} />
                  </span>
                  <span style={{ marginLeft: "10px", marginTop: "-10px" }}>Sending Request...</span>
                </span>
              ) : (
                "Book Auditorium"
              )}
            </button>
            </form>
            <div style={{textAlign:'center', width:'100%' }}>
              {error && <div className="error-message"><br/>{error}</div>}
              {message && <div className="success-message"><br/>{message}</div>}
            </div>
          </div>
        </div>
        )}

    </>
  );
};

export default Booking;
