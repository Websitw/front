import React, { useState,  } from "react";
import "./MyOrder.css";

import CurrentOrder from './CurrentOrder/CurrentOrder'
import HistoryOrder from './HistoryOrder/HistoryOrder'

const MyOrder = () => {
    const [activeTab, setActiveTab] = useState("Current");

    return (
        <>
            <div className="my-order-container">
                <div className="account-home-header">
                    <h1 className="account-title">My Orders </h1>
                    <div className="account-tabs">
                        <button
                            className={`tab ${activeTab === "Current" ? "active" : ""}`}
                            onClick={() => setActiveTab("Current")}
                        >
                            Current Orders
                        </button>

                        <button
                            className={`tab ${activeTab === "History" ? "active" : ""}`}
                            onClick={() => setActiveTab("History")}
                        >
                            History
                        </button>


                    </div>
                </div>


                {activeTab === "Current" && <CurrentOrder />}
                {activeTab === 'History' && <HistoryOrder />}
            </div>
        </>
    );
};

export default MyOrder;

