import sharp from "sharp";
import { exec } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

class TiffService {
  /**
   * Convert base64 image data to TIFF buffer
   * @param imageData Base64 encoded image data (without data URL prefix)
   * @returns TIFF buffer
   */
  async convertImageToTiff(imageData: string): Promise<Buffer> {
    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, "base64");

      // Convert to TIFF using sharp
      const tiffBuffer = await sharp(imageBuffer)
        .tiff({
          compression: "lzw", // Use LZW compression for smaller file size
          quality: 100,
          predictor: "horizontal",
        })
        .toBuffer();

      return tiffBuffer;
    } catch (error) {
      console.error("Error converting image to TIFF:", error);
      throw new Error("Failed to convert image to TIFF format");
    }
  }

  /**
   * Generate multi-page TIFF from multiple images using ImageMagick
   * @param images Array of base64 encoded images
   * @returns Multi-page TIFF buffer
   */
  async generateMultiPageTiff(images: string[]): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tiff-"));
    const tempFiles: string[] = [];

    try {
      if (images.length === 0) {
        throw new Error("No images provided");
      }

      // If only one page, convert and return it directly
      if (images.length === 1) {
        return await this.convertImageToTiff(images[0]);
      }

      // Save each image as a temporary file
      for (let i = 0; i < images.length; i++) {
        const imageBuffer = Buffer.from(images[i], "base64");
        const tempFile = path.join(tempDir, `page_${i + 1}.png`);
        await fs.writeFile(tempFile, imageBuffer);
        tempFiles.push(tempFile);
      }

      // Output file path
      const outputFile = path.join(tempDir, "output.tiff");

      // Use ImageMagick to create multi-page TIFF
      const command = `convert ${tempFiles.join(
        " "
      )} -compress lzw "${outputFile}"`;

      console.log("Executing ImageMagick command:", command);
      await execAsync(command);

      // Read the output file
      const tiffBuffer = await fs.readFile(outputFile);

      return tiffBuffer;
    } catch (error) {
      console.error("Error generating multi-page TIFF:", error);
      throw new Error("Failed to generate multi-page TIFF file");
    } finally {
      // Clean up temporary files
      try {
        for (const file of tempFiles) {
          await fs.unlink(file).catch(() => {}); // Ignore errors
        }
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Error cleaning up temporary files:", cleanupError);
      }
    }
  }

  /**
   * Process canvas data URLs and convert to TIFF
   * @param dataUrls Array of canvas data URLs (e.g., "data:image/png;base64,...")
   * @returns TIFF buffer
   */
  async processCanvasDataUrls(dataUrls: string[]): Promise<Buffer> {
    try {
      // Extract base64 data from data URLs (supports both PNG and JPEG)
      const base64Images = dataUrls.map((dataUrl) => {
        const matches = dataUrl.match(
          /^data:image\/(png|jpeg|jpg);base64,(.+)$/
        );
        if (!matches || !matches[2]) {
          throw new Error("Invalid data URL format");
        }
        return matches[2];
      });

      // Generate TIFF
      return await this.generateMultiPageTiff(base64Images);
    } catch (error) {
      console.error("Error processing canvas data URLs:", error);
      throw error;
    }
  }

  /**
   * Alternative method using Sharp only (combines pages vertically)
   * Use this if ImageMagick is not available
   */
  async generateCombinedTiff(images: string[]): Promise<Buffer> {
    try {
      if (images.length === 0) {
        throw new Error("No images provided");
      }

      // If only one page, convert and return it directly
      if (images.length === 1) {
        return await this.convertImageToTiff(images[0]);
      }

      // For multiple pages, combine them vertically into a single tall image
      const imageBuffers = images.map((img) => Buffer.from(img, "base64"));

      // Get dimensions of all images
      const metadataPromises = imageBuffers.map((buffer) =>
        sharp(buffer).metadata()
      );
      const metadataArray = await Promise.all(metadataPromises);

      // Calculate total height and max width
      let totalHeight = 0;
      let maxWidth = 0;

      for (const metadata of metadataArray) {
        if (!metadata.width || !metadata.height) {
          throw new Error("Unable to get image dimensions");
        }
        totalHeight += metadata.height;
        maxWidth = Math.max(maxWidth, metadata.width);
      }

      // Add some padding between pages
      const pagePadding = 50;
      totalHeight += pagePadding * (images.length - 1);

      // Create a composite image
      const compositeOperations: sharp.OverlayOptions[] = [];
      let currentY = 0;

      for (let i = 0; i < imageBuffers.length; i++) {
        const metadata = metadataArray[i];
        if (!metadata.width || !metadata.height) continue;

        // Center the image horizontally if it's narrower than maxWidth
        const xOffset = Math.floor((maxWidth - metadata.width) / 2);

        compositeOperations.push({
          input: imageBuffers[i],
          top: currentY,
          left: xOffset,
        });

        currentY +=
          metadata.height + (i < imageBuffers.length - 1 ? pagePadding : 0);
      }

      // Create the combined image
      const combinedImage = await sharp({
        create: {
          width: maxWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite(compositeOperations)
        .tiff({
          compression: "lzw",
          quality: 100,
          predictor: "horizontal",
        })
        .toBuffer();

      return combinedImage;
    } catch (error) {
      console.error("Error generating combined TIFF:", error);
      throw new Error("Failed to generate TIFF file");
    }
  }
}

export default new TiffService();
