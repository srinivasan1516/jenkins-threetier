const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const pool = mysql.createPool({
    host: "localhost",
    user: "three_tier_user",
    password: "ThreeTier@123",
    database: "three_tier_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "UP",
            message: "Backend and database are working"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "DOWN",
            message: "Database connection failed"
        });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, created_at FROM users ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to fetch users"
        });
    }
});

app.post("/api/users", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [name, email]
        );

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create user"
        });
    }
});

app.get("/api", (req, res) => {
    res.json({
        application: "Jenkins Three Tier Application",
        backend: "Node.js",
        database: "MySQL"
    });
});

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Backend running on port ${PORT}`);
});
