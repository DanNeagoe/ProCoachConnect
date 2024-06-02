import "./AddGym.scss"
import { db, app } from "../../firebase.js";
import { doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getDoc, arrayRemove, updateDoc, increment } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
//import * as admin from 'firebase-admin';
//import { createRequire } from 'node:module';
//import admin from 'firebase-admin';
//import firebase from "./default-namespace";
//import admin from 'firebase-admin';
export const DeleteUserAdmin = () => {
    let [coachPhoto, setCoachPhoto] = useState("");
    let [coachName, setCoachName] = useState("");
    let [coachId, setCoachId] = useState("");
    let [users, setUsers] = useState("")
    let [coachData, setCoachData] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        let storageUserData = localStorage.getItem("userData")
        let storageUserId = localStorage.getItem('userId')
        const storageCoaches = localStorage.getItem("usersAdmin");

        setCoachData(JSON.parse(storageUserData))
        if (storageCoaches) {
            setUsers(JSON.parse(storageCoaches));
        }
        if (storageUserId) {
            setCoachId(JSON.parse(storageUserId));
        }

        setCoachPhoto(JSON.parse(storageUserData).photo);

        setCoachName(JSON.parse(storageUserData).name);


    }, []);

    const deleteUser = async () => {

        const coachDocRef = doc(db, "users", coachId);
        await deleteDoc(coachDocRef);
        const filteredUsers = users.filter(gym => gym.id !== coachId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        navigate("/cautaUtilizatorAdmin");
    }

    return (
        <div className="gymAdmin">
            <div className="UKU">
                <img className="containerEditProfilePhotoL"
                    src={coachPhoto}
                />
                <h4>Numele utilizatorului: {coachName}</h4>
                <button className="deleteGym" onClick={deleteUser}>Șterge utilizator</button>
            </div>
        </div>
    );
}