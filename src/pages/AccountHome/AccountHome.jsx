import React, { useState } from "react";
import "./AccountHome.css";
import ProfileOverview from './ProfileOverview/ProfileOverview'
import PaymentsAndInvoices from './PaymentsAndInvoices/PaymentsAndInvoices';
import ShippingAndLocation from './ShippingAndLocation/ShippingAndLocation';

const AccountHome = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="account-home-wrapper">
      <div className="account-home-header">
      <h1 className="account-title">Personal Account </h1>
      <div className="account-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Overview
        </button>

        <button
          className={`tab ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          Payments & Invoices
        </button>

        <button
          className={`tab ${activeTab === "shipping" ? "active" : ""}`}
          onClick={() => setActiveTab("shipping")}
        >
          Shipping & Location
        </button>
      </div>
      </div>
      <div
        className="tab-content">
        {activeTab === "profile" && <ProfileOverview />}
        {activeTab === 'payments' && <PaymentsAndInvoices />}
        {activeTab === 'shipping' && <ShippingAndLocation />}
      </div>
    </div>
  );
};

export default AccountHome;
