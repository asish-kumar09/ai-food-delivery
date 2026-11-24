import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/deliveryhistory.css";

function DeliveryHistory() {
    const navigate=useNavigate();
    const GATEWAY_URL="http://localhost:8080";
    const [orders,setOrders]=useState([]);
    const [loading,setLoading]=useState(true);
    const [deliveries,setDeliveries]=useState(0);
    const [earnings,setEarnings]=useState(0);

    useEffect(()=>{
        const user=JSON.parse(localStorage.getItem("user"));
        const token=localStorage.getItem("token");
        if(!user||!token){navigate("/login");return;}
        const headers={Authorization:`Bearer ${token}`};
        const fetchHistory=async()=>{
            try{
                const response=await axios.get(`${GATEWAY_URL}/delivery/history/${user.id}`,{headers});
                const deliveries=response.data.content||response.data||[];
                const history=[];
                for(const delivery of deliveries){
                    try{
                        const orderResponse=await axios.get(`${GATEWAY_URL}/order/${delivery.orderId}`,{headers});
                        const order=orderResponse.data;
                        const customerResponse=await axios.get(`${GATEWAY_URL}/user/${order.userId}`,{headers});
                        const customer=customerResponse.data;
                        const restaurantResponse=await axios.get(`${GATEWAY_URL}/restaurant/${delivery.restaurantId}`,{headers});
                        const restaurant=restaurantResponse.data;
                        const foodResponse=await axios.get(`${GATEWAY_URL}/food/${delivery.foodId}`,{headers});
                        const foodItem=foodResponse.data;
                        const paymentResponse=await axios.get(`${GATEWAY_URL}/payment/order/${delivery.orderId}`,{headers});
                        const payment=paymentResponse.data;
                        history.push({
                            ...delivery,
                            order,
                            customer,
                            restaurant,
                            foodItem,
                            payment
                        });
                    }catch(error){
                        console.log("History details error:",error);
                        console.log(error.response?.data);
                        history.push({...delivery});
                    }
                }
                setOrders(history);
                setDeliveries(history.length);
                setEarnings(history.reduce((total,delivery)=>total+(delivery.order?.deliveryAgentIncome||0),0));
                setLoading(false);
            }catch(error){
                console.log(error);
                console.log(error.response?.data);
                setLoading(false);
            }
        };
        fetchHistory();
    },[navigate]);

    const getColor=(status)=>{
        if(status==="DELIVERED") return "green";
        if(status==="CANCELLED") return "red";
        if(status==="REJECTED") return "red";
        if(status==="OUT_FOR_DELIVERY") return "orange";
        return "blue";
    };

    return(
        <div className="deliveryhistory-container">
            <div className="navbar"><h3 className="name">QuickBite</h3><ul><li onClick={()=>navigate("/dashboard")}>Home</li><li onClick={()=>navigate("/profile")}>Profile</li></ul></div>
            <div className="middle-part">
                <h1>Delivery History</h1>
                <div className="summary-card">
                    <h2>Total Deliveries : {deliveries}</h2>
                    <h2>Total Earnings : ₹{earnings}</h2>
                </div>
                {loading?<h2>Loading...</h2>:orders.length>0?orders.slice().reverse().map((delivery)=>(
                    <div key={delivery.id} className="delivery-card">
                        
                        <div className="delivery-details">
                            <h2>{delivery?.foodItem?.foodName}</h2>
                            <p><b>Restaurant :</b> {delivery?.restaurant?.restaurantName}</p>
                            <p><b>Customer :</b> {delivery?.customer?.name}</p>
                            <p><b>Customer Phone :</b> {delivery?.customer?.phoneNo}</p>
                            <p><b>Delivery Address :</b> {delivery?.customer?.address}</p>
                            <p><b>Order Amount :</b> ₹{delivery?.order?.totalAmount}</p>
                            <p><b>Your Earnings :</b> ₹{delivery?.order?.deliveryAgentIncome||0}</p>
                            <p><b>Payment :</b> {delivery?.payment?.paymentStatus}</p>
                            <p><b>Status :</b> <span style={{color:getColor(delivery?.deliveryStatus)}}>{delivery?.deliveryStatus}</span></p>
                            <p><b>Delivered At :</b> {delivery?.deliveryTime}</p>
                        </div>
                    </div>
                )):<h2>No Delivery History Found</h2>}
            </div>
            <div className="footer"><p>© 2026 QuickBite</p></div>
        </div>
    );
}
export default DeliveryHistory;