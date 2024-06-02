import { useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../firebase.js';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import CustomToolbar from "./CustomToolbar.jsx";
import PropTypes from 'prop-types';
export const StudentAgenda = ({ check }) => {

  let [user, setUser] = useState("");
  let [userData, setUserData] = useState("");
  let [studentData, setStudentData] = useState("");
  const [studentId, setStudentId] = useState("");
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const localizer = momentLocalizer(moment);
  const [type, setType] = useState([]);
  const minTime = new Date();
  minTime.setHours(7, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(23, 59, 59, 999);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserData = localStorage.getItem("userData");
    const storedStudentId = localStorage.getItem("studentId");
    const storedStudentData = localStorage.getItem("studentData" + storedStudentId);
    const storedStudents = localStorage.getItem("students");
    const storedType = localStorage.getItem("type");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedType) {
      setType(storedType);
    }
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }


    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
    if (storedStudentData) {
      setStudentData(JSON.parse(storedStudentData));
    }
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  }, []);


  useEffect(() => {

    const fetchRecurringEvents = async () => {
      if (!studentData || !studentData.recurringEvents) {
        return;
      }

      const recurringEvents = studentData.recurringEvents;
      const startOfWeek = moment().startOf('week');
      const newEvents = [];
      recurringEvents.forEach((event) => {
        if ((event.isRecurring === false) && (moment(event.date).isSameOrAfter(startOfWeek) === false)) {
          deleteEvent(event);
        }
        if ((event.isRecurring === false) && (moment(event.date).isSameOrAfter(startOfWeek) === true)) {
          const eventDate = moment(event.date);
          const startTime = eventDate.set({
            hour: parseInt(event.startTime.split(':')[0], 10),
            minute: parseInt(event.startTime.split(':')[1], 10),
          }).toDate();

          const endTime = eventDate.clone().set({
            hour: parseInt(event.endTime.split(':')[0], 10),
            minute: parseInt(event.endTime.split(':')[1], 10),
          }).toDate();

          newEvents.push({
            id: event.id,
            title: event.title,
            start: startTime,
            end: endTime,
            isRecurring: event.isRecurring,
            date: event.date,
            type: event.type,
            userName: event.userName,
            userUid: event.userUid,
            gymId: event.gymId,
            gymName: event.gymName,
            check: event.check
          });

        } else {
          for (let i = 0; i < 360; i++) {
            const eventDay = startOfWeek.clone().add(i, 'days');
            if (eventDay.format('dddd') === event.dayOfWeek) {
              const startTime = eventDay.clone().set({
                hour: parseInt(event.startTime.split(':')[0], 10),
                minute: parseInt(event.startTime.split(':')[1], 10),
              }).toDate();

              const endTime = eventDay.clone().set({
                hour: parseInt(event.endTime.split(':')[0], 10),
                minute: parseInt(event.endTime.split(':')[1], 10),
              }).toDate();

              newEvents.push({
                id: event.id,
                title: event.title,
                start: startTime,
                end: endTime,
                dayOfWeek: event.dayOfWeek,
                isRecurring: event.isRecurring,
                date: event.date,
                type: event.type,
                userName: event.userName,
                userUid: event.userUid,
                gymId: event.gymId,
                gymName: event.gymName,
                check: event.check
              });
            }
          }
        }
      });

      setEvents(newEvents);
    };

    if (studentId) {
      fetchRecurringEvents();
    }
  }, [studentData, userData]);

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('Numele evenimentului:');
    if (title === "") {
      alert("Nu poti adauga un eveniment fara un nume");
    }
    if (title && title !== "") {
      const dayOfWeek = moment(start).format('dddd');
      const startTime = moment(start).format('HH:mm');
      const endTime = moment(end).format('HH:mm');
      const date = moment(start).format('YYYY-MM-DD')
      const isRecurring = window.confirm('Evenimentul este recurent?');
      let eventModel
      eventModel = {
        id: Date.now(),
        dayOfWeek,
        startTime,
        endTime,
        title,
        isRecurring,
        date,
        type,
        name: studentData.name,
        userUid: studentId,
        gymId: studentData.gymId,
        gymName: studentData.gymName,
        check: false
      };
      addRecurringEventToFirestore(eventModel);
    }

  };

  const addRecurringEventToFirestore = async (eventModel) => {
    const userRef = doc(db, 'users', studentId);
    try {


      if (check) {
        const eventModelCustom = { ...eventModel, check: true };
        await updateDoc(userRef, {
          recurringEvents: arrayUnion(eventModelCustom)
        });
        setStudentData(prevUserData => {
          const updatedRecurringEvents = [...(prevUserData.recurringEvents || []), eventModelCustom];
          const updatedUserData = { ...prevUserData, recurringEvents: updatedRecurringEvents };
          localStorage.setItem('studentData' + studentId, JSON.stringify(updatedUserData));
          return updatedUserData;
        });

        setStudents(prevStudentsArray => {
          const updatedStudentsArray = prevStudentsArray.map(studentItem => {
            if (studentItem.id === studentId) {
              return { ...studentItem, recurringEvents: [...(studentItem.recurringEvents || []), eventModel] };
            }
            return studentItem;
          });

          localStorage.setItem('students', JSON.stringify(updatedStudentsArray));
          return updatedStudentsArray;
        });
      } else {
        await updateDoc(userRef, {
          recurringEvents: arrayUnion(eventModel)
        });
        setStudentData(prevUserData => {
          const updatedRecurringEvents = [...(prevUserData.recurringEvents || []), eventModel];
          const updatedUserData = { ...prevUserData, recurringEvents: updatedRecurringEvents };
          localStorage.setItem('studentData' + studentId, JSON.stringify(updatedUserData));
          return updatedUserData;
        });

        setStudents(prevStudentsArray => {
          const updatedStudentsArray = prevStudentsArray.map(studentItem => {
            if (studentItem.id === studentId) {
              return { ...studentItem, recurringEvents: [...(studentItem.recurringEvents || []), eventModel] };
            }
            return studentItem;
          });

          localStorage.setItem('students', JSON.stringify(updatedStudentsArray));
          return updatedStudentsArray;
        });
      }
      if (check) {
        const eventModelCustom = { ...eventModel, title: studentData.name, check: true };
        const userCoachRef = doc(db, 'coaches', user.uid);

        await updateDoc(userCoachRef, {
          recurringEvents: arrayUnion(eventModelCustom)
        });

        setUserData(prevUserData => {
          const updatedRecurringEventsU = [...(prevUserData.recurringEvents || []), eventModelCustom];
          const updatedUserDataL = { ...prevUserData, recurringEvents: updatedRecurringEventsU };
          localStorage.setItem('userData', JSON.stringify(updatedUserDataL));
          return updatedUserDataL;
        });
      }
    } catch (error) {
      console.error('Eroare la adăugarea evenimentului recurent:', error);
    }
  };
  const handleSelectEvent = (event) => {
    const confirmDelete = window.confirm('Doriți să ștergeți acest eveniment?');
    if (confirmDelete) {
      deleteEvent(event);
    }
  };

  useEffect(() => {
    const loadedStudentData = localStorage.getItem('studentData' + studentId);
    if (loadedStudentData) {
      setStudentData(JSON.parse(loadedStudentData));
    }
  }, [studentId]);

  const deleteEvent = async (eventToDelete) => {
    try {
      const updatedEvents = studentData.recurringEvents.filter(event => event.id !== eventToDelete.id);

      const userRef = doc(db, 'users', studentId);
      await updateDoc(userRef, {
        recurringEvents: updatedEvents
      });

      setStudents(prevStudentsArray => {
        const updatedStudentsArray = prevStudentsArray.map(studentItem => {
          if (studentItem.id === studentId) {
            const filteredEvents = studentItem.recurringEvents.filter(event => event.id !== eventToDelete.id);
            return { ...studentItem, recurringEvents: filteredEvents };
          }

          return studentItem;
        });

        localStorage.setItem('students', JSON.stringify(updatedStudentsArray));
        return updatedStudentsArray;
      });

      setStudentData(prevStudentData => {
        const updateUserData = { ...prevStudentData, recurringEvents: updatedEvents };
        localStorage.setItem('studentData' + studentId, JSON.stringify(updateUserData));

        return updateUserData;
      });
      setEvents(updatedEvents);

      if (check) {
        const updatedEventsCoach = userData.recurringEvents.filter(event => event.id !== eventToDelete.id);
        const userRefCoach = doc(db, 'coaches', user.uid);
        await updateDoc(userRefCoach, {
          recurringEvents: updatedEventsCoach
        });
        const newUserDataCoach = { ...userData, recurringEvents: updatedEventsCoach };
        setUserData(newUserDataCoach);
        localStorage.setItem('userData', JSON.stringify(newUserDataCoach));
      }
    } catch (error) {
      console.error('Eroare la ștergerea evenimentului:', error);
    }
  };

  const [date, setDate] = useState(moment);
  const handleNavigate = (newDate) => {
    if (newDate >= moment().startOf('week')) {
      setDate(newDate)
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor;
    if (event.type === 'coach' && event.check === false) {
      backgroundColor = '#ccc90d';
    }
    if (event.type === 'coach' && event.check === true) {
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
      <Calendar className='Calendar'
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={event => handleSelectEvent(event)}
        defaultView="week"
        views={['week', 'agenda']}
        timeslots={1}
        step={60}
        formats={{ timeGutterFormat: 'H:mm' }}
        min={minTime}
        max={maxTime}
        longPressThreshold={650}
        onNavigate={handleNavigate}
        components={{ toolbar: CustomToolbar }}
        date={date}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}
StudentAgenda.propTypes = {
  check: PropTypes.bool,
};
export default StudentAgenda;

