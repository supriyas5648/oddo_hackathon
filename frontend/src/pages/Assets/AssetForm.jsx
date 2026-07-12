import { useMemo, useState } from 'react';
import { useCreateAsset, useUpdateAsset, useCategories, useDepartments } from '../../hooks/useAssets';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '../../constants/assetOptions';
import { toDateInput } from '../../utils/format';

// Build the initial form state, optionally seeded from an existing asset.
function buildInitial(asset) {
  return {
    name: asset?.name || '',
    serialNumber: asset?.serialNumber || '',
    category: asset?.category?._id || asset?.category || '',
    department: asset?.department?._id || asset?.department || '',
    location: asset?.location || '',
    purchaseDate: toDateInput(asset?.purchaseDate),
    purchaseCost: asset?.purchaseCost ?? '',
    warrantyExpiry: toDateInput(asset?.warrantyExpiry),
    condition: asset?.condition || 'Good',
    status: asset?.status || 'Available',
    isBookable: asset?.isBookable || false,
    image: asset?.image || '',
    documents: asset?.documents?.length ? asset.documents : [],
  };
}

// Client-side validation mirrors the backend Joi rules so users get instant
// feedback; the server remains the source of truth.
function validate(form) {
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = 'Name is required (min 2 chars)';
  if (!form.serialNumber || !form.serialNumber.trim()) errors.serialNumber = 'Serial number is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.department) errors.department = 'Department is required';
  if (form.purchaseCost !== '' && Number(form.purchaseCost) < 0)
    errors.purchaseCost = 'Purchase cost cannot be negative';
  if (
    form.purchaseDate &&
    form.warrantyExpiry &&
    new Date(form.warrantyExpiry) < new Date(form.purchaseDate)
  )
    errors.warrantyExpiry = 'Warranty expiry cannot be before purchase date';
  form.documents.forEach((d, i) => {
    if ((d.name && !d.url) || (!d.name && d.url)) {
      errors[`doc_${i}`] = 'Both name and URL are required';
    }
  });
  return errors;
}

// Strip empty optional fields before sending to the API.
function toPayload(form) {
  const payload = {
    name: form.name.trim(),
    serialNumber: form.serialNumber.trim(),
    category: form.category,
    department: form.department,
    condition: form.condition,
    status: form.status,
    isBookable: form.isBookable,
    location: form.location.trim(),
    image: form.image.trim(),
    documents: form.documents.filter((d) => d.name && d.url),
  };
  if (form.purchaseDate) payload.purchaseDate = form.purchaseDate;
  if (form.warrantyExpiry) payload.warrantyExpiry = form.warrantyExpiry;
  if (form.purchaseCost !== '') payload.purchaseCost = Number(form.purchaseCost);
  return payload;
}

export default function AssetForm({ asset, onSuccess, onCancel }) {
  const isEdit = Boolean(asset);
  const [form, setForm] = useState(() => buildInitial(asset));
  const [errors, setErrors] = useState({});

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: departments = [], isLoading: deptLoading } = useDepartments();
  const createMut = useCreateAsset();
  const updateMut = useUpdateAsset();
  const saving = createMut.isPending || updateMut.isPending;

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const setDocument = (i, key, value) => {
    setForm((f) => {
      const documents = [...f.documents];
      documents[i] = { ...documents[i], [key]: value };
      return { ...f, documents };
    });
  };
  const addDocument = () => setForm((f) => ({ ...f, documents: [...f.documents, { name: '', url: '' }] }));
  const removeDocument = (i) =>
    setForm((f) => ({ ...f, documents: f.documents.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = toPayload(form);
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: asset._id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onSuccess?.();
    } catch (err) {
      // Surface server-side field errors inline (e.g. duplicate serial).
      if (err.fieldErrors) {
        const fieldMap = {};
        err.fieldErrors.forEach((fe) => {
          fieldMap[fe.field] = fe.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldMap }));
      }
    }
  };

  const Err = ({ name }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  const lookupsLoading = useMemo(() => catLoading || deptLoading, [catLoading, deptLoading]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="label">Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. MacBook Pro 16”"
          />
          <Err name="name" />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            disabled={lookupsLoading}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <Err name="category" />
        </div>

        {/* Department */}
        <div>
          <label className="label">Department *</label>
          <select
            className="input"
            value={form.department}
            onChange={(e) => setField('department', e.target.value)}
            disabled={lookupsLoading}
          >
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <Err name="department" />
        </div>

        {/* Serial Number */}
        <div>
          <label className="label">Serial Number *</label>
          <input
            className="input"
            value={form.serialNumber}
            onChange={(e) => setField('serialNumber', e.target.value)}
            placeholder="Manufacturer serial"
          />
          <Err name="serialNumber" />
        </div>

        {/* Location */}
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="e.g. HQ - Floor 3"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="label">Purchase Date</label>
          <input
            type="date"
            className="input"
            value={form.purchaseDate}
            onChange={(e) => setField('purchaseDate', e.target.value)}
          />
        </div>

        {/* Purchase Cost */}
        <div>
          <label className="label">Purchase Cost</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            value={form.purchaseCost}
            onChange={(e) => setField('purchaseCost', e.target.value)}
            placeholder="0.00"
          />
          <Err name="purchaseCost" />
        </div>

        {/* Warranty Expiry */}
        <div>
          <label className="label">Warranty Expiry</label>
          <input
            type="date"
            className="input"
            value={form.warrantyExpiry}
            onChange={(e) => setField('warrantyExpiry', e.target.value)}
          />
          <Err name="warrantyExpiry" />
        </div>

        {/* Condition */}
        <div>
          <label className="label">Condition</label>
          <select
            className="input"
            value={form.condition}
            onChange={(e) => setField('condition', e.target.value)}
          >
            {ASSET_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status (edit only — new assets default to Available) */}
        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              {ASSET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Image URL */}
        <div className="sm:col-span-2">
          <label className="label">Image URL</label>
          <input
            className="input"
            value={form.image}
            onChange={(e) => setField('image', e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      {/* Bookable */}
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={form.isBookable}
          onChange={(e) => setField('isBookable', e.target.checked)}
        />
        This asset is bookable / reservable
      </label>

      {/* Documents */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Documents</label>
          <button type="button" className="btn-ghost px-2 py-1 text-brand-600" onClick={addDocument}>
            + Add document
          </button>
        </div>
        {form.documents.length === 0 && (
          <p className="text-xs text-slate-400">No documents attached.</p>
        )}
        <div className="space-y-2">
          {form.documents.map((doc, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input sm:w-1/3"
                placeholder="Name (e.g. Invoice)"
                value={doc.name}
                onChange={(e) => setDocument(i, 'name', e.target.value)}
              />
              <input
                className="input flex-1"
                placeholder="https://…"
                value={doc.url}
                onChange={(e) => setDocument(i, 'url', e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary px-3"
                onClick={() => removeDocument(i)}
                aria-label="Remove document"
              >
                ✕
              </button>
              {errors[`doc_${i}`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`doc_${i}`]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create asset'}
        </button>
      </div>
    </form>
  );
}
