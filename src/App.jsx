import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthProvider"; 
import PrivateRoute from "./PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Events from "./components/Events";
import Calendar from "./components/Calendar";
import AllEvents from "./components/AllEvents";
import ExportEvents from "./components/ExportEvents";

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/events" />} />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-events"
          element={
            <PrivateRoute>
              <AllEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/export"
          element={
            <PrivateRoute>
              <ExportEvents />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
