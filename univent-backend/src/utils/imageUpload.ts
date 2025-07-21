import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

export const uploadToImgBB = async (buffer: any, filename: string) => {
  try {
    if (!buffer || buffer.length === 0) {
      logger.error(`Invalid or empty buffer provided`);
      return null;
    }

    const formData = new FormData();
    formData.append("key", process.env.IMGBB_API_KEY);
    formData.append("image", buffer, {
      filename: filename || "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // logger.debug("ImgBB upload response: ", response.data);
    return response.data.data.url;
  } catch (err: any) {
    logger.error(
      `ImgBB upload error: ${err.response ? err.response.data : err.message}`
    );
    return null;
  }
};
