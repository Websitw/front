import { useState, useEffect, useCallback } from "react";
import { useFieldArray } from "react-hook-form";
import { createDefaultVariant } from "../../../Schemas/Productschema";
import DefineOptions from "./components/DefineOptions";
import VariantMatrix from "./components/VariantMatrix";
import AddOptionModal from "./components/AddOptionModal";
import VariantImagesModal from "./components/VariantImagesModal";

export default function VariantManager({
  control,
  watch,
  setValue,
  getValues,
  errors,
  maxImagesPerVariant = 5,
  activeStep
}) {
  const [showAddOption, setShowAddOption] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState(0);
  const [imagesModalVariant, setImagesModalVariant] = useState(null);

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: "options" });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: "variants",
  });

  const options = watch("options");

  const generateVariants = useCallback(
    (opts) => {
      if (!opts || opts.length === 0) return [];

      const combos = opts.reduce((acc, option) => {
        if (acc.length === 0) return option.values.map((v) => [v]);
        const result = [];
        acc.forEach((combo) => {
          option.values.forEach((v) => {
            result.push([...combo, v]);
          });
        });
        return result;
      }, []);

      const currentVariants = getValues("variants") || [];

      return combos.map((combo, i) => {
        const name = combo.join(" / ");
        const existing = currentVariants.find((v) => v.name === name);
        return existing || createDefaultVariant(name, i);
      });
    },
    [getValues]
  );

  useEffect(() => {
    if (!options || options.length === 0) return;
    const newVariants = generateVariants(options);
    const currentVariants = getValues("variants") || [];
    const currentNames = new Set(currentVariants.map((v) => v.name));
    const structureUnchanged =
      newVariants.length === currentVariants.length &&
      newVariants.every((v) => currentNames.has(v.name));
    if (!structureUnchanged) {
      replaceVariants(newVariants);
    }
  }, [JSON.stringify(options)]);

  const handleAddOption = (option) => {
    appendOption(option);
  };

  const handleUpdateOptionValues = (optIndex, newValues) => {
    setValue(`options.${optIndex}.values`, newValues);
  };

  const handleDeleteOption = (optIndex) => {
    removeOption(optIndex);
    if (options.length <= 1) {
      replaceVariants([]);
    }
  };

  const handleCopyTiersToAll = (fromIndex) => {
    const tiers = getValues(`variants.${fromIndex}.wholesaleTiers`);
    const variants = getValues("variants");
    variants.forEach((_, i) => {
      if (i !== fromIndex) {
        setValue(`variants.${i}.wholesaleTiers`, [...tiers]);
      }
    });
  };

  const handleUpdateVariantImages = (variantIndex, newImages) => {
    setValue(`variants.${variantIndex}.images`, newImages);
  };

  const handleToggleExpand = (index) => {
    setExpandedVariant((prev) => (prev === index ? null : index));
  };

  // Guard: if no control provided
  if (!control) {
    return <div>Variants tab — no form control provided.</div>;
  }

  

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <DefineOptions
        optionFields={optionFields}
        options={options}
        onAddClick={() => setShowAddOption(true)}
        onDeleteOption={handleDeleteOption}
        onUpdateOptionValues={handleUpdateOptionValues}
      />

      {errors?.variants?.message && (
        <span style={{ color: "#ef4444", fontSize: "13px" }}>{errors.variants.message}</span>
      )}

      <VariantMatrix
        variantFields={variantFields}
        control={control}
        watch={watch}
        errors={errors}
        expandedVariant={expandedVariant}
        onToggleExpand={handleToggleExpand}
        onOpenImages={setImagesModalVariant}
        onCopyTiersToAll={handleCopyTiersToAll}
      />

      <AddOptionModal
        open={showAddOption}
        onClose={() => setShowAddOption(false)}
        onAdd={handleAddOption}
      />

      {imagesModalVariant !== null && (
        <VariantImagesModal
          open
          onClose={() => setImagesModalVariant(null)}
          images={watch(`variants.${imagesModalVariant}.images`) || []}
          onUpdate={(imgs) =>
            handleUpdateVariantImages(imagesModalVariant, imgs)
          }
          maxImages={maxImagesPerVariant}
        />
      )}
    </div>
  );
}