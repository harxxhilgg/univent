import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import emailService from "./../utils/sendEMail";

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Please provide all required fields");
  }

  if (!process.env.JWT_SECRET) {
    return res
      .status(502)
      .json({ message: "Internal server error: JWT_SECRET not defined" });
  }

  try {
    // user exists
    const userExists = await pool.query(
      `
      SELECT
        1
      FROM
        users
      WHERE
        email = $1;
      `,
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(401).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 14);

    // New user
    const result = await pool.query(
      `
      INSERT INTO
        users (username, email, password, plain_password)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        *;
      `,
      [username, email, hashedPassword, password]
    );

    // JWT token with userId, username, email
    const token = jwt.sign(
      {
        userId: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        // password: result.rows[0].password --- uncomment for checking password on api test --- DO NOT USE IN BUILD
      },
      token,
    });
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).send("Server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id, username, email, password
      FROM
        users
      WHERE
        email = $1;
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      `
      DELETE FROM
        users
      WHERE
        email = $1
      `,
      [email]
    );
    console.log(`query result: ${result}`);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id, username, email } = req.body;

    const emailCheck = await pool.query(
      `
      SELECT
        id, email
      FROM
        users
      WHERE
        email = $1
      AND
        id != $2
      `,
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const usernameCheck = await pool.query(
      `
      SELECT
        id, username
      FROM
        users
      WHERE
        username = $1
      AND
        id != $2
      `,
      [username, id]
    );
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const updateUser = await pool.query(
      `
      UPDATE
        users
      SET
        username = $1, email = $2
      WHERE
        id = $3
      RETURNING
        id, username, email
      `,
      [username, email, id]
    );

    res.json(updateUser.rows[0]);
  } catch (err) {
    console.error("Profile update error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        username, plain_password
      FROM
        users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const { username, plain_password } = user;

    const subject = `Account Credentials for ${username} | Univent`;
    const html = `
    <div style="
      max-width: 600px;
      margin: 0 auto;
      margin-top: 0.5rem;
      padding: 30px;
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    ">
      <h2 style="color: #333;">Account Credentials</h2>

      <p style="font-size: 16px;">Dear <strong>${username}</strong>,</span>

      <p style="font-size: 16px; color: #555;">Please find your login credentials below:</p>

      <div style="
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #ddd;
        display: flex;
        width: 60%;
        justify-content: center;
        margin: 10px auto;
      ">
        <p style="font-size: 16px; margin: 5px 0">
          <strong>Username:</strong> ${username}<br>
          <strong>Password:</strong> ${plain_password}
        </p>
      </div>

      <p style="font-size: 15px; margin-top: 20px;">
        Best regards,<br>
        <strong>Harshil Patel</strong><br>
        <span style="color: #555; font-style: italic;">dev@univent</span>
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />

      <p style="font-size: 13px; color: #777;">
        If you have any questions or encounter any issues, please do not hesitate to respond to this email.
      </p>
    </div>
    `;

    // send mail
    await emailService.sendEmail(email, subject, html);

    return res.status(200).json({
      message: "Credentials sent via email",
      user: {
        username,
        email,
        plain_password,
      },
    });
  } catch (err) {
    console.error("Error in forgotPassword: ", err);
    return res.status(500).json({ message: "Server error" });
  }
};
