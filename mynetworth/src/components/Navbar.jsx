// Import all necessary files

import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FaArrowRight } from "react-icons/fa";

export const Navbar = () => {
  const navigate = useNavigate(); // Hook for navigating between pages

  return (
    <nav className="navbar">
      {/* Navbar */}
      {/* Back Button */}
      {/* Navbar Links and Day-Night Toggle */}
      <div className="navbar-left">
        <div id="logo-container">
          <p id="logo-text">MyNetworth</p>
        </div>
      </div>
      <div className="navbar-right">
        <ul className="navbar-links">
          {/* Navigation to Home */}
          <li>
            <button onClick={() => navigate("/home")}>Sign Up</button>
          </li>
          {/* Navigation to About Us */}
          <li>
            <button onClick={() => navigate("/about-us")}>Log In</button>
          </li>
          {/* Navigation to FAQ */}
          <li>
            <button onClick={() => navigate("/faq")}>
              Get Started <FaArrowRight size={20} />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
