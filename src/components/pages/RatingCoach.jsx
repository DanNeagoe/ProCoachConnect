import StarRatings from "react-rating-stars-component";
import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import "./RatingCoach.scss"
export const RatingCoach = () => {
  let [coachIfRating, setCoachIfRating] = useState("");
  let rating = parseFloat(localStorage.getItem("ratingCoach" + coachIfRating));
  let numberOfRatings = parseFloat(JSON.parse(localStorage.getItem("numberOfRatings" + coachIfRating)));
  let sumOfRatings = parseFloat(localStorage.getItem("sumOfRatings" + coachIfRating));
  let [user, setUser] = useState("");
  let [coachData, setCoachData] = useState("");

  let ratingCoachByUser = parseFloat(localStorage.getItem("ratingCoachByUser" + coachIfRating));
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCoachIdHelper = JSON.parse(localStorage.getItem("coachIdHelper"));
    const storedCoachIfRating = localStorage.getItem("coachIfRating" + storedCoachIdHelper);
    const storedCoachData = localStorage.getItem("coachData");

    if (storedCoachIfRating) {
      setCoachIfRating(JSON.parse(storedCoachIfRating));
    }


    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedCoachData) {
      setCoachData(JSON.parse(storedCoachData));
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

  const handleRating = async (newRating) => {

    const ratingDocRef = doc(db, "ratings", coachIfRating);
    const ratingsPath = `ratingsCoach.${user.uid}`;
    const docSnap = await getDoc(ratingDocRef);
    if (docSnap.exists()) {
      const existingRating = getPropertyValue(docSnap.data(), ratingsPath);
      if (existingRating !== undefined) {

        sumOfRatings = sumOfRatings - existingRating.rating + newRating;
        await updateDoc(
          ratingDocRef,
          {
            rating: sumOfRatings / numberOfRatings,
            sumOfRatings: sumOfRatings,
            [ratingsPath]: {
              rating: newRating,
              timestamp: new Date(),
            },
          },
          { merge: true }
        );
      } else {
        sumOfRatings = sumOfRatings + newRating;
        numberOfRatings = numberOfRatings + 1;
        await updateDoc(
          ratingDocRef,
          {
            rating: sumOfRatings / numberOfRatings,
            sumOfRatings: sumOfRatings,
            numberOfRatings: numberOfRatings,
            [ratingsPath]: {
              rating: newRating,
              timestamp: new Date()
            },
          },
          { merge: true }
        );
      }
    }
    localStorage.setItem("ratingCoach" + coachIfRating, sumOfRatings / numberOfRatings);
    localStorage.setItem("sumOfRatings" + coachIfRating, sumOfRatings);
    localStorage.setItem("numberOfRatings" + coachIfRating, numberOfRatings);
  };

  return (
    <div className="ratingCoachByUser">
      {ratingCoachByUser === 0 ? (<div className="messageForUser"><p>Lasa un rating pentru: </p>  <p>{(coachData.name)}</p ></div>) : (<div className="messageForUser"><p>Ultimul rating dat lui:</p> <p>{(coachData.name)}</p></div>)
      }
      <StarRatings classNames='ratingCoachByUserComponent'
        key={ratingCoachByUser + rating}
        count={5}
        onChange={handleRating}
        size={24}
        emptyIcon={<i className="far fa-star"></i>}
        halfIcon={<i className="fa fa-star-half-alt"></i>}
        fullIcon={<i className="fa fa-star"></i>}
        activeColor="red"
        value={ratingCoachByUser}
      />
    </div >
  );
};
