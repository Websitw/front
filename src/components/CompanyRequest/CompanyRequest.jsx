import { useState, useEffect } from "react";
import { Search, Plus, X, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import "./CompanyRequest.css";

const CompanyRequest = () => {
   
    return (
        <div className="pending-container">
            <div className="pending-content">
                <div className="pending-icon-wrapper">
                    <div className="pending-icon-circle">
                        <AlertTriangle className="pending-icon" />
                    </div>
                </div>
                
                <h1 className="pending-title">
                    Company Request Pending
                </h1>
                
                <p className="pending-message">
                    A request has been received for the company, but it needs to wait for approval from the administrator. Your request is currently pending.
                </p>
            </div>
        </div>
    );
};

export default CompanyRequest;