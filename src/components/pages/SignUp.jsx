import "./SignUp.scss";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../../firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const SignUp = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState("utilizator");
    const [name, setName] = useState("");
    const [maxnumberOfStudents, setMaxNumberOfStudents] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const photo = "https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/defaultPhoto.webp?alt=media&token=9c737020-94bf-4126-aa4a-3290c49bc723";
    const navigate = useNavigate();

    const handleSignUp = async e => {
        e.preventDefault();

        if (password !== verifyPassword) {
            setError("Parolele nu corespund.");
            return;
        }

        if (email.length === 0) {
            setError('Adauga adresa de email');
            return;
        }

        if (name.length < 3) {
            setError('Numele de utilizator trebuie să conțină minim 3 caractere.');
            return;
        }
        if (phoneNumber.length !== 10) {
            setError('Numărul de telefon introdus este invalid.');
            return;
        }
        if ((role === 'coach') && (isNaN(maxnumberOfStudents) || maxnumberOfStudents <= 0)) {
            setError('Numărul maxim de elevi trebuie să fie un număr valid.');
            return;
        }


        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            try {
                let dataBasecollection;
                if (role === "antrenor") {
                    dataBasecollection = "coaches";
                } else {
                    if (role === "utilizator") {
                        dataBasecollection = "users"
                    }
                }

                const userDocRef = doc(db, dataBasecollection, user.uid);
                if (role === "antrenor") {
                    await setDoc(userDocRef, {
                        email: user.email,
                        name: name,
                        photo: photo,
                        phoneNumber: phoneNumber,
                        actualNumberOfStudents: 0,
                        maxNumberOfStudents: maxnumberOfStudents,
                        gyms: [],
                        students: [],
                        performance: 0
                    });
                    const userCoachRatingRef = doc(db, "ratings", user.uid);
                    await setDoc(userCoachRatingRef, {
                        rating: 0,
                        numberOfRatings: 0,
                        sumOfRatings: 0,
                    });
                } else {
                    await setDoc(userDocRef, {
                        email: user.email,
                        name: name,
                        photo: photo,
                        coach: "",
                        phoneNumber: phoneNumber,
                        coachesHistory: {}
                    });
                }
            } catch (e) {
                console.error("Error adding document: ", e);
            }

            navigate("/");

        } catch (error) {
            console.error("Error during sign up: ", error);
            if (error.code === 'auth/email-already-in-use') {
                setError("Adresa de email este deja utilizată. Te rog să folosești o adresă diferită.");
            } else {
                setError("A apărut o eroare la înregistrare. Te rog să încerci din nou.");
            }
        }
    };

    return (
        <div className="containerSignUp">
            <form className="signUp" onSubmit={handleSignUp}>
                <h1 className="title">Sign up</h1>
                <h2>Este rapid și ușor.</h2>
                <input type="email" placeholder="Adresa de email" onChange={e => setEmail(e.target.value)} />
                <input type="text" placeholder="Nume utilizator" onChange={e => setName(e.target.value)} />
                <input type="text" placeholder="Număr telefon" onChange={e => setPhoneNumber(e.target.value)} />
                <select onChange={e => setRole(e.target.value)} required>
                    <option value="utilizator">UTILIZATOR</option>
                    <option value="antrenor">ANTRENOR</option>
                </select>
                {role === "antrenor" ? (
                    <div className="studentsNumber">
                        <input className="studentsNumberInput" type="text" placeholder="Numar maxim elevi" onChange={e => setMaxNumberOfStudents(e.target.value)} />
                    </div>
                ) : ("")}
                <input type="password" id="password" placeholder="Parola" onChange={e => setPassword(e.target.value)} />
                <input type="password" id="verifyPassword" placeholder="Parola" onChange={e => setVerifyPassword(e.target.value)} />
                {error && <span className="errorMessage">{error}</span>}
                <button className="signUpButton" type="submit">Înscrie-te</button>
            </form>
        </div>
    );
}