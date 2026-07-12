import { useState } from 'react';
import { useEmployees, useCreateAllocation } from '../../hooks/useAllocations';
import { useAuth } from '../../context/AuthContext';

// Client-side validation mirroring the backend rules.
function validate(form) {
  const errors = {};
  if (!form.employee) errors.employee = 'Please select an employee';
  return errors;
}

function toPayload(assetId, form) {
  const payload = { asset: assetId, employee: form.employee };
  if (form.expectedReturnDate) payload.expectedReturnDate = form.expectedReturnDate;
  if (form.purpose.trim()) payload.purpose = form.purpose.trim();
  if (form.remarks.trim()) payload.remarks = form.remarks.trim();
  return payload;
}

/**
 * Allocation form. Rendered inside a Modal from the Assets page.
 * `asset` is the asset being allocated.
 */
export default function AllocateForm({ asset, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    employee: '',
    expectedReturnDate: '',
    purpose: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});

  const { manager } = useAuth();
  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const createMut = useCreateAllocation();

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await createMut.mutateAsync(toPayload(asset._id, form));
      onSuccess?.();
    } catch (err) {
      // Surface backend field errors inline if provided.
      if (err.fieldErrors) {
        const map = {};
        err.fieldErrors.forEach((fe) => {
          map[fe.field] = fe.message;
        });
        setErrors((prev) => ({ ...prev, ...map }));
      }
    }
  };

  const Err = ({ name }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Asset context banner */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{asset.name}</p>
          <p className="font-mono text-xs text-brand-700">{asset.assetTag}</p>
        </div>
      </div>

      {/* Employee */}
      <div>
        <label className="label">Employee *</label>
        <select
          className="input"
          value={form.employee}
          onChange={(e) => setField('employee', e.target.value)}
          disabled={empLoading}
        >
          <option value="">{empLoading ? 'Loading employees…' : 'Select employee…'}</option>
          {employees.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
              {u.designation ? ` — ${u.designation}` : ''}
            </option>
          ))}
        </select>
        <Err name="employee" />
      </div>

      {/* Allocated By — always the logged-in manager (read-only, auto-set) */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
        <span className="text-sm text-slate-500">Allocated By</span>
        <span className="text-sm font-medium text-slate-800">{manager?.fullName}</span>
      </div>

      {/* Expected Return Date */}
      <div>
        <label className="label">Expected Return Date</label>
        <input
          type="date"
          className="input"
          value={form.expectedReturnDate}
          onChange={(e) => setField('expectedReturnDate', e.target.value)}
        />
        <Err name="expectedReturnDate" />
      </div>

      {/* Purpose */}
      <div>
        <label className="label">Purpose</label>
        <input
          className="input"
          value={form.purpose}
          onChange={(e) => setField('purpose', e.target.value)}
          placeholder="e.g. Project Work"
          maxLength={300}
        />
        <Err name="purpose" />
      </div>

      {/* Remarks */}
      <div>
        <label className="label">Remarks</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={form.remarks}
          onChange={(e) => setField('remarks', e.target.value)}
          placeholder="Any additional notes…"
          maxLength={500}
        />
        <Err name="remarks" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={createMut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={createMut.isPending}>
          {createMut.isPending ? 'Allocating…' : 'Allocate Asset'}
        </button>
      </div>
    </form>
  );
}
