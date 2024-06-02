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
export const DeleteCoachAdmin = () => {
    let [coachPhoto, setCoachPhoto] = useState("");
    let [coachName, setCoachName] = useState("");
    let [coachId, setCoachId] = useState("");
    let [coaches, setCoaches] = useState("")
    let [coachData, setCoachData] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        let storageCoachData = localStorage.getItem("coachData")
        let storageCoachId = localStorage.getItem('coachId')
        const storageCoaches = localStorage.getItem("coaches");

        setCoachData(JSON.parse(storageCoachData))
        if (storageCoaches) {
            setCoaches(JSON.parse(storageCoaches));
        }
        if (storageCoachId) {
            setCoachId(JSON.parse(storageCoachId));
        }

        setCoachPhoto(JSON.parse(storageCoachData).photo);

        setCoachName(JSON.parse(storageCoachData).name);


    }, []);

    const deleteCoach = async () => {
        if (coachData.actualNumberOfStudents > 0) {
            for (let i = 0; i < coachData.actualNumberOfStudents; ++i) {
                const studentRef = doc(db, "users", coachData.students[i]);
                const studentSnapshot = await getDoc(studentRef);
                const updatedRecurringEvents = studentSnapshot.data().recurringEvents.filter(event => event.type !== 'coach');
                await updateDoc(studentRef, {
                    coach: '',
                    recurringEvents: updatedRecurringEvents
                });
            }
        }

        const coachDocRef = doc(db, "coaches", coachId);
        await deleteDoc(coachDocRef);
        const filteredCoaches = coaches.filter(gym => gym.id !== coachId);
        localStorage.setItem('coaches', JSON.stringify(filteredCoaches));
        navigate("/cautaAntrenorAdmin");
    }

    return (
        <div className="gymAdmin">
            <div className="UKU">
                <img className="containerEditProfilePhotoL"
                    src={coachPhoto}
                />
                <h4>Numele antrenorului: {coachName}</h4>
                <button className="deleteGym" onClick={deleteCoach}>Șterge antrenor</button>
            </div>
        </div>
    );
}