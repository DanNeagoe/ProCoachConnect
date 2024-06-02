import { useEffect, useState } from "react";
import { NavBar } from "../NavBar.jsx";
import { SearchBar } from "../SearchBar.jsx";
import { Agenda } from "../Agenda.jsx";
import { RatingComponent } from "../RatingComponent.jsx";
import { doc, updateDoc, arrayRemove, getDoc, increment } from "firebase/firestore";
import { db } from "../../firebase.js";
import "./StudentHomePage.scss";

export const StudentHomePage = () => {
  let [user, setUser] = useState("");
  let [coachId, setCoachId] = useState("");
  let [userData, setUserData] = useState("");
  let [coachData, setCoachData] = useState("");

  useEffect(() => {
    fetchUserAndCoachData();
  }, []);

  const fetchUserAndCoachData = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storedCoachData = localStorage.getItem("coachData");
    if (storedCoachData) {
      setCoachData(JSON.parse(storedCoachData));
    }
    setUser(user);
    setCoachData(coachData);
    let userAccountDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userAccountDoc.data();
    setCoachId(userData.coach);
    localStorage.setItem('coachId', userData.coach);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUserData(userData);

    if (userData.coach !== '') {
      let coachAccountDoc = await getDoc(doc(db, "coaches", userData.coach));
      let coachData = coachAccountDoc.data();
      localStorage.setItem('coachData', JSON.stringify(coachData));
      setCoachData(coachData);
    }
  }

  const deleteCoach = async () => {
    const confirmDelete = window.confirm(
      `Ești sigur că vrei ca ${coachData.name} să nu mai fie antrenorul tău?`
    );
    if (confirmDelete) {
      const userDocRef = doc(db, "users", user.uid);
      let userAccountDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userAccountDoc.data();
      if (userData.recurringEvents !== undefined) {
        const updatedRecurringEventsStudent = userData.recurringEvents.filter(event => event.type !== "coach");
        const updatedUserData = { ...userData, coach: "", recurringEvents: updatedRecurringEventsStudent };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        await updateDoc(userDocRef, {
          coach: "",
          recurringEvents: updatedRecurringEventsStudent
        });
        localStorage.setItem("coachId", "");
        setCoachId("");
      } else {
        const updatedUserData = { ...userData, coach: "", };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        await updateDoc(userDocRef, {
          coach: "",
        });
        localStorage.setItem("coachId", "");
        setCoachId("");
      }

      if (coachData.recurringEvents !== undefined) {
        const updatedRecurringEventsCoach = coachData.recurringEvents.filter(event => event.userUid !== user.uid);
        const updatedCoachData = {
          ...coachData,
          actualNumberOfStudents: increment(-1),
          students: arrayRemove(coachId),
          recurringEvents: updatedRecurringEventsCoach
        };
        setCoachData(updatedCoachData);
        localStorage.setItem("coachData", JSON.stringify(updatedCoachData));

        const coachDocRef = doc(db, "coaches", coachId);
        const coachDocSnap = await getDoc(coachDocRef);
        const students = coachDocSnap.data().students || []
        if (students.includes(user.uid)) {
          if (coachDocSnap.exists()) {
            await updateDoc(coachDocRef, {
              actualNumberOfStudents: increment(-1),
              students: arrayRemove(user.uid),
              recurringEvents: updatedRecurringEventsCoach
            });
          }
        }
      }
    } else {

      const updatedCoachData = {
        ...coachData,
        actualNumberOfStudents: increment(-1),
        students: arrayRemove(user.uid),
      };
      setCoachData(updatedCoachData);
      localStorage.setItem("coachData", JSON.stringify(updatedCoachData));

      const coachDocRef = doc(db, "coaches", coachId);
      const coachDocSnap = await getDoc(coachDocRef);
      const students = coachDocSnap.data().students || []
      if (coachDocSnap.exists()) {
        if (students.includes(user.uid)) {
          await updateDoc(coachDocRef, {
            actualNumberOfStudents: increment(-1),
            students: arrayRemove(user.uid),
          });
        }
      }
    }
  };

  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    if (coachId === "") {
      const timeoutId = setTimeout(() => {
        setShowSearchBar(true);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [coachId]);


  return (
    <div className="studentHomePage">
      <div className="navBarStudentHomePage">
        <NavBar />
      </div>
      <div className="mainContainerStudentHomePage">
        {coachId !== "" ? (
          <div className="secondContainerStudentHomePage">
            <div className="mainCoachInformation">
              <div className="secondCoachInformation">
                <img className="coachPhotoLeft" src={coachData.photo}></img>
                <div className="coachInformationRight">
                  <p className="coachName"> {coachData.name}({coachData.performance}%🔥)</p>
                  <p className="coachTelephone">📞: {coachData.phoneNumber}</p>
                  <RatingComponent coachIdU={coachId} className="ratingComponent" />
                  <button
                    className="leaveButton"
                    onClick={() => deleteCoach()}
                  >
                    Parăsește
                  </button>
                </div>
              </div>
            </div>
            <p className="infoMessage">ℹ️ Marchează orele în care ești indisponibil.</p>
            <Agenda />
          </div>
        ) : showSearchBar ? (
          <SearchBar className="searchBar" />
        ) : null}
      </div>
    </div >
  );
};
