import { useState } from 'react';
import { useReturnAllocation } from '../../hooks/useAllocations';
import { useAuth } from '../../context/AuthContext';
import { ASSET_CONDITIONS } from '../../constants/assetOptions';

// Today's date as YYYY-MM-DD for the default return date.
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Return (check-in) form. Rendered in a Modal from Asset Details.
 * `asset` and `allocation` are the asset and its active allocation.
 */
export default function ReturnForm({ asset, allocation, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    returnDate: today(),
    returnCondition: asset.condition || 'Good',
    returnRemarks: '',
  });
  const [errors, setErrors] = useState({});
  const { manager } = useAuth();
  const returnMut = useReturnAllocation();

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.returnCondition) {
      setErrors({ returnCondition: 'Please select a condition' });
      return;
    }
    const payload = {
      returnCondition: form.returnCondition,
      returnDate: form.returnDate || undefined,
      returnRemarks: form.returnRemarks.trim() || undefined,
    };
    try {
      await returnMut.mutateAsync({ id: allocation._id, payload });
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
      {/* Read-only context */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Asset</label>
          <input className="input bg-slate-50" value={`${asset.name} (${asset.assetTag})`} readOnly />
        </div>
        <div>
          <label className="label">Employee</label>
          <input
            className="input bg-slate-50"
            value={allocation.employee?.name || '—'}
            readOnly
          />
        </div>
      </div>

      {/* Returned By — always the logged-in manager (read-only, auto-set) */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
        <span className="text-sm text-slate-500">Returned By</span>
        <span className="text-sm font-medium text-slate-800">{manager?.fullName}</span>
      </div>

      {/* Return date */}
      <div>
        <label className="label">Return Date</label>
        <input
          type="date"
          className="input"
          value={form.returnDate}
          onChange={(e) => setField('returnDate', e.target.value)}
        />
      </div>

      {/* Condition */}
      <div>
        <label className="label">Condition *</label>
        <select
          className="input"
          value={form.returnCondition}
          onChange={(e) => setField('returnCondition', e.target.value)}
        >
          {ASSET_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.returnCondition && (
          <p className="mt-1 text-xs text-red-600">{errors.returnCondition}</p>
        )}
      </div>

      {/* Remarks */}
      <div>
        <label className="label">Remarks</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={form.returnRemarks}
          onChange={(e) => setField('returnRemarks', e.target.value)}
          placeholder="Condition notes, damages, accessories returned…"
          maxLength={500}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={returnMut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={returnMut.isPending}>
          {returnMut.isPending ? 'Returning…' : 'Return Asset'}
        </button>
      </div>
    </form>
  );
}
