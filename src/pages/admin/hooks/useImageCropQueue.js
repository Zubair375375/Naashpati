import { useCallback, useEffect, useState } from "react";

export const useImageCropQueue = () => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);

  useEffect(() => {
    if (currentFile || pendingFiles.length === 0) {
      return;
    }

    const [nextFile, ...rest] = pendingFiles;
    setCurrentFile(nextFile);
    setPendingFiles(rest);
  }, [currentFile, pendingFiles]);

  const enqueueFiles = useCallback((files) => {
    setPendingFiles((prevFiles) => [...prevFiles, ...files]);
  }, []);

  const completeCurrent = useCallback((croppedImage) => {
    setCurrentFile(null);
    return croppedImage;
  }, []);

  const skipCurrent = useCallback(() => {
    setCurrentFile(null);
  }, []);

  const clearQueue = useCallback(() => {
    setPendingFiles([]);
    setCurrentFile(null);
  }, []);

  return {
    currentFile,
    isOpen: Boolean(currentFile),
    enqueueFiles,
    completeCurrent,
    skipCurrent,
    clearQueue,
  };
};
