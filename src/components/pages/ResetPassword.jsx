import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./ResetPassword.scss"
const auth = getAuth();

export const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("Link-ul de resetare a parolei a fost trimis.");
                })
                .catch((error) => {
                    console.error("Eroare la trimiterea emailului de resetare a parolei: ", error);
                    alert("Eroare: " + error.message);
                });
        } else {
            alert('Please enter your email address.');
        }
    };

    const handleCreateAccount = () => {
        navigate("/inregistrare");
    }

    return (
        <div className='resetPasswordContainer'>
            <div className='resetPassword'>
                <h1 className='resetPasswordTitle'>Resetare Parolă</h1>
                <input type="email" id="emailAdress" placeholder="Adresa de email" onChange={e => setEmail(e.target.value)} />
                <button className="resetButton" onClick={handleResetPassword}>Resetare Parolă</button>
                <Link to="/">login</Link>
                <button className="newUserButtonResetPassword" type="button" onClick={handleCreateAccount}>Crează-ți un cont</button>
            </div>
        </div>
    );
}