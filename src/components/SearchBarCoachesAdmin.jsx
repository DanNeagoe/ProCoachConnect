import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import './SearchBar.scss';

export const SearchBarCoachesAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({ coaches: [] });
    const [userData, setUserData] = useState('');
    const [storedTypeDada, setType] = useState("");
    const [gyms, setGyms] = useState([]);

    const [user, setUser] = useState("");
    const type = localStorage.getItem('type');


    useEffect(() => {
        const storedTypeDada = localStorage.getItem("type");
        if (storedTypeDada) {
            setType(storedTypeDada);
        }
        if (storedTypeDada === "coach") {
            const storedGyms = localStorage.getItem("gyms");

            const storedUser = localStorage.getItem("user");

            if (storedGyms) {
                setGyms(JSON.parse(storedGyms));
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        const storedUserData = localStorage.getItem("userData");

        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }

    }, []);


    useEffect(() => {

        const fetchData = async () => {
            const cachedCoaches = localStorage.getItem('coaches');


            if (cachedCoaches) {
                setInitialData({
                    coaches: JSON.parse(cachedCoaches),

                });
            } else {
                const coachsDocuments = await getDocs(collection(db, 'coaches'));


                let coaches = [];


                coachsDocuments.forEach(doc => coaches.push({ id: doc.id, ...doc.data(), type: 'user' }));

                localStorage.setItem('coaches', JSON.stringify(coaches));

                setInitialData({ coaches: coaches });
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const filteredUsers = initialData.coaches.filter(coach =>
            coach.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults([...filteredUsers]);
    }, [searchTerm, initialData]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectResult = async (result) => {
        localStorage.setItem('coachId', JSON.stringify(result.id))
        const coachData = initialData.coaches.find(coach => coach.id === result.id);
        localStorage.setItem('coachData', JSON.stringify(coachData))
        navigate("/stergeAntrenorAdmin");

    };


    return (
        <div className='containerSearchBar'>
            <p className="message">Selectează acum antrenorul pe care vrei sa il stergi!</p>
            <input className='inputSearchBar'

                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cauta antrenorul pe care vrei sa il stergi..."
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
                    <div>No results found</div>
                ) : <img className="paragraf" src="https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/stergereAntrenorAdmin.PNG?alt=media&token=dcc2cecc-ee09-4151-a0d3-770ee10bf9ce" />
                }
            </div>
        </div>
    );
};