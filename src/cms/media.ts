export interface OptimizedImageResult {
  file: File;
  width: number;
  height: number;
}

const readImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });

export async function optimizeImage(file: File, maxWidth = 1920, quality = 0.85): Promise<OptimizedImageResult> {
  if (!file.type.startsWith("image/")) {
    return { file, width: 0, height: 0 };
  }

  const image = await readImage(file);
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { file, width: image.width, height: image.height };
  }

  ctx.drawImage(image, 0, 0, width, height);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), outputType, quality);
  });

  if (!blob) {
    return { file, width: image.width, height: image.height };
  }

  const optimized = new File([blob], file.name, { type: blob.type });
  return { file: optimized, width, height };
}
