import { useState } from 'react';
import { upsertTripFare } from '../../utils/adminApi';

export default function PricingForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    zoneName: '', categoryType: '',
    baseFare: '', baseFarePerKm: '', timeRatePerMinOverride: ''
  });
  const [saving, setSaving] = useState(false);

  function set<K extends string>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Send only filled fields
      const payload: any = {};
      ['zoneId', 'zoneName', 'vehicleCategoryId', 'categoryType', 'categoryName', 'baseFare', 'baseFarePerKm', 'timeRatePerMinOverride',
        'waitingFeePerMin', 'cancellationFeePercent', 'minCancellationFee', 'idleFeePerMin', 'tripDelayFeePerMin', 'penaltyFeeForCancel', 'feeAddToNext']
        .forEach((k) => {
          if (form[k] !== '' && form[k] != null) {
            payload[k] = isNaN(form[k]) ? form[k] : Number(form[k]);
          }
        });
      await upsertTripFare(payload);
      onSaved();
      setForm({
        zoneName: '', categoryType: '',
        baseFare: '', baseFarePerKm: '', timeRatePerMinOverride: ''
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 shadow rounded space-y-3">
      <div className="font-semibold">Add/Update Fare Override</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Zone Name (or Zone ID)"
          value={form.zoneName}
          onChange={e => set('zoneName', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Category Type (e.g., MEGA)"
          value={form.categoryType}
          onChange={e => set('categoryType', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Base Fare"
          type="number"
          step="0.01"
          value={form.baseFare}
          onChange={e => set('baseFare', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Per Km Rate"
          type="number"
          step="0.01"
          value={form.baseFarePerKm}
          onChange={e => set('baseFarePerKm', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Time Rate / Min (optional)"
          type="number"
          step="0.01"
          value={form.timeRatePerMinOverride}
          onChange={e => set('timeRatePerMinOverride', e.target.value)}
        />
      </div>
      <button
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}