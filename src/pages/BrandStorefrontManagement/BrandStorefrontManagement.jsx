import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { environment } from "../../environments/environment";
import { uploadImage } from "../../helper/helper";
import { buildBrandMarketPath } from "../../helper/brandRoutes";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";
import { showToast } from "../../components/CustomToast/CustomToast";
import useLocalStorage from "../../hooks/useLocalStorage";
import "./BrandStorefrontManagement.css";

const emptyI18n = () => ({ en: "", ar: "" });

const initialStorefrontForm = {
  brandId: "",
  templateKey: "editorial-hero",
  discoverySummary: "",
  discoverySummary_i18n: emptyI18n(),
  tagline: "",
  tagline_i18n: emptyI18n(),
  heroTitle: "",
  heroTitle_i18n: emptyI18n(),
  heroDescription: "",
  heroDescription_i18n: emptyI18n(),
  heroMediaId: "",
  heroVideoId: "",
  heroVideoIdEn: "",
  heroVideoIdAr: "",
  heroPosterId: "",
  heroSubtitleMediaIdEn: "",
  heroSubtitleMediaIdAr: "",
  storyTitle: "",
  storyTitle_i18n: emptyI18n(),
  storyBody: "",
  storyBody_i18n: emptyI18n(),
  valuesTitle: "",
  valuesTitle_i18n: emptyI18n(),
  accentColor: "#2BA9A8",
  surfaceColor: "#0F1315",
  textColor: "#FFFFFF",
  borderColor: "#D6E6E6",
  mutedTextColor: "#5F6C75",
  themeMode: "dark",
  serviceTitle: "",
  serviceTitle_i18n: emptyI18n(),
  serviceDescription: "",
  serviceDescription_i18n: emptyI18n(),
  serviceEmail: "",
  servicePhone: "",
  serviceHours: "",
  serviceUrl: "",
  seoTitle: "",
  seoTitle_i18n: emptyI18n(),
  seoDescription: "",
  seoDescription_i18n: emptyI18n(),
  values: [],
  promoBlocks: [],
  serviceLinks: [],
  mediaGallery: [],
};

const initialCollectionForm = {
  id: "",
  brandId: "",
  title: "",
  title_i18n: emptyI18n(),
  description: "",
  description_i18n: emptyI18n(),
  sectionKey: "",
  categoryId: "",
  searchQuery: "",
  mediaId: "",
  ctaLabel: "",
  ctaLabel_i18n: emptyI18n(),
  ctaUrl: "",
  sortField: "",
  sortDesc: true,
  displayOrder: 0,
  maxProducts: 8,
  featured: false,
};

const initialPolicyForm = {
  id: "",
  title: "",
  title_i18n: emptyI18n(),
  description: "",
  description_i18n: emptyI18n(),
  content: "",
  content_i18n: emptyI18n(),
  category: "RETURNS",
  countryId: "JO",
  version: "1.0",
  effectiveFrom: "",
  effectiveTo: "",
  mandatory: false,
};

const storefrontTemplates = [
  { value: "editorial-hero", label: "Editorial Hero" },
  { value: "commerce-grid", label: "Commerce Grid" },
  { value: "story-collection", label: "Story + Collection" },
];

const sectionKeyOptions = [
  "featured",
  "featured_collection",
  "best_sellers",
  "new_arrivals",
  "recommended",
  "story_collection",
];

const policyCategories = ["RETURNS", "WARRANTY", "SHIPPING", "CUSTOMER"];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const readApp = async (url, params = {}) => {
  const response = await axios.get(`${environment.serverOrigin}${url}`, {
    headers: authHeaders(),
    params,
  });
  return response.data;
};

const writeApp = async (method, url, payload) =>
  axios({
    method,
    url: `${environment.serverOrigin}${url}`,
    headers: authHeaders(),
    data: payload,
  });

const makeStorefrontPayload = (form) => ({
  ...form,
  templateKey: form.templateKey || "editorial-hero",
  discoverySummary: form.discoverySummary_i18n.en || form.discoverySummary || "",
  tagline: form.tagline_i18n.en || form.tagline || "",
  heroTitle: form.heroTitle_i18n.en || form.heroTitle || "",
  heroDescription: form.heroDescription_i18n.en || form.heroDescription || "",
  storyTitle: form.storyTitle_i18n.en || form.storyTitle || "",
  storyBody: form.storyBody_i18n.en || form.storyBody || "",
  valuesTitle: form.valuesTitle_i18n.en || form.valuesTitle || "",
  serviceTitle: form.serviceTitle_i18n.en || form.serviceTitle || "",
  serviceDescription: form.serviceDescription_i18n.en || form.serviceDescription || "",
  seoTitle: form.seoTitle_i18n.en || form.seoTitle || "",
  seoDescription: form.seoDescription_i18n.en || form.seoDescription || "",
  values: (form.values || []).map((value) => ({
    ...value,
    title: value.title_i18n?.en || value.title || "",
    description: value.description_i18n?.en || value.description || "",
  })),
  promoBlocks: (form.promoBlocks || []).map((block) => ({
    ...block,
    title: block.title_i18n?.en || block.title || "",
    subTitle: block.subTitle_i18n?.en || block.subTitle || "",
    ctaLabel: block.ctaLabel_i18n?.en || block.ctaLabel || "",
  })),
  serviceLinks: (form.serviceLinks || []).map((link) => ({
    ...link,
    label: link.label_i18n?.en || link.label || "",
  })),
});

const makeCollectionPayload = (form) => ({
  ...form,
  title: form.title_i18n.en || form.title || "",
  description: form.description_i18n.en || form.description || "",
  ctaLabel: form.ctaLabel_i18n.en || form.ctaLabel || "",
  displayOrder: Number(form.displayOrder || 0),
  maxProducts: Number(form.maxProducts || 8),
});

const makePolicyPayload = (form, brandId) => ({
  ...form,
  brandId,
  title: form.title_i18n.en || form.title || "",
  description: form.description_i18n.en || form.description || "",
  content: form.content_i18n.en || form.content || "",
  effectiveFrom: form.effectiveFrom ? new Date(form.effectiveFrom).getTime() : Date.now(),
  effectiveTo: form.effectiveTo
    ? new Date(form.effectiveTo).getTime()
    : Date.now() + 31536000000,
});

const I18nFields = ({ label, value, onChange, type = "text" }) => (
  <div className="brand-storefront-form__grid brand-storefront-form__grid--split">
    <label>
      <span>{label} EN</span>
      {type === "textarea" ? (
        <textarea value={value.en} onChange={(event) => onChange("en", event.target.value)} />
      ) : (
        <input value={value.en} onChange={(event) => onChange("en", event.target.value)} />
      )}
    </label>
    <label>
      <span>{label} AR</span>
      {type === "textarea" ? (
        <textarea value={value.ar} onChange={(event) => onChange("ar", event.target.value)} />
      ) : (
        <input value={value.ar} onChange={(event) => onChange("ar", event.target.value)} />
      )}
    </label>
  </div>
);

const BrandStorefrontManagement = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData] = useLocalStorage("userData", null);

  const isMerchantRoute = location.pathname.startsWith("/merchant/");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [savingOverview, setSavingOverview] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [brand, setBrand] = useState(null);
  const [storefrontId, setStorefrontId] = useState("");
  const [storefrontForm, setStorefrontForm] = useState(initialStorefrontForm);
  const [collections, setCollections] = useState([]);
  const [collectionForm, setCollectionForm] = useState(initialCollectionForm);
  const [categories, setCategories] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("");
  const [policies, setPolicies] = useState([]);
  const [policyForm, setPolicyForm] = useState(initialPolicyForm);

  const canEditBrand = useMemo(() => {
    if (!brand) {
      return false;
    }

    if (!isMerchantRoute) {
      return true;
    }

    return String(brand.ownerId || "") === String(userData?.cbCusId || "");
  }, [brand, isMerchantRoute, userData?.cbCusId]);

  const loadStorefrontWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const brandRecord = await readApp(`brands/${brandId}`);
      const [storefrontPage, collectionPage, categoryPage, policyPage] = await Promise.all([
        readApp("manage/brand-landing", {
          q: `properties.brandId:${brandId}`,
          limit: 1,
        }),
        readApp("manage/brand-collections", {
          q: `properties.brandId:${brandId}`,
          limit: 100,
        }),
        readApp("manage/brand-categories", {
          limit: 200,
        }),
        readApp("manage/policies", {
          q: `properties.brandId:${brandId}`,
          limit: 50,
        }),
      ]);

      const mappingPage = await readApp("manage/brand-category-mappings", {
        q: `properties.brandKey:${brandRecord.key}`,
        limit: 200,
      });

      const storefrontItem = storefrontPage?.items?.[0] || null;
      setBrand(brandRecord);
      setStorefrontId(storefrontItem?.id || "");
      setStorefrontForm({
        ...initialStorefrontForm,
        ...storefrontItem,
        brandId,
        values: storefrontItem?.values || [],
        promoBlocks: storefrontItem?.promoBlocks || [],
        serviceLinks: storefrontItem?.serviceLinks || [],
        mediaGallery: storefrontItem?.mediaGallery || [],
        discoverySummary_i18n: storefrontItem?.discoverySummary_i18n || emptyI18n(),
        tagline_i18n: storefrontItem?.tagline_i18n || emptyI18n(),
        heroTitle_i18n: storefrontItem?.heroTitle_i18n || emptyI18n(),
        heroDescription_i18n: storefrontItem?.heroDescription_i18n || emptyI18n(),
        storyTitle_i18n: storefrontItem?.storyTitle_i18n || emptyI18n(),
        storyBody_i18n: storefrontItem?.storyBody_i18n || emptyI18n(),
        valuesTitle_i18n: storefrontItem?.valuesTitle_i18n || emptyI18n(),
        serviceTitle_i18n: storefrontItem?.serviceTitle_i18n || emptyI18n(),
        serviceDescription_i18n: storefrontItem?.serviceDescription_i18n || emptyI18n(),
        seoTitle_i18n: storefrontItem?.seoTitle_i18n || emptyI18n(),
        seoDescription_i18n: storefrontItem?.seoDescription_i18n || emptyI18n(),
      });
      setCollections(collectionPage?.items || []);
      setCategories(categoryPage?.items || []);
      setMappings(mappingPage?.items || []);
      setPolicies(policyPage?.items || []);
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to load storefront workspace");
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadStorefrontWorkspace();
  }, [loadStorefrontWorkspace]);

  const updateStorefrontI18n = (field, locale, value) => {
    setStorefrontForm((currentState) => ({
      ...currentState,
      [field]: {
        ...(currentState[field] || emptyI18n()),
        [locale]: value,
      },
    }));
  };

  const updateCollectionI18n = (field, locale, value) => {
    setCollectionForm((currentState) => ({
      ...currentState,
      [field]: {
        ...(currentState[field] || emptyI18n()),
        [locale]: value,
      },
    }));
  };

  const updatePolicyI18n = (field, locale, value) => {
    setPolicyForm((currentState) => ({
      ...currentState,
      [field]: {
        ...(currentState[field] || emptyI18n()),
        [locale]: value,
      },
    }));
  };

  const uploadToStorefrontField = async (field, file) => {
    if (!file) {
      return;
    }

    try {
      const response = await uploadImage(file);
      setStorefrontForm((currentState) => ({
        ...currentState,
        [field]: response?.result?.id || "",
      }));
      showToast.success("Media uploaded");
    } catch (error) {
      console.error(error);
      showToast.error(`Failed to upload ${field}`);
    }
  };

  const uploadToCollectionField = async (file) => {
    if (!file) {
      return;
    }

    try {
      const response = await uploadImage(file);
      setCollectionForm((currentState) => ({
        ...currentState,
        mediaId: response?.result?.id || "",
      }));
      showToast.success("Collection media uploaded");
    } catch (error) {
      console.error(error);
      showToast.error("Failed to upload collection media");
    }
  };

  const saveStorefront = async () => {
    if (!brandId || !canEditBrand) {
      showToast.error("You do not have permission to edit this storefront");
      return;
    }

    setSavingOverview(true);
    try {
      const payload = makeStorefrontPayload({ ...storefrontForm, brandId });
      if (storefrontId) {
        await writeApp("put", `manage/brand-landing/${storefrontId}`, payload);
      } else {
        const response = await writeApp("post", "manage/brand-landing", payload);
        setStorefrontId(response?.data?.id || "");
      }
      showToast.success("Storefront saved");
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to save storefront");
    } finally {
      setSavingOverview(false);
    }
  };

  const saveCollection = async () => {
    if (!brandId || !canEditBrand) {
      showToast.error("You do not have permission to edit collections");
      return;
    }

    setSavingCollection(true);
    try {
      const payload = makeCollectionPayload({ ...collectionForm, brandId });
      if (collectionForm.id) {
        await writeApp("put", `manage/brand-collections/${collectionForm.id}`, payload);
      } else {
        await writeApp("post", "manage/brand-collections", payload);
      }
      showToast.success("Collection saved");
      setCollectionForm({ ...initialCollectionForm, brandId });
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to save collection");
    } finally {
      setSavingCollection(false);
    }
  };

  const deleteCollection = async (id) => {
    try {
      await writeApp("delete", `manage/brand-collections/${id}`);
      showToast.success("Collection deleted");
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to delete collection");
    }
  };

  const addCategoryMapping = async () => {
    if (!selectedCategoryKey || !brand?.key) {
      return;
    }

    try {
      await writeApp("post", "manage/brand-category-mappings", {
        brandKey: brand.key,
        categoryKey: selectedCategoryKey,
      });
      showToast.success("Category assigned");
      setSelectedCategoryKey("");
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to assign category");
    }
  };

  const removeCategoryMapping = async (id) => {
    try {
      await writeApp("delete", `manage/brand-category-mappings/${id}`);
      showToast.success("Category removed");
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to remove category");
    }
  };

  const savePolicy = async () => {
    if (!brandId || !canEditBrand) {
      showToast.error("You do not have permission to edit policies");
      return;
    }

    setSavingPolicy(true);
    try {
      const payload = makePolicyPayload(policyForm, brandId);
      if (policyForm.id) {
        await writeApp("put", `manage/policies/${policyForm.id}`, payload);
      } else {
        await writeApp("post", "manage/policies", payload);
      }
      showToast.success("Policy saved");
      setPolicyForm(initialPolicyForm);
      await loadStorefrontWorkspace();
    } catch (error) {
      console.error(error);
      showToast.error(error?.response?.data?.message || "Failed to save policy");
    } finally {
      setSavingPolicy(false);
    }
  };

  const storefrontPreviewPath = brand ? buildBrandMarketPath(brand) : "/brand-stores";

  if (loading) {
    return (
      <div className="brand-storefront-page__state">
        <LoadingIndicator size="md" text="Loading storefront workspace..." />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="brand-storefront-page__state">
        <h2>Brand not found</h2>
      </div>
    );
  }

  if (!canEditBrand) {
    return (
      <div className="brand-storefront-page__state">
        <h2>You do not have permission to edit this storefront</h2>
      </div>
    );
  }

  return (
    <div className="brand-storefront-page">
      <div className="brand-storefront-page__header">
        <div>
          <h1>{brand.brandName} Storefront</h1>
          <p>Dedicated brand market authoring on top of the real storefront stack.</p>
        </div>
        <div className="brand-storefront-page__header-actions">
          <button type="button" onClick={() => navigate(storefrontPreviewPath)}>
            Open Storefront
          </button>
          <button type="button" onClick={() => navigate(-1)} className="brand-storefront-page__secondary">
            Back
          </button>
        </div>
      </div>

      <div className="brand-storefront-page__tabs">
        {[
          ["overview", "Overview"],
          ["collections", "Collections"],
          ["categories", "Categories"],
          ["policies", "Policies"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <section className="brand-storefront-form">
          <div className="brand-storefront-form__card">
            <h2>Template + Theme</h2>
            <div className="brand-storefront-form__grid">
              <label>
                <span>Template</span>
                <select
                  value={storefrontForm.templateKey}
                  onChange={(event) =>
                    setStorefrontForm((currentState) => ({
                      ...currentState,
                      templateKey: event.target.value,
                    }))
                  }
                >
                  {storefrontTemplates.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Theme Mode</span>
                <select
                  value={storefrontForm.themeMode}
                  onChange={(event) =>
                    setStorefrontForm((currentState) => ({
                      ...currentState,
                      themeMode: event.target.value,
                    }))
                  }
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
              {["accentColor", "surfaceColor", "textColor", "borderColor", "mutedTextColor"].map((field) => (
                <label key={field}>
                  <span>{field}</span>
                  <input
                    value={storefrontForm[field]}
                    onChange={(event) =>
                      setStorefrontForm((currentState) => ({
                        ...currentState,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>Hero + Story</h2>
            <I18nFields
              label="Tagline"
              value={storefrontForm.tagline_i18n}
              onChange={(locale, value) => updateStorefrontI18n("tagline_i18n", locale, value)}
            />
            <I18nFields
              label="Hero Title"
              value={storefrontForm.heroTitle_i18n}
              onChange={(locale, value) => updateStorefrontI18n("heroTitle_i18n", locale, value)}
            />
            <I18nFields
              label="Hero Description"
              type="textarea"
              value={storefrontForm.heroDescription_i18n}
              onChange={(locale, value) =>
                updateStorefrontI18n("heroDescription_i18n", locale, value)
              }
            />
            <I18nFields
              label="Story Title"
              value={storefrontForm.storyTitle_i18n}
              onChange={(locale, value) => updateStorefrontI18n("storyTitle_i18n", locale, value)}
            />
            <I18nFields
              label="Story Body"
              type="textarea"
              value={storefrontForm.storyBody_i18n}
              onChange={(locale, value) => updateStorefrontI18n("storyBody_i18n", locale, value)}
            />
          </div>

          <div className="brand-storefront-form__card">
            <h2>Hero Media</h2>
            <div className="brand-storefront-form__grid">
              {[
                ["heroMediaId", "Hero Image"],
                ["heroPosterId", "Hero Poster"],
                ["heroVideoIdEn", "Hero Video EN"],
                ["heroVideoIdAr", "Hero Video AR"],
                ["heroSubtitleMediaIdEn", "Subtitles EN"],
                ["heroSubtitleMediaIdAr", "Subtitles AR"],
              ].map(([field, label]) => (
                <label key={field}>
                  <span>{label}</span>
                  <input
                    value={storefrontForm[field]}
                    onChange={(event) =>
                      setStorefrontForm((currentState) => ({
                        ...currentState,
                        [field]: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="file"
                    onChange={(event) => uploadToStorefrontField(field, event.target.files?.[0])}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>Values + Service</h2>
            <I18nFields
              label="Values Title"
              value={storefrontForm.valuesTitle_i18n}
              onChange={(locale, value) => updateStorefrontI18n("valuesTitle_i18n", locale, value)}
            />
            <div className="brand-storefront-form__repeater">
              {(storefrontForm.values || []).map((value, index) => (
                <div key={`value-${index}`} className="brand-storefront-form__repeater-card">
                  <h3>Value {index + 1}</h3>
                  <I18nFields
                    label="Title"
                    value={value.title_i18n || emptyI18n()}
                    onChange={(locale, nextValue) =>
                      setStorefrontForm((currentState) => {
                        const values = [...(currentState.values || [])];
                        values[index] = {
                          ...values[index],
                          title_i18n: { ...(values[index]?.title_i18n || emptyI18n()), [locale]: nextValue },
                        };
                        return { ...currentState, values };
                      })
                    }
                  />
                  <I18nFields
                    label="Description"
                    type="textarea"
                    value={value.description_i18n || emptyI18n()}
                    onChange={(locale, nextValue) =>
                      setStorefrontForm((currentState) => {
                        const values = [...(currentState.values || [])];
                        values[index] = {
                          ...values[index],
                          description_i18n: {
                            ...(values[index]?.description_i18n || emptyI18n()),
                            [locale]: nextValue,
                          },
                        };
                        return { ...currentState, values };
                      })
                    }
                  />
                  <label>
                    <span>Media Id</span>
                    <input
                      value={value.mediaId || ""}
                      onChange={(event) =>
                        setStorefrontForm((currentState) => {
                          const values = [...(currentState.values || [])];
                          values[index] = { ...values[index], mediaId: event.target.value };
                          return { ...currentState, values };
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="brand-storefront-form__danger"
                    onClick={() =>
                      setStorefrontForm((currentState) => ({
                        ...currentState,
                        values: (currentState.values || []).filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remove Value
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="brand-storefront-form__add"
                onClick={() =>
                  setStorefrontForm((currentState) => ({
                    ...currentState,
                    values: [...(currentState.values || []), { title_i18n: emptyI18n(), description_i18n: emptyI18n() }],
                  }))
                }
              >
                Add Value
              </button>
            </div>

            <I18nFields
              label="Service Title"
              value={storefrontForm.serviceTitle_i18n}
              onChange={(locale, value) => updateStorefrontI18n("serviceTitle_i18n", locale, value)}
            />
            <I18nFields
              label="Service Description"
              type="textarea"
              value={storefrontForm.serviceDescription_i18n}
              onChange={(locale, value) =>
                updateStorefrontI18n("serviceDescription_i18n", locale, value)
              }
            />
            <div className="brand-storefront-form__grid">
              {["serviceEmail", "servicePhone", "serviceHours", "serviceUrl"].map((field) => (
                <label key={field}>
                  <span>{field}</span>
                  <input
                    value={storefrontForm[field]}
                    onChange={(event) =>
                      setStorefrontForm((currentState) => ({
                        ...currentState,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>Promo Blocks</h2>
            <div className="brand-storefront-form__repeater">
              {(storefrontForm.promoBlocks || []).map((block, index) => (
                <div key={`promo-${index}`} className="brand-storefront-form__repeater-card">
                  <h3>Promo {index + 1}</h3>
                  <I18nFields
                    label="Title"
                    value={block.title_i18n || emptyI18n()}
                    onChange={(locale, nextValue) =>
                      setStorefrontForm((currentState) => {
                        const promoBlocks = [...(currentState.promoBlocks || [])];
                        promoBlocks[index] = {
                          ...promoBlocks[index],
                          title_i18n: { ...(promoBlocks[index]?.title_i18n || emptyI18n()), [locale]: nextValue },
                        };
                        return { ...currentState, promoBlocks };
                      })
                    }
                  />
                  <I18nFields
                    label="Subtitle"
                    value={block.subTitle_i18n || emptyI18n()}
                    onChange={(locale, nextValue) =>
                      setStorefrontForm((currentState) => {
                        const promoBlocks = [...(currentState.promoBlocks || [])];
                        promoBlocks[index] = {
                          ...promoBlocks[index],
                          subTitle_i18n: {
                            ...(promoBlocks[index]?.subTitle_i18n || emptyI18n()),
                            [locale]: nextValue,
                          },
                        };
                        return { ...currentState, promoBlocks };
                      })
                    }
                  />
                  <div className="brand-storefront-form__grid">
                    {["ctaLabel", "targetUrl", "mediaId", "placement", "backgroundColor", "priority"].map((field) => (
                      <label key={field}>
                        <span>{field}</span>
                        <input
                          value={block[field] || ""}
                          onChange={(event) =>
                            setStorefrontForm((currentState) => {
                              const promoBlocks = [...(currentState.promoBlocks || [])];
                              promoBlocks[index] = { ...promoBlocks[index], [field]: event.target.value };
                              return { ...currentState, promoBlocks };
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="brand-storefront-form__danger"
                    onClick={() =>
                      setStorefrontForm((currentState) => ({
                        ...currentState,
                        promoBlocks: (currentState.promoBlocks || []).filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remove Promo
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="brand-storefront-form__add"
                onClick={() =>
                  setStorefrontForm((currentState) => ({
                    ...currentState,
                    promoBlocks: [...(currentState.promoBlocks || []), { title_i18n: emptyI18n(), subTitle_i18n: emptyI18n() }],
                  }))
                }
              >
                Add Promo Block
              </button>
            </div>
          </div>

          <div className="brand-storefront-form__actions">
            <button type="button" onClick={saveStorefront} disabled={savingOverview}>
              {savingOverview ? "Saving..." : storefrontId ? "Update Storefront" : "Create Storefront"}
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === "collections" ? (
        <section className="brand-storefront-form">
          <div className="brand-storefront-form__card">
            <h2>Collections</h2>
            <div className="brand-storefront-form__table">
              {collections.map((collection) => (
                <div key={collection.id} className="brand-storefront-form__table-row">
                  <div>
                    <strong>{collection.title || collection.title_i18n?.en}</strong>
                    <span>{collection.sectionKey || "unassigned"}</span>
                  </div>
                  <div className="brand-storefront-form__row-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionForm({
                          ...initialCollectionForm,
                          ...collection,
                          brandId,
                          title_i18n: collection.title_i18n || emptyI18n(),
                          description_i18n: collection.description_i18n || emptyI18n(),
                          ctaLabel_i18n: collection.ctaLabel_i18n || emptyI18n(),
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="brand-storefront-form__danger"
                      onClick={() => deleteCollection(collection.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>{collectionForm.id ? "Edit Collection" : "Create Collection"}</h2>
            <I18nFields
              label="Title"
              value={collectionForm.title_i18n}
              onChange={(locale, value) => updateCollectionI18n("title_i18n", locale, value)}
            />
            <I18nFields
              label="Description"
              type="textarea"
              value={collectionForm.description_i18n}
              onChange={(locale, value) =>
                updateCollectionI18n("description_i18n", locale, value)
              }
            />
            <div className="brand-storefront-form__grid">
              <label>
                <span>Section Key</span>
                <select
                  value={collectionForm.sectionKey}
                  onChange={(event) =>
                    setCollectionForm((currentState) => ({
                      ...currentState,
                      sectionKey: event.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  {sectionKeyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              {["searchQuery", "categoryId", "mediaId", "ctaUrl", "sortField"].map((field) => (
                <label key={field}>
                  <span>{field}</span>
                  <input
                    value={collectionForm[field]}
                    onChange={(event) =>
                      setCollectionForm((currentState) => ({
                        ...currentState,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
              <label>
                <span>Display Order</span>
                <input
                  type="number"
                  value={collectionForm.displayOrder}
                  onChange={(event) =>
                    setCollectionForm((currentState) => ({
                      ...currentState,
                      displayOrder: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Max Products</span>
                <input
                  type="number"
                  value={collectionForm.maxProducts}
                  onChange={(event) =>
                    setCollectionForm((currentState) => ({
                      ...currentState,
                      maxProducts: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Sort Desc</span>
                <select
                  value={collectionForm.sortDesc ? "true" : "false"}
                  onChange={(event) =>
                    setCollectionForm((currentState) => ({
                      ...currentState,
                      sortDesc: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>
              <label>
                <span>Featured</span>
                <select
                  value={collectionForm.featured ? "true" : "false"}
                  onChange={(event) =>
                    setCollectionForm((currentState) => ({
                      ...currentState,
                      featured: event.target.value === "true",
                    }))
                  }
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              </label>
            </div>
            <I18nFields
              label="CTA Label"
              value={collectionForm.ctaLabel_i18n}
              onChange={(locale, value) => updateCollectionI18n("ctaLabel_i18n", locale, value)}
            />
            <input type="file" onChange={(event) => uploadToCollectionField(event.target.files?.[0])} />
            <div className="brand-storefront-form__actions">
              <button type="button" onClick={saveCollection} disabled={savingCollection}>
                {savingCollection ? "Saving..." : collectionForm.id ? "Update Collection" : "Create Collection"}
              </button>
              {collectionForm.id ? (
                <button
                  type="button"
                  className="brand-storefront-form__secondary"
                  onClick={() => setCollectionForm({ ...initialCollectionForm, brandId })}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "categories" ? (
        <section className="brand-storefront-form">
          <div className="brand-storefront-form__card">
            <h2>Assigned Brand Categories</h2>
            <div className="brand-storefront-form__chip-list">
              {mappings.map((mapping) => {
                const category = categories.find((item) => item.key === mapping.categoryKey);
                return (
                  <div key={mapping.id} className="brand-storefront-form__chip">
                    <span>{category?.categoryName || mapping.categoryKey}</span>
                    <button type="button" onClick={() => removeCategoryMapping(mapping.id)}>
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>Add Category Mapping</h2>
            <div className="brand-storefront-form__grid brand-storefront-form__grid--split">
              <label>
                <span>Category</span>
                <select
                  value={selectedCategoryKey}
                  onChange={(event) => setSelectedCategoryKey(event.target.value)}
                >
                  <option value="">Select</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.key}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="brand-storefront-form__actions">
              <button type="button" onClick={addCategoryMapping}>
                Assign Category
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "policies" ? (
        <section className="brand-storefront-form">
          <div className="brand-storefront-form__card">
            <h2>Existing Policies</h2>
            <div className="brand-storefront-form__table">
              {policies.map((policy) => (
                <div key={policy.id} className="brand-storefront-form__table-row">
                  <div>
                    <strong>{policy.title || policy.title_i18n?.en}</strong>
                    <span>{policy.category}</span>
                  </div>
                  <div className="brand-storefront-form__row-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setPolicyForm({
                          ...initialPolicyForm,
                          ...policy,
                          title_i18n: policy.title_i18n || emptyI18n(),
                          description_i18n: policy.description_i18n || emptyI18n(),
                          content_i18n: policy.content_i18n || emptyI18n(),
                          effectiveFrom: policy.effectiveFrom
                            ? new Date(policy.effectiveFrom).toISOString().slice(0, 16)
                            : "",
                          effectiveTo: policy.effectiveTo
                            ? new Date(policy.effectiveTo).toISOString().slice(0, 16)
                            : "",
                        })
                      }
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="brand-storefront-form__card">
            <h2>{policyForm.id ? "Edit Policy" : "Create Policy"}</h2>
            <I18nFields
              label="Title"
              value={policyForm.title_i18n}
              onChange={(locale, value) => updatePolicyI18n("title_i18n", locale, value)}
            />
            <I18nFields
              label="Description"
              type="textarea"
              value={policyForm.description_i18n}
              onChange={(locale, value) =>
                updatePolicyI18n("description_i18n", locale, value)
              }
            />
            <I18nFields
              label="Content"
              type="textarea"
              value={policyForm.content_i18n}
              onChange={(locale, value) => updatePolicyI18n("content_i18n", locale, value)}
            />
            <div className="brand-storefront-form__grid">
              <label>
                <span>Category</span>
                <select
                  value={policyForm.category}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      category: event.target.value,
                    }))
                  }
                >
                  {policyCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Country</span>
                <input
                  value={policyForm.countryId}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      countryId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Version</span>
                <input
                  value={policyForm.version}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      version: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Effective From</span>
                <input
                  type="datetime-local"
                  value={policyForm.effectiveFrom}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      effectiveFrom: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Effective To</span>
                <input
                  type="datetime-local"
                  value={policyForm.effectiveTo}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      effectiveTo: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Mandatory</span>
                <select
                  value={policyForm.mandatory ? "true" : "false"}
                  onChange={(event) =>
                    setPolicyForm((currentState) => ({
                      ...currentState,
                      mandatory: event.target.value === "true",
                    }))
                  }
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              </label>
            </div>
            <div className="brand-storefront-form__actions">
              <button type="button" onClick={savePolicy} disabled={savingPolicy}>
                {savingPolicy ? "Saving..." : policyForm.id ? "Update Policy" : "Create Policy"}
              </button>
              {policyForm.id ? (
                <button
                  type="button"
                  className="brand-storefront-form__secondary"
                  onClick={() => setPolicyForm(initialPolicyForm)}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default BrandStorefrontManagement;
