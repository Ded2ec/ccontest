const db = require("../config/db");

// GET /api/evaluation -> list all evaluations (frontend ยัง filter ตาม role/username เอง)
exports.getEvaluations = async (req, res) => {
  try {
    // ใช้ schema ปัจจุบันของตาราง evaluations:
    // id, period_id, employee_id, position_name, status, employee_name, created_at, updated_at
    // ตอนนี้ frontend ยังไม่ได้ใช้ period_id/employee_id จึงส่งค่า period เป็น NULL ไปก่อน
    const [rows] = await db.query(
      "SELECT id, employee_name AS employee, position_name AS position, NULL AS period, status FROM evaluations ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Scores per evaluation / criteria / subitem =====

// GET /api/evaluation/:id/scores -> list scores for one evaluation
exports.getScoresForEvaluation = async (req, res) => {
  try {
    const { id } = req.params; // evaluation id
    const [rows] = await db.query(
      "SELECT criteria_id AS criteriaId, subitem_id AS subitemId, self_score AS selfScore, manager_score AS managerScore, note FROM evaluation_scores WHERE evaluation_id = ?",
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/:id/scores
// body: { scores: [{ criteriaId, subitemId, selfScore, managerScore, note }] }
exports.saveScoresForEvaluation = async (req, res) => {
  try {
    const { id } = req.params; // evaluation id
    const { scores } = req.body;

    if (!Array.isArray(scores)) {
      return res.status(400).json({ message: "scores must be an array" });
    }

    for (const s of scores) {
      if (!s || !s.criteriaId || !s.subitemId) continue;

      await db.query(
        "INSERT INTO evaluation_scores (evaluation_id, criteria_id, subitem_id, self_score, manager_score, note) VALUES (?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE self_score = VALUES(self_score), manager_score = VALUES(manager_score), note = VALUES(note)",
        [
          id,
          s.criteriaId,
          s.subitemId,
          s.selfScore ?? null,
          s.managerScore ?? null,
          s.note ?? null,
        ]
      );
    }

    res.json({ message: "scores saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/evaluation/criteria/:id
exports.updateCriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, requiresEvidence, subItems, periodStart, periodEnd } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // อัปเดตหัวข้อหลัก
    const [result] = await db.query(
      "UPDATE evaluation_criteria SET name = ?, description = ?, requires_evidence = ?, period_start = ?, period_end = ? WHERE id = ?",
      [name, description || "", requiresEvidence ? 1 : 0, periodStart || null, periodEnd || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    let newSubItems = [];
    if (Array.isArray(subItems)) {
      // ลบ subitems เดิมทั้งหมด แล้วเพิ่มใหม่ตามที่ frontend ส่งมา
      await db.query("DELETE FROM evaluation_subitems WHERE criteria_id = ?", [id]);

      for (const s of subItems) {
        if (!s || !s.name) continue;
        const itemType = s.type === "document" ? "document" : "score";
        const [ins] = await db.query(
          "INSERT INTO evaluation_subitems (criteria_id, name, item_type) VALUES (?,?,?)",
          [id, s.name, itemType]
        );
        newSubItems.push({ id: ins.insertId, name: s.name, type: itemType });
      }
    }

    res.json({
      id: Number(id),
      name,
      description: description || "",
      requiresEvidence: !!requiresEvidence,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      subItems: newSubItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/evaluation/periods/:id
exports.deletePeriod = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM evaluation_periods WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Period not found" });
    }

    res.json({ message: "period deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/positions -> list positions and employees from profiles (เฉพาะ role = 'user')
exports.getPositionsForEvaluation = async (req, res) => {
  try {
    // ใช้ join กับตาราง users เพื่อกรองเฉพาะผู้ใช้ที่มี role = 'user'
    // ส่ง userId กลับไปให้ frontend ด้วยเพื่อใช้ map กับการตั้งค่าหัวข้อ
    const [rows] = await db.query(
      "SELECT u.id AS userId, p.full_name AS employee, p.position FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.position IS NOT NULL AND p.position <> '' AND u.role = 'user' ORDER BY p.position, p.full_name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Periods =====

// GET /api/evaluation/periods
exports.getPeriods = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, start_date AS startDate, end_date AS endDate, status FROM evaluation_periods ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/periods
exports.createPeriod = async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "name, startDate, endDate are required" });
    }

    const [result] = await db.query(
      "INSERT INTO evaluation_periods (name, start_date, end_date, status) VALUES (?,?,?,?)",
      [name, startDate, endDate, status || "draft"]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      startDate,
      endDate,
      status: status || "draft"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Criteria & Subitems =====

// GET /api/evaluation/criteria -> return criteria with subitems
exports.getCriteriaWithSubitems = async (req, res) => {
  try {
    const [criteriaRows] = await db.query(
      "SELECT id, name, description, requires_evidence AS requiresEvidence, period_start AS periodStart, period_end AS periodEnd FROM evaluation_criteria ORDER BY id ASC"
    );

    const [subitemRows] = await db.query(
      "SELECT id, criteria_id AS criteriaId, name, item_type AS itemType FROM evaluation_subitems ORDER BY id ASC"
    );

    const criteria = criteriaRows.map(c => ({
      ...c,
      requiresEvidence: !!c.requiresEvidence,
      subItems: subitemRows
        .filter(s => s.criteriaId === c.id)
        .map(s => ({ id: s.id, name: s.name, type: s.itemType }))
    }));

    res.json(criteria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/criteria
exports.createCriteria = async (req, res) => {
  try {
    const { name, description, requiresEvidence, periodStart, periodEnd } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO evaluation_criteria (name, description, requires_evidence, period_start, period_end) VALUES (?,?,?,?,?)",
      [name, description || "", requiresEvidence ? 1 : 0, periodStart || null, periodEnd || null]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description: description || "",
      requiresEvidence: !!requiresEvidence,
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      subItems: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/evaluation/criteria/:id
exports.deleteCriteria = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM evaluation_criteria WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    res.json({ message: "criteria deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation/criteria/:id/subitems
exports.createSubitem = async (req, res) => {
  try {
    const { id } = req.params; // criteria id
    const { name, type } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const itemType = type === "document" ? "document" : "score";

    const [result] = await db.query(
      "INSERT INTO evaluation_subitems (criteria_id, name, item_type) VALUES (?,?,?)",
      [id, name, itemType]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      type: itemType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/evaluation -> start new evaluation
// body: { employee, position, periodId }
exports.startEvaluation = async (req, res) => {
  try {
    const { employee, position, periodId } = req.body;
    if (!employee || !position || !periodId) {
      return res
        .status(400)
        .json({ message: "employee, position and periodId are required" });
    }

    // ตอนนี้ยังไม่ผูกกับ employee_id จริง จึงใส่ NULL ชั่วคราว แต่ต้องมี period_id
    const [result] = await db.query(
      "INSERT INTO evaluations (period_id, employee_id, position_name, status, employee_name) VALUES (?, NULL, ?, ?, ?)",
      [periodId, position, "in-progress", employee]
    );

    const newEval = {
      id: result.insertId,
      employee,
      position,
      period: null,
      status: "in-progress"
    };

    res.status(201).json(newEval);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/evaluation/:id/submit -> mark as completed
exports.submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE evaluations SET status = 'completed' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    res.json({ message: "evaluation submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Position / Employee / Criteria Mapping =====

// POST /api/evaluation/position-config
// body: { positionName: string, employeeIds: number[], criteriaIds: number[] }
// บันทึก mapping user_id -> criteria_id ตามที่เลือกจากหน้า ตำแหน่งและบุคลากร
exports.savePositionConfig = async (req, res) => {
  try {
    const { positionName, employeeIds, criteriaIds } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res
        .status(400)
        .json({ message: "employeeIds must be a non-empty array" });
    }
    if (!Array.isArray(criteriaIds) || criteriaIds.length === 0) {
      return res
        .status(400)
        .json({ message: "criteriaIds must be a non-empty array" });
    }

    // ลบ mapping เดิมของ user เหล่านี้ทั้งหมดก่อน แล้วค่อยใส่ใหม่
    await db.query(
      "DELETE FROM evaluation_employee_criteria WHERE user_id IN (?)",
      [employeeIds]
    );

    // แทรก mapping ใหม่
    for (const userId of employeeIds) {
      for (const criteriaId of criteriaIds) {
        await db.query(
          "INSERT INTO evaluation_employee_criteria (user_id, criteria_id) VALUES (?, ?)",
          [userId, criteriaId]
        );
      }
    }

    res.json({ message: "position config saved", positionName, employeeCount: employeeIds.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/my-criteria -> return list of criteria_id for current user
exports.getMyCriteriaIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT criteria_id FROM evaluation_employee_criteria WHERE user_id = ?",
      [userId]
    );
    const ids = rows.map((r) => r.criteria_id);
    res.json(ids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/evaluation/employee-criteria -> return all mappings { userId, criteriaId }
exports.getAllEmployeeCriteria = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id AS userId, criteria_id AS criteriaId FROM evaluation_employee_criteria"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
