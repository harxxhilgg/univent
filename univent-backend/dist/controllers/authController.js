"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.deleteAccount = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send("Please provide all required fields");
    }
    if (!process.env.JWT_SECRET) {
        return res
            .status(500)
            .json({ message: "Internal server error: JWT_SECRET not defined" });
    }
    try {
        // user exists
        const userExists = yield db_1.default.query(`
      SELECT
        1
      FROM
        users
      WHERE
        email = $1;
      `, [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 14);
        // New user
        const result = yield db_1.default.query(`
      INSERT INTO
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *;
      `, [username, email, hashedPassword]);
        // JWT token with userId, username, email
        const token = jsonwebtoken_1.default.sign({
            userId: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
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
    }
    catch (err) {
        console.error(err);
        if (err.code === "23505") {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).send("Server error");
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Please provide email and password" });
    }
    try {
        const result = yield db_1.default.query(`
      SELECT
        id, username, email, password
      FROM
        users
      WHERE
        email = $1;
      `, [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        const user = result.rows[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.login = login;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const result = yield db_1.default.query(`
      DELETE FROM
        users
      WHERE
        email = $1
      `, [email]);
        console.log(`query result: ${result}`);
        res.json({ message: "Account deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteAccount = deleteAccount;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, username, email } = req.body;
        const emailCheck = yield db_1.default.query(`
      SELECT
        id, email
      FROM
        users
      WHERE
        email = $1
      AND
        id != $2
      `, [email, id]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const usernameCheck = yield db_1.default.query(`
      SELECT
        id, username
      FROM
        users
      WHERE
        username = $1
      AND
        id != $2
      `, [username, id]);
        if (usernameCheck.rows.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }
        const updateUser = yield db_1.default.query(`
      UPDATE
        users
      SET
        username = $1, email = $2
      WHERE
        id = $3
      RETURNING
        id, username, email
      `, [username, email, id]);
        res.json(updateUser.rows[0]);
    }
    catch (err) {
        console.error("Profile update error: ", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateProfile = updateProfile;
