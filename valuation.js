import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PHOTO_FIELDS = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "driver_side", label: "Driver Side" },
  { key: "passenger_side", label: "Passenger Side" },
  { key: "interior", label: "Interior" },
  { key: "mileage", label: "Mileage Photo" },
  { key: "engine_bay", label: "Engine Bay" },
  { key: "documents", label: "Car Documents / Passing" },
];

export default function ValuationPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    condition: "Excellent",
    notes: "",
  });

  const [files, setFiles] = useState(() =>
    Object.fromEntries(PHOTO_FIELDS.map(f => [f.key, null]))
  );

  const [previews, setPreviews] = useState(() =>
    Object.fromEntries(PHOTO_FIELDS.map(f => [f.key, null]))
  );

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function onFileChange(key, file) {
    setFiles(prev => ({ ...prev, [key]: file || null }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [key]: url }));
    } else {
      setPreviews(prev => ({ ...prev, [key]: null }));
    }
  }

  async function uploadOne(file, requestId, key) {
    const safeName = file.name.replace(/\s+/g, "_");
    const path = `${requestId}/${key}-${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("valuation-photos")
      .upload(path, file, { upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
      .from("valuation-photos")
      .getPublicUrl(path);

    return { key, url: data.publicUrl };
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      // 1) Create request row first (no photos yet)
      const { data: row, error: insertErr } = await supabase
        .from("valuation_requests")
        .insert({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: form.year.trim(),
          mileage: form.mileage.trim(),
          condition: form.condition,
          notes: form.notes.trim(),
          status: "new",
          photos: [],
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 2) Upload files
      const requestId = row.id;
      const uploads = [];

      for (const f of PHOTO_FIELDS) {
        const file = files[f.key];
        if (file) uploads.push(uploadOne(file, requestId, f.key));
      }

      const photos = await Promise.all(uploads);

      // 3) Update row with photo URLs
      const { error: updErr } = await supabase
        .from("valuation_requests")
        .update({ photos })
        .eq("id", requestId);

      if (updErr) throw updErr;

      setMsg("✅ Submitted! CARFIN team will contact you soon.");
      setForm({
        name: "",
        phone: "",
        email: "",
        brand: "",
        model: "",
        year: "",
        mileage: "",
        condition: "Excellent",
        notes: "",
      });
      setFiles(Object.fromEntries(PHOTO_FIELDS.map(f => [f.key, null])));
      setPreviews(Object.fromEntries(PHOTO_FIELDS.map(f => [f.key, null])));
    } catch (err) {
      setMsg(`❌ Error: ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "Arial" }}>
      <h1>Vehicle Valuation</h1>
      <p>Upload vehicle details and photos for evaluation.</p>

      <form onSubmit={submit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} required style={inp} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={onChange} required style={inp} />

        <label>Email (optional)</label>
        <input name="email" value={form.email} onChange={onChange} style={inp} />

        <label>Car Brand</label>
        <input name="brand" value={form.brand} onChange={onChange} style={inp} />

        <label>Model</label>
        <input name="model" value={form.model} onChange={onChange} style={inp} />

        <label>Year</label>
        <input name="year" value={form.year} onChange={onChange} style={inp} />

        <label>Mileage (km)</label>
        <input name="mileage" value={form.mileage} onChange={onChange} style={inp} />

        <label>Condition</label>
        <select name="condition" value={form.condition} onChange={onChange} style={inp}>
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
          <option>Poor</option>
        </select>

        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={onChange} style={{ ...inp, height: 90 }} />

        <h3 style={{ marginTop: 24 }}>Photos</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PHOTO_FIELDS.map((f) => (
            <div key={f.key} style={card}>
              <div style={{ fontWeight: 700 }}>{f.label}</div>

              {previews[f.key] ? (
                <img src={previews[f.key]} alt={f.label} style={{ width: "100%", marginTop: 8, borderRadius: 8 }} />
              ) : (
                <div style={{ marginTop: 8, opacity: 0.7 }}>No photo selected</div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(f.key, e.target.files?.[0] || null)}
                style={{ marginTop: 10 }}
              />
            </div>
          ))}
        </div>

        <button disabled={loading} style={btn}>
          {loading ? "Submitting..." : "Submit Valuation"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 16 }}>{msg}</p>}
    </div>
  );
}

const inp = {
  width: "100%",
  padding: 12,
  margin: "6px 0 14px",
  borderRadius: 10,
  border: "1px solid #ccc",
};

const btn = {
  marginTop: 18,
  padding: "12px 18px",
  borderRadius: 10,
  border: "none",
  background: "black",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
};
