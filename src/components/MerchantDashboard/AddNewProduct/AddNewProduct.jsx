import "./AddNewProduct.css";
import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  productDefaultValues,
  STEP_FIELDS,
  transformToBackendBody,
  transformFromApiResponse,
  transformDirtyProductToUpdateBody,
  buildSkuUpdatePayload,
} from "../Schemas/Productschema";
import HeaderAddProduct from "./components/HeaderAddProduct/HeaderAddProduct";
import ProductDescriptionStep from "./components/ProdcutDescriptionStep/ProdcutDescriptionStep";
import SwitchButtons from "./components/SwitchButtons/SwitchButtons";
import ProductDetailsStep from "./components/ProductDetailsStep/ProductDetailsStep";
import ProductShippingStep from "./components/ProductShippingStep/ProductShippingStep";
import ProductPublishingStep from "./components/ProductPublishingStep/ProductPublishingStep";
import ProductStepper from "./components/ProductStepper/ProductStepper";
import VariantManager from "./components/VariantManager/VariantManager";
import ProductSidebar from "./components/ProductSidebar/ProductSidebar";
import useAddProduct from "../../../hooks/useAddProduct";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { useSearchParams, useNavigate } from "react-router-dom";
import { showToast } from "../../CustomToast/CustomToast";
import { useGetProductDetailsQuery } from "../../../store/slices/productsSlice";

const TOTAL_STEPS = 5;

const AddNewProduct = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { createProduct, updateProduct, updateSkuProduct } = useAddProduct();
  const [user] = useLocalStorage("userData");
  const merchantId = user?.cbCusId;
  const [searchParams] = useSearchParams();
  const inventoryIdFromURL = searchParams.get("inventoryId");
  const productIdFromURL = searchParams.get("productId");
  const isEditMode = !!productIdFromURL;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("en");
  const skuIdsByNameRef = useRef({});

  const { data: productDetails, isLoading: isLoadingProduct } = useGetProductDetailsQuery(
    productIdFromURL,
    { skip: !productIdFromURL },
  );

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isEditMode || !productDetails) return;
    const formValues = transformFromApiResponse(productDetails);
    const skuMap = {};
    (productDetails.skus || []).forEach((sku) => {
      const name = (sku.attributeValues || [])
        .map((a) => a.value_i18n?.en || a.valueKey || "")
        .join(" / ");
      skuMap[name] = { id: sku.id, status: sku.status || "DRAFT" };
    });
    skuIdsByNameRef.current = skuMap;
    reset(formValues);
  }, [productDetails, isEditMode, reset]);

  const handleNext = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[activeStep] || [];
    const titleEnError = errors.titleEn?.message;
    const titleArError = errors.titleAr?.message;

    if (activeStep === 1 && titleArError && !titleEnError) {
      setActiveTab("ar");
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);

      if (!isValid) {
        if (activeStep === 3) {
          const variantErrors = errors?.variants;
          const hasPhysicalSpecError =
            Array.isArray(variantErrors) &&
            variantErrors.some(
              (v) => v?.weight || v?.length || v?.width || v?.height,
            );

          if (hasPhysicalSpecError) {
            showToast.error("All physical specs are required");
          }
        }
        return;
      }
    }

    setCompletedSteps((prev) =>
      prev.includes(activeStep) ? prev : [...prev, activeStep],
    );
    setActiveStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, [activeStep, trigger, errors]);

  const handlePrevious = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const onFinalSubmit = useCallback(
    async (data) => {
      if (isEditMode) {
        try {
          const { variants: _variantsDirty, ...productDirtyFields } = dirtyFields;
          if (Object.keys(productDirtyFields).length > 0) {
            const updatePayload = transformDirtyProductToUpdateBody(data, productDirtyFields);
            if (Object.keys(updatePayload).length > 0) {
              await updateProduct(productIdFromURL, updatePayload);
            }
          }

          const variantDirtyArray = dirtyFields.variants || [];
          for (let i = 0; i < data.variants.length; i++) {
            const dirty = variantDirtyArray[i];
            if (!dirty || Object.keys(dirty).length === 0) continue;
            const variantName = data.variants[i]?.name;
            const skuEntry = skuIdsByNameRef.current[variantName];
            if (!skuEntry?.id) continue;
            const skuPayload = buildSkuUpdatePayload(
              data.variants[i],
              data.options,
              { moq: data.moq, packQty: data.packQty, status: skuEntry.status },
            );
            await updateSkuProduct(skuEntry.id, skuPayload);
          }

          navigate("/merchant/dashboard/products");
        } catch {
          // error toasts handled inside hooks
        }
      } else {
        const body = transformToBackendBody(data, {
          merchantId,
          storeId: inventoryIdFromURL,
        });
        try {
          await createProduct({ productData: body });
          reset(productDefaultValues);
          setActiveStep(1);
          setCompletedSteps([]);
          navigate("/merchant/dashboard/products");
        } catch {
          // error toast is already handled inside createProduct
        }
      }
    },
    [isEditMode, dirtyFields, productIdFromURL, merchantId, inventoryIdFromURL, createProduct, updateProduct, updateSkuProduct, reset, navigate],
  );

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <ProductDescriptionStep
            control={control}
            errors={errors}
            setValue={setValue}
            watch={watch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        );
      case 2:
        return <ProductDetailsStep control={control} errors={errors} />;
      case 3:
        return (
          <VariantManager
            control={control}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
            activeStep={activeStep}
          />
        );
      case 4:
        return (
          <ProductShippingStep
            control={control}
            errors={errors}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
          />
        );
      case 5:
        return <ProductPublishingStep control={control} errors={errors} />;
      default:
        return null;
    }
  };

  if (isEditMode && isLoadingProduct) {
    return <div className="anp-loading">Loading product details...</div>;
  }

  return (
    <>
      <HeaderAddProduct isEditMode={isEditMode} />
      <SwitchButtons
        activeStep={activeStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit(onFinalSubmit)}
        isEditMode={isEditMode}
      />
      <div className="product-description-step">
        <ProductStepper
          activeStep={activeStep}
          completedSteps={completedSteps}
        />
      </div>

      <div className="anp-content-layout">
        <div className="anp-content-left">{renderStep()}</div>
        <div className="anp-content-right">
          <ProductSidebar control={control} />
        </div>
      </div>
    </>
  );
};

export default AddNewProduct;
