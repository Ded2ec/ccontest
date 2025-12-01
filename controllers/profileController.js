const db = require("../config/db");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            "SELECT full_name, email, position, avatar_url FROM profiles WHERE user_id = ?",
            [userId]
        );
        if (rows.length === 0) {
            return res.json({ full_name: "", email: "", position: "", avatar_url: "" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.saveProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, email, position, avatar_url } = req.body;

        await db.query(
            "INSERT INTO profiles (user_id, full_name, email, position, avatar_url) VALUES (?,?,?,?,?) " +
            "ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), position = VALUES(position), avatar_url = VALUES(avatar_url)",
            [userId, full_name || "", email || "", position || "", avatar_url || ""]
        );

        res.json({ message: "profile saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
