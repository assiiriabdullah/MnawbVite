/**
 * seed_data.js
 * سكريبت لإنشاء بيانات تجريبية شاملة للنظام
 * يُشغَّل مرة واحدة: node seed_data.js
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'data', 'database.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const pwd = bcrypt.hashSync('123456', 10);

console.log('🌱 بدء إنشاء البيانات التجريبية...\n');

// ─────────────────────────────────────────────
// 1) موظفون إضافيون (إن لم يكونوا موجودين)
// ─────────────────────────────────────────────
const insertEmp = (name, username, role, department, shift, sub_department, join_date) => {
  const exists = db.prepare('SELECT id FROM employees WHERE username = ?').get(username);
  if (exists) {
    console.log(`   ⚠️  المستخدم ${username} موجود مسبقاً`);
    return exists.id;
  }
  const r = db.prepare(`
    INSERT INTO employees (name, username, password, role, department, sub_department, shift, join_date, annual_leave_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 36)
  `).run(name, username, pwd, role, department, sub_department || null, shift || null, join_date);
  console.log(`   ✅ أُضيف: ${name} (${username})`);
  return r.lastInsertRowid;
};

console.log('👥 إضافة الموظفين...');

// مدراء الأقسام
const mgr_shifts  = insertEmp('محمد العتيبي',   'mgr_shifts',  'dept_manager', 'shifts',     null, null, '2021-03-01');
const mgr_ops     = insertEmp('عبدالرحمن الزهراني', 'mgr_ops',  'dept_manager', 'operations', null, null, '2021-03-01');

// مشرفون - مناوبة ج ود
const sup_c       = insertEmp('سلطان الشمري',   'sup_c',       'supervisor',   'shifts',     'ج', 'shifts_rotation', '2022-01-15');
const sup_d       = insertEmp('خالد الدوسري',   'sup_d',       'supervisor',   'shifts',     'د', 'shifts_rotation', '2022-02-10');

// منفذون - مناوبة أ (تابعون لـ sup_a الموجود)
const op_a3       = insertEmp('عمر الغامدي',    'op_a3',       'operator',     'shifts',     'أ', 'shifts_rotation', '2023-07-01');
const op_a4       = insertEmp('تركي المطيري',   'op_a4',       'operator',     'shifts',     'أ', 'shifts_rotation', '2023-07-01');

// منفذون - مناوبة ب (تابعون لـ sup_b الموجود)
const op_b1       = insertEmp('فيصل السبيعي',   'op_b1',       'operator',     'shifts',     'ب', 'shifts_rotation', '2023-08-01');
const op_b2       = insertEmp('نواف الحارثي',   'op_b2',       'operator',     'shifts',     'ب', 'shifts_rotation', '2023-08-01');

// منفذون - مناوبة ج
const op_c1       = insertEmp('راشد العنزي',    'op_c1',       'operator',     'shifts',     'ج', 'shifts_rotation', '2023-09-01');
const op_c2       = insertEmp('حمد القحطاني',   'op_c2',       'operator',     'shifts',     'ج', 'shifts_rotation', '2023-09-01');

// منفذون - مناوبة د
const op_d1       = insertEmp('بندر الرشيدي',   'op_d1',       'operator',     'shifts',     'د', 'shifts_rotation', '2023-10-01');
const op_d2       = insertEmp('سعود الجهني',    'op_d2',       'operator',     'shifts',     'د', 'shifts_rotation', '2023-10-01');

// موظفو العمليات
const emp_ops1    = insertEmp('وليد الحربي',    'emp_ops1',    'operator',     'operations', null, 'ops_staff', '2022-05-01');
const emp_ops2    = insertEmp('منصور الرويلي',  'emp_ops2',    'operator',     'operations', null, 'ops_staff', '2022-06-01');

// موظفو الموارد البشرية
const emp_hr1     = insertEmp('أحمد الصالح',    'emp_hr1',     'operator',     'hr',         null, null, '2021-11-01');

// موظفو القوى العاملة
const emp_wf1     = insertEmp('يحيى الجبر',     'emp_wf1',     'operator',     'workforce',  null, null, '2022-01-01');

// ─────────────────────────────────────────────
// 2) بيانات الحضور التجريبية (3 جلسات سابقة)
// ─────────────────────────────────────────────
console.log('\n📋 إضافة سجلات الحضور...');

const empIds = {
  sup_a:   db.prepare("SELECT id FROM employees WHERE username = 'sup_a'").get()?.id,
  sup_b:   db.prepare("SELECT id FROM employees WHERE username = 'sup_b'").get()?.id,
  op_a1:   db.prepare("SELECT id FROM employees WHERE username = 'op_a1'").get()?.id,
  op_a2:   db.prepare("SELECT id FROM employees WHERE username = 'op_a2'").get()?.id,
  op_a3:   db.prepare("SELECT id FROM employees WHERE username = 'op_a3'").get()?.id,
  op_a4:   db.prepare("SELECT id FROM employees WHERE username = 'op_a4'").get()?.id,
  op_b1:   db.prepare("SELECT id FROM employees WHERE username = 'op_b1'").get()?.id,
  op_b2:   db.prepare("SELECT id FROM employees WHERE username = 'op_b2'").get()?.id,
  op_c1:   db.prepare("SELECT id FROM employees WHERE username = 'op_c1'").get()?.id,
  op_c2:   db.prepare("SELECT id FROM employees WHERE username = 'op_c2'").get()?.id,
  op_d1:   db.prepare("SELECT id FROM employees WHERE username = 'op_d1'").get()?.id,
  op_d2:   db.prepare("SELECT id FROM employees WHERE username = 'op_d2'").get()?.id,
  emp_ops1: db.prepare("SELECT id FROM employees WHERE username = 'emp_ops1'").get()?.id,
  emp_ops2: db.prepare("SELECT id FROM employees WHERE username = 'emp_ops2'").get()?.id,
  emp_hr1:  db.prepare("SELECT id FROM employees WHERE username = 'emp_hr1'").get()?.id,
  emp_wf1:  db.prepare("SELECT id FROM employees WHERE username = 'emp_wf1'").get()?.id,
};

const pastDates = [
  { date: '2026-05-17', shift: 'أ', supervisor_id: empIds.sup_a },
  { date: '2026-05-18', shift: 'أ', supervisor_id: empIds.sup_a },
  { date: '2026-05-17', shift: 'ب', supervisor_id: empIds.sup_b },
];

const shiftEmpsA = [empIds.op_a1, empIds.op_a2, empIds.sup_a, empIds.op_a3, empIds.op_a4].filter(Boolean);
const shiftEmpsB = [empIds.op_b1, empIds.op_b2, empIds.sup_b].filter(Boolean);

for (const sess of pastDates) {
  const exists = db.prepare('SELECT id FROM attendance_sessions WHERE shift = ? AND date = ?').get(sess.shift, sess.date);
  if (exists) {
    console.log(`   ⚠️  جلسة مناوبة ${sess.shift} بتاريخ ${sess.date} موجودة مسبقاً`);
    continue;
  }
  const s = db.prepare(`
    INSERT INTO attendance_sessions (supervisor_id, shift, date, status, shift_start_time, shift_end_time, approved_at)
    VALUES (?, ?, ?, 'approved', '07:00', '19:00', datetime('now'))
  `).run(sess.supervisor_id, sess.shift, sess.date);

  const sessionId = s.lastInsertRowid;
  const emps = sess.shift === 'أ' ? shiftEmpsA : shiftEmpsB;

  for (let i = 0; i < emps.length; i++) {
    const empId = emps[i];
    // اجعل آخر موظف متأخرًا، وقبل الأخير غائبًا للتنوع
    const status = i === emps.length - 1 ? 'absent' : i === emps.length - 2 ? 'late' : 'present';
    const checkIn = status !== 'absent' ? `${sess.date}T07:${status === 'late' ? '25' : '02'}:00` : null;
    const checkOut = status !== 'absent' ? `${sess.date}T19:05:00` : null;

    db.prepare(`
      INSERT INTO attendance_records (session_id, employee_id, check_in_time, check_out_time, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, empId, checkIn, checkOut, status);
  }
  console.log(`   ✅ جلسة مناوبة ${sess.shift} - ${sess.date} (${emps.length} موظف)`);
}

// ─────────────────────────────────────────────
// 3) إجازات بحالات متنوعة
// ─────────────────────────────────────────────
console.log('\n🌴 إضافة الإجازات...');

const insertLeave = (empId, start, end, status) => {
  if (!empId) { console.log(`   ⚠️  تجاوز إجازة بدون معرف موظف`); return; }
  const exists = db.prepare('SELECT id FROM leaves WHERE employee_id = ? AND start_date = ?').get(empId, start);
  if (exists) return;
  db.prepare(`INSERT INTO leaves (employee_id, start_date, end_date, status) VALUES (?, ?, ?, ?)`).run(empId, start, end, status);
};

// إجازات مقبولة
insertLeave(empIds.op_a1,  '2026-04-01', '2026-04-07', 'approved');
insertLeave(empIds.op_a2,  '2026-03-10', '2026-03-15', 'approved');
insertLeave(empIds.op_a3,  '2026-05-01', '2026-05-05', 'approved');
insertLeave(empIds.op_b1,  '2026-04-20', '2026-04-25', 'approved');
insertLeave(empIds.op_b2,  '2026-02-14', '2026-02-18', 'approved');
insertLeave(empIds.op_c1,  '2026-03-20', '2026-03-24', 'approved');
insertLeave(empIds.emp_ops1,'2026-04-10', '2026-04-14', 'approved');
insertLeave(empIds.emp_hr1, '2026-05-05', '2026-05-08', 'approved');

// إجازات مرفوضة
insertLeave(empIds.op_a4,   '2026-05-10', '2026-05-14', 'rejected');
insertLeave(empIds.op_d1,   '2026-04-15', '2026-04-20', 'rejected');
insertLeave(empIds.emp_ops2,'2026-03-01', '2026-03-05', 'rejected');

// إجازات قيد المراجعة
insertLeave(empIds.op_c2,   '2026-06-01', '2026-06-07', 'pending');
insertLeave(empIds.op_d2,   '2026-06-10', '2026-06-14', 'pending');
insertLeave(empIds.emp_wf1, '2026-06-05', '2026-06-10', 'pending');

console.log('   ✅ تمت إضافة 14 إجازة (مقبولة، مرفوضة، قيد المراجعة)');

// ─────────────────────────────────────────────
// 4) دورات تدريبية
// ─────────────────────────────────────────────
console.log('\n🎓 إضافة الدورات التدريبية...');

const insertCourse = (empId, title, location, date) => {
  if (!empId) { console.log(`   ⚠️  تجاوز دورة بدون معرف موظف`); return; }
  const exists = db.prepare('SELECT id FROM courses WHERE employee_id = ? AND title = ?').get(empId, title);
  if (exists) return;
  db.prepare(`INSERT INTO courses (employee_id, title, location, date) VALUES (?, ?, ?, ?)`).run(empId, title, location, date);
};

insertCourse(empIds.op_a1,   'السلامة والصحة المهنية',     'الرياض',  '2025-11-10');
insertCourse(empIds.op_a1,   'مهارات الاتصال الفعّال',     'الرياض',  '2026-02-15');
insertCourse(empIds.op_a2,   'إدارة الأزمات',                'جدة',     '2025-10-05');
insertCourse(empIds.op_a3,   'إجراءات التشغيل الآمن',      'الرياض',  '2025-12-20');
insertCourse(empIds.op_b1,   'السلامة والصحة المهنية',     'الدمام',  '2026-01-08');
insertCourse(empIds.op_b2,   'مهارات القيادة الميدانية',   'جدة',     '2025-09-14');
insertCourse(empIds.op_c1,   'إدارة المخاطر التشغيلية',   'الرياض',  '2026-03-01');
insertCourse(empIds.op_d1,   'إجراءات التشغيل الآمن',      'الرياض',  '2026-04-10');
insertCourse(empIds.emp_ops1, 'أتمتة العمليات',             'الرياض',  '2026-02-20');
insertCourse(empIds.emp_hr1,  'نظام إدارة الموارد البشرية', 'الرياض', '2026-01-15');
insertCourse(empIds.emp_wf1,  'تخطيط القوى العاملة',       'جدة',     '2025-12-01');

console.log('   ✅ تمت إضافة 11 دورة تدريبية');

// ─────────────────────────────────────────────
// 5) انتدابات
// ─────────────────────────────────────────────
console.log('\n💼 إضافة الانتدابات...');

const insertMandate = (empId, title, location, date) => {
  if (!empId) { console.log(`   ⚠️  تجاوز انتداب بدون معرف موظف`); return; }
  const exists = db.prepare('SELECT id FROM mandates WHERE employee_id = ? AND title = ?').get(empId, title);
  if (exists) return;
  db.prepare(`INSERT INTO mandates (employee_id, title, location, date) VALUES (?, ?, ?, ?)`).run(empId, title, location, date);
};

insertMandate(empIds.op_a1,   'انتداب دعم فني للميدان',      'الدمام',  '2025-11-20');
insertMandate(empIds.op_a2,   'انتداب للمركز الإقليمي',    'جدة',     '2026-01-10');
insertMandate(empIds.op_a3,   'انتداب تغطية مناوبة طارئة', 'الرياض',  '2026-03-05');
insertMandate(empIds.op_b1,   'انتداب دعم فني مؤقت',         'تبوك',    '2025-12-15');
insertMandate(empIds.op_c1,   'انتداب مؤتمر العمليات',     'الرياض',  '2026-02-28');
insertMandate(empIds.op_d1,   'انتداب إداري',                 'الرياض',  '2026-04-20');
insertMandate(empIds.emp_ops1, 'انتداب دعم عمليات الفرع',   'المدينة', '2026-01-25');
insertMandate(empIds.emp_ops2, 'انتداب دعم فني',               'جدة',     '2026-03-10');
insertMandate(empIds.emp_hr1,  'انتداب تدريب الكوادر',        'الرياض',  '2026-02-05');

console.log('   ✅ تمت إضافة 9 انتدابات');

// ─────────────────────────────────────────────
// 6) الملخص النهائي
// ─────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));
console.log('✅ اكتملت البيانات التجريبية بنجاح!');
console.log('═'.repeat(55));
console.log('\n📌 حسابات المدراء:');
console.log('   المدير العام   : admin      / admin123');
console.log('   مدير المناوبات: mgr_shifts  / 123456');
console.log('   مدير العمليات : mgr_ops     / 123456');
console.log('\n📌 حسابات المشرفين (كلمة المرور: 123456):');
console.log('   sup_a  - مناوبة أ    sup_b  - مناوبة ب');
console.log('   sup_c  - مناوبة ج    sup_d  - مناوبة د');
console.log('\n📌 حسابات المنفذين (كلمة المرور: 123456):');
console.log('   مناوبة أ: op_a1, op_a2, op_a3, op_a4');
console.log('   مناوبة ب: op_b1, op_b2');
console.log('   مناوبة ج: op_c1, op_c2');
console.log('   مناوبة د: op_d1, op_d2');
console.log('   عمليات  : emp_ops1, emp_ops2');
console.log('   موارد بشرية: emp_hr1');
console.log('   قوى عاملة  : emp_wf1');
console.log('\n📌 حسابات المساندة (كلمة المرور: 123456):');
console.log('   صباح: sup_m1, sup_m2');
console.log('   عصر : sup_a1, sup_a2');
console.log('   ليل : sup_n1, sup_n2');
console.log('');

db.close();
