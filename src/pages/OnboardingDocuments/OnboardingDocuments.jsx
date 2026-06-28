import { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import { environment } from "../../environments/environment";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import "./OnboardingDocuments.css";

const BASE_URL = `${environment.serverOrigin}merchants/onboarding/documents`;

const DocumentForm = ({
    formData,
    setFormData,
    countries,
    disabled,
}) => {
    return (
        <>
            <label>Name</label>
            <input
                placeholder="Name"
                value={formData.name}

                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                disabled={disabled}
            />

            <label>Name (EN)</label>
            <input
                placeholder="Name EN"
                value={formData.name_i18n.en}
                disabled={disabled}

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
                disabled={disabled}

                value={formData.name_i18n.ar}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        name_i18n: { ...formData.name_i18n, ar: e.target.value },
                    })
                }
            />

            <label>Description</label>
            <textarea
                disabled={disabled}

                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    minHeight: '100px',
                    border: "1px solid #ccc",
                    marginBottom: "10px"
                }}
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
            />

            <label>Description (EN)</label>
            <textarea
                disabled={disabled}

                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    minHeight: '100px',
                    border: "1px solid #ccc",
                    marginBottom: "10px"
                }}
                placeholder="Description EN"
                value={formData.description_i18n.en}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        description_i18n: {
                            ...formData.description_i18n,
                            en: e.target.value,
                        },
                    })
                }
            />

            <label>Description (AR)</label>
            <textarea
                disabled={disabled}

                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    minHeight: '100px',
                    border: "1px solid #ccc",
                    marginBottom: "10px"
                }}
                placeholder="Description AR"
                value={formData.description_i18n.ar}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        description_i18n: {
                            ...formData.description_i18n,
                            ar: e.target.value,
                        },
                    })
                }
            />

            <label>Country</label>
            <select
                disabled={disabled}

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

            <label>Allowed File Types (comma separated)</label>
            <input
                disabled={disabled}

                placeholder="pdf,jpeg,png"
                value={formData.allowedFileTypes.join(",")}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        allowedFileTypes: e.target.value.split(","),
                    })
                }
            />

            <label>Max File Size (bytes)</label>
            <input
                disabled={disabled}

                placeholder="Max File Size (bytes)"
                type="number"
                value={formData.maxFileSize}
                onChange={(e) =>
                    setFormData({ ...formData, maxFileSize: Number(e.target.value) })
                }
            />

            <label>Display Order</label>
            <input
                disabled={disabled}

                placeholder="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                    setFormData({ ...formData, displayOrder: Number(e.target.value) })
                }
            />

            <label style={{
                display: 'block',
                width: '100%',
                position: 'relative'
            }}>
                Required
                <input
                    disabled={disabled}

                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) =>
                        setFormData({ ...formData, required: e.target.checked })
                    }
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
            </label>

            <label style={{
                display: 'block',
                width: '100%',
                position: 'relative'
            }}>
                Has Expiry Date
                <input
                    disabled={disabled}

                    type="checkbox"
                    checked={formData.hasExpiryDate}
                    onChange={(e) =>
                        setFormData({ ...formData, hasExpiryDate: e.target.checked })
                    }
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
            </label>

            <label>Status</label>
            <select
                disabled={disabled}

                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "10px"
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

const OnboardingDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        name: "",
        name_i18n: { en: "", ar: "" },
        description: "",
        description_i18n: { en: "", ar: "" },
        countryId: "",
        hasExpiryDate: false,
        required: true,
        allowedFileTypes: [],
        maxFileSize: 0,
        displayOrder: 1,
        status: "ACTIVE",
    });

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(res.data.items || []);
        } catch {
            showToast.error("Error fetching documents");
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchDocuments();
        fetchCountries();
    }, []);

    const createDocument = async () => {
        try {
            await axios.post(BASE_URL, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            showToast.success("Document created");
            fetchDocuments();
            setIsDrawerOpen(false);
        } catch {
            showToast.error("Create failed");
        }
    };

    const updateDocument = async () => {
        try {
            await axios.put(`${BASE_URL}/${selectedDoc.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            showToast.success("Document updated");
            fetchDocuments();
            setIsDrawerOpen(false);
        } catch {
            showToast.error("Update failed");
        }
    };

    const deleteDocument = async () => {
        try {
            setIsDeleting(true);

            await axios.delete(`${BASE_URL}/${selectedDoc.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            showToast.success("Deleted");
            fetchDocuments();
            setIsConfirmDialogOpen(false);
        } catch {
            showToast.error("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddNew = () => {
        setDrawerMode("create");
        setIsDrawerOpen(true);

        setFormData({
            name: "",
            name_i18n: { en: "", ar: "" },
            description: "",
            description_i18n: { en: "", ar: "" },
            countryId: "",
            hasExpiryDate: false,
            required: true,
            allowedFileTypes: [],
            maxFileSize: 0,
            displayOrder: 1,
            status: "ACTIVE",
        });
    };

    const handleEdit = (doc) => {
        setDrawerMode("edit");
        setIsDrawerOpen(true);
        setSelectedDoc(doc);

        setFormData({
            name: doc.name,
            name_i18n: doc.name_i18n || { en: "", ar: "" },
            description: doc.description,
            description_i18n: doc.description_i18n || { en: "", ar: "" },
            countryId: doc.countryId,
            hasExpiryDate: doc.hasExpiryDate,
            required: doc.required,
            allowedFileTypes: doc.allowedFileTypes || [],
            maxFileSize: doc.maxFileSize,
            displayOrder: doc.displayOrder,
            status: doc.status,
        });
    };

    const filteredDocs = documents.filter((d) =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (doc) => {
        setDrawerMode("view");
        setIsDrawerOpen(true);
        setSelectedDoc(doc);

        setFormData({
            name: doc.name,
            name_i18n: doc.name_i18n || { en: "", ar: "" },
            description: doc.description,
            description_i18n: doc.description_i18n || { en: "", ar: "" },
            countryId: doc.countryId,
            hasExpiryDate: doc.hasExpiryDate,
            required: doc.required,
            allowedFileTypes: doc.allowedFileTypes || [],
            maxFileSize: doc.maxFileSize,
            displayOrder: doc.displayOrder,
            status: doc.status,
        });
    };


    return (
        <>
            <div className="main-segment-mangements">
                <div className="segment-container">
                    <div className="header">
                        <h1>Onboarding Documents Management</h1>
                        <p>Manage and track your Documents</p>
                    </div>
                </div>

                <div className="card">
                    <div className="filters">
                        <div className="search-box">
                            <SearchIcon className="search-icon" />
                            <input
                                placeholder="Search By Document Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="add-user-btn" onClick={handleAddNew}>
                            <Add /> Add Documents
                        </button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Country</th>
                                <th>Max File Size</th>
                                <th>Has Expiry Date</th>
                                <th>Required</th>
                                <th>Status</th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4">Loading...</td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan="7">No Results</td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.name}</td>
                                        <td>{doc.countryId}</td>
                                        <td>{doc.maxFileSize}</td>
                                        <td>{doc.hasExpiryDate ? 'YES' : 'NO'}</td>
                                        <td>{doc.required ? 'YES' : 'NO'}</td>
                                        <td>{doc.status}</td>
                                        <td>
                                            <button
                                                className="segment-btn btn-edit"
                                                onClick={() => handleEdit(doc)}
                                            >
                                                Edit
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                style={{
                                                    color: 'green'
                                                }}
                                                className="segment-btn"
                                                onClick={() => handleView(doc)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                        <td>

                                            <button
                                                className="segment-btn btn-delete"
                                                onClick={() => {
                                                    setSelectedDoc(doc);
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
                                {drawerMode === "create"
                                    ? "Add Document"
                                    : drawerMode === "edit"
                                        ? "Edit Document"
                                        : "Document Details"}
                            </h2>
                            <button onClick={() => setIsDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <DocumentForm
                                formData={formData}
                                setFormData={setFormData}
                                disabled={drawerMode === "view"}
                                countries={countries}
                            />
                        </div>

                        {drawerMode !== "view" &&
                            <div className="drawer-footer">
                                <button onClick={drawerMode === "edit" ? updateDocument : createDocument}>
                                    {drawerMode === "edit" ? "Update" : "Create"}
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={deleteDocument}
                loading={isDeleting}
            />
        </>
    );
};

export default OnboardingDocuments;