import React,{useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/cart.css";

function Cart(){
    const navigate=useNavigate();
    const [foods,setFoods]=useState([]);

    useEffect(()=>{
        const savedFoods=JSON.parse(localStorage.getItem("cartFoods")) || [];
        setFoods(savedFoods);
    },[]);

    const removeItem=(id)=>{
        const updatedFoods=foods.filter(food=>food.id!==id);
        setFoods(updatedFoods);
        localStorage.setItem("cartFoods",JSON.stringify(updatedFoods));
    };

    const total=foods.reduce((sum,food)=>sum+Number(food.price || 0),0);

    return(
        <div className="cart-container">
            <div className="navbar">
                <h3 className="name">QuickBite</h3>
                <ul>
                    <li onClick={()=>navigate("/dashboard")}>Home</li>
                    <li onClick={()=>navigate("/profile")}>
                        <img src="https://th.bing.com/th/id/OIP.1-zwKjnKoLSmjnuFLQ4MXAHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" height="30px" width="30px" alt="profile"/>
                    </li>
                </ul>
            </div>

            <div className="cart-content">
                <h1>My Cart</h1>

                {foods.length>0 ? (
                    foods.map((food,index)=>(
                        <div className="cart-card" key={`${food.id}-${index}`}>
                            <img src={food.imageUrl} alt={food.foodName} className="food-image"/>
                            <div className="cart-details">
                                <h2>{food.foodName}</h2>
                                <p>{food.description}</p>
                                <p>Category : {food.category}</p>
                                <p>Type : {food.type}</p>
                                <h3>₹ {food.price}</h3>
                                <button className="remove-btn" onClick={()=>removeItem(food.id)}>Remove</button>
                                <button className="remove-btn" onClick={()=>navigate(`/food/${food.id}`)}>Food Details</button>
                            </div>
                        </div>
                    ))
                ):(
                    <h2>Cart Is Empty</h2>
                )}

                <div className="total-box">
                    <h2>Total : ₹ {total}</h2>
                </div>
            </div>

            <div className="footer">
                <p>© 2026 QuickBite</p>
            </div>
        </div>
    );
}

export default Cart;