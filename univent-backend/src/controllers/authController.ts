import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import emailService from "./../utils/sendEMail";
import logger from "../utils/logger";
import { Request, Response } from "express";

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
    logger.error(`${err}`);

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
    logger.error(err);
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
    logger.debug(`query result: ${result}`);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    logger.error(err);
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
    logger.error(`Profile update error: ${err}`);
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
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        width="100%"
        style="
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          padding: 20px;
        "
      >
        <tr>
          <td align="center" valign="top">
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              width="100%"
              style="
              max-width: 600px;
              background-color: #f9f9f9;
              border-radius: 20px;
              border-collapse: separate;
              "
            >
              <tr>
                <td
                  align="center"
                  style="
                  background-color: #291315;
                  border-top-left-radius: 20px;
                  border-top-right-radius: 20px;
                  padding: 16px;
                  font-size: 0;
                  line-height: 0;
                  "
                >
                  <img
                    src="https://i.ibb.co/pvQ5SM4Y/univent-no-bg.png"
                    alt="univent-logo"
                    border="0"
                    width="150"
                    style="display: block; max-width: 100%; height: auto;"
                  />
                </td>
              </tr>

              <tr>
                <td
                  align="center"
                  style="padding: 20px 30px 10px 30px; color: #333;"
                >
                  <h2 class="desktop-large" style="margin: 0px 0px 10px 0px; padding: 0; font-size: 15px; color: #333;">
                    Account Credentials
                  </h2>
                </td>
              </tr>

              <tr>
                <td style="padding: 0px 30px 0px 30px;">
                  <p class="desktop-large" style="font-size: 13px; margin: 0 0 10px 0;">
                    Dear <strong>${username}</strong>,
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 0px 30px 20px 30px;">
                  <p class="desktop-large" style="font-size: 12px; color: #555; margin: 0;">
                    Please find your login credentials below:
                  </p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 0 30px;">
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    style="
                      background-color: #ffffff;
                      border-radius: 10px;
                      border: 1px solid #ddd;
                      border-collapse: separate;
                      max-width: 98%;
                    "
                  >
                    <tr>
                      <td style="padding: 14px; text-align: center;">
                        <p class="desktop-large" style="font-size: 13px; margin: 5px 0;">
                          <strong>Username:</strong> ${username}<br />
                          <strong>Password:</strong> ${plain_password}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 8px 30px 0px 30px; text-align: center;">
                  <p class="desktop-large" style="font-size: 14px; margin: 20px 0 0 0;">
                  Best regards,<br />
                  <strong>Harshil Patel</strong><br />
                  <span class="desktop-large" style="color: #555; font-style: italic;">
                    dev@univent
                  </span>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 30px 14px 30px;">
                  <hr style="border: none; border-top: 1px solid #ccc; margin: 0;" />
                </td>
              </tr>

              <tr>
                <td style="padding: 0px 30px 30px 30px; text-align: center;">
                  <p class="desktop-large" style="font-size: 10px; color: #777; margin: 0;">
                    If you have any questions or encounter any issues, reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <style>
        @media only screen and (min-width: 601px) {
          .desktop-large {
            font-size: 16px !important;
          }
          h2.desktop-large {
            font-size: 18px !important;
          }
          p.desktop-large {
            font-size: 15px !important;
          }
          span.desktop-large {
            font-size: 13px !important;
          }
        }
      </style>
    `;

    // send mail
    await emailService.sendEmail(email, subject, html);

    return res.status(200).json({
      message: `Credentials sent to ${email}`,
    });
  } catch (err) {
    logger.error(`Error in forgottenPassword: ${err}`);
    return res.status(500).json({ message: "Server error" });
  }
};
