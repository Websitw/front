



import { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import "./ManageAgreements.css";
import { environment } from '../../environments/environment'
import LoadingIndicator from '../../components/common/LoadingIndicator/LoadingIndicator'


const BASE_URL = `${environment.serverOrigin}plans`;

const PlanForm = ({ formData, setFormData, disabled, countries }) => {
    return (
        <>
            <label>Code</label>
            <input
                placeholder="Plan Code (e.g. VSA-2025-001)"
                value={formData.code}
                onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                }
                disabled={disabled}
            />

            <label>Name</label>
            <input
                placeholder="Plan Name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
            />

            <label>Name (EN)</label>
            <input
                placeholder="Name EN"
                value={formData.name_i18n.en}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        name_i18n: { ...formData.name_i18n, en: e.target.value },
                    })
                }
            />

            <label>Name (AR)</label>
            <input
                placeholder="Name AR"
                value={formData.name_i18n.ar}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        name_i18n: { ...formData.name_i18n, ar: e.target.value },
                    })
                }
            />

            {/* <label>Country ID</label>
            <input
                placeholder="Country ID"
                value={formData.countryId}
                onChange={(e) =>
                    setFormData({ ...formData, countryId: e.target.value })
                }
            /> */}

            <label>Country</label>
            <select
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "10px"
                }}
                value={formData.countryId}
                onChange={(e) =>
                    setFormData({ ...formData, countryId: e.target.value })
                }
            >
                <option value="">Select Country</option>
                {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name_i18n?.en || "No Name"}
                    </option>
                ))}
            </select>

            


            <label>Agreement Model</label>
            <select
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "10px",
                }}
                value={formData.agreementModel}
                onChange={(e) =>
                    setFormData({ ...formData, agreementModel: e.target.value })
                }
            >
                <option value="FIXED_FEE">FIXED_FEE</option>
                <option value="FREE">FREE</option>
            </select>

            <label>Fixed Fee Amount</label>
            <input
                type="number"
                placeholder="Fixed Fee Amount"
                value={formData.fixedFeeAmount}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        fixedFeeAmount: Number(e.target.value),
                    })
                }
            />

        

            <label>Billing Cycle</label>
            <select
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "10px",
                }}
                value={formData.billingCycle}
                onChange={(e) =>
                    setFormData({ ...formData, billingCycle: e.target.value })
                }
            >
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
            </select>

            <label style={{ display: "block", position: "relative" }}>
                Required E-Signature
                <input
                    type="checkbox"
                    checked={formData.requiredESignature}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            requiredESignature: e.target.checked,
                        })
                    }
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                />
            </label>

            <label>Max Store Limit</label>
            <input
                type="number"
                placeholder="Max Store Limit"
                value={formData.maxStoreLimit}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        maxStoreLimit: Number(e.target.value),
                    })
                }
            />

            <label>Max Product Limit</label>
            <input
                type="number"
                placeholder="Max Product Limit"
                value={formData.maxProductLimit}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        maxProductLimit: Number(e.target.value),
                    })
                }
            />

            <label>Status</label>
            <select
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "10px",
                }}
                value={formData.status}
                onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                }
            >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
            </select>
        </>
    );
};

const ManageAgreements = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [countries, setCountries] = useState([]);


    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        name_i18n: { en: "", ar: "" },
        countryId: "",
        agreementModel: "FIXED_FEE",
        fixedFeeAmount: 0,
        // currencyId: "",
        billingCycle: "MONTHLY",
        requiredESignature: false,
        status: "ACTIVE",
        maxStoreLimit: 0,
        currencyId: "1927692133108551680",
        maxProductLimit: 0,
    });

    const fetchCountries = async () => {
        try {
            const res = await axios.get(
                `${environment.serverOrigin}countries?limit=100`,
                {
                    headers: { Authorization: `Anonymous=${environment.appid}` },
                }
            );
            setCountries(res.data.items || []);
        } catch {
            showToast.error("Error fetching countries");
        }
    };



    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlans(res.data.items || res.data || []);
        } catch {
            showToast.error("Error fetching plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchCountries();
    }, []);

    const createPlan = async () => {
        try {
            await axios.post(BASE_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
            showToast.success("Plan created");
            fetchPlans();
            setIsDrawerOpen(false);
        } catch(error) {
            console.log('error' , error);
            showToast.error(`Create failed ${error.response.data.result} `);
        }
    };

    const updatePlan = async () => {
        try {
            await axios.put(`${BASE_URL}/${selectedPlan.id}`, formData,
            { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast.success("Plan updated");
            fetchPlans();
            setIsDrawerOpen(false);
        } catch (error) {
            showToast.error(`Update failed ${error.response.data.result} `);
        }
    };

    const deletePlan = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`${BASE_URL}/${selectedPlan.id}` ,       { headers: { Authorization: `Bearer ${token}` } });
            showToast.success("Deleted");
            fetchPlans();
            setIsConfirmDialogOpen(false);
        } catch(error) {

            showToast.error(`Delete failed ${error.response.data.result} `);
           
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddNew = () => {
        setDrawerMode("create");
        setIsDrawerOpen(true);

        setFormData({
            code: "",
            name: "",
            name_i18n: { en: "", ar: "" },
            countryId: "",
            agreementModel: "FIXED_FEE",
            fixedFeeAmount: 0,
            currencyId: "1927692133108551680",
            billingCycle: "MONTHLY",
            requiredESignature: false,
            status: "ACTIVE",
            maxStoreLimit: 0,
            maxProductLimit: 0,
        });
    };

    const handleEdit = (plan) => {
        setDrawerMode("edit");
        setIsDrawerOpen(true);
        setSelectedPlan(plan);

        setFormData({
            code: plan.code,
            name: plan.name,
            name_i18n: plan.name_i18n || { en: "", ar: "" },
            countryId: plan.countryId,
            agreementModel: plan.agreementModel,
            fixedFeeAmount: plan.fixedFeeAmount,
            currencyId: plan.currencyId,
            billingCycle: plan.billingCycle,
            requiredESignature: plan.requiredESignature,
            status: plan.status,
            maxStoreLimit: plan.maxStoreLimit,
            maxProductLimit: plan.maxProductLimit,
        });
    };

    const filteredPlans = plans.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="main-segment-mangements">
                <div className="segment-container">
                    <div className="header">
                        <h1>Plans Management</h1>
                        <p>Manage Plans</p>
                    </div>
                </div>

                <div className="card">
                    <div className="filters">
                        <div className="search-box">
                            <SearchIcon className="search-icon" />
                            <input
                                placeholder="Search By Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="add-user-btn" onClick={handleAddNew}>
                            <Add /> Add Plan
                        </button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Model</th>
                                <th>Billing</th>
                                <th>Status</th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                <td colSpan="9">
                                  <div className="seg-mgmt__table-loader">
                                    <LoadingIndicator
                                      size="md"
                                      text="Loading segments..."
                                    />
                                  </div>
                                </td>
                              </tr>
                            ) : filteredPlans.length === 0 ? (
                                <tr>
                                    <td colSpan="7">No Results</td>
                                </tr>
                            ) : (
                                filteredPlans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td>{plan.code}</td>
                                        <td>{plan.name}</td>
                                        <td>{plan.agreementModel}</td>
                                        <td>{plan.billingCycle}</td>
                                        <td>{plan.status}</td>

                                        <td>
                                            <button
                                                className="segment-btn btn-edit"
                                                onClick={() => handleEdit(plan)}
                                            >
                                                Edit
                                            </button>
                                        </td>


                                        <td>
                        <button
                          className="seg-mgmt__btn-action seg-mgmt__btn-action--details"
                        //   onClick={(e) => handleView(segment, e)}
                        >
                          Details
                        </button>
                      </td>

                                        <td>
                                            <button
                                                className="segment-btn btn-delete"
                                                onClick={() => {
                                                    setSelectedPlan(plan);
                                                    setIsConfirmDialogOpen(true);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>
                                {drawerMode === "edit"
                                    ? "Edit Plan"
                                    : "Add Plan"}
                            </h2>
                            <button onClick={() => setIsDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <PlanForm
                                formData={formData}
                                setFormData={setFormData}
                                countries={countries} 

                            />
                        </div>

                        <div className="drawer-footer">
                            <button
                                onClick={
                                    drawerMode === "edit"
                                        ? updatePlan
                                        : createPlan
                                }
                            >
                                {drawerMode === "edit" ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={deletePlan}
                loading={isDeleting}
            />
        </>
    );
};

export default ManageAgreements;
