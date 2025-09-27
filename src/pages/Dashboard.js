import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from "react-spinners";
import { BeatLoader } from "react-spinners";

const DepartmentDashboard = () => {
  const [userID, setuserID] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Approved");
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
   
  if (userData.role !== "department") {
      window.location.href = "/login";
      return;
    }
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
    if (selectedTab === "Approved") return event.departmentApproval === "Approved";
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
         <div className="container-fluid py-3">
          {/* Overlay Loader */}
      {isBookingLoading && (
        <div className="whenactiondashboard">
          <BeatLoader size={25} color="#fff" />
        </div>
      )}
      <nav className="navbar navbar-expand bg-primary navbar-dark shadow-sm rounded px-3">
        <div className="container-fluid">
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            <span className="d-none d-sm-inline">(ID: {userID})</span>
          </Link>

          <span className="navbar-text text-white mx-auto text-center fw-bold">
            Department Dashboard <br className="d-sm-none" />
            <small className="d-none d-sm-inline">{userDepartment}</small>
          </span>

      <button
        onClick={handleLogout}
        className="btn btn-outline-light btn-sm ms-auto d-flex align-items-center px-2 py-1"
        style={{ fontSize: "12px" }}
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
        <span className="d-none d-sm-inline">Logout</span>
      </button>

        </div>
      </nav>





      <br/>
      <h3>📌 {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Events</h3>

      <div className="tab-panel row g-2 my-4 justify-content-center">
        <div className="col-12 col-md-auto mb-2 mb-md-0 d-flex flex-wrap gap-2 justify-content-center">
          <button
            className={`btn btn-outline-primary ${selectedTab === "Approved" ? "active" : ""}`}
            onClick={() => setSelectedTab("Approved")}
          >
            Approved
          </button>
          <button
            className={`btn btn-outline-warning ${selectedTab === "pending" ? "active" : ""}`}
            onClick={() => setSelectedTab("pending")}
          >
            Pending
          </button>
          <button
            className={`btn btn-outline-danger ${selectedTab === "rejected" ? "active" : ""}`}
            onClick={() => setSelectedTab("rejected")}
          >
            Rejected
          </button>
          {userRole === "department" && (
            <Link to="/dashboard">
              <button className="btn btn-outline-secondary">
                Go to All Event Panel
              </button>
            </Link>
          )}
        </div>
      </div>


      {events.length === 0 ? (
  <p className="alert alert-primary text-center fw-bold"><b>No requests yet for your department.</b></p>
) : (
  
filteredEvents.map((event) => (
  <div
    key={event._id}
   className="row align-items-center fw-bold bg-light py-3 px-2 mb-3 border rounded shadow-sm gx-2 gy-2"
  style={{ margin: "20px 0" }}
  >
    <h4 className="col-12 col-md-2 mb-2 mb-md-0 text-center text-md-start">{event.title}</h4>
    <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start gap-3 mb-2 mb-md-0">
      <p className="mb-1">📅 {event.date}</p>
      <p className="mb-0">⏰ {event.time}</p>
    </div>

<div className="col-12 col-md-4 d-flex flex-column flex-md-row align-items-center align-items-md-start justify-content-center justify-content-md-start mb-2 mb-md-0">
  <p className="mb-0 me-md-3 me-lg-4">
    Admin Status:{" "}
    <span className="badge bg-info text-dark">{event.status}</span>
  </p>
  <p className="mb-0">
    Department Status:{" "}
    <span
      className={`badge ${
        event.departmentApproval === "Approved"
          ? "bg-success"
          : event.departmentApproval === "Rejected"
          ? "bg-danger"
          : "bg-warning text-dark"
      }`}
    >
      {event.departmentApproval}
    </span>
  </p>
</div>


    <div className="col-12 col-md-1 d-flex flex-wrap gap-2 justify-content-center justify-content-md-end mt-2 mt-md-0">
      {/* Buttons as direct col child */}
      {event.departmentApproval === "Pending" && (
        <>
          <button
            className="accept-btn btn btn-success btn-sm w-10 w-md-auto"
            onClick={() => handleAction(event._id, "department-approve")}
            disabled={loading}
          >
            Approve
          </button>
          <button
            className="reject-btn btn btn-danger btn-sm w-10 w-md-auto"
            onClick={() => handleAction(event._id, "department-reject")}
            disabled={loading}
          >
            Reject
          </button>
        </>
      )}
      {event.departmentApproval === "Approved" && (
        <button
          className="reject-btn btn btn-danger btn-sm w-10 w-md-auto"
          onClick={() => handleAction(event._id, "department-reject")}
          disabled={loading}
        >
          Reject
        </button>
      )}
      {event.departmentApproval === "Rejected" && (
        <button
          className="accept-btn btn btn-success btn-sm w-10 w-md-auto"
          onClick={() => handleAction(event._id, "department-approve")}
          disabled={loading}
        >
          Approve
        </button>
      )}
    </div>
  </div>
))

)}
    </div> 
    )}

    
    </>
  );
};

export default DepartmentDashboard;
