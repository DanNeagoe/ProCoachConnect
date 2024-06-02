import StarRatings from "react-rating-stars-component";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import "./RatingComponent.scss"

export const RatingComponent = ({ coachIdU }) => {
  let coachId;
  if (coachIdU === "") {
    coachId = localStorage.getItem("coachId");
  } else {
    coachId = coachIdU;
  }
  let [rating, setRating] = useState(0);
  let [numberOfRatings, setNumberOfRatings] = useState(0);
  let [user, setUser] = useState("");

  let [userData, setUserData] = useState("");
  let [type, setType] = useState("");
  let [ratingsData, setRatingsData] = useState("");
  let navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedUserData = localStorage.getItem("userData");
      const storedType = localStorage.getItem("type");
      setType(storedType);
      const fetchCoachRating = async () => {
        if (coachId !== '') {
          let coachRatingDoc = await getDoc(doc(db, "ratings", coachId));
          localStorage.setItem('ratingsData' + coachId, JSON.stringify(coachRatingDoc.data()));
          setRatingsData(coachRatingDoc.data())
          setRating(parseFloat(coachRatingDoc.data().rating));
          localStorage.setItem('ratingCoach' + coachId, coachRatingDoc.data().rating);
          localStorage.setItem('sumOfRatings' + coachId, coachRatingDoc.data().sumOfRatings);
          setNumberOfRatings(coachRatingDoc.data().numberOfRatings);
          localStorage.setItem('numberOfRatings' + coachId, coachRatingDoc.data().numberOfRatings);
          localStorage.setItem('coachIfRating' + coachId, JSON.stringify(coachId));
        }
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      fetchCoachRating();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }, []);

  function getPropertyValue(obj, path) {
    return path
      .split(".")
      .reduce(
        (currentObject, key) =>
          currentObject ? currentObject[key] : undefined,
        obj
      );
  }

  const handleRating = () => {
    if (ratingsData.ratingsCoach && ratingsData.ratingsCoach[user.uid]) {
      localStorage.setItem("ratingCoachByUser" + coachId, JSON.stringify(ratingsData.ratingsCoach[user.uid].rating));
      localStorage.setItem("timeStampRatingCoachByUser" + coachId, Date(ratingsData.ratingsCoach[user.uid].timestamp));
    } else {
      localStorage.setItem(
        "ratingCoachByUser" + coachId,
        JSON.stringify(0)
      );
      localStorage.setItem(
        "timeStampRatingCoachByUser" + coachId,
        "lasa un rating"
      );
    }
    localStorage.setItem("coachIdHelper", JSON.stringify(coachId))
    navigate("/notareAntrenor");
  };
  useEffect(() => {
  }, [rating]);

  return (
    <div className="ratingComponent">
      <div className="starRating" >
        {type === 'user' && (
          <p className="rating">({rating.toFixed(1)}/5)</p>
        )}
        <StarRatings
          key={rating}
          count={5}
          size={type === 'coach' ? 10 : 15}
          isHalf={true}
          activeColor="red"
          value={rating}
          edit={false}
        />
        {type === 'user' && (<p className="numberOfRatings">({numberOfRatings})</p>)}
      </div>
      {type === 'user' ? (
        getPropertyValue(userData, `coachesHistory.${coachId}`) !== undefined ? (
          <button className="giveRating" onClick={handleRating}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lasă un rating
          </button>
        ) : (
          <p></p>
        )
      ) : (
        <p className="ratingCoach"></p>
      )
      }
    </div>
  );
};


RatingComponent.propTypes = {
  coachIdU: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

