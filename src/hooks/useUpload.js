import { uploadFile, validateFile, uploadedFileData } from "../store/slices/uploadeFiles";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showToast } from "../components/CustomToast/CustomToast";

export const useUpload = () => {
  const dispatch = useDispatch();
  const { files, validateData, uploadedData } = useSelector((state) => state.uploadedFiles);
  const [loading, setLoading] = useState(false);

  const upload = (file) => {
    setLoading(true);
    return dispatch(uploadFile(file))
      .unwrap()
      .then((data) => {
        showToast.success("File uploaded successfully");
        return { success: true, data };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to upload file");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const validate = (fileData) => {
    setLoading(true);
    return dispatch(validateFile(fileData))
      .unwrap()
      .then((data) => {
        showToast.success(data?.message || "File validated successfully");
        return { success: true, data };
      })
      .catch((error) => {
        showToast.error(error?.message || "File validation failed");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const uploadData = (fileData) => {
    setLoading(true);
    return dispatch(uploadedFileData(fileData))
      .unwrap()
      .then((data) => {
        showToast.success("Products imported successfully");
        return { success: true, data };
      })
      .catch((error) => {
        showToast.error(error?.message || "Failed to import products");
        return { success: false, error };
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    upload,
    validate,
    uploadData,
    files,
    validateData,
    uploadedData,
    loading,
  };
};