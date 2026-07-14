const DEFAULT_CROP_SIZE = 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const dataUrlToImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = dataUrl;
  });

const fileToImage = async (file) => {
  const dataUrl = await readFileAsDataUrl(file);
  return dataUrlToImage(dataUrl);
};

const dataUrlToBlob = async (dataUrl) => {
  const [header, base64Data = ""] = String(dataUrl || "").split(",");
  const matches = header.match(/^data:(.*?);base64$/);
  const mimeType = matches?.[1] || "image/jpeg";
  const binaryString = atob(base64Data);
  const byteArray = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    byteArray[index] = binaryString.charCodeAt(index);
  }

  return new Blob([byteArray], { type: mimeType });
};

export const cropImageFileToSquare = async (
  file,
  size = DEFAULT_CROP_SIZE,
) => {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  const sourceSize = Math.min(image.width, image.height);
  const sourceX = Math.max(0, Math.floor((image.width - sourceSize) / 2));
  const sourceY = Math.max(0, Math.floor((image.height - sourceSize) / 2));

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error("Failed to crop image"));
      },
      "image/jpeg",
      0.92,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const croppedFile = new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
  });

  const previewUrl = await readFileAsDataUrl(croppedFile);

  return {
    file: croppedFile,
    previewUrl,
  };
};

export const createCroppedImageFromArea = async (
  imageSrc,
  croppedAreaPixels,
  fileName = "image.jpg",
  size = DEFAULT_CROP_SIZE,
) => {
  const image = await dataUrlToImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    size,
    size,
  );

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const blob = await dataUrlToBlob(dataUrl);

  const baseName = fileName.replace(/\.[^.]+$/, "") || "image";
  const file = new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
  });

  return {
    file,
    previewUrl: dataUrl,
  };
};