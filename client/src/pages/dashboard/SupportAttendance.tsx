import { useState, useEffect } from 'react';
import { api } from '../../hooks/useApi';
import Modal, { Card, SectionHeader, EmptyState, Skeleton, Button } from '../../components/UI';
import { StatusBadge } from '../../components/Badge';
import { Shield, Eye, Sun, Sunset, Moon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const groupIcons: Record<string, any> = { morning: <Sun size={16} />, afternoon: <Sunset size={16} />, night: <Moon size={16} /> };
const groupNames: Record<string, string> = { morning: 'الصباح', afternoon: 'العصر', night: 'الليل' };

export default function SupportAttendance() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    api('/api/support-attendance/reports/approved').then(d => { setReports(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const viewDetail = async (id: number) => {
    try {
      const data = await api(`/api/support-attendance/reports/${id}/full`);
      setDetail(data);
    } catch {}
  };

  const deleteReport = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف كشف هذا اليوم بالكامل؟ هذا الإجراء سيسمح للمشرفين بإعادة التحضير اليومي.')) return;
    try {
      await api(`/api/support-attendance/reports/${id}`, 'DELETE');
      setDetail(null);
      setLoading(true);
      const data = await api('/api/support-attendance/reports/approved');
      setReports(data);
      setLoading(false);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="كشوفات المساندة" subtitle={`${reports.length} كشف`} />

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div> :
       reports.length === 0 ? <Card><EmptyState message="لا توجد كشوفات مرفوعة" icon={<Shield size={48} />} /></Card> : (
        <div className="grid gap-4">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition cursor-pointer" onClick={() => viewDetail(r.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Shield size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">كشف المساندة - {r.date}</p>
                      <p className="text-xs text-gray-500">رفع بواسطة: {r.submitted_by_name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <Eye size={18} className="text-gray-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `كشف المساندة - ${detail.report?.date}` : ''} size="xl">
        {detail && (
          <div className="space-y-6">
            {detail.sessions?.map((session: any) => (
              <div key={session.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 font-bold text-sm">
                  {groupIcons[session.group_type]}
                  <span>مجموعة {groupNames[session.group_type]}</span>
                  <span className="text-xs text-gray-400 font-normal mr-auto">{session.shift_start_time} → {session.shift_end_time}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50"><tr>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">#</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">الموظف</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">الحضور</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">الانصراف</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {session.records?.map((r: any, idx: number) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{r.employee_name}</td>
                        <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>{r.check_in_time ? new Date(r.check_in_time + 'Z').toLocaleTimeString('ar-SA') : '-'}</span>
                            {(r.check_in_signature || (r.check_in_time && r.employee_signature)) && (
                              <img 
                                src={r.check_in_signature || r.employee_signature} 
                                alt="توقيع" 
                                className="h-7 max-w-[80px] object-contain border border-gray-100 rounded bg-white p-0.5"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>{r.check_out_time ? new Date(r.check_out_time + 'Z').toLocaleTimeString('ar-SA') : '-'}</span>
                            {(r.check_out_signature || (r.check_out_time && r.employee_signature)) && (
                              <img 
                                src={r.check_out_signature || r.employee_signature} 
                                alt="توقيع" 
                                className="h-7 max-w-[80px] object-contain border border-gray-100 rounded bg-white p-0.5"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Signatures section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-6">
              {detail.report?.opening_signature && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">مشرف الصباح (توقيع افتتاحي)</span>
                    <span className="font-bold text-gray-800 text-sm">{detail.report.opening_supervisor_name || 'مشرف الصباح'}</span>
                  </div>
                  <img src={detail.report.opening_signature} alt="توقيع الصباح" className="h-12 object-contain bg-white border rounded p-1" />
                </div>
              )}
              {detail.report?.closing_signature && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">مشرف الليل (توقيع ختامي)</span>
                    <span className="font-bold text-gray-800 text-sm">{detail.report.submitted_by_name || 'مشرف الليل'}</span>
                  </div>
                  <img src={detail.report.closing_signature} alt="توقيع الليل" className="h-12 object-contain bg-white border rounded p-1" />
                </div>
              )}
            </div>

            {/* Reset/Delete Action */}
            <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
              <Button 
                variant="danger" 
                onClick={() => deleteReport(detail.report.id)}
                className="flex items-center gap-1.5"
              >
                <Trash2 size={16} className="ml-1" />
                حذف الكشف وإعادة التهيئة
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
