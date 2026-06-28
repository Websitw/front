import React, { useState } from "react";
import "./BusinessAccountTabs.css";
import ProfileOverview from './ProfileOverview/ProfileOverview'
import PaymentsAndInvoices from './PaymentsAndInvoices/PaymentsAndInvoices';
import ShippingAndLocation from './ShippingAndLocation/ShippingAndLocation'
const BusinessAccountTabs = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="business-account-tabs-wrapper">
      <div className="business-account-tabs-header">
      <h1 className="account-title">Business Account <span className="business-active">Active</span></h1>
      <div className="account-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Business Profile
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

export default BusinessAccountTabs;
