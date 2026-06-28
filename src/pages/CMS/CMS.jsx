import React, { useState } from "react";
import "./CMS.css";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
const LANGS = ["en", "ar", "fr"];
const LANG_LABEL = { en: "English", ar: "العربية", fr: "French" };

export default function ContentManagement() {
    const [platform, setPlatform] = useState("");
    const [module, setModule] = useState("");
    const [page, setPage] = useState("");
    const [section, setSection] = useState("");
    const [lang, setLang] = useState("en");
    const [field, setField] = useState("");

    const [content, setContent] = useState({});

    const modules = ["Dashboard", "Analytics"];
    const pages = ["Segment Landing", "Analytics"];
    const sections = ["Section 1", "Section 2"];
    const fields = ["Field 1"];
    const SECTION_FIELDS = {
        "Section 1": ["Hero Title", "Hero Description", "CTA Text"],
        "Section 2": ["Card Title", "Card Subtitle", "Footer Note"],
    };

    const updateContent = (level, key, field, value) => {
        setContent((prev) => ({
            ...prev,
            [level]: {
                ...prev[level],
                [key]: {
                    ...prev[level]?.[key],
                    [lang]: {
                        ...prev[level]?.[key]?.[lang],
                        [field]: value,
                    },
                },
            },
        }));
    };


    const getValue = (level, key, field) =>
        content[level]?.[key]?.[lang]?.[field] || "";

    return (
        <>
            <div className="cms-main">
                <div className="cms-container-header">
                    <h1 className="page-title">Content/CMS Pages</h1>
                    <h2 className="page-subtitle">Manage and update SAWA platforms structural content and modules.</h2>
                </div>
                <div className="cms-container">
                    <aside className="cms-sidebar">
                        <h3>Content Management</h3>
                        <p>
                            Manage and customize your website content with ease. Select the desired module and page to precisely adjust text and fields through a unified system.

                        </p>

                        <div className="select-wrapper">

                            <select
                                value={platform}
                                onChange={(e) => {
                                    setPlatform(e.target.value);
                                    setModule("");
                                    setPage("");
                                    setSection("");
                                }}
                            >
                                <option value="">Select Platform</option>
                                <option value="E-commerce Website">E-commerce Website</option>
                            </select>

                            <KeyboardArrowDownIcon className="select-icon" />

                        </div>

                        <div className="select-wrapper">

                            <select
                                disabled={!platform}
                                value={module}
                                onChange={(e) => {
                                    setModule(e.target.value);
                                    setPage("");
                                    setSection("");
                                }}
                            >
                                <option className="option-title" value="">Select Module</option>
                                {modules.map((m) => (
                                    <option key={m}>{m}</option>
                                ))}
                            </select>
                            <KeyboardArrowDownIcon className="select-icon" />

                        </div>


                        <div className="select-wrapper">

                            <select
                                disabled={!module}
                                value={page}
                                onChange={(e) => {
                                    setPage(e.target.value);
                                    setSection("");
                                }}
                            >
                                <option value="">Select Page</option>
                                {pages.map((p) => (
                                    <option key={p}>{p}</option>
                                ))}
                            </select>
                            <KeyboardArrowDownIcon className="select-icon" />
                        </div>



                        <div className="select-wrapper">

                            <select
                                disabled={!page}
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                <option value="">Select Section</option>
                                {sections.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}

                            </select>
                            <KeyboardArrowDownIcon className="select-icon" />


                        </div>

                        <div className="select-wrapper">
                            <select
                                disabled={!section}
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                            >
                                <option value="">Select Field</option>

                                {(SECTION_FIELDS[section] || []).map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>

                            <KeyboardArrowDownIcon className="select-icon" />
                        </div>


                    </aside>

                    <main className="cms-content">
                        {!platform && (
                            <p className="empty">
                                Please Select A Module And Page To View Content Specifications
                            </p>
                        )}

                        {platform && (
                            <>
                                <h2
                                    style={{
                                        fontWeight: '600',
                                        fontSize: '18px',
                                        lineHeight: '23px',
                                        color: "#000",
                                        verticalAlign: 'middle',
                                        marginBottom: '26px'
                                    }}
                                >{platform}</h2>

                                <Block
                                    title="Select Module"
                                    items={module ? [module] : modules}
                                    active={module}
                                    onSelect={setModule}
                                    level="module"
                                    getValue={getValue}
                                    updateContent={updateContent}
                                    lang={lang}
                                    setLang={setLang}
                                />

                                {module && (
                                    <Block
                                        title="Select Page"
                                        items={page ? [page] : pages}
                                        active={page}
                                        onSelect={setPage}
                                        level="page"
                                        getValue={getValue}
                                        updateContent={updateContent}
                                        lang={lang}
                                        setLang={setLang}
                                    />
                                )}

                                {page && (
                                    <Block
                                        title="Select Section"
                                        items={section ? [section] : sections}
                                        active={section}
                                        onSelect={setSection}
                                        level="section"
                                        getValue={getValue}
                                        updateContent={updateContent}
                                        lang={lang}
                                        setLang={setLang}
                                    />
                                )}

                                {section && field && (
                                    <>

                                        <Block
                                            title="Select Field"
                                            items={[field]}
                                            active={field}
                                            onSelect={() => { }}
                                            level="field"
                                            getValue={getValue}
                                            updateContent={updateContent}
                                            lang={lang}
                                            setLang={setLang}
                                        />


                                    </>


                                )}


                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

function Block({
    title,
    items,
    active,
    onSelect,
    level,
    getValue,
    updateContent,
    lang,
    setLang,
}) {
    return (
        <div className="block fade-in">
            <h4>{title}</h4>

            {items.map((item) => (
                <div
                    key={item}
                    className={`item ${active === item ? "active" : ""}`}
                    onClick={() => onSelect(item)}
                >
                    <p className="title"> {item}</p>
                    <span>
                        <ArrowForwardIcon

                            style={{
                                fontSize: '22px',
                                border: '1px solid #0D7C85',
                                borderRadius: '50%',
                                color: "#0D7C85"
                            }}
                        />
                    </span>

                </div>
            ))}

            {active && (
                <>
                    <div className="main-tabs">
                        <div className="tabs">
                            {LANGS.map((l) => (
                                <button
                                    key={l}
                                    className={lang === l ? "tab active" : "tab"}
                                    onClick={() => setLang(l)}
                                >
                                    {LANG_LABEL[l]}
                                </button>
                            ))}
                        </div>



                        {title !== 'Select Field' &&
                            <div className="inputs">
                                <input
                                    placeholder="Title"
                                    value={getValue(level, active, "title")}
                                    onChange={(e) =>
                                        updateContent(level, active, "title", e.target.value)
                                    }
                                />

                                <input
                                    placeholder="Description"
                                    value={getValue(level, active, "desc")}
                                    onChange={(e) =>
                                        updateContent(level, active, "desc", e.target.value)
                                    }
                                />
                            </div>
                        }

                    </div>

                    {title === 'Select Field' &&

                        <>

                            <div className="field-editor">
                                <div className="field-row field-inputs">
                                    <div>
                                        <label className="field-label">Label</label>
                                        <input

                                            placeholder="Field 1"
                                            className="field-input"
                                            value={getValue(level, active, "label")}
                                            onChange={(e) =>
                                                updateContent(level, active, "label", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="field-label">Help Text</label>
                                        <textarea

                                            placeholder="Help text"
                                            className="field-textarea"
                                            value={getValue(level, active, "help")}
                                            onChange={(e) =>
                                                updateContent(level, active, "help", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="field-row field-inputs-textarea">
                                    <div>
                                        <label className="field-label">Placeholder</label>
                                        <input

                                            placeholder="Field 1"
                                            className="field-input"
                                            value={getValue(level, active, "placeholder")}
                                            onChange={(e) =>
                                                updateContent(level, active, "placeholder", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="field-divider" />

                                <div className="field-group-title">Validation Messages</div>

                                <div className="field-row full">
                                    <div>
                                        <label className="field-label">Required</label>
                                        <input
                                            placeholder="Field 1" className="field-input" />
                                    </div>
                                </div>

                                <div className="field-row full">
                                    <div>
                                        <label className="field-label">Error Message</label>
                                        <input
                                            placeholder="Field 1" className="field-input" />
                                    </div>
                                </div>

                                <div className="field-row full">
                                    <div>
                                        <label className="field-label">Success Message</label>
                                        <input
                                            placeholder="Field 1" className="field-input" />
                                    </div>
                                </div>

                                <div className="field-row full">
                                    <div>
                                        <label className="field-label">Other</label>
                                        <input
                                            placeholder="Field 1"
                                            className="field-input" />
                                    </div>
                                </div>
                            </div>

                        </>
                    }
                </>

            )}
        </div>
    );
}
