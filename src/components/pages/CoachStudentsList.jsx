import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CoachStudentsList.scss"
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { NavBar } from "../NavBar.jsx";
import { db } from "../../firebase.js";
export const CoachStudentsList = () => {

    const [userData, setUserData] = useState('');
    const [user, setUser] = useState('');
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchStudents = async () => {
            let userAccountDoc = await getDoc(doc(db, "coaches", JSON.parse(storedUser).uid));
            let userData = userAccountDoc.data();
            localStorage.setItem('userData', JSON.stringify(userData));
            setUserData(userData);
            let students = [];
            if (userData && userData.students && userData.students.length !== 0) {
                for (let i = 0; i < userData.students.length; ++i) {
                    let studentId = userData.students[i];
                    const studentRef = doc(db, "users", studentId);
                    const studentSnapshot = await getDoc(studentRef);
                    if (studentSnapshot.exists()) {
                        students.push({ id: studentSnapshot.id, ...studentSnapshot.data() });
                    }
                }
                setStudents(JSON.stringify(students));
            }
            setStudents(students);
        }
        fetchStudents();

    }, [])


    const handleAddTrain = (student, studentId) => {
        localStorage.setItem('studentId', studentId)
        localStorage.setItem('studentData' + studentId, JSON.stringify(student))
        navigate("/adaugaAntrenament");
    }

    const handleDeleteUser = async (student, studentId) => {
        const deleteStudents = window.confirm('Esti sigur ca vrei sa stergi utilizatorul?');
        if (deleteStudents) {
            let userRef = doc(db, "users", studentId);
            let coachRef = doc(db, "coaches", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.data().recurringEvents !== undefined) {
                const updatedRecurringEvents = docSnap.data().recurringEvents.filter(event => event.type !== 'coach');
                if (docSnap.exists()) {
                    await updateDoc(userRef, {
                        coach: "",
                        recurringEvents: updatedRecurringEvents
                    });
                }
            } else {

                if (docSnap.exists()) {
                    await updateDoc(userRef, {
                        coach: "",
                    });
                }
            }

            const coachSnap = await getDoc(coachRef);
            if (coachSnap.exists()) {
                let studentsCheck = coachSnap.data().students;
                if (studentsCheck.includes(studentId)) {
                    const updatedStudents = students.filter(s => s.id !== studentId);
                    if (userData.recurringEvents !== undefined) {
                        const updatedRecurringEvents = userData.recurringEvents.filter(event => event.userUid !== studentId);

                        localStorage.setItem("students", JSON.stringify(updatedStudents));
                        localStorage.setItem("userData", JSON.stringify({ ...userData, students: updatedStudents, recurringEvents: updatedRecurringEvents }));
                        setStudents(updatedStudents);

                        await updateDoc(coachRef, {
                            students: updatedStudents.map(student => student.id),
                            recurringEvents: updatedRecurringEvents,
                            actualNumberOfStudents: increment(-1)
                        });
                    } else {

                        localStorage.setItem("students", JSON.stringify(updatedStudents));
                        localStorage.setItem("userData", JSON.stringify({ ...userData, students: updatedStudents }))

                        await updateDoc(coachRef, {
                            students: updatedStudents.map(student => student.id),
                            actualNumberOfStudents: increment(-1)
                        });
                    }
                } else {
                    const updatedRecurringEvents = userData.recurringEvents.filter(event => event.userUid !== studentId);
                    const updatedStudents = students.filter(s => s.id !== studentId);
                    localStorage.setItem("students", JSON.stringify(updatedStudents));
                    localStorage.setItem("userData", JSON.stringify({ ...userData, students: updatedStudents, recurringEvents: updatedRecurringEvents }));
                    setStudents(updatedStudents);
                }
            }
        }
    }

    return (
        <div className="contentGu">
            <div className="navBarR">
                <NavBar className="navBarStudents" />
            </div>
            <div className="contentF">
                {students.length > 0 ? (
                    students.map((student) => (
                        <div key={student.id} className="studentsContent">
                            <button className="deleteUser" onClick={() => handleDeleteUser(student, student.id)}>❌</button>
                            <img src={student.photo} className="studentsPhoto" alt={student.name} style={{ width: '100px', height: '100px' }} />
                            <p>{student.name}</p>
                            <p>📞{student.phoneNumber}</p>
                            <p>GYM🏢:{student.gymName}</p>
                            <button className="addTrainButton" onClick={() => handleAddTrain(student, student.id)}>Adaugă antrenament</button>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    )
}