import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import './SearchBar.scss';

export const SearchBarUsersAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({ users: [] });
    const [userData, setUserData] = useState('');
    // const [storedTypeDada, setType] = useState("");
    // const [gyms, setGyms] = useState([]);

    // const [user, setUser] = useState("");
    // const type = localStorage.getItem('type');


    // useEffect(() => {
    //     // const storedTypeDada = localStorage.getItem("type");
    //     // if (storedTypeDada) {
    //     //     setType(storedTypeDada);
    //     // }
    //     // if (storedTypeDada === "coach") {
    //     //     const storedGyms = localStorage.getItem("gyms");

    //     //     const storedUser = localStorage.getItem("user");

    //     //     if (storedGyms) {
    //     //         setGyms(JSON.parse(storedGyms));
    //     //     }

    //     //     if (storedUser) {
    //     //         setUser(JSON.parse(storedUser));
    //     //     }
    //     // }
    //     const storedUserData = localStorage.getItem("userData");

    //     if (storedUserData) {
    //         setUserData(JSON.parse(storedUserData));
    //     }

    // }, []);


    useEffect(() => {

        const fetchData = async () => {
            const cachedUsers = localStorage.getItem('usersAdmin');


            if (cachedUsers) {
                setInitialData({
                    users: JSON.parse(cachedUsers),

                });
            } else {
                const usersDocuments = await getDocs(collection(db, 'users'));


                let users = [];


                usersDocuments.forEach(doc => users.push({ id: doc.id, ...doc.data(), type: 'user' }));

                localStorage.setItem('users', JSON.stringify(users));

                setInitialData({ users: users });
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        console.log(initialData.users);
        const filteredUsers = initialData.users.filter(user =>
            user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults([...filteredUsers]);
    }, [searchTerm, initialData]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectResult = async (result) => {
        localStorage.setItem('userId', JSON.stringify(result.id))
        const userData = initialData.users.find(user => user.id === result.id);
        localStorage.setItem('userData', JSON.stringify(userData))
        navigate("/stergeUtilizatorAdmin");

    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin");
        window.history.pushState(null, document.title, window.location.href);
        window.addEventListener('popstate', function (event) {
            window.history.pushState(null, document.title, window.location.href);
        });
    }

    return (
        <div className='containerSearchBar'>
            <button className="backButton" onClick={handleLogout}>Înapoi</button>
            <p className="message">Selectează acum utilizatorul pe care vrei sa îl ștergi!</p>
            <input className='inputSearchBar'

                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Caută utilizatorul pe care vrei să îl ștergi..."
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