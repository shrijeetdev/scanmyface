/**
 * Face Validator — Client-side heuristic face detection
 * Uses canvas pixel analysis to detect skin-tone regions
 * and aspect ratio checks before allowing AI scan to run.
 */

/**
 * Checks if a pixel (R,G,B) is a skin-tone color
 * Using the Peer/Kovac skin-tone detection algorithm
 */
function isSkinPixel(r, g, b) {
  // Rule 1: Peer et al. skin model (RGB)
  const rule1 = r > 95 && g > 40 && b > 20 &&
    (Math.max(r, g, b) - Math.min(r, g, b)) > 15 &&
    Math.abs(r - g) > 15 && r > g && r > b;

  // Rule 2: Looser YCbCr-inspired heuristic in RGB space
  const rule2 = r > 80 && g > 30 && b > 15 &&
    r > b && (r - b) > 20 && g > b;

  return rule1 || rule2;
}

/**
 * Validates that the image contains a human face
 * Returns { isValid, confidence, message }
 */
export async function validateFaceImage(imageFile) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Scale down for performance
      const maxDim = 200;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const totalPixels = canvas.width * canvas.height;

      // Count skin-tone pixels
      let skinPixels = 0;
      // Focus on center region (face is usually centered)
      const marginX = Math.round(canvas.width * 0.15);
      const marginY = Math.round(canvas.height * 0.1);

      for (let y = marginY; y < canvas.height - marginY; y++) {
        for (let x = marginX; x < canvas.width - marginX; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          if (isSkinPixel(r, g, b)) {
            skinPixels++;
          }
        }
      }

      const centerPixels = (canvas.width - 2 * marginX) * (canvas.height - 2 * marginY);
      const skinPercent = (skinPixels / centerPixels) * 100;

      // Aspect ratio check — selfies/portraits are roughly 3:4 to 4:3
      const aspectRatio = img.width / img.height;
      const isPortraitAspect = aspectRatio > 0.4 && aspectRatio < 2.5;

      // Check for solid color images (no variance)
      let totalR = 0, totalG = 0, totalB = 0;
      const sampleCount = Math.min(totalPixels, 500);
      for (let i = 0; i < sampleCount; i++) {
        const idx = Math.floor(Math.random() * totalPixels) * 4;
        totalR += pixels[idx];
        totalG += pixels[idx + 1];
        totalB += pixels[idx + 2];
      }
      const avgR = totalR / sampleCount;
      const avgG = totalG / sampleCount;
      const avgB = totalB / sampleCount;

      let variance = 0;
      for (let i = 0; i < sampleCount; i++) {
        const idx = Math.floor(Math.random() * totalPixels) * 4;
        variance += Math.pow(pixels[idx] - avgR, 2) +
                    Math.pow(pixels[idx + 1] - avgG, 2) +
                    Math.pow(pixels[idx + 2] - avgB, 2);
      }
      variance = variance / (sampleCount * 3);
      const isSolidColor = variance < 100;

      // Decision logic
      if (isSolidColor) {
        resolve({
          isValid: false,
          confidence: 0,
          message: 'This appears to be a solid color or blank image. Please upload a clear photo of your face.',
        });
        return;
      }

      if (!isPortraitAspect) {
        resolve({
          isValid: false,
          confidence: 15,
          message: 'The image aspect ratio doesn\'t match a typical face photo. Please upload a portrait-oriented selfie.',
        });
        return;
      }

      if (skinPercent < 8) {
        resolve({
          isValid: false,
          confidence: Math.round(skinPercent * 2),
          message: 'No face detected in this image. Please upload a clear, front-facing photo of your face with good lighting.',
        });
        return;
      }

      if (skinPercent < 15) {
        resolve({
          isValid: false,
          confidence: Math.round(skinPercent * 3),
          message: 'The image doesn\'t appear to contain a clear face. Please upload a closer selfie with your face centered in the frame.',
        });
        return;
      }

      // Passed all checks
      const confidence = Math.min(Math.round(skinPercent * 2.5), 95);
      resolve({
        isValid: true,
        confidence,
        message: 'Face detected successfully.',
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        confidence: 0,
        message: 'Could not read the image. Please upload a valid JPEG or PNG photo.',
      });
    };

    img.src = url;
  });
}
