import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../hooks/useApi';
import { useToast } from '../../components/Toast';
import Modal, { Card, SectionHeader, Button, Input, Select, EmptyState, Skeleton } from '../../components/UI';
import { RoleBadge, DeptBadge, ShiftBadge, SubDeptBadge, StatusBadge } from '../../components/Badge';
import { UserPlus, Search, Eye, Pencil, Trash2, Users, CalendarDays, GraduationCap, Briefcase, Wallet } from 'lucide-react';

interface Employee {
  id: number; name: string; username: string; role: string;
  department: string | null; sub_department: string | null; shift: string | null; join_date: string;
  annual_leave_balance: number;
}

interface EmployeeDetail {
  employee: Employee;
  leaves: any[];
  courses: any[];
  mandates: any[];
}

const subDeptOptions: Record<string, { value: string; label: string }[]> = {
  shifts: [
    { value: '', label: 'اختر القسم الفرعي' },
    { value: 'shifts_rotation', label: 'المناوبات' },
    { value: 'shifts_support', label: 'المساندة' },
    { value: 'shifts_executive', label: 'التنفيذي' },
    { value: 'shifts_base', label: 'القاعدة' },
  ],
  operations: [
    { value: '', label: 'اختر القسم الفرعي' },
    { value: 'ops_staff', label: 'موظفي العمليات' },
    { value: 'ops_cameras', label: 'الكاميرات' },
  ],
};

const TABS = [
  { id: 'leaves', label: 'الإجازات', icon: CalendarDays },
  { id: 'courses', label: 'الدورات', icon: GraduationCap },
  { id: 'mandates', label: 'الانتدابات', icon: Briefcase },
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [subDeptFilter, setSubDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'operator', department: 'shifts', sub_department: '', shift: '', join_date: '' });
  const { toast } = useToast();

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<EmployeeDetail | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('leaves');

  const load = () => {
    setLoading(true);
    api<Employee[]>('/api/employees').then(d => { setEmployees(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = employees.filter(e => {
    if (deptFilter && e.department !== deptFilter) return false;
    if (subDeptFilter && e.sub_department !== subDeptFilter) return false;
    if (search && !e.name.includes(search) && !e.username.includes(search)) return false;
    return true;
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', username: '', password: '', role: 'operator', department: 'shifts', sub_department: '', shift: '', join_date: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({ name: emp.name, username: emp.username, password: '', role: emp.role, department: emp.department || 'shifts', sub_department: emp.sub_department || '', shift: emp.shift || '', join_date: emp.join_date });
    setModalOpen(true);
  };

  const openProfile = async (emp: Employee) => {
    setProfileOpen(true);
    setProfileData(null);
    setProfileLoading(true);
    setActiveTab('leaves');
    try {
      const data = await api<EmployeeDetail>(`/api/employees/${emp.id}`);
      setProfileData(data);
    } catch {
      toast('فشل تحميل بيانات الموظف', 'error');
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...form, shift: form.shift || null, sub_department: form.sub_department || null };
      if (!payload.password && !editId) { toast('كلمة المرور مطلوبة', 'error'); return; }
      if (!payload.password) delete payload.password;

      if (editId) {
        await api(`/api/employees/${editId}`, 'PUT', payload);
        toast('تم تعديل الموظف بنجاح');
      } else {
        await api('/api/employees', 'POST', payload);
        toast('تم إضافة الموظف بنجاح');
      }
      setModalOpen(false);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try { await api(`/api/employees/${id}`, 'DELETE'); toast('تم حذف الموظف'); load(); }
    catch (err: any) { toast(err.message, 'error'); }
  };

  const shiftLabel = (s: string | null) => s ? `مناوبة ${s}` : '-';
  const hasSubDepts = form.department === 'shifts' || form.department === 'operations';
  const currentSubDeptOptions = subDeptOptions[form.department] || [];

  // Get available sub-dept options for the filter
  const filterSubDeptOptions = deptFilter ? (subDeptOptions[deptFilter] || []).filter(o => o.value !== '') : [];

  const emp = profileData?.employee;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="إدارة الموظفين"
        subtitle={`${employees.length} موظف`}
        actions={<Button onClick={openAdd}><UserPlus size={16} /> إضافة موظف</Button>}
      />

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المستخدم..." className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setSubDeptFilter(''); }} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">كل الإدارات</option>
          <option value="shifts">المناوبات</option>
          <option value="hr">الموارد البشرية</option>
          <option value="operations">العمليات</option>
          <option value="workforce">القوى العاملة</option>
        </select>
        {filterSubDeptOptions.length > 0 && (
          <select value={subDeptFilter} onChange={e => setSubDeptFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">كل الأقسام</option>
            {filterSubDeptOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </Card>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState message="لا يوجد موظفين" icon={<Users size={48} />} /></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">#</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">المستخدم</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">الدور</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">الإدارة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">القسم</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">المناوبة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">التعيين</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp, i) => (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs" dir="ltr">{emp.username}</td>
                    <td className="px-4 py-3"><RoleBadge role={emp.role} /></td>
                    <td className="px-4 py-3"><DeptBadge dept={emp.department} /></td>
                    <td className="px-4 py-3"><SubDeptBadge subDept={emp.sub_department} /></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{shiftLabel(emp.shift)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.join_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openProfile(emp)}
                          title="عرض الملف الشخصي"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                        >
                          <Eye size={16} />
                        </button>
                        {emp.role !== 'general_manager' && (
                          <>
                            <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(emp.id, emp.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'تعديل موظف' : 'إضافة موظف جديد'}>
        <div className="space-y-4">
          <Input label="الاسم الكامل" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="اسم المستخدم" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required dir="ltr" />
          <Input label={editId ? 'كلمة المرور (اتركها فارغة لعدم التغيير)' : 'كلمة المرور'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editId} />
          <Select label="الدور" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} options={[
            { value: 'operator', label: 'منفذ' },
            { value: 'supervisor', label: 'ضابط (مشرف)' },
            { value: 'dept_manager', label: 'مدير إدارة' },
          ]} />
          <Select label="الإدارة" value={form.department} onChange={e => setForm({ ...form, department: e.target.value, sub_department: '', shift: '' })} options={[
            { value: 'shifts', label: 'إدارة المناوبات' },
            { value: 'hr', label: 'الموارد البشرية' },
            { value: 'operations', label: 'العمليات' },
            { value: 'workforce', label: 'القوى العاملة' },
          ]} />
          {hasSubDepts && form.role !== 'dept_manager' && (
            <Select label="القسم الفرعي" value={form.sub_department} onChange={e => setForm({ ...form, sub_department: e.target.value })} options={currentSubDeptOptions} />
          )}
          {form.department === 'shifts' && form.role !== 'dept_manager' && (form.sub_department === 'shifts_rotation' || form.sub_department === '') && (
            <Select label="المناوبة" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} options={[
              { value: '', label: 'اختر المناوبة' },
              { value: 'أ', label: 'مناوبة أ' },
              { value: 'ب', label: 'مناوبة ب' },
              { value: 'ج', label: 'مناوبة ج' },
              { value: 'د', label: 'مناوبة د' },
            ]} />
          )}
          <Input label="تاريخ التعيين" type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} required />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">{editId ? 'حفظ التعديلات' : 'إضافة'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* Employee Profile Modal */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title={emp ? `ملف الموظف — ${emp.name}` : 'تحميل...'} size="xl">
        {profileLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : profileData && emp ? (
          <div className="space-y-6">

            {/* Employee Info Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800">{emp.name}</h3>
                <p className="text-xs text-gray-500 font-mono" dir="ltr">@{emp.username}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <RoleBadge role={emp.role} />
                  <DeptBadge dept={emp.department} />
                  {emp.sub_department && <SubDeptBadge subDept={emp.sub_department} />}
                  {emp.shift && <ShiftBadge shift={emp.shift} />}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-100 shadow-sm text-center">
                  <Wallet size={16} className="text-emerald-600" />
                  <div>
                    <p className="text-xl font-bold text-emerald-700">{emp.annual_leave_balance}</p>
                    <p className="text-[10px] text-gray-500">رصيد الإجازات</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
                  <CalendarDays size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">{emp.join_date}</p>
                    <p className="text-[10px] text-gray-500">تاريخ التعيين</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'إجازة', count: profileData.leaves.length, icon: CalendarDays, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                { label: 'دورة', count: profileData.courses.length, icon: GraduationCap, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
                { label: 'انتداب', count: profileData.mandates.length, icon: Briefcase, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{s.count}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white shadow text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={15} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Leaves Tab */}
              {activeTab === 'leaves' && (
                <div>
                  {profileData.leaves.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <CalendarDays size={40} className="opacity-30 mb-2" />
                      <p className="text-sm">لا توجد إجازات مسجلة</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">#</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">من</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">إلى</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">الأيام</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">تاريخ الطلب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {profileData.leaves.map((l: any, i: number) => {
                            const days = Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / 86400000) + 1;
                            return (
                              <tr key={l.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-2.5 text-gray-700">{l.start_date}</td>
                                <td className="px-4 py-2.5 text-gray-700">{l.end_date}</td>
                                <td className="px-4 py-2.5">
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">{days} يوم</span>
                                </td>
                                <td className="px-4 py-2.5"><StatusBadge status={l.status} /></td>
                                <td className="px-4 py-2.5 text-gray-400 text-xs">{l.created_at?.split('T')[0] || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div>
                  {profileData.courses.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <GraduationCap size={40} className="opacity-30 mb-2" />
                      <p className="text-sm">لا توجد دورات مسجلة</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">#</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">العنوان</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">الموقع</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {profileData.courses.map((c: any, i: number) => (
                            <tr key={c.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-2.5 font-medium text-gray-800">{c.title}</td>
                              <td className="px-4 py-2.5 text-gray-500">{c.location}</td>
                              <td className="px-4 py-2.5 text-gray-500">{c.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Mandates Tab */}
              {activeTab === 'mandates' && (
                <div>
                  {profileData.mandates.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <Briefcase size={40} className="opacity-30 mb-2" />
                      <p className="text-sm">لا توجد انتدابات مسجلة</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">#</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">العنوان</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">الموقع</th>
                            <th className="px-4 py-2.5 text-right font-medium text-gray-500">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {profileData.mandates.map((m: any, i: number) => (
                            <tr key={m.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-2.5 font-medium text-gray-800">{m.title}</td>
                              <td className="px-4 py-2.5 text-gray-500">{m.location}</td>
                              <td className="px-4 py-2.5 text-gray-500">{m.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
