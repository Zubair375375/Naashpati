import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  createCroppedImageFromArea,
  cropImageFileToSquare,
} from "../utils/imageCrop";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const ImageCropperModal = ({
  isOpen,
  file,
  onCancel,
  onConfirm,
  aspect = 1,
  outputSize = 1024,
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSource = async () => {
      if (!isOpen || !file) {
        setImageSrc("");
        return;
      }

      setLoadingImage(true);
      try {
        const nextSrc = await readFileAsDataUrl(file);
        if (isMounted) {
          setImageSrc(nextSrc);
        }
      } finally {
        if (isMounted) {
          setLoadingImage(false);
        }
      }
    };

    loadSource();

    return () => {
      isMounted = false;
    };
  }, [file, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setSaving(false);
      setLoadingImage(false);
      setImageSrc("");
    }
  }, [isOpen]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !file) {
      return;
    }

    setSaving(true);
    try {
      const cropped = croppedAreaPixels
        ? await createCroppedImageFromArea(
            imageSrc,
            croppedAreaPixels,
            file?.name || "image.jpg",
            outputSize,
          )
        : await cropImageFileToSquare(file, outputSize);

      await Promise.resolve(onConfirm(cropped));
    } catch (error) {
      toast.error(error?.message || "Unable to crop image.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !file) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Crop image</h2>
            <p className="text-sm text-gray-500">
              Drag to position the image and zoom to frame the crop.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Skip
          </button>
        </div>

        <div className="relative h-[60vh] min-h-[360px] bg-gray-900">
          {loadingImage ? (
            <div className="flex h-full items-center justify-center text-sm text-white">
              Loading image...
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="border-t border-gray-200 px-5 py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Skip image
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || loadingImage}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Cropping..." : "Use crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
