import "./Login.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../../firebase.js";
import { getDoc, doc, collection, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
export const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(false);
        localStorage.clear();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            localStorage.setItem('user', JSON.stringify(userCredential.user));
            let userAccountDoc = await getDoc(doc(db, "users", uid));
            if (userAccountDoc.exists()) {
                let userData = userAccountDoc.data();
                localStorage.setItem('userData', JSON.stringify(userData));
                if (userData.coach !== "") {
                    let coachDocRef = doc(db, "coaches", userData.coach);
                    let coachDoc = await getDoc(coachDocRef);

                    if (coachDoc.exists()) {

                        localStorage.setItem('coachData', JSON.stringify(coachDoc.data()));
                    } else {

                        updateDoc(doc(db, "users", uid), {
                            coach: ""
                        });
                        localStorage.setItem('coachId', "");
                    }
                } else {
                    if (userData.recurringEvents !== undefined) {
                        const updatedRecurringEventsStudent = userData.recurringEvents.filter((event) => event.type !== "coach");
                        userData.recurringEvents = updatedRecurringEventsStudent;
                        updateDoc(doc(db, "users", uid), {
                            recurringEvents: updatedRecurringEventsStudent,
                        });
                        localStorage.setItem("userData", JSON.stringify(userData))
                    }
                }
                localStorage.setItem('type', "user")
                navigate("/utilizator")
                return;
            } else {
                let adminAccountDoc = await getDoc(doc(db, "admins", uid));
                if (adminAccountDoc.exists()) {
                    const gymsRef = collection(db, `gyms`);
                    const gymsSnapshot = await getDocs(gymsRef);
                    let gyms = [];
                    gymsSnapshot.forEach(docSnap => {
                        if (docSnap.exists()) {
                            gyms.push({ id: docSnap.id, ...docSnap.data() });
                        }
                    });
                    localStorage.setItem('gymsAdmin', JSON.stringify(gyms));
                    const usersRef = collection(db, `users`);
                    const usersSnapshot = await getDocs(usersRef);
                    let users = [];
                    usersSnapshot.forEach(docSnap => {
                        if (docSnap.exists()) {
                            users.push({ id: docSnap.id, ...docSnap.data() });
                        }
                    });
                    localStorage.setItem('usersAdmin', JSON.stringify(users));
                    const coachesRef = collection(db, `coaches`);
                    const coachesSnapshot = await getDocs(coachesRef);
                    let coaches = [];
                    coachesSnapshot.forEach(docSnap => {
                        if (docSnap.exists()) {
                            coaches.push({ id: docSnap.id, ...docSnap.data() });
                        }
                    });
                    localStorage.setItem('coachesAdmin', JSON.stringify(coaches));
                    localStorage.setItem('type', 'admin');
                    navigate("/admin");
                } else {
                    let coachAccountDoc = await getDoc(doc(db, "coaches", uid));
                    if (coachAccountDoc.exists()) {
                        let userData = coachAccountDoc.data();
                        localStorage.setItem('userData', JSON.stringify(userData));

                        let gyms = [];
                        for (let i = 0; i < userData.gyms.length; ++i) {
                            let gymId = userData.gyms[i];
                            const gymsRef = doc(db, "gyms", gymId);
                            const coachSnapshot = await getDoc(gymsRef); // Corrected to fetch single document
                            if (coachSnapshot.exists()) {
                                gyms.push({ id: coachSnapshot.id, ...coachSnapshot.data() }); // Directly push to array
                            } else {

                                updateDoc(doc(db, "coaches", uid), {
                                    gyms: arrayRemove(gymId)
                                });
                            }
                        }
                        localStorage.setItem("gyms", JSON.stringify(gyms))
                        localStorage.setItem('type', "coach")
                        navigate("/antrenor");
                        return;

                    }
                }
            }
            setError(true);
        } catch (error) {
            let errorMessage = 'Adresa de email sau parola sunt greșite';
            setError(errorMessage);
        }
    };

    const handleCreateAccount = () => {
        navigate("/inregistrare");
    }

    return (
        <div className="loginContainer">
            <form className="login" onSubmit={handleLogin}>
                <h1 className="name">ProCoachConnect</h1>
                <input type="email" id="emailAdress" placeholder="Adresa de email" onChange={e => setEmail(e.target.value)} />
                <input type="password" id="password" placeholder="Parola" onChange={e => setPassword(e.target.value)} />
                {error && <span className="errorMessageLogin">{error}</span>}
                <button className="loginButton" type="submit">Conectează-te</button>
                <button className="newUserButton" type="button" onClick={handleCreateAccount}>Crează-ți un cont</button>
                <Link className="resetPasswordLink" to="/resetareParola">Ai uitat parola?</Link>
            </form>
        </div>
    );
}
