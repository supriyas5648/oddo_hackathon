import { useState } from 'react';
import { useStartRepair } from '../../hooks/useMaintenance';

/** Start Repair modal: Pending -> In Progress. */
export default function StartRepairForm({ record, onSuccess, onCancel }) {
  const [form, setForm] = useState({ technicianName: '', estimatedRepairCost: '', repairNotes: '' });
  const [errors, setErrors] = useState({});
  const startMut = useStartRepair();

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.technicianName || form.technicianName.trim().length < 2) {
      setErrors({ technicianName: 'Technician name is required' });
      return;
    }
    const payload = { technicianName: form.technicianName.trim() };
    if (form.estimatedRepairCost !== '') payload.estimatedRepairCost = Number(form.estimatedRepairCost);
    if (form.repairNotes.trim()) payload.repairNotes = form.repairNotes.trim();

    try {
      await startMut.mutateAsync({ id: record._id, payload });
      onSuccess?.();
    } catch (err) {
      if (err.fieldErrors) {
        const map = {};
        err.fieldErrors.forEach((fe) => {
          map[fe.field] = fe.message;
        });
        setErrors(map);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{record.asset?.name}</p>
          <p className="font-mono text-xs text-brand-700">{record.asset?.assetTag}</p>
        </div>
      </div>

      {record.issue && (
        <div>
          <label className="label">Reported Issue</label>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{record.issue}</p>
        </div>
      )}

      <div>
        <label className="label">Technician Name *</label>
        <input
          className="input"
          value={form.technicianName}
          onChange={(e) => setField('technicianName', e.target.value)}
          placeholder="e.g. Ravi Kumar"
        />
        {errors.technicianName && (
          <p className="mt-1 text-xs text-red-600">{errors.technicianName}</p>
        )}
      </div>

      <div>
        <label className="label">Estimated Repair Cost</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input"
          value={form.estimatedRepairCost}
          onChange={(e) => setField('estimatedRepairCost', e.target.value)}
          placeholder="0.00"
        />
        {errors.estimatedRepairCost && (
          <p className="mt-1 text-xs text-red-600">{errors.estimatedRepairCost}</p>
        )}
      </div>

      <div>
        <label className="label">Repair Notes</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={form.repairNotes}
          onChange={(e) => setField('repairNotes', e.target.value)}
          placeholder="Diagnosis, parts needed…"
          maxLength={1000}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={startMut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={startMut.isPending}>
          {startMut.isPending ? 'Starting…' : 'Start Repair'}
        </button>
      </div>
    </form>
  );
}
