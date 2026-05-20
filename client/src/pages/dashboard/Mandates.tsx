import { useState, useEffect } from 'react';
import { api } from '../../hooks/useApi';
import { useToast } from '../../components/Toast';
import Modal, { Card, SectionHeader, Button, Input, EmptyState, Skeleton } from '../../components/UI';
import { RoleBadge, ShiftBadge } from '../../components/Badge';
import { Briefcase, Plus, Trash2, Pencil, Search, Award, CheckCircle, ChevronDown, ChevronUp, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Smart Employee Picker ────────────────────────────────────────
function EmployeePicker({ nominees, selectedId, onSelect }: {
  nominees: any[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = nominees.filter(n =>
    !search || n.name.includes(search) || n.shift?.includes(search)
  );

  const selected = nominees.find(n => n.id.toString() === selectedId);

  // Days since last mandate
  const daysSince = (dateStr: string | null) => {
    if (!dateStr) return Infinity;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  const priorityColor = (n: any) => {
    if (!n.last_mandate_date) return 'bg-green-50 border-green-200 text-green-700';
    const d = daysSince(n.last_mandate_date);
    if (d > 90) return 'bg-blue-50 border-blue-200 text-blue-700';
    if (d > 30) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-gray-50 border-gray-200 text-gray-500';
  };

  const priorityLabel = (n: any) => {
    if (!n.last_mandate_date) return 'لم ينتدب';
    const d = daysSince(n.last_mandate_date);
    if (d > 90) return `منذ ${d} يوم`;
    if (d > 30) return `منذ ${d} يوم`;
    return `منذ ${d} يوم`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        الموظف المُرشَّح
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition outline-none
          ${open ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}
          ${selected ? 'text-gray-800' : 'text-gray-400'}`}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">{selected.name}</span>
            {selected.shift && <ShiftBadge shift={selected.shift} />}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(selected)}`}>
              {priorityLabel(selected)}
            </span>
          </div>
        ) : (
          <span>اختر الموظف من القائمة المرتبة...</span>
        )}
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو المناوبة..."
                  className="flex-1 text-sm outline-none bg-transparent"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2 pr-1">
                ✦ مرتبون تلقائياً: الأقدم بدون انتداب أولاً
              </p>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">لا توجد نتائج</p>
              ) : filtered.map((n, idx) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => { onSelect(n.id.toString()); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 transition
                    ${selectedId === n.id.toString() ? 'bg-emerald-50' : ''}`}
                >
                  {/* Rank badge */}
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${idx === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' :
                      idx === 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                      'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-medium text-gray-800 text-sm">{n.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <RoleBadge role={n.role} />
                      {n.shift && <ShiftBadge shift={n.shift} />}
                    </div>
                  </div>

                  {/* Priority indicator */}
                  <div className="flex-shrink-0 text-left">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(n)}`}>
                      {priorityLabel(n)}
                    </span>
                  </div>

                  {selectedId === n.id.toString() && (
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function Mandates() {
  const [mandates, setMandates] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'nominate'>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', location: '', date: '', employee_id: '' });
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const load = () => { api('/api/mandates').then(d => { setMandates(d); setLoading(false); }).catch(() => setLoading(false)); };
  const loadNominees = () => { api('/api/mandates/nominations').then(setNominees).catch(() => {}); };
  useEffect(() => { load(); loadNominees(); }, []);

  const openAdd = (empId?: number) => {
    setEditId(null);
    setForm({ title: '', location: '', date: new Date().toISOString().split('T')[0], employee_id: empId?.toString() || '' });
    setModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditId(m.id);
    setForm({ title: m.title, location: m.location, date: m.date, employee_id: m.employee_id.toString() });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      if (!form.title || !form.location || !form.date || !form.employee_id) { toast('جميع الحقول مطلوبة', 'error'); return; }
      if (editId) { await api(`/api/mandates/${editId}`, 'PUT', { ...form, employee_id: Number(form.employee_id) }); toast('تم التعديل'); }
      else { await api('/api/mandates', 'POST', { ...form, employee_id: Number(form.employee_id) }); toast('تم إسناد الانتداب ✓'); }
      setModalOpen(false); load(); loadNominees();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const del = async (id: number) => {
    if (!confirm('حذف؟')) return;
    try { await api(`/api/mandates/${id}`, 'DELETE'); toast('تم الحذف'); load(); loadNominees(); } catch (e: any) { toast(e.message, 'error'); }
  };

  const filtered = mandates.filter(m => !search || m.employee_name?.includes(search) || m.title?.includes(search));

  // Days since last mandate for nominee tab
  const daysSince = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="إدارة الانتدابات" subtitle={`${mandates.length} انتداب`} actions={<Button onClick={() => openAdd()}><Plus size={16} /> إسناد انتداب</Button>} />

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('list')} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Briefcase size={16} className="inline ml-1" /> سجل الانتدابات
        </button>
        <button onClick={() => setTab('nominate')} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'nominate' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Award size={16} className="inline ml-1" /> الترشيح الذكي
        </button>
      </div>

      {/* ─── LIST TAB ─────────────────────────────── */}
      {tab === 'list' && (
        <>
          <Card className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </Card>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div> :
           filtered.length === 0 ? <Card><EmptyState message="لا توجد انتدابات" icon={<Briefcase size={48} />} /></Card> : (
            <Card padding={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100"><tr>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">الموظف</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">الانتداب</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">المكان</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">التاريخ</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">إجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((m, i) => (
                      <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{m.employee_name}</td>
                        <td className="px-4 py-3 text-gray-700">{m.title}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.location}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.date}</td>
                        <td className="px-4 py-3"><div className="flex gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"><Pencil size={16} /></button>
                          <button onClick={() => del(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                        </div></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ─── NOMINATE TAB ─────────────────────────── */}
      {tab === 'nominate' && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">قائمة الترشيح الذكي</h3>
              <p className="text-xs text-gray-400 mt-0.5">مرتبون تلقائياً · الأقدم بدون انتداب أولاً</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>لم ينتدب</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>أكثر من 90 يوم</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>30-90 يوم</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {nominees.map((n, i) => {
              const ds = daysSince(n.last_mandate_date);
              const dotColor = !n.last_mandate_date ? 'bg-green-400' : ds! > 90 ? 'bg-blue-400' : ds! > 30 ? 'bg-amber-400' : 'bg-gray-300';
              const rankColors = ['from-emerald-500 to-teal-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-500'];
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition"
                >
                  {/* Rank */}
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white bg-gradient-to-br ${rankColors[i] || 'from-gray-300 to-gray-400'}`}>
                    {i + 1}
                  </span>

                  {/* Name & badges */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{n.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <RoleBadge role={n.role} />
                      {n.shift && <ShiftBadge shift={n.shift} />}
                    </div>
                  </div>

                  {/* Last mandate */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></span>
                    {n.last_mandate_date
                      ? <span>آخر انتداب: {n.last_mandate_date} <span className="text-gray-300">({ds} يوم)</span></span>
                      : <span className="text-green-600 font-medium">لم ينتدب بعد</span>
                    }
                  </div>

                  {/* Assign button */}
                  <Button size="sm" onClick={() => openAdd(n.id)}>
                    <Plus size={13} /> إسناد
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── MODAL ────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'تعديل انتداب' : 'إسناد انتداب جديد'}>
        <div className="space-y-4">
          <Input label="عنوان الانتداب" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="مثال: انتداب دعم فني" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin size={13} className="inline ml-1 text-gray-400" />المكان
              </label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="مثال: الرياض"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={13} className="inline ml-1 text-gray-400" />التاريخ
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Smart Employee Picker */}
          {!editId && (
            <EmployeePicker
              nominees={nominees}
              selectedId={form.employee_id}
              onSelect={id => setForm({ ...form, employee_id: id })}
            />
          )}

          {editId && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
              الموظف: <span className="font-bold">{nominees.find(n => n.id.toString() === form.employee_id)?.name || '—'}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={save} className="flex-1">{editId ? 'حفظ التعديلات' : 'إسناد الانتداب'}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
