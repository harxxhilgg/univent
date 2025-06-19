import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const environment = process.env.NODE_ENV || "development";

if (!admin.apps.length) {
  try {
    const serviceAccount =
      environment === "production"
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}")
        : require("../../univent-app-firebase-adminsdk-fbsvc-52de75750d.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "univent-app",
    });

    console.log("(firebase) Firebase admin intialized successfully");
  } catch (err) {
    console.error("(firebase) Firebase admin initialized error: ", err);
  }
}

export const messaging = admin.messaging();
export default admin;
