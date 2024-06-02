import { NavBar } from "../NavBar"
import "./EditProfile.scss"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { deleteObject, ref as storageRef } from "firebase/storage";
import { getAuth, updatePassword } from "firebase/auth";

export const EditProfile = () => {

  const [user, setUser] = useState("");
  const [userData, setUserData] = useState("");
  const [image, setImage] = useState("");
  let [newName, setNewName] = useState("");
  let [newPhoneNumber, setNewPhoneNumber] = useState("");
  let [newMaxNumberOfStudents, setNewMaxNumberOfStudents] = useState("");
  let [verifyNewPassword, setVerifyNewPassword] = useState("");
  let [newPassword, setNewPassword] = useState("");
  const storedTypeDada = localStorage.getItem("type");
  const auth = getAuth();

  const currentUser = auth.currentUser;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserData = localStorage.getItem("userData");
    const storedImage = localStorage.getItem("image");


    if (storedImage) {
      setImage(JSON.parse(storedImage));
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
      const userDataParsed = JSON.parse(storedUserData);
      setImage(userDataParsed.photo);
    }


  }, []);

  const handleUpload = (e) => {
    let file = e.target.files[0];
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    if (!file) return;
    const storageRef = ref(storage, `profile/${uniqueSuffix}`); // creează o referință în Firebase Storage
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
    if (image !== "https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/defaultPhoto.webp?alt=media&token=9c737020-94bf-4126-aa4a-3290c49bc723") {
      const oldFileName = extractFileName(image);
      const oldFileRef = storageRef(storage, `profile/${oldFileName}`);
      await deleteObject(oldFileRef);
    }
    setImage((image) => {
      localStorage.setItem('image', JSON.stringify(imageUrl));
      return imageUrl;
    })
    let userRef;
    if (storedTypeDada !== "user") {
      userRef = doc(db, "coaches", user.uid);
    } else {
      userRef = doc(db, "users", user.uid);
    }
    await updateDoc(userRef, {
      photo: imageUrl,
    })
    setUserData((prevUserData) => {
      const updatedUserData = { ...prevUserData, photo: imageUrl };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      return updatedUserData;
    });
  };

  const handleSaveChanges = async () => {
    let userRef;
    if (storedTypeDada === 'coach') {
      userRef = doc(db, "coaches", user.uid);
    } else {
      userRef = doc(db, "users", user.uid);
    }
    if (newName !== "") {
      userData.name = newName;
    }

    if (newPhoneNumber !== "") {
      userData.phoneNumber = newPhoneNumber;
    }

    if (newMaxNumberOfStudents !== "") {
      userData.maxNumberOfStudents = newMaxNumberOfStudents;
    }

    localStorage.setItem("userData", JSON.stringify(userData));
    setUserData(userData);
    await updateDoc(userRef, userData);
    if ((newPassword !== '') && (verifyNewPassword !== '')) {
      if (newPassword === verifyNewPassword) {
        updatePassword(currentUser, newPassword);
      }
    }
  }

  return (
    <div className="EditProfile">
      <div className="navBarEditProfile">
        {storedTypeDada === "coach" ? (<NavBar style={{ height: '70px' }} />) : (<NavBar style={{ height: '60px' }} />)}
      </div>
      <div className="containerEditProfile">
        <div className="containerEditProfileRight">
          <img className="containerEditProfilePhoto"
            src={image !== "https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/defaultPhoto.webp?alt=media&token=9c737020-94bf-4126-aa4a-3290c49bc723" ? image : "https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/defaultPhoto.webp?alt=media&token=9c737020-94bf-4126-aa4a-3290c49bc723"
            }
          />
          <input type="file" id="file" style={{ display: "none" }} onChange={handleUpload} />
          <div className="photoButtons">
            <label className="addNewPhoto" htmlFor="file" style={{ cursor: "pointer" }}>Încarcă 🖼️</label>
            <button className='deletePhoto' onClick={() => updateUserProfileImage("https://firebasestorage.googleapis.com/v0/b/procoachconnect-92db3.appspot.com/o/defaultPhoto.webp?alt=media&token=9c737020-94bf-4126-aa4a-3290c49bc723")}>Șterge Poza</button>
          </div>
          <h4>Numele</h4>
          <input type="text" placeholder={userData.name} onChange={e => setNewName(e.target.value)} />
          <h4>Număr Telefon</h4>
          <input type="text" placeholder={userData.phoneNumber} onChange={e => setNewPhoneNumber(e.target.value)} />
          {storedTypeDada === "coach" ? (
            <>
              <h4>Număr Studenți</h4>
              <input type="number" placeholder={userData.maxNumberOfStudents} onChange={e => setNewMaxNumberOfStudents(e.target.value)} />
            </>
          ) : null}
          <h4>Noua Parolă</h4>
          <input type="text" onChange={e => setNewPassword(e.target.value)} />
          <h4>Noua Parolă</h4>
          <input type="text" onChange={e => setVerifyNewPassword(e.target.value)} />
          <button className="editProfileSaveChanges" onClick={handleSaveChanges}>Salvează Modificări</button>
        </div>
      </div>
    </div>
  )
}