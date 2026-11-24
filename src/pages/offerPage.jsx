import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/offer.css";

function OfferPage() {
    const navigate = useNavigate();
    const GATEWAY_URL = "http://localhost:8080";

    const [offers, setOffers] = useState([]);
    const [restaurantId, setRestaurantId] = useState("");
    const [foods, setFoods] = useState([]);
    const [foodName, setFoodName] = useState("");
    const [selectedFoods, setSelectedFoods] = useState([]);

    const [offerData, setOfferData] = useState({
        restaurantId: "",
        title: "",
        description: "",
        offerType: "RESTAURANT",
        targetType: "ORDER",
        discountType: "PERCENTAGE",
        discountValue: "",
        maxDiscount: "",
        minOrderAmount: "",
        startDateTime: "",
        endDateTime: ""
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user && user.restaurantId) {
            setRestaurantId(user.restaurantId);
            setOfferData(prev => ({ ...prev, restaurantId: user.restaurantId }));
        }
    }, []);

    useEffect(() => {
        if (!restaurantId) return;

        const token = localStorage.getItem("token");

        axios.get(`${GATEWAY_URL}/offer/restaurant/${restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setOffers(res.data))
            .catch(err => console.log(err));
    }, [restaurantId]);

    const handleChange = (e) => {
        setOfferData({ ...offerData, [e.target.name]: e.target.value });
    };

    const searchFood = () => {
        if (!foodName.trim() || !restaurantId) return;

        const token = localStorage.getItem("token");

        axios.get(
            `${GATEWAY_URL}/food/restaurant/${restaurantId}/name/${encodeURIComponent(foodName)}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
            .then(res => setFoods(res.data))
            .catch(err => console.log(err));
    };

    const selectFood = (food) => {
        if (offerData.targetType === "FOOD") {
            setSelectedFoods([food]);
            return;
        }

        if (offerData.targetType === "COMBO") {
            const alreadySelected = selectedFoods.some(item => item.id === food.id);

            if (alreadySelected) {
                setSelectedFoods(
                    selectedFoods.filter(item => item.id !== food.id)
                );
            } else {
                setSelectedFoods([...selectedFoods, food]);
            }
        }
    };

    const addOffer = async () => {
        const token = localStorage.getItem("token");

        if (!restaurantId) {
            alert("Restaurant not found");
            return;
        }

        if (offerData.targetType === "FOOD" && selectedFoods.length !== 1) {
            alert("Select one food");
            return;
        }

        if (offerData.targetType === "COMBO" && selectedFoods.length < 2) {
            alert("Select at least two foods for combo");
            return;
        }

        try {
            const data = {
                restaurantId: Number(restaurantId),
                title: offerData.title,
                description: offerData.description,
                offerType: offerData.offerType,
                targetType: offerData.targetType,
                discountType: offerData.discountType,
                discountValue: Number(offerData.discountValue),
                maxDiscount: Number(offerData.maxDiscount),
                minOrderAmount: Number(offerData.minOrderAmount),
                startDateTime: offerData.startDateTime,
                endDateTime: offerData.endDateTime
            };

            const offerResponse = await axios.post(
                `${GATEWAY_URL}/offer/add`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const offerId = offerResponse.data.id;

            if (offerData.targetType === "FOOD" || offerData.targetType === "COMBO") {
                for (const food of selectedFoods) {
                    await axios.post(
                        `${GATEWAY_URL}/offer-item/add`,
                        {
                            offerId: offerId,
                            foodId: food.id
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                }
            }

            alert("Offer Added");

            setOffers([...offers, offerResponse.data]);

            setOfferData({
                restaurantId: restaurantId,
                title: "",
                description: "",
                offerType: "RESTAURANT",
                targetType: "ORDER",
                discountType: "PERCENTAGE",
                discountValue: "",
                maxDiscount: "",
                minOrderAmount: "",
                startDateTime: "",
                endDateTime: ""
            });

            setFoodName("");
            setFoods([]);
            setSelectedFoods([]);

        } catch (err) {
            console.log(err);
            alert("Failed to add offer");
        }
    };

    const deleteOffer = (id) => {
        const token = localStorage.getItem("token");

        axios.delete(`${GATEWAY_URL}/offer/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                alert("Offer Deleted");
                setOffers(offers.filter(item => item.id !== id));
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="offer-container">
            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={() => navigate("/dashboard")}>Home</li><li onClick={() => navigate("/profile")}>Profile</li></ul></div>

            <div className="middle-part">
                <h1>Offers</h1>

                <div className="offer-form">
                    <input type="text" placeholder="Offer Title" name="title" value={offerData.title} onChange={handleChange} />

                    <input type="text" placeholder="Description" name="description" value={offerData.description} onChange={handleChange} />

                    <select name="offerType" value={offerData.offerType} onChange={handleChange}>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="FESTIVAL">Festival</option>
                        <option value="MEMBERSHIP">Membership</option>
                        <option value="COMBO">Combo</option>
                    </select>

                    <select name="targetType" value={offerData.targetType} onChange={(e) => {
                        handleChange(e);
                        setSelectedFoods([]);
                        setFoods([]);
                    }}>
                        <option value="ORDER">Order</option>
                        <option value="FOOD">Food</option>
                        <option value="COMBO">Combo</option>
                        <option value="DELIVERY">Delivery</option>
                    </select>

                    {(offerData.targetType === "FOOD" || offerData.targetType === "COMBO") && (
                        <>
                            <input type="text" placeholder="Search Food" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
                            <button type="button" onClick={searchFood}>Search Food</button>

                            {foods.length > 0 && foods.map((food) => (
                                <div key={food.id}>
                                    <span>{food.foodName} - ₹{food.price}</span>
                                    <button type="button" onClick={() => selectFood(food)}>
                                        {selectedFoods.some(item => item.id === food.id) ? "Selected" : "Select"}
                                    </button>
                                </div>
                            ))}

                            {selectedFoods.length > 0 && (
                                <div>
                                    <p>Selected Foods:</p>
                                    {selectedFoods.map(food => (
                                        <p key={food.id}>{food.foodName}</p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <select name="discountType" value={offerData.discountType} onChange={handleChange}>
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FLAT">Flat</option>
                        <option value="FREE_DELIVERY">Free Delivery</option>
                    </select>

                    <input type="number" placeholder="Discount Value" name="discountValue" value={offerData.discountValue} onChange={handleChange} />

                    <input type="number" placeholder="Maximum Discount" name="maxDiscount" value={offerData.maxDiscount} onChange={handleChange} />

                    <input type="number" placeholder="Minimum Order Amount" name="minOrderAmount" value={offerData.minOrderAmount} onChange={handleChange} />

                    <input type="datetime-local" name="startDateTime" value={offerData.startDateTime} onChange={handleChange} />

                    <input type="datetime-local" name="endDateTime" value={offerData.endDateTime} onChange={handleChange} />

                    <button onClick={addOffer}>Create Offer</button>
                </div>

                <h2>Available Offers</h2>

                {offers.length > 0 ? offers.map((offer) => (
                    <div className="offer-card" key={offer.id}>
                        <h3>{offer.title}</h3>
                        <p>Type : {offer.offerType}</p>
                        <p>Target : {offer.targetType}</p>
                        <p>{offer.description}</p>
                        <p>Discount : {offer.discountValue} {offer.discountType === "PERCENTAGE" ? "%" : offer.discountType === "FLAT" ? "₹" : ""}</p>
                        <p>Minimum Order : ₹{offer.minOrderAmount}</p>
                        <p>Maximum Discount : ₹{offer.maxDiscount}</p>
                        <p>Valid : {offer.startDateTime} - {offer.endDateTime}</p>
                        <p>Status : {offer.offerStatus}</p>
                        <button onClick={() => deleteOffer(offer.id)}>Delete</button>
                    </div>
                )) : <p>No Offers Available</p>}
            </div>

            <div className="footer"><p>© 2026 QuickBite</p></div>
        </div>
    );
}

export default OfferPage;