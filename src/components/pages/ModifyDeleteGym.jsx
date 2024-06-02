import "./AddGym.scss"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { deleteObject, ref as storageRef } from "firebase/storage";
import { useNavigate } from "react-router-dom";
export const ModifyDeleteGym = () => {

    let [gymPhoto, setGymPhoto] = useState("");
    let [gymData, setGymData] = useState("");
    let [gyms, setGyms] = useState("");
    let [gymName, setGymName] = useState("")
    const navigate = useNavigate();
    useEffect(() => {
        let gymPhoto = localStorage.getItem("gymPhoto");
        const storedGymData = localStorage.getItem("gymData");
        const storedGyms = localStorage.getItem("Gyms");

        if (gymPhoto) {
            setGymPhoto(gymPhoto);
        }

        if (storedGyms) {
            setGyms(JSON.parse(storedGyms));
        }

        if (storedGymData) {
            setGymData(JSON.parse(storedGymData));
        }

    }, []);

    const type = localStorage.getItem('type');
    const handleUpload = (e) => {
        let file = e.target.files[0];
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        if (!file) return;
        const storageRef = ref(storage, `profile/${uniqueSuffix}`);
        uploadBytes(storageRef, file).then((snapshot) => {
            e.target.value = null;
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                updateUserProfileImage(downloadURL);
            });
        });
    };

    const extractFileName = (url) => {
        const matches = url.match(/%2F(.*?)\?/);
        if (matches && matches.length > 1) {
            return matches[1];
        }
        return null;
    };

    const updateUserProfileImage = async (imageUrl) => {
        const oldFileName = extractFileName(gymPhoto);
        const oldFileRef = storageRef(storage, `profile/${oldFileName}`);
        await deleteObject(oldFileRef);

        setGymPhoto(() => {
            localStorage.setItem('gymPhoto', imageUrl);
            return imageUrl;
        })

        let gymRef = doc(db, "gyms", gymData.id);

        await updateDoc(gymRef, {
            photo: imageUrl,
        })
        const updatedGymData = { ...gymData, photo: imageUrl };
        setGymData(updatedGymData);

        const updatedGymIndex = gyms.findIndex(gym => gym.id === updatedGymData.id);
        if (updatedGymIndex !== -1) {
            gyms[updatedGymIndex] = updatedGymData;
        }
        localStorage.setItem('gymData', JSON.stringify(updatedGymData));
        const updatedGyms = gyms.map(gym =>
            gym.id === updatedGymData.id ? updatedGymData : gym
        );

        setGyms(updatedGyms);
        localStorage.setItem('Gyms', JSON.stringify(updatedGyms));
    };


    const saveChanges = async () => {
        const gymsDocRef = doc(db, "gyms", gymData.id);
        if (gymName !== '') {
            await updateDoc(gymsDocRef, {
                name: gymName,
            });
            const updatedGymData = { ...gymData, name: gymName };
            setGymData(updatedGymData);

            const updatedGymIndex = gyms.findIndex(gym => gym.id === updatedGymData.id);
            if (updatedGymIndex !== -1) {
                gyms[updatedGymIndex] = updatedGymData;
            }

            localStorage.setItem('gymData', JSON.stringify(updatedGymData));
            const updatedGyms = gyms.map(gym =>
                gym.id === updatedGymData.id ? updatedGymData : gym
            );

            setGyms(updatedGyms);
            localStorage.setItem('Gyms', JSON.stringify(updatedGyms));
        }
        navigate("/modificaStergeSali");
    }

    const deleteGym = async () => {
        const gymsDocRef = doc(db, "gyms", gymData.id);
        await deleteDoc(gymsDocRef);
        const filteredGyms = gyms.filter(gym => gym.id !== gymData.id);
        setGyms(filteredGyms);
        localStorage.setItem('Gyms', JSON.stringify(filteredGyms));
        navigate("/modificaStergeSali");
    }

    return (
        <div className="gymAdmin">
            <div className="UKU">
                <img className="containerEditProfilePhotoL"
                    src={gymPhoto}
                />
                <label className="addGymPhoto" htmlFor="file" style={{ cursor: "pointer" }}>Încarcă o imagine📸</label>
                <input type="file" id="file" style={{ display: "none" }} onChange={handleUpload} />
                <h4>Nume sala:</h4>
                <input type="text" onChange={e => setGymName(e.target.value)} />
                <button onClick={saveChanges}>Salveaza Modificari</button>
                <button className="deleteGym" onClick={deleteGym}>Sterge sala</button>
            </div>
        </div>
    );
}