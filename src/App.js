import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import DepartmentDashboard from "./pages/DepartmentDashboard"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


function App() {
  
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />  {/* Default Route */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/department-dashboard" element={<DepartmentDashboard />} />
        <Route path="/Booking" element={<Booking />} />
      </Routes>
    </Router>
  );
}

export default App;
