import { useState, useEffect } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { Add, SearchIcon } from "../../assets/icons";
import { showToast } from "../../components/CustomToast/CustomToast";
import ConfirmDialog from "../../components/Admin/Modal/Modal";
import { environment } from "../../environments/environment";
import "./GlobalAttributes.css";

// import LoadingIndicator from '../../components/common/LoadingIndicator/LoadingIndicator'
import LoadingIndicator from '../../components/common/LoadingIndicator/LoadingIndicator'


const BASE_URL = `${environment.serverOrigin}attributes`;

const AttributeForm = ({ formData, setFormData }) => {

    const handleValueChange = (index, field, value, lang = null) => {
        const updatedValues = [...formData.values];

        if (field === "value") {
            updatedValues[index].value = value;
        } else {
            updatedValues[index].value_i18n[lang] = value;
        }

        setFormData({ ...formData, values: updatedValues });
    };

    const addValue = () => {
        setFormData({
            ...formData,
            values: [
                ...formData.values,
                { value: "", value_i18n: { en: "", ar: "" } }
            ]
        });
    };

    const removeValue = (index) => {
        const updatedValues = formData.values.filter((_, i) => i !== index);
        setFormData({ ...formData, values: updatedValues });
    };

    return (
        <>
            <label>Label</label>
            <input
                placeholder="Label (e.g. color)"
                value={formData.label}
                onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                }
            />

            <label>Label (EN)</label>
            <input
                placeholder="Label EN"
                value={formData.label_i18n.en}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        label_i18n: { ...formData.label_i18n, en: e.target.value }
                    })
                }
            />

            <label>Label (AR)</label>
            <input
                placeholder="Label AR"
                value={formData.label_i18n.ar}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        label_i18n: { ...formData.label_i18n, ar: e.target.value }
                    })
                }
            />

            <label>Values</label>

            {formData.values.map((val, index) => (
                <div key={index}>
                    <input
                        placeholder="Value"
                        value={val.value}
                        onChange={(e) =>
                            handleValueChange(index, "value", e.target.value)
                        }
                    />

                    <input
                        placeholder="Value EN"
                        value={val.value_i18n.en}
                        onChange={(e) =>
                            handleValueChange(index, "value_i18n", e.target.value, "en")
                        }
                    />

                    <input
                        placeholder="Value AR"
                        value={val.value_i18n.ar}
                        onChange={(e) =>
                            handleValueChange(index, "value_i18n", e.target.value, "ar")
                        }
                    />

                    <button
                    style={{
                        display:'flex',
                        width:'100%',
                        justifyContent:'center',
                        color:"#FFF",
                        borderRadius:'6px',
                        padding:'5px',
                        backgroundColor:'red'
                    }}
                        className="segment-btn btn-delete"
                        onClick={() => removeValue(index)}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <button className="add-user-btn" onClick={addValue}>
                <Add /> Add Value
            </button>
        </>
    );
};

const GlobalAttributes = () => {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const token = localStorage.getItem("token");

    const emptyForm = {
        label: "",
        label_i18n: { en: "", ar: "" },
        values: [{ value: "", value_i18n: { en: "", ar: "" } }]
    };

    const [formData, setFormData] = useState(emptyForm);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttributes(res.data.items || res.data || []);
        } catch {
            showToast.error("Error fetching attributes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const createAttribute = async () => {
        try {
            await axios.post(BASE_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast.success("Attribute created");
            fetchAttributes();
            setIsCreateDrawerOpen(false);
        } catch (error){
            showToast.error(`Create failed ${error.response.data.result} `);
            // showToast.error("Create failed"); 
        }
    };

    const updateAttribute = async () => {
        try {
            await axios.put(`${BASE_URL}/${selectedAttribute.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast.success("Attribute updated");
            
            fetchAttributes();
            setIsEditDrawerOpen(false);
        } catch (error) {
            
            // showToast.error("Update failed");
            showToast.error(`Update failed ${error.response.data.result} `);

        }
    };

    const deleteAttribute = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`${BASE_URL}/${selectedAttribute.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast.success("Deleted");
            fetchAttributes();
            setIsConfirmDialogOpen(false);
        } catch (error){
            // showToast.error("Delete failed");

            showToast.error(`Delete failed ${error.response.data.result} `);
            
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddNew = () => {
        setFormData(emptyForm);
        setIsCreateDrawerOpen(true);
    };

    const handleEdit = (attr) => {
        setSelectedAttribute(attr);
        setFormData({
            label: attr.label || "",
            label_i18n: attr.label_i18n || { en: "", ar: "" },
            values: attr.values?.length ? attr.values : emptyForm.values
        });
        setIsEditDrawerOpen(true);
    };

    const filteredAttributes = attributes.filter((a) =>
        a.label?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="main-segment-mangements">
                <div className="segment-container">
                    <div className="header">
                        <h1>Global Attributes</h1>
                        <p>Manage Attributes</p>
                    </div>
                </div>

                <div className="card">
                    <div className="filters">
                        <div className="search-box">
                            <SearchIcon className="search-icon" />
                            <input
                                placeholder="Search By Label"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="add-user-btn" onClick={handleAddNew}>
                            <Add /> Add Attribute
                        </button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Label</th>
                                <th>Values</th>
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
                            ) : filteredAttributes.length === 0 ? (
                                <tr><td colSpan="4">No Results</td></tr>
                            ) : (
                                filteredAttributes.map((attr) => (
                                    <tr key={attr.id}>
                                        <td>
                                            <div><strong>EN:</strong> {attr.label_i18n?.en || "-"}</div>
                                            <div><strong>AR:</strong> {attr.label_i18n?.ar || "-"}</div>
                                        </td>

                                        <td>
                                            {attr.values?.map((val, i) => (
                                                <div key={i}>
                                                    EN: {val.value_i18n?.en || val.value} | AR: {val.value_i18n?.ar || "-"}
                                                </div>
                                            ))}
                                        </td>

                                        <td>
                                            <button
                                                className="segment-btn btn-edit"
                                                onClick={() => handleEdit(attr)}
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
                                                    setSelectedAttribute(attr);
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

                <div className={`drawer ${isCreateDrawerOpen ? "open" : ""}`}>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>Add Attribute</h2>
                            <button onClick={() => setIsCreateDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <AttributeForm formData={formData} setFormData={setFormData} />
                        </div>

                        <div className="drawer-footer">
                            <button onClick={createAttribute}>Create</button>
                        </div>
                    </div>
                </div>

                <div className={`drawer ${isEditDrawerOpen ? "open" : ""}`}>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>Edit Attribute</h2>
                            <button onClick={() => setIsEditDrawerOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <AttributeForm formData={formData} setFormData={setFormData} />
                        </div>

                        <div className="drawer-footer">
                            <button onClick={updateAttribute}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={deleteAttribute}
                loading={isDeleting}
            />
        </>
    );
};

export default GlobalAttributes;
