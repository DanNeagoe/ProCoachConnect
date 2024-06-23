import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from "../../firebase.js";
import { useNavigate } from "react-router-dom";
import { increment } from 'firebase/firestore';
import { RatingComponent } from '../RatingComponent.jsx'
import "./GymCoachesList.scss"
import { NavBar } from "../NavBar.jsx";

export const GymCoachesList = () => {

  let [user, setUser] = useState("");
  let gymId = JSON.parse(localStorage.getItem("gymId"));
  let [coaches, setCoaches] = useState("");
  let [userData, setUserData] = useState("");
  let [gymData, setGymData] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const storedGymId = JSON.parse(localStorage.getItem("gymId"));
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user);
    const gymDocRef = doc(db, "gyms", storedGymId);
    let gymAccountDoc = await getDoc(gymDocRef);
    if (gymAccountDoc.exists()) {
      let gymData = gymAccountDoc.data();
      localStorage.setItem('gymData', JSON.stringify(gymData));
      setGymData(gymData);
      await fetchCoaches(gymData);
    }
  };

  const fetchCoaches = async (gymData) => {
    if (gymData && gymData.coaches) {
      const coachPromises = gymData.coaches.map(coachId => {
        const coachRef = doc(db, "coaches", coachId);
        return getDoc(coachRef);
      });

      const coachSnapshots = await Promise.all(coachPromises);

      const coaches = coachSnapshots.map((coachSnapshot) => {
        if (coachSnapshot.exists()) {
          return { id: coachSnapshot.id, ...coachSnapshot.data() };
        } else {

          return null;
        }
      }).filter(coach => coach !== null);

      setCoaches(coaches);
    }
  }

  const addCoach = async (coachId) => {

    const coachDocRef = doc(db, "coaches", coachId);
    let coachAccountDoc = await getDoc(coachDocRef);
    let coachData = coachAccountDoc.data();
    let addCoach = true;
    console.log(coachData.actualNumberOfStudents + "OOOOOOOOOO" + coachData.maxNumberOfStudents);
    if (!coachData.gyms.includes(gymId)) {
      alert("Din pacate antrenorul tocmai ce a parasit sala");
      addCoach = false;
      window.location.reload();
    }
    if (parseInt(coachData.actualNumberOfStudents) === parseInt(coachData.maxNumberOfStudents)) {
      alert("Din pacate antrenorul tocmai ce si-a umplut locurile ");
      addCoach = false;
      window.location.reload();
    }

    if (addCoach) {
      const userDocRef = doc(db, "users", user.uid);

      let coachRatingDoc = await getDoc(doc(db, "ratings", coachId));
      localStorage.setItem('ratingsData', JSON.stringify(coachRatingDoc.data()));
      let coachRating = coachRatingDoc.data().rating;
      localStorage.setItem('ratingCoach', coachRating);
      let sumOfRatings = coachRatingDoc.data().sumOfRatings;
      localStorage.setItem('sumOfRatings', sumOfRatings);
      let numberOfRatings = coachRatingDoc.data().numberOfRatings;
      localStorage.setItem('numberOfRatings', numberOfRatings);
      const coachesHistoryPath = `coachesHistory.${coachId}`;

      await updateDoc(userDocRef, {
        coach: coachId,
        [coachesHistoryPath]: coachRating,
        gymId: gymId,
        gymName: gymData.name
      });

      const updatedUserData = {
        ...userData,
        coach: coachId,
        coachesHistory: {
          ...userData.coachesHistory,
          [coachId]: coachRating,
          gymId: gymId,
          gymName: gymData.name
        }
      }
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      userData = localStorage.getItem('userData');
      localStorage.setItem("coachId", coachId)
      coachData = coaches.find(coach => coach.id === coachId);
      await updateDoc(coachDocRef, {
        actualNumberOfStudents: increment(1),
        students: arrayUnion(user.uid),
      });
      if (coachData) {
        localStorage.setItem('coachData', JSON.stringify(coachData));
      }

      navigate("/utilizator");
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', function () {
        window.history.pushState(null, document.title, window.location.href);
      });
    }
  }


  return (
    <div className="GymCoachesList">
      <div className="navBarGymCoachesList">
        <NavBar className="navBarStudents" />
      </div>
      <div className="containerGymCoachesList">
        {coaches.length > 0 ? (
          coaches.map((coach) => (
            <div className='coachContent' key={coach.id}>
              <img className='coachPhoto' src={coach.photo} alt={coach.name} style={{ width: '100px', height: '100px' }} />
              <p>{coach.name}({coach.performance}%🔥)</p>
              <p>📞{coach.phoneNumber}</p>
              <RatingComponent coachIdU={coach.id} />
              {coach.actualNumberOfStudents < coach.maxNumberOfStudents ? (
                <div className='secondCoachContent'>
                  <p>{coach.maxNumberOfStudents - coach.actualNumberOfStudents} LOCURI LIBERE 🏋️‍♂️</p>
                  <button className="addButton" onClick={() => addCoach(coach.id)}>ADAUGĂ ANTRENOR</button>
                </div>
              ) :
                (
                  <div>
                    <p >NU MAI SUNT LOCURI LIBERE</p>
                  </div>
                )}

            </div>
          ))
        ) : (
          <p className="logo">&nbsp;ProCoachConnect&nbsp;</p>
        )}
      </div>
    </div>
  );
}
