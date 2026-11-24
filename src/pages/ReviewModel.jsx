import React, { useState } from "react";
import axios from "axios";
import "../css/reviewModal.css";

function ReviewModal({ show, order, onClose, onSuccess }) {

    const GATEWAY_URL = "http://localhost:8080";

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");

    if (!show) return null;

    const submitReview = () => {

        const token = localStorage.getItem("token");

        if (rating === 0) {
            alert("Please give rating");
            return;
        }

        axios.post(`${GATEWAY_URL}/review/add`, {
            orderId: order.id,
            foodId: order.foodItem.id,
            restaurantId: order.restaurant.id,
            rating: rating,
            review: review
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            alert("Thank you for your review ❤️");
            if (onSuccess) onSuccess();
            onClose();
        })
        .catch(err => {
            console.log(err);
            alert("Failed to submit review");
        });

    };

    return (

        <div className="review-overlay">

            <div className="review-modal">

                <h2>Rate Your Experience</h2>

                <img src={order?.foodItem?.imageUrl} alt="food" className="food-img"/>

                <h3>{order?.foodItem?.name}</h3>

                <div className="star-box">
                    {[1,2,3,4,5].map((star)=>(
                        <span key={star} className={star<=(hover||rating)?"star active":"star"} onClick={()=>setRating(star)} onMouseEnter={()=>setHover(star)} onMouseLeave={()=>setHover(0)}>★</span>
                    ))}
                </div>

                <textarea rows="5" placeholder="Share your experience (optional)" value={review} onChange={(e)=>setReview(e.target.value)}></textarea>

                <div className="btn-group">
                    <button className="cancel-btn" onClick={onClose}>Later</button>
                    <button className="submit-btn" onClick={submitReview}>Submit</button>
                </div>

            </div>

        </div>

    );

}

export default ReviewModal;