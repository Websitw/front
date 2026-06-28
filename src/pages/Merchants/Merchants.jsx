import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import { environment } from "../../environments/environment";
import "./Merchants.css";

//  import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";

import LoadingIndicator from '../../components/common/LoadingIndicator/LoadingIndicator'


const BASE_URL = `${environment.serverOrigin}merchants`;

const Merchants = () => {
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [status, setStatus] = useState("");
    const [merchantType, setMerchantType] = useState("SEGMENT");
    const [rejectReason, setRejectReason] = useState("");
    const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
    const [selectedMerchantDetails, setSelectedMerchantDetails] = useState(null);
    const token = localStorage.getItem("token");


    const fetchMerchants = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchants(res.data.items || res.data || []);
        } catch {
            showToast.error("Error fetching merchants");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMerchants();
    }, [fetchMerchants]);

    const updateMerchant = async () => {
      
        if (status === "REJECTED" && !rejectReason.trim()) {
            showToast.error("Reject reason is required");
            return;
        }

        try {
            await axios.put(`${BASE_URL}/${selectedMerchant.id}`, {
                legalName: selectedMerchant.legalName,
                tradeName: selectedMerchant.tradeName,
                businessTypeId: selectedMerchant.businessTypeId,
                tradeLicenseNo: selectedMerchant.tradeLicenseNo,
                taxId: selectedMerchant.taxId,
                industryId: selectedMerchant.industryId,
                yearsInOperation: Number(selectedMerchant.yearsInOperation || 0),
                employeesCount: Number(selectedMerchant.employeesCount || 0),
                status,
                comment: status === "REJECTED" ? rejectReason : "",
                merchantType,
                businessStartedDate: selectedMerchant.businessStartedDate,
                licenseExpiryDate: selectedMerchant.licenseExpiryDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showToast.success("Merchant updated");
            fetchMerchants();
            setIsEditDrawerOpen(false);
            setRejectReason("");
        } catch (error) {
            console.log('error', error);
            showToast.error(`Update failed ${error?.response?.data?.result || ""}`);
        }
    };

    const handleEdit = (merchant) => {
        setSelectedMerchant(merchant);
        setStatus(merchant.status || "UNDER_REVIEW");
        setMerchantType(merchant.merchantType || "SEGMENT");
        setRejectReason(merchant.comment || "");
        setIsEditDrawerOpen(true);
    };

    const handleDetails = (merchant) => {
        setSelectedMerchantDetails(merchant);
        setIsDetailsDrawerOpen(true);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        if (value !== "REJECTED") {
            setRejectReason("");
        }
    };

    const filteredMerchants = merchants.filter((m) =>
        m.legalName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="main-segment-mangements">
                <div className="segment-container">
                    <div className="header">
                        <h1>Merchants</h1>
                        <p>Manage Merchants</p>
                    </div>
                </div>

                <div className="card">
                    <div className="filters">
                        <div className="search-box">
                            <SearchIcon className="search-icon" />
                            <input
                                placeholder="Search By Legal Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Legal Name</th>
                                <th>Business Type</th>
                                <th>Years</th>
                                <th>Trade Name</th>
                                <th>Industry</th>
                                <th>Start Date</th>
                                <th>Type</th>
                                <th>Employees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                 <tr>
                                 <td colSpan="8">
                                   <div className="cat-mgmt__table-loader">
                                     <LoadingIndicator
                                       size="md"
                                       text="Loading merchants..."
                                     />
                                   </div>
                                 </td>
                               </tr>
                            ) : filteredMerchants.length === 0 ? (
                                <tr><td colSpan="10">No Results</td></tr>
                            ) : (
                                filteredMerchants.map((m) => (
                                    <tr key={m.id}>
                                        <td>{m.legalName || "-"}</td>
                                        <td>{m.businessTypeId || "-"}</td>
                                        <td>{m.yearsInOperation || "-"}</td>
                                        <td>{m.industryId || "-"}</td>
                                        <td>{m.tradeName || "-"}</td>
                                        <td>{m.businessStartedDate || "-"}</td>
                                        <td>{m.merchantType || "-"}</td>
                                        <td>{m.employeesCount || "-"}</td>
                                        <td>{m.status || "-"}</td>

                                        <td>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    className="segment-btn btn-edit"
                                                    onClick={() => handleEdit(m)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    style={{ color: "green" }}
                                                    className="segment-btn"
                                                    onClick={() => handleDetails(m)}
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={`drawer ${isEditDrawerOpen ? "open" : ""}`}>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>Edit Merchant</h2>
                            <button onClick={() => setIsEditDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <label>Status</label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc"
                                }}
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>

                            <label style={{ marginTop: "15px" }}>Merchant Type</label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc"
                                }}
                                value={merchantType}
                                onChange={(e) => setMerchantType(e.target.value)}
                            >
                                <option value="SEGMENT">SEGMENT</option>
                                <option value="BRAND_OWNER">BRAND_OWNER</option>
                            </select>

                            {status === "REJECTED" && (
                                <>
                                    <label style={{ marginTop: "15px" }}>
                                        Reject Reason
                                    </label>
                                    <textarea
                            
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        style={{
                                            width: "100%",
                                            marginTop: "10px",
                                            minHeight:'120px',
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc"
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div className="drawer-footer">
                            <button onClick={updateMerchant}>Update</button>
                        </div>
                    </div>
                </div>

                <div className={`drawer ${isDetailsDrawerOpen ? "open" : ""}`}>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>Merchant Details</h2>
                            <button onClick={() => setIsDetailsDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            {selectedMerchantDetails && (
                                <>
                                    {Object.entries(selectedMerchantDetails).map(([key, value]) => (
                                        <div key={key} style={{ marginBottom: "12px" }}>
                                            <label>{key}</label>
                                            <input
                                                value={value || "-"}
                                                disabled
                                                style={{
                                                    width: "100%",
                                                    marginTop: "10px",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ccc",
                                                    background: "#fff"
                                                }}
                                            />
                                        </div>
                                    ))}

                              
                                    {selectedMerchantDetails.status === "REJECTED" && (
                                        <div style={{ marginTop: "15px" }}>
                                            <label>Reject Reason</label>
                                            <textarea
                                                value={selectedMerchantDetails.comment || "-"}
                                                disabled
                                                style={{
                                                    width: "100%",
                                                    marginTop: "10px",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ccc"
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Merchants;
