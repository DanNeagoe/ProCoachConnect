import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc, arrayUnion, } from "firebase/firestore";
import { db } from "../firebase.js";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "./Agenda.scss";
import CustomToolbar from "./CustomToolbar.jsx";
export const Agenda = () => {
  let [user, setUser] = useState("");
  let [userData, setUserData] = useState("");
  const [events, setEvents] = useState([]);
  const [type, setType] = useState([]);
  const localizer = momentLocalizer(moment);

  const [minTime, setMinTime] = useState();
  const [maxTime, setMaxTime] = useState();
  const [date, setDate] = useState(moment());
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const currentMinTime = new Date();
    currentMinTime.setHours(7, 0, 0, 0);

    const currentMaxTime = new Date();
    currentMaxTime.setHours(23, 59, 59, 999);

    setMinTime(currentMinTime);
    setMaxTime(currentMaxTime);
  }, [date]);

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    const storedUser = localStorage.getItem("user");
    const storedUserData = localStorage.getItem("userData");
    const storedType = localStorage.getItem("type");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
    if (storedType) {
      setType(storedType);
    }
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    handleSelectSlot;
  }, []);


  useEffect(() => {
    const fetchRecurringEvents = async () => {
      if (!userData || !userData.recurringEvents) {
        return;
      }

      const recurringEvents = userData.recurringEvents;
      const startOfWeek = moment().startOf("week");
      const endOfWeek = moment().endOf("week");
      const newEvents = [];
      let numberOfWorkouts = 0;
      recurringEvents.forEach((event) => {
        if (
          event.isRecurring === false &&
          moment(event.date).isSameOrAfter(startOfWeek) === false
        ) {
          deleteEvent(event);
        }

        if (
          event.isRecurring === false && moment(event.date).isBetween(startOfWeek, endOfWeek, undefined, []) === true
        ) {
          if (event.check === true) {
            numberOfWorkouts = numberOfWorkouts + 1;
          }
        }


        if (
          event.isRecurring === true
        ) {
          if (event.check === true) {
            numberOfWorkouts = numberOfWorkouts + 1;
          }
        }

        if (
          event.isRecurring === false &&
          moment(event.date).isSameOrAfter(startOfWeek) === true
        ) {
          const eventDate = moment(event.date);
          const startTime = eventDate
            .set({
              hour: parseInt(event.startTime.split(":")[0], 10),
              minute: parseInt(event.startTime.split(":")[1], 10),
            })
            .toDate();

          const endTime = eventDate
            .clone()
            .set({
              hour: parseInt(event.endTime.split(":")[0], 10),
              minute: parseInt(event.endTime.split(":")[1], 10),
            })
            .toDate();

          newEvents.push({
            id: event.id,
            title: event.title,
            start: startTime,
            end: endTime,
            isRecurring: event.isRecurring,
            date: event.date,
            type: event.type,
            userUid: event.userUid,
            gymId: event.gymId,
            gymName: event.gymName,
            check: event.check,
          });
        } else {
          for (let i = 0; i < 360; i++) {
            const eventDay = startOfWeek.clone().add(i, "days");
            if (eventDay.format("dddd") === event.dayOfWeek) {
              const startTime = eventDay
                .clone()
                .set({
                  hour: parseInt(event.startTime.split(":")[0], 10),
                  minute: parseInt(event.startTime.split(":")[1], 10),
                })
                .toDate();

              const endTime = eventDay
                .clone()
                .set({
                  hour: parseInt(event.endTime.split(":")[0], 10),
                  minute: parseInt(event.endTime.split(":")[1], 10),
                })
                .toDate();

              newEvents.push({
                id: event.id,
                title: event.title,
                start: startTime,
                end: endTime,
                dayOfWeek: event.dayOfWeek,
                isRecurring: event.isRecurring,
                date: event.date,
                type: event.type,
                userUid: event.userUid,
                gymId: event.gymId,
                gymName: event.gymName,
                check: event.check
              });
            }
          }
        }
      });
      localStorage.setItem("numberOfWorkouts", numberOfWorkouts);
      setEvents(newEvents);
    };

    if (user && user.uid) {
      fetchRecurringEvents();
    }
  }, [user, userData]);

  const handleSelectSlot = ({ start, end }) => {

    const title = window.prompt("Numele evenimentului:");
    if (title === "") {
      alert("Nu poti adauga un eveniment fara un nume");
    }
    if (title && title !== "") {
      const dayOfWeek = moment(start).format("dddd");
      const startTime = moment(start).format("HH:mm");
      const endTime = moment(end).format("HH:mm");
      const date = moment(start).format("YYYY-MM-DD");
      const isRecurring = window.confirm("Evenimentul este recurent?");

      const eventModel = {
        id: Date.now(),
        dayOfWeek,
        startTime,
        endTime,
        title,
        isRecurring,
        date,
        type,
        userUid: user.uid,
        gymId: '',
        gymName: '',
        check: false
      };
      addRecurringEventToFirestore(eventModel);
    }
  };

  const addRecurringEventToFirestore = async (eventModel) => {

    let userRef;
    if (type === 'user') {
      eventModel = { ...eventModel, gymId: userData.gymId, gymName: userData.gymName };
      userRef = doc(db, "users", user.uid);
    }
    if (type === 'coach') {
      userRef = doc(db, "coaches", user.uid);
    }
    try {
      await updateDoc(userRef, {
        recurringEvents: arrayUnion(eventModel),
      });
      setUserData((prevUserData) => {
        const updatedRecurringEvents = prevUserData.recurringEvents
          ? [...prevUserData.recurringEvents, eventModel]
          : [eventModel];


        const updatedUserData = {
          ...prevUserData,
          recurringEvents: updatedRecurringEvents,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        return updatedUserData;
      });

    } catch (error) {
      console.error("Error adding recurring event: ", error);
    }
  };

  const handleSelectEvent = (event) => {
    const confirmDelete = window.confirm("Doriți să ștergeți acest eveniment?");
    if (confirmDelete) {
      deleteEvent(event);
    }
  };

  const deleteEvent = async (eventToDelete) => {
    // try {
    const updatedEvents = userData.recurringEvents.filter(
      (event) => event.id !== eventToDelete.id
    );
    let userRef;
    let mutualEvent = false;
    if (type === "user") {
      userRef = doc(db, "users", user.uid);
      if (eventToDelete.check) {
        let coachesAccountDoc = await getDoc(doc(db, "coaches", userData.coach))
        if (coachesAccountDoc.exists()) {
          const updatedEvents = coachesAccountDoc.data().recurringEvents.filter(
            (event) => event.id !== eventToDelete.id);
          await updateDoc(doc(db, "coaches", userData.coach), {
            recurringEvents: updatedEvents,
          });
        }
      }
    } else {
      userRef = doc(db, "coaches", user.uid);

      let userAccountDoc = await getDoc(doc(db, "users", eventToDelete.userUid))
      if (userAccountDoc.exists()) {
        mutualEvent = true
        const updatedEvents = userAccountDoc.data().recurringEvents.filter(
          (event) => event.id !== eventToDelete.id);
        await updateDoc(doc(db, "users", eventToDelete.userUid), {
          recurringEvents: updatedEvents,
        });
      }
    }
    await updateDoc(userRef, {
      recurringEvents: updatedEvents,
    });
    const newUserData = { ...userData, recurringEvents: updatedEvents };
    setUserData(newUserData);
    localStorage.setItem("userData", JSON.stringify(newUserData));
    setEvents(updatedEvents);

    if (type === 'coach') {
      if (eventToDelete.type === 'coach' && !mutualEvent) {

        let filteredEvents
        setStudents(prevStudentsArray => {
          const updatedStudentsArray = prevStudentsArray.map(studentItem => {
            if (studentItem.id === eventToDelete.userUid) {
              filteredEvents = studentItem.recurringEvents.filter(event => event.id !== eventToDelete.id);
              return { ...studentItem, recurringEvents: filteredEvents };
            }
            return studentItem;
          });

          localStorage.setItem('students', JSON.stringify(updatedStudentsArray));
          return updatedStudentsArray;
        });
        const userRef = doc(db, "users", eventToDelete.userUid);
        const updatedStudent = await getDoc(userRef);
        if (updatedStudent.exists()) {
          await updateDoc(userRef, { recurringEvents: filteredEvents });
        }
      }
    }
    // } catch (error) {
    //   console.error("Error removing event: ", error);
    // }
  };

  const handleNavigate = (newDate) => {
    if (newDate >= moment().startOf("week")) {
      setDate(newDate);
    }
  };


  const eventStyleGetter = (event) => {
    let backgroundColor;
    if (event.type === 'coach' && event.check === false) {
      backgroundColor = '#ccc90d';
    }
    if (event.type === 'coach' && event.gymId === '') {
      backgroundColor = ' rgba(255, 0, 0, 0.712)';
    } else if (event.type === 'coach' && event.check === true && event.gymId !== '') {
      backgroundColor = 'rgba(0, 145, 12, 0.647)';
    }

    const style = {
      backgroundColor,
    };
    return {
      style: style
    };
  };

  return (
    <div className="ok">
      <Calendar
        className="Calendar"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => handleSelectEvent(event)}
        defaultView="week"
        longPressThreshold={650}
        timeslots={1}
        step={60}
        formats={{ timeGutterFormat: "H:mm" }}
        min={minTime}
        max={maxTime}
        onNavigate={handleNavigate}
        components={{ toolbar: CustomToolbar }}
        eventPropGetter={eventStyleGetter}
        date={date}
      />
    </div>
  );
};
export default Agenda;
