
import "./GymAdmin.scss"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { doc, collection, setDoc } from "firebase/firestore";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
export const GymAdmin = () => {
    let [image, setImage] = useState("https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/gymLogo.PNG?alt=media&token=f9b46033-39db-4c39-bcaa-b40f9e1a11bc");
    let [gymName, setGymName] = useState("");
    const navigate = useNavigate();
    const handleUpload = (e) => {
        let file = e.target.files[0];
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        if (!file) return;
        const storageRef = ref(storage, `profile/${uniqueSuffix}`);
        uploadBytes(storageRef, file).then((snapshot) => {
            e.target.value = null;
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                setImage(downloadURL);
            });
        });
    };

    const addGym = async () => {
        const gymsDocRef = doc(collection(db, "gyms"));
        await setDoc(gymsDocRef, {
            name: gymName,
            photo: image,
        });
        navigate("/admin");
    }

    return (
        <div className="gymAdmin">
            <div className="UKU">
                <img className="containerEditProfilePhotoL"
                    src={image}
                />
                <label className="addGymPhoto" htmlFor="file" style={{ cursor: "pointer" }}>Încarcă o imagine📸</label>
                <input type="file" id="file" style={{ display: "none" }} onChange={handleUpload} />
                <h4>Nume sala:</h4>
                <input type="text" onChange={e => setGymName(e.target.value)} />
                <button onClick={addGym}>Adauga sala</button>
            </div>
        </div>
    );
}