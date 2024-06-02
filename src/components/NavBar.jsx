import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi"; // Import the menu icon
import "./NavBar.scss";
import { RatingComponent } from "./RatingComponent.jsx";
export const NavBar = () => {
  const [isOpen, showMenu] = useState(false);
  const [user, setUser] = useState(false);
  let userImage = JSON.parse(localStorage.getItem("userData")).photo;
  const [type, setType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    setUser(JSON.parse(savedUser))
    setType(localStorage.getItem("type"))
  }, []);



  const handleLogout = () => {
    const confirmDelete = window.confirm(
      "Ești sigur că vrei să părăsești pagina?"
    );
    if (confirmDelete) {
      localStorage.clear();
      navigate("/");
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', function (event) {
        window.history.pushState(null, document.title, window.location.href);
      });
    }
  }

  const toggleMenu = () => {
    showMenu(!isOpen)
  }

  return (
    <nav className="NavBar">
      <div className="welcomeMessage">ProCoachConnect</div>
      <FiMenu className="toggleMenuIcon" onClick={toggleMenu} />
      <ul className={isOpen ? "open" : "closed"} style={type === 'coach' ? { top: "30px" } : {}}>
        <li>
          <NavLink className="navLink" to={type === 'user' ? "/utilizator" : "/antrenor"}>Acasă</NavLink>
        </li>
        <li>
          <NavLink className="navLink" to="/editareProfil">Editare Profil</NavLink>
        </li>
        <li>
          <button className="buttonLeave" onClick={handleLogout}>
            Delogare
          </button>
        </li>
        {
          user.uid !== undefined && (
            type === 'user' && type !== undefined ? (
              <div className="profilePicture">
                <img src={userImage} alt="Profile" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="profilePicture" style={{ width: "clamp(30px, 5vw, 60px)", height: "clamp(30px, 5vw, 60px)" }}>
                  <img src={userImage} alt="Profile" />
                </div>
                <RatingComponent coachIdU={user.uid} className="ratingComponent"
                />
              </div>
            )
          )
        }

      </ul>
    </nav >
  );
};
