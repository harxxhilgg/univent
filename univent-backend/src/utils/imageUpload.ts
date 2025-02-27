// @ts-nocheck

import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

export const uploadToImgBB = async (buffer, filename) => {
  try {
    if (!buffer || buffer.length === 0) {
      console.error("Invalid or empty buffer provided");
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

    // console.log("ImgBB upload response: ", response.data);
    return response.data.data.url;
  } catch (err) {
    console.error(
      "ImgBB upload error: ",
      err.response ? err.response.data : err.message
    );
    return null;
  }
};
