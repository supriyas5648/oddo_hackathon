import { useState } from 'react';
import { useCompleteRepair } from '../../hooks/useMaintenance';
import { useAuth } from '../../context/AuthContext';
import { REPAIR_CONDITIONS } from '../../constants/maintenanceOptions';

/** Complete Repair modal: In Progress -> Completed, asset back to service. */
export default function CompleteRepairForm({ record, onSuccess, onCancel }) {
  const { manager } = useAuth();
  const [form, setForm] = useState({
    repairCost: record.estimatedRepairCost ? String(record.estimatedRepairCost) : '',
    resolution: '',
    assetCondition: 'Good',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const completeMut = useCompleteRepair();

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetCondition) {
      setErrors({ assetCondition: 'Select the asset condition' });
      return;
    }
    const payload = { assetCondition: form.assetCondition };
    if (form.repairCost !== '') payload.repairCost = Number(form.repairCost);
    if (form.resolution.trim()) payload.resolution = form.resolution.trim();
    if (form.remarks.trim()) payload.remarks = form.remarks.trim();

    try {
      await completeMut.mutateAsync({ id: record._id, payload });
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
        {record.technicianName && (
          <span className="ml-auto text-xs text-slate-400">Technician: {record.technicianName}</span>
        )}
      </div>

      <div>
        <label className="label">Final Repair Cost</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input"
          value={form.repairCost}
          onChange={(e) => setField('repairCost', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="label">Resolution</label>
        <textarea
          className="input min-h-[70px] resize-y"
          value={form.resolution}
          onChange={(e) => setField('resolution', e.target.value)}
          placeholder="What was done to fix it…"
          maxLength={1000}
        />
      </div>

      <div>
        <label className="label">Asset Condition *</label>
        <select
          className="input"
          value={form.assetCondition}
          onChange={(e) => setField('assetCondition', e.target.value)}
        >
          {REPAIR_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.assetCondition && (
          <p className="mt-1 text-xs text-red-600">{errors.assetCondition}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">The asset returns to service with this condition.</p>
      </div>

      <div>
        <label className="label">Remarks</label>
        <textarea
          className="input min-h-[70px] resize-y"
          value={form.remarks}
          onChange={(e) => setField('remarks', e.target.value)}
          placeholder="Any additional notes…"
          maxLength={1000}
        />
      </div>

      {/* Completed By — always the logged-in manager (read-only, auto-set) */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
        <span className="text-sm text-slate-500">Completed By</span>
        <span className="text-sm font-medium text-slate-800">{manager?.fullName}</span>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={completeMut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={completeMut.isPending}>
          {completeMut.isPending ? 'Completing…' : 'Complete Repair'}
        </button>
      </div>
    </form>
  );
}
