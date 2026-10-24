"use strict";
module.exports = function registerWorkplaceEntries({
  app,
  db,
  requireAdmin,
  writeAdminAudit,
}) {
  db.exec(`CREATE TABLE IF NOT EXISTS workplace_manual_scores (
 employee_id TEXT NOT NULL, period TEXT NOT NULL, quantity REAL NOT NULL, quality REAL NOT NULL,
 scale TEXT NOT NULL DEFAULT 'raw', assessor TEXT NOT NULL, saved_by TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL,
 PRIMARY KEY(employee_id, period));`);
  const validPeriod = (period) =>
    typeof period === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
  const serialize = (row) => ({
    employeeCode: row.employee_code,
    quantity: row.quantity,
    quality: row.quality,
    scale: row.scale,
    assessor: row.assessor,
    revision: row.revision,
    updatedAt: row.updated_at,
  });
  app.get("/api/workplace/manual-scores", requireAdmin, (req, res) => {
    if (!validPeriod(req.query.period))
      return res.status(400).json({ error: "กรุณาเลือกงวดประเมิน" });
    const rows = db
      .prepare(
        "SELECT s.*,u.employee_code FROM workplace_manual_scores s JOIN users u ON u.id=s.employee_id WHERE s.period=?",
      )
      .all(req.query.period);
    res.json({ period: req.query.period, entries: rows.map(serialize) });
  });
  app.post("/api/workplace/manual-scores", requireAdmin, (req, res) => {
    const { period, entries, assessor } = req.body || {};
    if (
      !validPeriod(period) ||
      typeof assessor !== "string" ||
      !assessor.trim() ||
      assessor.length > 200 ||
      !Array.isArray(entries) ||
      entries.length < 1 ||
      entries.length > 1000
    )
      return res.status(400).json({
        error:
          "กรุณาระบุงวด ผู้บันทึก และรายการคะแนนให้ครบ (ไม่เกิน 1,000 คนต่อครั้ง)",
      });
    try {
      const seen = new Set();
      const saved = db.transaction(() =>
        entries.map((entry) => {
          const code = String(entry.employeeCode || "")
            .trim()
            .toUpperCase();
          if (seen.has(code)) throw new Error("มีรหัสพนักงานซ้ำ: " + code);
          seen.add(code);
          const user = db
            .prepare(
              "SELECT * FROM users WHERE employee_code=? AND is_active=1",
            )
            .get(code);
          if (!user) throw new Error("ไม่พบพนักงานที่ใช้งาน: " + code);
          const scale = entry.scale || "raw";
          if (scale !== "raw") throw new Error("รูปแบบคะแนนไม่ถูกต้อง");
          if (
            ![entry.quantity, entry.quality].every(
              (value) =>
                typeof value === "number" &&
                Number.isFinite(value) &&
                value >= 0,
            )
          )
            throw new Error(
              code + ": กรอกคะแนนทั้งสองหัวข้อเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
            );
          if (
            scale === "level" &&
            ![entry.quantity, entry.quality].every(
              (value) => Number.isInteger(value) && value >= 1 && value <= 4,
            )
          )
            throw new Error(code + ": คะแนนระดับต้องเป็นจำนวนเต็ม 1–4");
          const old = db
            .prepare(
              "SELECT * FROM workplace_manual_scores WHERE employee_id=? AND period=?",
            )
            .get(user.id, period);
          if (
            !Number.isInteger(entry.revision) ||
            entry.revision !== (old?.revision || 0)
          ) {
            const error = new Error(
              code + ": คะแนนถูกแก้ไขแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก",
            );
            error.status = 409;
            throw error;
          }
          const row = {
            employee_id: user.id,
            period,
            quantity: entry.quantity,
            quality: entry.quality,
            scale,
            assessor: assessor.trim(),
            saved_by: req.user.employee_code,
            revision: (old?.revision || 0) + 1,
            updated_at: new Date().toISOString(),
          };
          db.prepare(
            `INSERT INTO workplace_manual_scores VALUES (@employee_id,@period,@quantity,@quality,@scale,@assessor,@saved_by,@revision,@updated_at) ON CONFLICT(employee_id,period) DO UPDATE SET quantity=excluded.quantity,quality=excluded.quality,scale=excluded.scale,assessor=excluded.assessor,saved_by=excluded.saved_by,revision=excluded.revision,updated_at=excluded.updated_at`,
          ).run(row);
          writeAdminAudit(
            req,
            "update",
            "workplace_manual_scores",
            user.id + ":" + period,
            old,
            row,
          );
          return serialize({ ...row, employee_code: code });
        }),
      )();
      res.json({ period, entries: saved });
    } catch (error) {
      res.status(error.status || 400).json({ error: error.message });
    }
  });
};
