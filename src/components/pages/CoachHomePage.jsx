import { useEffect, useState } from "react";
import { NavBar } from "../NavBar.jsx";
import { db } from "../../firebase.js";
import "./CoachHomePage.scss"
import { Agenda } from "../Agenda.jsx"
import { useNavigate } from "react-router-dom";
import { doc, getDoc, arrayRemove, updateDoc, increment } from "firebase/firestore";

export const CoachHomePage = () => {
  const [gyms, setGyms] = useState([]);

  const [user, setUser] = useState("");
  const [userData, setUserData] = useState("");
  const [students, setStudents] = useState("");
  const [noStudentsMessage, setNoStudentsMessage] = useState("");
  const [performanceOfCoach, setPerformanceOfCoach] = useState(0.0);
  const navigate = useNavigate();


  useEffect(() => {
    fetchUserData();
  }, []);


  const fetchUserData = async () => {
    const storedUser = localStorage.getItem("user");
    const storedGyms = localStorage.getItem("gyms");
    const numberOfWorkouts = localStorage.getItem("numberOfWorkouts");
    if (storedGyms) {
      setGyms(JSON.parse(storedGyms));
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    let userAccountDoc = await getDoc(doc(db, "coaches", JSON.parse(storedUser).uid));
    let userData = userAccountDoc.data();
    setStudents(userData.students);
    localStorage.setItem('students', JSON.stringify(userData.students));
    localStorage.setItem('userData', JSON.stringify(userData));
    setUserData(userData);

    const performanceOfCoach = async () => {
      let userRatingAccountDoc = await getDoc(doc(db, "ratings", JSON.parse(storedUser).uid));
      let userRatingData = userRatingAccountDoc.data();
      const importance = {
        'studentsNumber': 0.35,
        'rating': 0.35,
        'trainingsNumber': 0.3,
      }
      const performanceIndex = (
        importance['studentsNumber'] * (Math.min(userData.actualNumberOfStudents / 20, 1) * 10) +
        importance['rating'] * (Math.min(userRatingData.rating / 5, 1) * 10) +
        importance['trainingsNumber'] * (Math.min(numberOfWorkouts / 54, 1) * 10)
      )
      setPerformanceOfCoach(performanceIndex.toFixed(1) * 10);
      updateDoc(doc(db, "coaches", JSON.parse(storedUser).uid), {
        performance: performanceIndex.toFixed(1) * 10,
      });
    }
    performanceOfCoach();
  };

  const handleDeleteGym = async (gymId) => {
    const deleteGym = window.confirm('Esti sigur ca vrei sa stergi sala?');
    if (deleteGym) {
      let updatedStudents = [];
      let numberOfdDeletesUsers = 0;

      let userAccountDoc = await getDoc(doc(db, "coaches", user.uid));
      let userData2 = userAccountDoc.data();
      localStorage.setItem('userData', JSON.stringify(userData2));

      if (userData2.students.length > 0) {
        for (let i = 0; i < userData2.students.length; ++i) {
          const studentRef = doc(db, "users", students[i]);
          const studentSnapshot = await getDoc(studentRef);
          let studentData = studentSnapshot.data();
          if (studentData.gymId === gymId) {
            //  if (studentData.coach !== '') {
            numberOfdDeletesUsers = numberOfdDeletesUsers + 1;
            //   }
            const updatedRecurringEvents = studentData.recurringEvents.filter(event => event.type !== 'coach');
            await updateDoc(studentRef, {
              coach: '',
              recurringEvents: updatedRecurringEvents
            });
          } else {
            updatedStudents.push(students[i]);
          }
        }
      }
      const gymRef1 = doc(db, "gyms", gymId);
      const docSnap = await getDoc(gymRef1);

      if (docSnap.exists()) {
        await updateDoc(gymRef1, {
          coaches: arrayRemove(user.uid),
        });
      }

      let updatedRecurringEvents;
      if (userData2.recurringEvents !== undefined) {
        updatedRecurringEvents = userData2.recurringEvents.filter(event =>
          event.userUid === user.uid || event.gymId !== gymId
        );
        const userRef = doc(db, "coaches", user.uid);
        await updateDoc(userRef, {
          gyms: arrayRemove(gymId),
          students: updatedStudents,
          recurringEvents: updatedRecurringEvents,
          actualNumberOfStudents: increment(-numberOfdDeletesUsers)
        });
      } else {
        const userRef = doc(db, "coaches", user.uid);
        await updateDoc(userRef, {
          gyms: arrayRemove(gymId),
          students: updatedStudents,
          actualNumberOfStudents: increment(-numberOfdDeletesUsers)
        });
      }
      localStorage.setItem("userData", JSON.stringify({ ...userData, students: updatedStudents, recurringEvents: updatedRecurringEvents }));
      setUserData({ ...userData, students: updatedStudents, recurringEvents: updatedRecurringEvents });
      setGyms((currentGyms) => {
        const updatedGyms = currentGyms.filter((gym) => gym.id !== gymId);
        localStorage.setItem("gyms", JSON.stringify(updatedGyms));
        return updatedGyms;
      });
    }
  };

  const handleAddGym = () => {
    navigate("/adaugaSala");
  }

  const handleSeeUsers = () => {
    navigate("/elevi");
  }

  useEffect(() => {
    if (userData.actualNumberOfStudents === 0) {
      const timeoutId = setTimeout(() => {
        setNoStudentsMessage(true);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userData.actualNumberOfStudents]);



  return (
    <div className="coachContainer">
      <div className="navBarCoach">
        <NavBar style={{ height: '70px' }} />
      </div>
      <div className="upContainer">
        <div className="secondUpContainer">
          {userData.actualNumberOfStudents !== 0 ? (<button className="seeStudents" onClick={() => handleSeeUsers()}>Vezi elevi🏃‍♀️🧍‍♂️🏋️‍♂️🤸‍♀️ </button>) : <p></p>}
          < p className="performance">INDICE PERFORMANȚĂ: {performanceOfCoach}%🔥</p>
        </div>
        <div className="secondDownContainer">
          <div className="gyms">
            {gyms.length > 0 ? (
              gyms.map((gym) => (
                <div className="gym" key={gym.id} >
                  <button className="deleteGym" onClick={() => handleDeleteGym(gym.id)}>X</button>
                  <img className="gymPhoto"
                    src={gym.photo}
                    alt={gym.name}
                  />
                  <p>{gym.name}</p>
                </div>
              ))
            ) : (
              <p className="noGyms">Adaugă sala la care dorești să activezi&nbsp;&nbsp;</p>
            )}
            {gyms.length < 3 ? <button className="addGymButton" onClick={() => handleAddGym()}>➕</button> : null}
          </div>
        </div>
      </div>
      <div className="downContainer">
        {gyms.length > 0 ? <Agenda className="agenda" /> : null}
      </div>
    </div>
  );
};
