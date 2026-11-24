import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../css/review.css";

function Review() {

    const navigate = useNavigate();
    const { foodId } = useParams();
    const GATEWAY_URL = "http://localhost:8080";

    const [reviews, setReviews] = useState([]);
    const [food, setFood] = useState({});
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`${GATEWAY_URL}/review/food/${foodId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {

            setReviews(res.data);

            if (res.data.length > 0) {

                setFood(res.data[0].foodItem);

                let total = 0;

                res.data.forEach(item => total += item.rating);

                setAverageRating((total / res.data.length).toFixed(1));

            }

        })
        .catch(err => console.log(err));

    }, [foodId, navigate]);

    const renderStars = (rating) => {

        let stars = [];

        for (let i = 1; i <= 5; i++) {
            stars.push(<span key={i}>{i <= rating ? "⭐" : "☆"}</span>);
        }

        return stars;

    };

    return (

        <div className="review-container">

            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={() => navigate("/dashboard")}>Home</li><li onClick={() => navigate(-1)}>Back</li></ul></div>

            <div className="middle-part">

                <h1>Food Reviews</h1>

                {
                    reviews.length > 0 &&
                    <div className="food-card">
                        <img src={food?.imageUrl} alt="food" className="food-image" />
                        <h2>{food?.name}</h2>
                        <h3>⭐ {averageRating} / 5</h3>
                        <p>{reviews.length} Reviews</p>
                    </div>
                }

                {
                    reviews.length > 0 ?

                    reviews.map(review => (

                        <div key={review.id} className="review-card">

                            <div className="review-header">
                                <h3>{review.customer?.name}</h3>
                                <div>{renderStars(review.rating)}</div>
                            </div>

                            <p>{review.review ? review.review : "No written review."}</p>

                            <small>{review.createdAt}</small>

                        </div>

                    ))

                    :

                    <div>
                        <h2>No Reviews Yet</h2>
                        <p>Be the first customer to review this food.</p>
                    </div>

                }

            </div>

            <div className="footer"><p>© 2026 QuickBite</p></div>

        </div>

    );

}

export default Review;