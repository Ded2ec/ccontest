const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const evaluationController = require("../controllers/evaluationController");

// ดึงรายการการประเมินทั้งหมด (frontend จะ filter ตาม role/username เอง)
router.get("/", verifyToken, evaluationController.getEvaluations);

// เริ่มประเมินใหม่
router.post("/", verifyToken, evaluationController.startEvaluation);

// คะแนนของการประเมินหนึ่งรายการ
router.get(
  "/:id/scores",
  verifyToken,
  evaluationController.getScoresForEvaluation
);
router.post(
  "/:id/scores",
  verifyToken,
  evaluationController.saveScoresForEvaluation
);

// ส่งการประเมิน (เปลี่ยนสถานะเป็น completed)
router.put("/:id/submit", verifyToken, evaluationController.submitEvaluation);

// --- Periods ---
router.get("/periods", verifyToken, evaluationController.getPeriods);
router.post("/periods", verifyToken, evaluationController.createPeriod);
router.delete("/periods/:id", verifyToken, evaluationController.deletePeriod);

// --- Criteria & Subitems ---
router.get("/criteria", verifyToken, evaluationController.getCriteriaWithSubitems);
router.post("/criteria", verifyToken, evaluationController.createCriteria);
router.put("/criteria/:id", verifyToken, evaluationController.updateCriteria);
router.post("/criteria/:id/subitems", verifyToken, evaluationController.createSubitem);
router.delete("/criteria/:id", verifyToken, evaluationController.deleteCriteria);

// position / employee / criteria mapping
router.post(
  "/position-config",
  verifyToken,
  evaluationController.savePositionConfig
);
router.get(
  "/my-criteria",
  verifyToken,
  evaluationController.getMyCriteriaIds
);
router.get(
  "/employee-criteria",
  verifyToken,
  evaluationController.getAllEmployeeCriteria
);

// --- Positions/Employees (for evaluation page) ---
router.get("/positions", verifyToken, evaluationController.getPositionsForEvaluation);

module.exports = router;
