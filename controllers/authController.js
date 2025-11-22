const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


exports.register = async (req, res) => {
    const {username, password, role } =req.body;
    const hash = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (username, password, role) VALUES (?,?,?)",[username,hash,role]);

    res.json({message: "user registered"});
};

exports.login = async (req, res) => {
    const {username, password} = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if(rows.length === 0) return res.status(400).json({message: "User not found"});

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({message: "Invalid password"});

    const token = jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    res.json({token, role: user.role});
}