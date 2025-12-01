const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const {verifyToken, allowRole} = require("../middleware/auth");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/user", verifyToken, allowRole("user", "admin", "assessor"), (req, res) => {
    res.json({message:"user content"});
});

router.get("/admin", verifyToken, allowRole("admin"), (req, res) => {
    res.json({message:"admin content"});
});

router.get("/assessor", verifyToken, allowRole("assessor"), (req, res) => {
    res.json({message:"assessor content"});
});

module.exports = router;