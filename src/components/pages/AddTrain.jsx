import { StudentAgenda } from "../StudentAgenda.jsx"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { db } from "../../firebase.js";
import { getDoc, doc, collection, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { NavBar } from "../NavBar.jsx";
import './StudentHomePage.scss'
export const AddTrain = () => {
    const [userData, setUserData] = useState('');
    const [studentData, setStudentData] = useState('');
    const [user, setUser] = useState('');
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();
    const [check, setCheck] = useState(true);

    useEffect(() => {

        fetchUser();

    }, [])


    const fetchUser = async () => {
        const storedUser = localStorage.getItem("user");
        const storedStudentId = localStorage.getItem("studentId");
        let userAccountDoc = await getDoc(doc(db, "users", storedStudentId));
        let userData = userAccountDoc.data();
        setStudentData(userData);
        localStorage.setItem('studentData' + storedStudentId, JSON.stringify(userData));
        setUserData(userData);
    };


    const handleCheckboxChange = (e) => {
        setCheck(e.target.checked);
        localStorage.setItem('checked', e.target.checked);
    };

    return (
        <div className="studentHomePage">
            <div className="navBarStudentHomePage">
                <NavBar style={{ height: '70px' }} />
            </div>
            <div className="mainContainerStudentHomePage">
                <div className="secondContainerStudentHomePage">
                    <div className="mainCoachInformation">
                        <div className="secondCoachInformation">
                            <img className="coachPhotoLeft" src={studentData.photo}></img>
                            <div className="coachInformationRight">
                                <p className="coachName"> {studentData.name}</p>
                                <p className="coachTelephone">📞: {studentData.phoneNumber}</p>
                                <p className="coachTelephone">🏢: {studentData.gymName}</p>
                                <label className="label-inline">
                                    <input className="checkbox"
                                        type="checkbox"
                                        checked={check}
                                        style={{ width: '15px', height: '15px', margin: '9px' }}
                                        onChange={handleCheckboxChange}
                                    />
                                    <p className="copyEvents">sincronizare calendare </p>
                                </label>
                                <p className="infoMessageCoach">ℹ️ bifa pusă,acțiunea apare și în orarul propriu</p>
                            </div>
                        </div>
                    </div>
                    <StudentAgenda check={check} />
                </div>

            </div>
        </div>
    );
}
