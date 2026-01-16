import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

/**
 * Remove background from an image using remove.bg API
 * @param {string} inputPath - Path to the input image file
 * @param {string} outputPath - Path where the processed image should be saved
 * @returns {Promise<string>} - Returns the output path on success
 */
async function removeBackground(inputPath, outputPath) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error('REMOVE_BG_API_KEY is not configured. Please add it to your .env file.');
  }

  // Verify input file exists
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(inputPath));
    formData.append('size', 'auto');

    // Use axios for better FormData handling
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });

    // Save the processed image
    fs.writeFileSync(outputPath, Buffer.from(response.data));

    return outputPath;
  } catch (error) {
    // Clean up output file if it was partially created
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Try to parse error message
      let errorMessage = 'Background removal failed';
      try {
        const errorText = Buffer.from(errorData).toString('utf-8');
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.errors?.[0]?.title || errorJson.error || errorMessage;
      } catch (e) {
        // If can't parse, use default message
      }

      // Handle specific error codes
      if (status === 402) {
        throw new Error('Insufficient credits in your remove.bg account. Please add credits or upgrade your plan.');
      } else if (status === 403) {
        throw new Error('Invalid remove.bg API key. Please check your REMOVE_BG_API_KEY in .env file.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 400) {
        throw new Error(`Bad request: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    // Network error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Failed to connect to remove.bg API. Please check your internet connection.');
    }

    throw error;
  }
}

export { removeBackground };
