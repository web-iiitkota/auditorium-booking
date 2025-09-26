import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from "react-spinners";
import { BeatLoader } from "react-spinners";

const DepartmentDashboard = () => {
  const [userID, setuserID] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState("booked");
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();
  const [userDepartment, setUserDepartment] = useState("");
  const [loading, setLoading] = useState(false);
   const [isBookingLoading, setIsBookingLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
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
        setIsLoading(false);
        setLoading(false); 
      }
    };

    checkAuth();
  }, [navigate]);
  

  useEffect(() => {
    fetchUser(); 
  }, []);
  


  const fetchUser = async () => {
    try {
      const response = await axios.get("https://auditorium-api.iiitkota.ac.in/api/auth/me", {
        withCredentials: true,
      });
  
      const userData = response.data;
   

      setUserRole(userData.role);
      setuserID(userData.userID);
      setUserDepartment(userData.email);
      fetchEvents(userData.email); 
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      window.location.href = "/login";
    }
  };
  
  // useEffect(() => {
  //   if (userDepartment) {
  //     fetchEvents();
  //   }
  // }, [userDepartment]);

  const fetchEvents = async (departmentEmail) => {
    try {
      const response = await axios.get('https://auditorium-api.iiitkota.ac.in/api/events/events', {
        withCredentials: true, 
      });

      const filteredEvents = response.data.filter(
        (event) =>
          // event.requestedDepartment?.trim().toLowerCase() ===
          // departmentEmail?.trim().toLowerCase()
          event.requestedDepartment === departmentEmail
      );

      setEvents(filteredEvents); 
    } catch (error) {
      // console.error('Error fetching events:', error);
    }
  };




  const handleAction = async (eventId, action) => {
     setIsBookingLoading(true);
    setLoading(true);
    try {
      await axios.put(
        `https://auditorium-api.iiitkota.ac.in/api/events/${action}/${eventId}`,
        {},
        { withCredentials: true }
      );
      fetchEvents(userDepartment); 
    } catch (err) {
      console.error(`Failed to ${action} event:`, err);
    }
    setIsBookingLoading(false);
    setLoading(false);
  };


  const handleLogout = async () => {
    try {
      await axios.post("https://auditorium-api.iiitkota.ac.in/api/auth/logout", {}, {
        withCredentials: true, 
      });

      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };


  const filteredEvents = events.filter((event) => {
    if (selectedTab === "booked") return event.departmentApproval === "Approved";
    if (selectedTab === "pending") return event.departmentApproval === "Pending";
    if (selectedTab === "rejected") return event.departmentApproval === "Rejected";
    return true;
  });

  return (
    <>
     {isLoading ? (
        <div className="loader" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <ClipLoader color={"#276afb"} loading={isLoading} size={150} />
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
      <Link to="/dashboard" className="text-white text-decoration-none">
                    <FontAwesomeIcon icon={faUser} /> (ID: {userID})
      </Link>
        <h2>Department Dashboard - {userDepartment}
         
        </h2>

        <button onClick={handleLogout} className="btn btn-outline-light ">Logout</button>
      </div>

      <br/>
      <h3>📌 {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Events</h3>

      <div className="tab-panel">
                  <button
                    className={selectedTab === "booked" ? "active" : ""}
                    onClick={() => setSelectedTab("booked")}
                  >
                    Booked
                  </button>
                  <button
                    className={selectedTab === "pending" ? "active" : ""}
                    onClick={() => setSelectedTab("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={selectedTab === "rejected" ? "active" : ""}
                    onClick={() => setSelectedTab("rejected")}
                  >
                    Rejected
                  </button>
                  {userRole === "department" && (
                   
                <Link to="/dashboard">
                  <button className="active" >
                    Go to All Event Panel
                  </button>
                </Link>
      
             
                  )}
      </div>


      {events.length === 0 ? (
  <p className="alert alert-primary text-center"><b>No requests yet for your department.</b></p>
) : (
  
  filteredEvents.map((event) => (
    <div key={event._id} className="event-card row fw-bold bg-light py-2 border-bottom" style={{margin:"20px", display:"flex"}}>
     <h4 >{event.title}</h4>
     <p className="col-2">📅 {event.date}</p>
     <p className="col-2">⏰ {event.time}</p>
      <p className="col-2">Admin Status: {event.status}</p>
      <p className="col-2">Department Status: {event.departmentApproval}</p>


      {/*  Show Approve/Reject Buttons only if departmentApproval is "Pending" */}
      {event.departmentApproval === "Pending" && (
        <div className="col-2 ">
          <button
            className="accept-btn"
            onClick={() => handleAction(event._id, "department-approve")}
            disabled={loading}
          >
            Approve
          </button>{" "}
          <button
            className="reject-btn"
            onClick={() => handleAction(event._id, "department-reject")}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}

      {/*  If already approved by department, show only Reject */}
      {event.departmentApproval === "Approved" && (
        <div className="col-2">
          <button
            className="reject-btn"
            onClick={() => handleAction(event._id, "department-reject")}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}

      {/* If already rejected, show only Approve */}
      {event.departmentApproval === "Rejected" && (
        <div className="col-2">
          <button
            className="accept-btn"
            onClick={() => handleAction(event._id, "department-approve")}
            disabled={loading}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  ))
)}

    </div> 
    )}

    
    </>
  );
};

export default DepartmentDashboard;
