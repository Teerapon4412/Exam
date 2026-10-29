# ดึงสำเนาข้อมูลจริงจาก Render

ยังไม่หยุดระบบจริง ขั้นตอนนี้สำรองเพื่อนำมาทดสอบเท่านั้น
ผู้ดูแล Render ต้องรันคำสั่งเอง เพราะชุดเตรียมย้ายนี้ไม่มีสิทธิ์เข้าถึงบัญชีหรือฐานข้อมูล Render

## สำรองผ่าน Shell ของ Render

เปิด service factory-online-exam-c089 → Shell แล้วรัน:

```sh
node <<'JS'
const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const source = path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'factory-exam.sqlite');
  const folder = fs.mkdtempSync('/tmp/factory-export-');
  const output = path.join(folder, 'factory-exam.sqlite');
  const db = new Database(source, { readonly: true, fileMustExist: true });
  try { await db.backup(output); } finally { db.close(); }
  const copy = new Database(output, { readonly: true });
  try {
    if (copy.pragma('integrity_check', { simple: true }) !== 'ok') throw new Error('Integrity check failed');
  } finally { copy.close(); }
  console.log('Verified backup: ' + output);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
JS
```

จดเส้นทาง Verified backup ที่แสดงไว้ ไฟล์ใน /tmp ไม่ถาวร ต้องดาวน์โหลดก่อน restart/deploy
ห้ามย้ายไฟล์นี้เข้าโฟลเดอร์เว็บหรือสร้างลิงก์ดาวน์โหลดสาธารณะ เพราะมีข้อมูลพนักงาน

## ดาวน์โหลดอย่างเป็นส่วนตัว

ใช้ SSH connection details ของ service จากเมนู Connect ตามสิทธิ์บัญชี
ให้ IT ใช้ scp/SFTP โดยใช้ host, user, port และ key จาก Render จริง
ห้ามเดาค่าหรือเผยแพร่ private key หากบัญชีไม่มี SSH ให้แจ้งช่องทางที่มีเพื่อเลือกวิธีส่งออกอื่น

ดาวน์โหลดสำเนาที่สร้างใน /tmp เท่านั้น ไม่คัดลอกไฟล์ฐานข้อมูลที่กำลังใช้งานโดยตรง
เก็บในโฟลเดอร์จำกัดสิทธิ์ เช่น C:\FactoryExamMigration\incoming

## ตรวจข้อมูลบนเครื่องเตรียมงาน

ติดตั้ง Node.js และ dependencies ของโปรเจกต์ แล้วรันจากรากโปรเจกต์:

```powershell
node migration/windows/inspect-data.cjs "C:\FactoryExamMigration\incoming\factory-exam.sqlite" "C:\FactoryExamMigration\inventory.json"
```

รายงานนับตารางและแจกแจงรูปฝังในฐานข้อมูล รูปภายนอก และไฟล์อ้างอิงภายใน
ไม่เปลี่ยนต้นฉบับและไม่ดาวน์โหลดรูปอัตโนมัติ เก็บรายงานส่วนตัวเพราะ URL อาจเป็นลิงก์ลับ
รูปภายนอกและไฟล์อ้างอิงต้องรวบรวมแยกก่อนรับรองว่าใช้งานออฟไลน์ได้ครบ
ไม่ต้องส่ง AUTH_SECRET หรือข้อมูลพนักงานลงในแชต ให้ IT เก็บและย้ายผ่านช่องทางที่อนุญาต
