import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ── Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  ingredient: "M9 2h6l2 4H7L9 2z M3 6h18v2a9 9 0 01-18 0V6z M12 12v6 M8 14l4 4 4-4",
  menu: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  sop: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  chart: "M18 20V10 M12 20V4 M6 20v-6",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  plus: "M12 5v14 M5 12h14",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  close: "M6 18L18 6M6 6l12 12",
  check: "M5 13l4 4L19 7",
  warning: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  food: "M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  wifi: "M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01",
  image: "M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M21 15l-5-5L5 21",
  scale: "M12 3v18 M3 9l9-6 9 6 M3 15l9 6 9-6",
  tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  info: "M12 16v-4 M12 8h.01 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  calculator: "M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z M8 6h8 M8 10h2 M12 10h2 M16 10h.01 M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01 M16 18h.01",
};

// ── LocalStorage Hook ──────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = useCallback((value) => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { console.error(e); }
  }, [key, storedValue]);
  return [storedValue, setValue];
}

// ── Initial Data ───────────────────────────────────────
const INIT_CATEGORIES = ["เนื้อสัตว์", "ผักและผลไม้", "เครื่องปรุง", "นม/ไข่", "แป้ง/ธัญพืช", "อื่นๆ"];
const INIT_INGREDIENTS = [
  { id: 1, name: "ไก่หน้าอก", category: "เนื้อสัตว์", buyUnit: "กก.", buyAmount: 1, buyPrice: 120, convertToGram: 1000, pricePerGram: 0.12, stock: 5, image: null, note: "" },
  { id: 2, name: "ไข่ไก่", category: "นม/ไข่", buyUnit: "แผง (30ฟอง)", buyAmount: 1, buyPrice: 120, convertToGram: 1800, pricePerGram: 0.067, stock: 60, image: null, note: "1 ฟอง ≈ 60 กรัม" },
  { id: 3, name: "น้ำมันพืช", category: "เครื่องปรุง", buyUnit: "ลิตร", buyAmount: 1, buyPrice: 60, convertToGram: 920, pricePerGram: 0.065, stock: 6, image: null, note: "" },
  { id: 4, name: "ซีอิ้วขาว", category: "เครื่องปรุง", buyUnit: "ขวด 700ml", buyAmount: 1, buyPrice: 45, convertToGram: 700, pricePerGram: 0.064, stock: 8, image: null, note: "" },
];
const INIT_MENUS = [
  {
    id: 1, name: "ข้าวผัดไก่", category: "อาหารจานเดียว", price: 80, image: null,
    description: "ข้าวผัดไก่หอมอร่อย",
    ingredients: [{ ingredientId: 1, amountGram: 150 }, { ingredientId: 2, amountGram: 60 }, { ingredientId: 3, amountGram: 20 }, { ingredientId: 4, amountGram: 15 }],
    sop: [
      { step: 1, title: "เตรียมวัตถุดิบ", desc: "หั่นไก่เป็นชิ้นเล็กๆ ตีไข่ใส่ชาม เตรียมข้าวสวย", image: null },
      { step: 2, title: "ผัดไก่", desc: "ตั้งกระทะไฟแรง ใส่น้ำมัน ผัดไก่จนสุก", image: null },
      { step: 3, title: "ใส่ข้าว", desc: "ใส่ข้าวลงผัดรวมกัน ปรุงด้วยซีอิ้วขาว", image: null },
      { step: 4, title: "เสิร์ฟ", desc: "ตักใส่จาน ตกแต่งด้วยต้นหอม", image: null },
    ]
  },
];

// ── Helpers ────────────────────────────────────────────
function calcIngredientCost(ingredientId, amountGram, ingredients) {
  const ing = ingredients.find(i => i.id === ingredientId);
  if (!ing) return 0;
  return ing.pricePerGram * amountGram;
}
function calcMenuCost(menu, ingredients) {
  return menu.ingredients.reduce((sum, item) => sum + calcIngredientCost(item.ingredientId, item.amountGram, ingredients), 0);
}
function calcPricePerGram(buyPrice, convertToGram) {
  if (!convertToGram || convertToGram === 0) return 0;
  return buyPrice / convertToGram;
}

// ── Image Upload Helper ────────────────────────────────
function ImageUpload({ value, onChange, size = "normal", label = "แนบรูป" }) {
  const ref = useRef();
  const isSmall = size === "small";
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("รูปต้องไม่เกิน 2MB ครับ"); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  return (
    <div style={{ marginBottom: isSmall ? 0 : 14 }}>
      {!isSmall && label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6, fontFamily: "'Sarabun',sans-serif" }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {value ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={value} alt="" style={{ width: isSmall ? 40 : 80, height: isSmall ? 40 : 80, objectFit: "cover", borderRadius: isSmall ? 8 : 12, border: "2px solid #e2e8f0" }} />
            <button onClick={() => onChange(null)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ) : (
          <div onClick={() => ref.current?.click()} style={{ width: isSmall ? 40 : 80, height: isSmall ? 40 : 80, border: "2px dashed #e2e8f0", borderRadius: isSmall ? 8 : 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafc", gap: 4, transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#f97316"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <Icon d={Icons.image} size={isSmall ? 14 : 22} color="#94a3b8" />
            {!isSmall && <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>อัปโหลด</span>}
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        {!value && !isSmall && <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>JPG, PNG ไม่เกิน 2MB</span>}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: wide ? 720 : 560, boxShadow: "0 32px 80px rgba(15,23,42,0.2)", overflow: "hidden", animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "linear-gradient(135deg,#fff7ed,#fff)" }}>
          <span style={{ fontFamily: "'Sarabun',sans-serif", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", padding: 6, borderRadius: 8, display: "flex" }}><Icon d={Icons.close} size={16} /></button>
        </div>
        <div style={{ padding: "20px 28px 28px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── UI Components ──────────────────────────────────────
const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "'Sarabun',sans-serif", outline: "none", boxSizing: "border-box", color: "#0f172a", background: "#f8fafc", transition: "border 0.15s" };
function Input({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4, fontFamily: "'Sarabun',sans-serif" }}>{label}{hint && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>{hint}</span>}</label>}
      <input style={inputStyle} {...props} />
    </div>
  );
}
function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4, fontFamily: "'Sarabun',sans-serif" }}>{label}</label>}
      <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} {...props} />
    </div>
  );
}
function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4, fontFamily: "'Sarabun',sans-serif" }}>{label}</label>}
      <select style={{ ...inputStyle, appearance: "none" }} {...props}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}
function Btn({ children, variant = "primary", onClick, style = {}, icon, disabled }) {
  const variants = {
    primary: { background: "linear-gradient(135deg,#f97316,#ef4444)", color: "#fff", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" },
    secondary: { background: "#f1f5f9", color: "#475569" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    ghost: { background: "transparent", color: "#64748b" },
    success: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" },
    info: { background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" },
  };
  return <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", fontFamily: "'Sarabun',sans-serif", transition: "all 0.15s", opacity: disabled ? 0.5 : 1, ...variants[variant], ...style }} onClick={disabled ? undefined : onClick}>{icon && <Icon d={icon} size={15} />}{children}</button>;
}
function Badge({ children, color = "orange" }) {
  const colors = { orange: { bg: "#fff7ed", text: "#f97316" }, blue: { bg: "#f0f9ff", text: "#0ea5e9" }, green: { bg: "#dcfce7", text: "#16a34a" }, red: { bg: "#fee2e2", text: "#dc2626" }, yellow: { bg: "#fef9c3", text: "#a16207" }, gray: { bg: "#f1f5f9", text: "#475569" } };
  const c = colors[color] || colors.gray;
  return <span style={{ display: "inline-block", padding: "2px 10px", background: c.bg, color: c.text, borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Sarabun',sans-serif" }}>{children}</span>;
}
function SaveIndicator({ saved }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: saved ? "#22c55e" : "#f97316", transition: "color 0.3s" }}><Icon d={Icons.save} size={12} color={saved ? "#22c55e" : "#f97316"} />{saved ? "บันทึกแล้ว" : "กำลังบันทึก..."}</div>;
}
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return <div style={{ background: "#1e293b", color: "#f8fafc", padding: "8px 20px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "'Sarabun',sans-serif" }}><Icon d={Icons.wifi} size={14} color="#f8fafc" /><span>ออฟไลน์อยู่ — ข้อมูลบันทึกในเครื่องครับ</span></div>;
}

// ── Ingredient Tab ─────────────────────────────────────
function IngredientTab({ ingredients, setIngredients, categories, addHistory }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ทุกหมวด");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { name: "", category: categories[0], buyUnit: "กก.", buyAmount: 1, buyPrice: "", convertToGram: 1000, pricePerGram: 0, stock: "", image: null, note: "" };
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 18;

  const filtered = useMemo(() => ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === "ทุกหมวด" || i.category === filterCat)
  ), [ingredients, search, filterCat]);
  const paged = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  function handleFormChange(field, value) {
    setForm(f => {
      const updated = { ...f, [field]: value };
      if (field === "buyPrice" || field === "convertToGram") {
        updated.pricePerGram = calcPricePerGram(+updated.buyPrice || 0, +updated.convertToGram || 1);
      }
      return updated;
    });
  }

  function openAdd() { setForm(emptyForm); setEditItem(null); setShowAdd(true); }
  function openEdit(item) { setForm({ ...item }); setEditItem(item.id); setShowAdd(true); }
  function save() {
    if (!form.name || !form.buyPrice) return;
    const item = { ...form, buyPrice: +form.buyPrice, buyAmount: +form.buyAmount, convertToGram: +form.convertToGram, pricePerGram: calcPricePerGram(+form.buyPrice, +form.convertToGram), stock: +form.stock };
    if (editItem) { setIngredients(p => p.map(i => i.id === editItem ? { ...i, ...item } : i)); addHistory(`แก้ไขวัตถุดิบ: ${form.name}`); }
    else { setIngredients(p => [...p, { ...item, id: Date.now() }]); addHistory(`เพิ่มวัตถุดิบ: ${form.name}`); }
    setShowAdd(false);
  }
  function del(id, name) {
    if (!window.confirm(`ลบ "${name}"?`)) return;
    setIngredients(p => p.filter(i => i.id !== id)); addHistory(`ลบวัตถุดิบ: ${name}`);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icon d={Icons.search} size={16} /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="ค้นหาวัตถุดิบ..." style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
          <option>ทุกหมวด</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <Btn onClick={openAdd} icon={Icons.plus}>เพิ่มวัตถุดิบ</Btn>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontFamily: "'Sarabun',sans-serif" }}>แสดง {paged.length} จาก {filtered.length} รายการ</div>
      {paged.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><Icon d={Icons.warning} size={40} color="#cbd5e1" /><p style={{ marginTop: 12, fontFamily: "'Sarabun',sans-serif" }}>ไม่พบวัตถุดิบ</p></div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {paged.map(item => (
              <div key={item.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,23,42,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.07)"; }}>
                <div style={{ display: "flex", gap: 0 }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#fff7ed,#fef3c7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon d={Icons.ingredient} size={28} color="#f97316" />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", fontFamily: "'Sarabun',sans-serif" }}>{item.name}</div>
                        <Badge color="orange">{item.category}</Badge>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(item)} style={{ background: "#f0f9ff", border: "none", borderRadius: 7, padding: 5, cursor: "pointer", color: "#0ea5e9" }}><Icon d={Icons.edit} size={13} /></button>
                        <button onClick={() => del(item.id, item.name)} style={{ background: "#fff1f2", border: "none", borderRadius: 7, padding: 5, cursor: "pointer", color: "#f43f5e" }}><Icon d={Icons.trash} size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #f8fafc" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>ซื้อมา</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "'Sarabun',sans-serif" }}>฿{item.buyPrice}</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'Sarabun',sans-serif" }}>{item.buyAmount} {item.buyUnit}</div>
                    </div>
                    <div style={{ background: "#fff7ed", borderRadius: 8, padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>= กรัม</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f97316", fontFamily: "'Sarabun',sans-serif" }}>{item.convertToGram.toLocaleString()}g</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'Sarabun',sans-serif" }}>ทั้งหมด</div>
                    </div>
                    <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>ราคา/กรัม</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", fontFamily: "'Sarabun',sans-serif" }}>฿{item.pricePerGram.toFixed(3)}</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'Sarabun',sans-serif" }}>ต่อ 1g</div>
                    </div>
                  </div>
                  {item.note && <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", fontFamily: "'Sarabun',sans-serif", fontStyle: "italic" }}>📝 {item.note}</div>}
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>สต็อก</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.stock < 3 ? "#ef4444" : "#22c55e", fontFamily: "'Sarabun',sans-serif" }}>{item.stock} {item.buyUnit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {paged.length < filtered.length && <div style={{ textAlign: "center", marginTop: 20 }}><Btn variant="secondary" onClick={() => setPage(p => p + 1)}>โหลดเพิ่ม ({filtered.length - paged.length} รายการ)</Btn></div>}
        </>
      )}

      {showAdd && (
        <Modal title={editItem ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"} onClose={() => setShowAdd(false)}>
          <ImageUpload label="รูปวัตถุดิบ" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
          <Input label="ชื่อวัตถุดิบ" value={form.name} onChange={e => handleFormChange("name", e.target.value)} placeholder="เช่น ไก่หน้าอก" autoFocus />
          <Select label="หมวดหมู่" value={form.category} onChange={e => handleFormChange("category", e.target.value)} options={categories} />
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", fontFamily: "'Sarabun',sans-serif", marginBottom: 10 }}>💰 ข้อมูลการซื้อ</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="ซื้อมากี่หน่วย" type="number" value={form.buyAmount} onChange={e => handleFormChange("buyAmount", e.target.value)} placeholder="1" />
              <Input label="หน่วยที่ซื้อ" value={form.buyUnit} onChange={e => handleFormChange("buyUnit", e.target.value)} placeholder="กก., ขวด, แผง" />
            </div>
            <Input label="ราคาที่ซื้อมา (บาท)" type="number" value={form.buyPrice} onChange={e => handleFormChange("buyPrice", e.target.value)} placeholder="0" />
          </div>
          <div style={{ background: "#fff7ed", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f97316", fontFamily: "'Sarabun',sans-serif", marginBottom: 10 }}>⚖️ แปลงเป็นกรัม</div>
            <Input label="เท่ากับกี่กรัม" hint="(ทั้งหมดที่ซื้อ)" type="number" value={form.convertToGram} onChange={e => handleFormChange("convertToGram", e.target.value)} placeholder="1000" />
            <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>ราคาต่อกรัม (คำนวณอัตโนมัติ)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f97316", fontFamily: "'Sarabun',sans-serif" }}>
                ฿{form.buyPrice && form.convertToGram ? calcPricePerGram(+form.buyPrice, +form.convertToGram).toFixed(4) : "0.0000"}
                <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>ต่อกรัม</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="สต็อกปัจจุบัน" type="number" value={form.stock} onChange={e => handleFormChange("stock", e.target.value)} placeholder="0" />
          </div>
          <Textarea label="หมายเหตุ" value={form.note} onChange={e => handleFormChange("note", e.target.value)} placeholder="เช่น 1 ฟอง ≈ 60 กรัม" style={{ minHeight: 60 }} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>ยกเลิก</Btn>
            <Btn onClick={save} icon={Icons.check} disabled={!form.name || !form.buyPrice}>{editItem ? "บันทึก" : "เพิ่ม"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Menu Tab ───────────────────────────────────────────
function MenuTab({ menus, setMenus, ingredients, addHistory }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", category: "อาหารจานเดียว", price: "", description: "", image: null, ingredients: [], sop: [] });
  const [newIng, setNewIng] = useState({ ingredientId: "", amountGram: "" });

  const filtered = useMemo(() => menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase())), [menus, search]);

  function openAdd() { setForm({ name: "", category: "อาหารจานเดียว", price: "", description: "", image: null, ingredients: [], sop: [] }); setEditItem(null); setShowAdd(true); }
  function openEdit(item) { setForm({ ...item }); setEditItem(item.id); setShowAdd(true); }
  function addIngredient() {
    if (!newIng.ingredientId || !newIng.amountGram) return;
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { ingredientId: +newIng.ingredientId, amountGram: +newIng.amountGram }] }));
    setNewIng({ ingredientId: "", amountGram: "" });
  }
  function removeIng(idx) { setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) })); }
  function save() {
    if (!form.name || !form.price) return;
    if (editItem) { setMenus(p => p.map(m => m.id === editItem ? { ...m, ...form, price: +form.price } : m)); addHistory(`แก้ไขเมนู: ${form.name}`); }
    else { setMenus(p => [...p, { ...form, id: Date.now(), price: +form.price, sop: form.sop.length ? form.sop : [{ step: 1, title: "", desc: "", image: null }] }]); addHistory(`เพิ่มเมนู: ${form.name}`); }
    setShowAdd(false);
  }
  function del(id, name) {
    if (!window.confirm(`ลบเมนู "${name}"?`)) return;
    setMenus(p => p.filter(m => m.id !== id)); addHistory(`ลบเมนู: ${name}`);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icon d={Icons.search} size={16} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเมนู..." style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <Btn onClick={openAdd} icon={Icons.plus}>เพิ่มเมนู</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {filtered.map(menu => {
          const cost = calcMenuCost(menu, ingredients);
          const profit = menu.price - cost;
          const margin = menu.price > 0 ? (profit / menu.price * 100) : 0;
          const marginColor = margin >= 60 ? "#22c55e" : margin >= 40 ? "#f59e0b" : "#ef4444";
          return (
            <div key={menu.id} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.07)"; }}>
              <div style={{ height: 5, background: `linear-gradient(90deg,${marginColor},${marginColor}88)` }} />
              {menu.image ? (
                <img src={menu.image} alt={menu.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 80, background: "linear-gradient(135deg,#fff7ed,#fef3c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={Icons.food} size={36} color="#f97316" />
                </div>
              )}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", fontFamily: "'Sarabun',sans-serif" }}>{menu.name}</div>
                    <Badge color="blue">{menu.category}</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(menu)} style={{ background: "#f0f9ff", border: "none", borderRadius: 7, padding: 5, cursor: "pointer", color: "#0ea5e9" }}><Icon d={Icons.edit} size={13} /></button>
                    <button onClick={() => del(menu.id, menu.name)} style={{ background: "#fff1f2", border: "none", borderRadius: 7, padding: 5, cursor: "pointer", color: "#f43f5e" }}><Icon d={Icons.trash} size={13} /></button>
                  </div>
                </div>
                {menu.description && <p style={{ fontSize: 12, color: "#64748b", fontFamily: "'Sarabun',sans-serif", marginBottom: 10 }}>{menu.description}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "ราคาขาย", value: `฿${menu.price}`, color: "#0f172a" },
                    { label: "ต้นทุน", value: `฿${cost.toFixed(2)}`, color: "#f97316" },
                    { label: "กำไร %", value: `${margin.toFixed(0)}%`, color: marginColor },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sarabun',sans-serif" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>
                  <span>{menu.ingredients.length} วัตถุดิบ</span>
                  <span>{menu.sop?.length || 0} ขั้นตอน SOP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title={editItem ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"} onClose={() => setShowAdd(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <ImageUpload label="รูปเมนู" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
              <Input label="ชื่อเมนู" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="เช่น ข้าวผัดไก่" autoFocus />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="หมวดหมู่" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="อาหารจานเดียว" />
                <Input label="ราคาขาย (฿)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
              </div>
              <Textarea label="รายละเอียดเมนู" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="อธิบายเมนูสั้นๆ" style={{ minHeight: 60 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", fontFamily: "'Sarabun',sans-serif", marginBottom: 8 }}>วัตถุดิบ (คำนวณจากกรัม)</div>
              {form.ingredients.map((mi, idx) => {
                const ing = ingredients.find(i => i.id === mi.ingredientId);
                const cost = ing ? (ing.pricePerGram * mi.amountGram) : 0;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                    <span style={{ flex: 1, fontSize: 13, fontFamily: "'Sarabun',sans-serif" }}>{ing?.name ?? "?"}</span>
                    <span style={{ fontSize: 12, color: "#f97316", fontWeight: 600 }}>{mi.amountGram}g</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>= ฿{cost.toFixed(2)}</span>
                    <button onClick={() => removeIng(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f43f5e" }}><Icon d={Icons.close} size={13} /></button>
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginBottom: 8 }}>
                <div style={{ flex: 2 }}>
                  <select value={newIng.ingredientId} onChange={e => setNewIng({ ...newIng, ingredientId: e.target.value })} style={{ ...inputStyle, fontSize: 13 }}>
                    <option value="">-- เลือกวัตถุดิบ --</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (฿{i.pricePerGram.toFixed(3)}/g)</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" value={newIng.amountGram} onChange={e => setNewIng({ ...newIng, amountGram: e.target.value })} placeholder="กรัม" style={{ ...inputStyle, fontSize: 13 }} />
                </div>
                <Btn variant="secondary" onClick={addIngredient} icon={Icons.plus} style={{ padding: "9px 12px", marginBottom: 14 }}>เพิ่ม</Btn>
              </div>
              {form.ingredients.length > 0 && (
                <div style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>ต้นทุนรวม</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316", fontFamily: "'Sarabun',sans-serif" }}>
                    ฿{form.ingredients.reduce((s, mi) => { const ing = ingredients.find(i => i.id === mi.ingredientId); return s + (ing ? ing.pricePerGram * mi.amountGram : 0); }, 0).toFixed(2)}
                  </div>
                  {form.price > 0 && <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'Sarabun',sans-serif" }}>
                    กำไร: {(((form.price - form.ingredients.reduce((s, mi) => { const ing = ingredients.find(i => i.id === mi.ingredientId); return s + (ing ? ing.pricePerGram * mi.amountGram : 0); }, 0)) / form.price) * 100).toFixed(1)}%
                  </div>}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>ยกเลิก</Btn>
            <Btn onClick={save} icon={Icons.check} disabled={!form.name || !form.price}>{editItem ? "บันทึก" : "เพิ่มเมนู"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── SOP Tab ────────────────────────────────────────────
function SOPTab({ menus, setMenus, ingredients }) {
  const [selected, setSelected] = useState(menus[0]?.id ?? null);
  const [editMode, setEditMode] = useState(false);
  const menu = useMemo(() => menus.find(m => m.id === selected), [menus, selected]);
  const [sopForm, setSopForm] = useState([]);

  useEffect(() => {
    if (menu) setSopForm(menu.sop ? [...menu.sop] : []);
    setEditMode(false);
  }, [selected, menu]);

  function addStep() {
    setSopForm(f => [...f, { step: f.length + 1, title: "", desc: "", image: null }]);
  }
  function removeStep(idx) { setSopForm(f => f.filter((_, i) => i !== idx)); }
  function updateStep(idx, field, value) { setSopForm(f => f.map((s, i) => i === idx ? { ...s, [field]: value } : s)); }
  function saveSop() {
    setMenus(p => p.map(m => m.id === selected ? { ...m, sop: sopForm } : m));
    setEditMode(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, minHeight: 500 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 2px 12px rgba(15,23,42,0.07)", overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "4px 8px 8px", fontFamily: "'Sarabun',sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>เมนูทั้งหมด</div>
        {menus.map(m => {
          const cost = calcMenuCost(m, ingredients);
          const margin = m.price > 0 ? ((m.price - cost) / m.price * 100) : 0;
          return (
            <div key={m.id} onClick={() => setSelected(m.id)} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: selected === m.id ? "#fff7ed" : "transparent", transition: "all 0.1s", border: selected === m.id ? "1px solid #fed7aa" : "1px solid transparent" }}>
              <div style={{ fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: selected === m.id ? 700 : 500, color: selected === m.id ? "#f97316" : "#475569" }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>กำไร {margin.toFixed(0)}% · {m.sop?.length || 0} ขั้นตอน</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        {menu ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {menu.image && <img src={menu.image} alt={menu.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 12 }} />}
                <div>
                  <h2 style={{ fontFamily: "'Sarabun',sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{menu.name}</h2>
                  <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'Sarabun',sans-serif" }}>
                    ราคาขาย ฿{menu.price} · ต้นทุน ฿{calcMenuCost(menu, ingredients).toFixed(2)} · กำไร {menu.price > 0 ? (((menu.price - calcMenuCost(menu, ingredients)) / menu.price) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {editMode ? (
                  <>
                    <Btn variant="secondary" onClick={() => setEditMode(false)} style={{ padding: "7px 14px", fontSize: 13 }}>ยกเลิก</Btn>
                    <Btn variant="success" onClick={saveSop} icon={Icons.check} style={{ padding: "7px 14px", fontSize: 13 }}>บันทึก SOP</Btn>
                  </>
                ) : (
                  <Btn variant="info" onClick={() => setEditMode(true)} icon={Icons.edit} style={{ padding: "7px 14px", fontSize: 13 }}>แก้ไข SOP</Btn>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", fontFamily: "'Sarabun',sans-serif", marginBottom: 8 }}>วัตถุดิบในเมนู</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {menu.ingredients.map((mi, idx) => {
                  const ing = ingredients.find(i => i.id === mi.ingredientId);
                  return ing ? (
                    <div key={idx} style={{ background: "#f8fafc", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "'Sarabun',sans-serif", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{ing.name}</span>
                      <span style={{ color: "#f97316", marginLeft: 6 }}>{mi.amountGram}g</span>
                      <span style={{ color: "#64748b", marginLeft: 4 }}>= ฿{(ing.pricePerGram * mi.amountGram).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", fontFamily: "'Sarabun',sans-serif", marginBottom: 12 }}>ขั้นตอนการทำ (SOP)</div>

            {editMode ? (
              <div>
                {sopForm.map((step, idx) => (
                  <div key={idx} style={{ background: "#f8fafc", borderRadius: 14, padding: "16px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{idx + 1}</div>
                      <button onClick={() => removeStep(idx)} style={{ background: "#fee2e2", border: "none", borderRadius: 7, padding: "4px 8px", cursor: "pointer", color: "#dc2626", fontSize: 12, fontFamily: "'Sarabun',sans-serif" }}>ลบขั้นตอน</button>
                    </div>
                    <Input label="ชื่อขั้นตอน" value={step.title} onChange={e => updateStep(idx, "title", e.target.value)} placeholder="เช่น เตรียมวัตถุดิบ" />
                    <Textarea label="รายละเอียด" value={step.desc} onChange={e => updateStep(idx, "desc", e.target.value)} placeholder="อธิบายวิธีทำในขั้นตอนนี้..." style={{ minHeight: 70 }} />
                    <ImageUpload label="รูปประกอบขั้นตอน" value={step.image} onChange={v => updateStep(idx, "image", v)} />
                  </div>
                ))}
                <Btn variant="secondary" onClick={addStep} icon={Icons.plus} style={{ width: "100%", justifyContent: "center" }}>เพิ่มขั้นตอน</Btn>
              </div>
            ) : (
              <div>
                {(!menu.sop || menu.sop.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    <Icon d={Icons.sop} size={40} color="#cbd5e1" />
                    <p style={{ marginTop: 12, fontFamily: "'Sarabun',sans-serif" }}>ยังไม่มี SOP กด "แก้ไข SOP" เพื่อเพิ่มครับ</p>
                  </div>
                ) : menu.sop.map((step, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>{idx + 1}</div>
                      {idx < menu.sop.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "linear-gradient(to bottom,#f97316,#f9731622)", marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", fontFamily: "'Sarabun',sans-serif", marginBottom: 4 }}>{step.title || `ขั้นตอนที่ ${idx + 1}`}</div>
                      {step.desc && <p style={{ fontSize: 14, color: "#475569", fontFamily: "'Sarabun',sans-serif", lineHeight: 1.7, marginBottom: step.image ? 10 : 0 }}>{step.desc}</p>}
                      {step.image && <img src={step.image} alt={step.title} style={{ maxWidth: 320, borderRadius: 12, border: "1px solid #e2e8f0", marginTop: 8 }} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <Icon d={Icons.sop} size={48} color="#cbd5e1" />
            <p style={{ marginTop: 16, fontFamily: "'Sarabun',sans-serif" }}>เลือกเมนูเพื่อดู SOP</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary Tab ────────────────────────────────────────
function SummaryTab({ menus, ingredients }) {
  const items = useMemo(() => menus.map(m => {
    const cost = calcMenuCost(m, ingredients);
    const profit = m.price - cost;
    const margin = m.price > 0 ? profit / m.price * 100 : 0;
    return { ...m, cost, profit, margin };
  }), [menus, ingredients]);
  const stats = useMemo(() => ({
    avg: items.length ? items.reduce((s, i) => s + i.margin, 0) / items.length : 0,
    total: items.length,
    good: items.filter(i => i.margin >= 60).length,
    totalProfit: items.reduce((s, i) => s + i.profit, 0),
  }), [items]);
  const [sortBy, setSortBy] = useState("margin");
  const sorted = useMemo(() => [...items].sort((a, b) => b[sortBy] - a[sortBy]), [items, sortBy]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "เมนูทั้งหมด", value: stats.total, unit: "เมนู", color: "#6366f1", icon: Icons.menu },
          { label: "กำไรเฉลี่ย", value: stats.avg.toFixed(1), unit: "%", color: "#f97316", icon: Icons.chart },
          { label: "เมนูกำไรดี (≥60%)", value: stats.good, unit: "เมนู", color: "#22c55e", icon: Icons.check },
          { label: "กำไรรวม", value: `฿${stats.totalProfit.toFixed(0)}`, unit: "", color: "#0ea5e9", icon: Icons.calculator },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={card.icon} size={20} color={card.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color, fontFamily: "'Sarabun',sans-serif", lineHeight: 1.2 }}>{card.value}<span style={{ fontSize: 12, fontWeight: 600, marginLeft: 2 }}>{card.unit}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Sarabun',sans-serif", color: "#0f172a" }}>ตารางต้นทุนทุกเมนู</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: "auto", fontSize: 12, padding: "5px 10px" }}>
            <option value="margin">เรียง % กำไร</option>
            <option value="profit">เรียงกำไร</option>
            <option value="price">เรียงราคาขาย</option>
            <option value="cost">เรียงต้นทุน</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Sarabun',sans-serif" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["เมนู", "หมวด", "ราคาขาย", "ต้นทุน", "กำไร (฿)", "% กำไร", "สถานะ"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, idx) => (
                <tr key={item.id} style={{ borderTop: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{item.category}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>฿{item.price}</td>
                  <td style={{ padding: "12px 16px", color: "#f97316", fontWeight: 600 }}>฿{item.cost.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px", color: item.profit >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>฿{item.profit.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${Math.min(Math.max(item.margin, 0), 100)}%`, background: item.margin >= 60 ? "#22c55e" : item.margin >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", minWidth: 36 }}>{item.margin.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge color={item.margin >= 60 ? "green" : item.margin >= 40 ? "yellow" : "red"}>{item.margin >= 60 ? "ดี" : item.margin >= 40 ? "พอใช้" : "ต่ำ"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────
function HistoryTab({ history, onClear }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        {history.length > 0 && <Btn variant="danger" onClick={() => { if (window.confirm("ลบประวัติทั้งหมด?")) onClear(); }} icon={Icons.trash} style={{ fontSize: 12, padding: "6px 12px" }}>ลบประวัติ</Btn>}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>
            <Icon d={Icons.history} size={40} color="#cbd5e1" />
            <p style={{ marginTop: 12 }}>ยังไม่มีประวัติ</p>
          </div>
        ) : history.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={Icons.check} size={16} color="#f97316" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", fontFamily: "'Sarabun',sans-serif" }}>{item.action}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Sarabun',sans-serif" }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export/Import ──────────────────────────────────────
function ExportImportBar({ ingredients, menus, categories, onImport }) {
  const fileRef = useRef();
  function exportData() {
    const data = { ingredients, menus, categories, exportedAt: new Date().toISOString(), version: "2.0" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `foodcost-backup-${new Date().toLocaleDateString("th-TH").replace(/\//g, "-")}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  function handleImport(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { try { const data = JSON.parse(ev.target.result); if (data.ingredients && data.menus) { onImport(data); alert("นำเข้าข้อมูลสำเร็จ!"); } else alert("ไฟล์ไม่ถูกต้อง"); } catch { alert("อ่านไฟล์ไม่ได้"); } };
    reader.readAsText(file); e.target.value = "";
  }
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <Btn variant="secondary" onClick={exportData} icon={Icons.download} style={{ padding: "5px 10px", fontSize: 12 }}>Export</Btn>
      <Btn variant="secondary" onClick={() => fileRef.current?.click()} icon={Icons.upload} style={{ padding: "5px 10px", fontSize: 12 }}>Import</Btn>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
    </div>
  );
}

// ── Main App ───────────────────────────────────────────
export default function FoodCostApp() {
  const [activeTab, setActiveTab] = useState("ingredients");
  const [ingredients, setIngredients] = useLocalStorage("fc2_ingredients", INIT_INGREDIENTS);
  const [menus, setMenus] = useLocalStorage("fc2_menus", INIT_MENUS);
  const [categories] = useLocalStorage("fc2_categories", INIT_CATEGORIES);
  const [history, setHistory] = useLocalStorage("fc2_history", []);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    setSaved(false); clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), 600);
    return () => clearTimeout(saveTimer.current);
  }, [ingredients, menus]);

  const addHistory = useCallback((action) => {
    setHistory(p => [{ action, time: new Date().toLocaleString("th-TH") }, ...p.slice(0, 99)]);
  }, [setHistory]);

  const handleImport = useCallback((data) => {
    setIngredients(data.ingredients); setMenus(data.menus); addHistory("นำเข้าข้อมูล backup");
  }, [setIngredients, setMenus, addHistory]);

  const tabs = [
    { id: "ingredients", label: "วัตถุดิบ", icon: Icons.ingredient },
    { id: "menus", label: "เมนู", icon: Icons.food },
    { id: "sop", label: "SOP", icon: Icons.sop },
    { id: "summary", label: "สรุปต้นทุน", icon: Icons.chart },
    { id: "history", label: "ประวัติ", icon: Icons.history },
  ];

  const descriptions = {
    ingredients: "จัดการวัตถุดิบ ราคาต่อกรัม และสต็อก",
    menus: "กำหนดส่วนผสม คำนวณต้นทุนและกำไรแต่ละเมนู",
    sop: "ขั้นตอนมาตรฐานการทำอาหาร พร้อมรูปภาพ",
    summary: "ภาพรวมต้นทุนและกำไรทุกเมนู",
    history: "บันทึกการเปลี่ยนแปลงข้อมูลทั้งหมด",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f1f5f9; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
      `}</style>
      <OfflineBanner />
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fef3ec 0%,#f1f5f9 50%)", fontFamily: "'Sarabun',sans-serif" }}>
        <nav style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #f1f5f9", padding: "0 24px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100, height: 60, boxShadow: "0 1px 20px rgba(15,23,42,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 28 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#f97316,#ef4444)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
              <Icon d={Icons.food} size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, background: "linear-gradient(135deg,#f97316,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>FoodCost</div>
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, letterSpacing: 1 }}>MANAGEMENT</div>
            </div>
          </div>
          <div style={{ display: "flex", flex: 1, overflowX: "auto" }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", height: 60, border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? "#f97316" : "#64748b", fontFamily: "'Sarabun',sans-serif", borderBottom: activeTab === tab.id ? "2.5px solid #f97316" : "2.5px solid transparent", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                <Icon d={tab.icon} size={15} color={activeTab === tab.id ? "#f97316" : "#94a3b8"} />{tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <SaveIndicator saved={saved} />
            <ExportImportBar ingredients={ingredients} menus={menus} categories={categories} onImport={handleImport} />
            <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{ingredients.length} วัตถุดิบ · {menus.length} เมนู</span>
          </div>
        </nav>
        <div style={{ padding: "24px 28px 0" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{tabs.find(t => t.id === activeTab)?.label}</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{descriptions[activeTab]}</p>
        </div>
        <div style={{ padding: "0 28px 48px" }}>
          {activeTab === "ingredients" && <IngredientTab ingredients={ingredients} setIngredients={setIngredients} categories={categories} addHistory={addHistory} />}
          {activeTab === "menus" && <MenuTab menus={menus} setMenus={setMenus} ingredients={ingredients} addHistory={addHistory} />}
          {activeTab === "sop" && <SOPTab menus={menus} setMenus={setMenus} ingredients={ingredients} />}
          {activeTab === "summary" && <SummaryTab menus={menus} ingredients={ingredients} />}
          {activeTab === "history" && <HistoryTab history={history} onClear={() => setHistory([])} />}
        </div>
      </div>
    </>
  );
}
