import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";



const App = () => {
  return (
    <div >
      <AuthProvider>
        <Router>
          {/*<InterviewProvider>*/}
            <Routes>
              <Route path="/" element={<LandingPage />} />

            </Routes>
          {/*</InterviewProvider>*/}
        </Router>
      </AuthProvider>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />

    </div>
  );
};

export default App