import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "react-calendar/dist/Calendar.css"; 
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import interactionPlugin from "@fullcalendar/interaction"; 
import { ClipLoader } from "react-spinners";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BeatLoader } from "react-spinners";



const Dashboard = () => {
  const [userRole, setUserRole] = useState('');
  const [userID, setuserID] = useState('');
  const [userName, setuserName] = useState('');
  const [UserMongoId, setUserMongoId] = useState('');
  const [isAdmin, setisAdmin] = useState('');
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState([]);
  const [date] = useState(new Date());
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("booked");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompModal, setshowCompModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    time: "",
    department: "",
  });
   const [isBookingLoading, setIsBookingLoading] = useState(false);






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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("https://auditorium-api.iiitkota.ac.in/api/auth/me", {
          withCredentials: true, 
        });
        const userData = response.data;
  
        setUserRole(userData.role);
        setuserID(userData.userID);
        setuserName(userData.name);
        setisAdmin(userData.role === "admin");
        setUserMongoId(userData._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login"); 
      }
    };
  
    fetchUser();
  }, []); 
  
          
  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://auditorium-api.iiitkota.ac.in/api/events/events', {
        withCredentials: true, 
      });
  
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };
  

  useEffect(() => {
    fetchEvents();
  }, []);


  const eventsForSelectedDate = (Array.isArray(events) ? events : []).filter(event => 
    new Date(event.date).toDateString() === date.toDateString()
  );
  


  const handleLogout = async () => {
    try {
        await axios.post("https://auditorium-api.iiitkota.ac.in/api/auth/logout", {}, {
            withCredentials: true,
        });

        console.log("User logged out");

        
        console.log("Cookies after logout:", document.cookie);

       
        window.location.href = "/login";
    } catch (error) {
        console.error("Error during logout:", error);
    }
};


  

  const handleAction = async (eventId, action) => {
    if (!isAdmin) {
      alert("Unauthorized Access!");
      return;
    }

    // console.log("handleAction started for:", eventId, "Action:", action);
     setIsBookingLoading(true);
    setLoading(true);
    const url = `https://auditorium-api.iiitkota.ac.in/api/events/${action}/${eventId}`;

    try {
      // console.log("Sending request to:", url);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      // console.log("Response data:", data);

      if (response.ok) {
        alert(`Event ${action} successfully!`);
        fetchEvents();
      } else {
        alert(`Failed to ${action} event: ${data.message}`);
      }
    } catch (error) {
      // console.error(" Error:", error);
      alert("Something went wrong!", );
      console.log("error:" , error)
    } finally {
      console.log("✅ Resetting loading state");
      setIsBookingLoading(false);
      setLoading(false);
    }
};


useEffect(() => {
  // console.log(" Resetting loading state on component update");
  setLoading(false);
}, []);

  
  const filteredEvents = (Array.isArray(events) ? events : []).filter((event) => {
    if (selectedTab === "booked") {
      return event.status === "Approved";
    }
    if (selectedTab === "pending") {
      return isAdmin
      ? event.status === "Pending"
      : event.status === "Pending" && event.bookedBy?.toString() === UserMongoId;
    }
    if (selectedTab === "rejected") {
      return isAdmin
      ? event.status === "Rejected" 
      : event.status === "Rejected" && event.bookedBy?.toString() === UserMongoId;
    }
    return true;
  });

  const safeEvents = Array.isArray(events) ? events : [];

  const approvedEvents = Array.isArray(events)
  ? events.filter(event => event.status === "Approved")
  : [];


  const myPendingEvents = UserMongoId
  ? safeEvents.filter(
      (event) =>
        event.status === "Pending" &&
      (isAdmin || event.bookedBy?.toString() === UserMongoId)
    )
  : [];

const myRejectedEvents = UserMongoId
  ? safeEvents.filter(
      (event) =>
        event.status === "Rejected" &&
      (isAdmin || event.bookedBy?.toString() === UserMongoId)
    )
  : [];


  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
  };


  const eventsOnSelectedDate = selectedDate
  ? events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split("T")[0];
      return eventDate === selectedDate && event.status === "Approved";
    })
  : [];


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
      <div className="dashboard">
        {/* Overlay Loader */}
      {isBookingLoading && (
        <div className="whenactiondashboard">
          <BeatLoader size={25} color="#fff" />
        </div>
      )}
        <div className="top-bar">
        <span>  <FontAwesomeIcon icon={faUser} /> ({userName})</span>
        {/* <h2>{userRole === "admin" ? "Admin Dashboard" : "Student Dashboard"}</h2> */}
<h2 className="fs-4 fs-md-3 fs-lg-2">
  {userRole === "admin"
    ? "Admin Dashboard"
    : userRole === "department"
    ? "Department Dashboard"
    : "Student Dashboard"}
</h2>

        <button onClick={handleLogout} className="btn btn-outline-light ">Logout</button>
        </div>

        <div className="main-content">
          <div className="events-section">
            <div className="tab-panel">
              <button
                className={selectedTab === "booked" ? "active" : ""}
                onClick={() => setSelectedTab("booked")}
              >
                Booked
              </button>


              {(isAdmin || myPendingEvents.length > 0) && (
                <button
                  className={selectedTab === "pending" ? "active" : ""}
                  onClick={() => setSelectedTab("pending")}
                >
                  Pending
                </button>
              )}

              {(isAdmin || myRejectedEvents.length > 0) && (
                <button
                  className={selectedTab === "rejected" ? "active" : ""}
                  onClick={() => setSelectedTab("rejected")}
                >
                  Rejected
                </button>
              )}

              {userRole === "department" && (
             
             <Link to="/department-dashboard">
               <button className="active" >
                 Go to Request Panel
               </button>
             </Link>         
               )}
            </div>

            
            <h3>📌 {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Events</h3>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <p>📅 {event.date} | ⏰ {event.time}</p>
                    <p>Status: <b>{event.status}</b></p>
                  </div>
                  {isAdmin && (
                    <div className="event-actions">
                      {event.status === "Pending" && (
                        <>
                          <button
                            className="accept-btn"
                            onClick={() => handleAction(event._id, "approve")}
                            disabled={loading}
                          >
                            Accept
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleAction(event._id, "reject")}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {event.status === "Approved" && (
                        <button
                          className="reject-btn"
                          onClick={() => handleAction(event._id, "reject")}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      )}
                      {event.status === "Rejected" && (
                        <button
                          className="accept-btn"
                          onClick={() => handleAction(event._id, "approve")}
                          disabled={loading}
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  )}


      <button className="accept-btn" onClick={() => {
        setSelectedEvent(event);
        setshowCompModal(true);
      }}>
        Open
      </button>
                </div>
            ))
           
            ) : (
              <p>No {selectedTab} events.</p>
            )}
            {/* complaint modal start */}
            {showCompModal && selectedEvent && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000
                }}
                onClick={() => setshowCompModal(false)}
              >
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    minWidth: "500px"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
            <div className="modal-body position-relative">
              <button 
                className="btn-close position-absolute top-0 end-0 m-2" 
                onClick={() => setshowCompModal(false)}
              ></button>

              <h5 className="mb-3 text-center">
              <strong>📌 Event:</strong> {selectedEvent.title}
            </h5>
              <p><strong>📅 Date:</strong> {selectedEvent.date}</p>
              <p><strong>⏰ Time:</strong> {selectedEvent.time}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`badge ms-2 ${
                  selectedEvent.status === "Approved" 
                    ? "bg-success" 
                    : selectedEvent.status === "Rejected" 
                      ? "bg-danger" 
                      : "bg-warning text-dark"
                }`}>
                  {selectedEvent.status}
                </span>
              </p>
              <p>
                <strong>Requested Department:</strong> 
                <span className="badge bg-info">{selectedEvent.requestedDepartment}</span>
              </p>
              <p>
                <strong>Department Approval:</strong> 
                <span 
                  className={`badge ms-2 ${
                    selectedEvent.status === "Approved" 
                      ? "bg-success" 
                      : selectedEvent.status === "Rejected" 
                        ? "bg-danger" 
                        : "bg-warning text-dark"
                  }`}>
                  {selectedEvent.departmentApproval}
                </span>
              </p>
            </div>

                </div>
              </div>
            )}
            {/* complaint modal end */}
                      </div>

                      <div className="calendar-section">
                        <h3>📅 Event Calendar</h3>
                        <div className="calendar-container">
                          <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={approvedEvents}
                            eventColor="#0E407C"
                            dateClick={handleDateClick}
                          />
                        </div>
                        <Link to="/Booking">
                          <button className="book-event-button">📅 Book Event </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

        {/* modal start*/}


            {showModal && (
            <div className="modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
              }}
              onClick={() => setShowModal(false)}
            >
            <div
            style={{
              position: "relative",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              minWidth: "300px"
            }}
            onClick={(e) => e.stopPropagation()}
            >
            {/* <button
                    onClick={() => setShowModal(false)}
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "none",
                      border: "none",
                      borderRadius:"50%",
                      fontSize: "20px",
                      cursor: "pointer",
                      color:"red",
                  
                    }}
                    aria-label="Close"
                  >
                    &times;
                    <FontAwesomeIcon icon={faTimes} />
                  </button> */}
            <h3>Book Auditorium on {selectedDate}</h3>

            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <p>📅 {event.date} | ⏰ {event.time}</p>
                    <p>Status: <b>{event.status}</b></p>
                  </div>

                </div>
              ))
            ) : (<>
                        <p>No events on this date.</p>
            <Link to="/Booking">
                          <button className="book-event-button">📅 Book Event </button>
                        </Link>
            </>
              
            )}

            
              {/* <button onClick={() => setShowModal(false)}>Close</button> */}
              
            </div>
            </div>
            )}
        {/* modal end */}
    </>
  );
};

export default Dashboard;
