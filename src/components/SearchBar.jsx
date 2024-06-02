import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { doc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import './SearchBar.scss';

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({ gyms: [] }); // useState({ coaches: [], gyms: [] });
  const [storedTypeDada, setType] = useState("");
  const [user, setUser] = useState("");
  const type = localStorage.getItem('type');


  useEffect(() => {
    const storedTypeDada = localStorage.getItem("type");
    if (storedTypeDada) {
      setType(storedTypeDada);
    }
    if (storedTypeDada === "coach") {
      //const storedGymData = localStorage.getItem("gymData");
      const storedUser = localStorage.getItem("user");

      // if (storedGymData) {
      //   setGymData(JSON.parse(storedGymData));
      // }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

  }, []);


  useEffect(() => {

    const fetchData = async () => {
      // const cachedCoaches = localStorage.getItem('coaches');
      const cachedGyms = localStorage.getItem('Gyms');

      if (cachedGyms) { //if (cachedCoaches && cachedGyms) {
        setInitialData({
          // coaches: JSON.parse(cachedCoaches),
          gyms: JSON.parse(cachedGyms)
        });
      } else {
        // const coachsDocuments = await getDocs(collection(db, 'coaches'));
        const gymsDocuments = await getDocs(collection(db, 'gyms'));

        //let coaches = [];
        let gyms = [];

        // coachsDocuments.forEach(doc => coaches.push({ id: doc.id, ...doc.data(), type: 'user' }));
        gymsDocuments.forEach(doc => gyms.push({ id: doc.id, ...doc.data(), type: 'gym' }));
        // localStorage.setItem('coaches', JSON.stringify(coaches));
        localStorage.setItem('Gyms', JSON.stringify(gyms));
        setInitialData({ gyms: gyms }); // setInitialData({ coaches: coaches, gyms: gyms });
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // const filteredUsers = initialData.coaches.filter(coach =>
    //   coach.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const filteredGyms = initialData.gyms.filter(gym =>
      gym.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults([...filteredGyms]); //setSearchResults([...filteredUsers, ...filteredGyms]);
  }, [searchTerm, initialData]);

  const handleSearchChange = (event) => {

    setSearchTerm(event.target.value);
  };

  const addCoachToGym = async (gymId) => {
    const gymRef = doc(db, "gyms", gymId);

    await updateDoc(gymRef, {
      coaches: arrayUnion(user.uid),
    });
  };

  const addGymToCoach = async (gymId) => {
    const gymData = initialData.gyms.find(gym => gym.id === gymId);
    const newGym = {
      id: gymId,
      name: gymData.name,
      photo: gymData.photo,
    };

    let currentGyms = JSON.parse(localStorage.getItem('gyms')) || [];

    const gymExists = currentGyms.some(gym => gym.id === gymId);

    if (!gymExists) {
      currentGyms = [...currentGyms, newGym];
      localStorage.setItem('gyms', JSON.stringify(currentGyms));
    }
    const coachRef = doc(db, "coaches", user.uid);
    await updateDoc(coachRef, {
      gyms: arrayUnion(gymId),
    });

    navigate("/antrenor");
  };


  const handleSelectResult = async (result) => {
    if (result.type === 'gym') {
      localStorage.setItem('gymId', JSON.stringify(result.id));
      const gymData = initialData.gyms.find(gym => gym.id === result.id);
      localStorage.setItem('gymData', JSON.stringify(gymData));


      if (storedTypeDada === "user") {
        navigate('/sala');
      } else {
        if (type === 'admin') {
          localStorage.setItem("gymPhoto", gymData.photo);
          localStorage.setItem("gymName", gymData.name)
          localStorage.setItem('gymData', JSON.stringify(gymData))
          navigate('/modificaStergeSala')
        } else {

          addGymToCoach(result.id);
          addCoachToGym(result.id);
          navigate('/antrenor');
        }
      }
    }
  };


  return (
    <div className='containerSearchBar'>
      <p className="message">Selectează acum sala!</p>
      <input className='inputSearchBar'
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Caută sala favorită..."
      />
      <div className='searchBar'>
        {searchResults.length > 0 ? (
          searchResults.map((result) => (
            <div className='searchResults'
              key={result.id}
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => handleSelectResult(result)}
            >
              <img
                src={result.photo}
                alt={result.name}
                style={{ marginRight: '8px', width: '50px', height: '50px' }}
              />
              {result.name}
            </div>
          ))
        ) : searchTerm !== '' ? (
          <div>Nu s-au găsit rezultate.</div>
        ) : <img className="paragraf" src="https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/gymPhoto.webp?alt=media&token=621d25ac-b0f7-4a8b-a9e8-3a5c7f8d8838" />
        }
      </div>
    </div>
  );
};