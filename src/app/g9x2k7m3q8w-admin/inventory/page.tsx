"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsageEntry {
  id: string;
  itemId: string;
  quantityUsed: number;
  notes: string | null;
  usedAt: string;
}

const CATEGORIES = ["general", "medicine", "supplies", "equipment", "consumables"];

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: "", category: "general", quantity: "", unit: "pcs", minQuantity: "0", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [usingItem, setUsingItem] = useState<InventoryItem | null>(null);
  const [useForm, setUseForm] = useState({ quantityUsed: "", notes: "" });
  const [savingUse, setSavingUse] = useState(false);

  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<UsageEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/inventory${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items);
    } catch {
      router.push("/g9x2k7m3q8w-admin");
    } finally {
      setLoading(false);
    }
  }, [search, router]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", category: "general", quantity: "", unit: "pcs", minQuantity: "0", notes: "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minQuantity: String(item.minQuantity),
      notes: item.notes || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = editing ? `/api/admin/inventory/${editing.id}` : "/api/admin/inventory";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
        return;
      }
      setShowForm(false);
      fetchItems();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: InventoryItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/inventory/${item.id}`, { method: "DELETE" });
      fetchItems();
    } catch { /* ignore */ }
  }

  async function openHistory(item: InventoryItem) {
    setHistoryItem(item);
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}/use`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHistory(data.usage);
    } catch { /* ignore */ }
    finally {
      setHistoryLoading(false);
    }
  }

  async function handleUse(e: React.FormEvent) {
    e.preventDefault();
    if (!usingItem) return;
    setError("");
    setSavingUse(true);
    try {
      const res = await fetch(`/api/admin/inventory/${usingItem.id}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useForm),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to record usage");
        return;
      }
      setUsingItem(null);
      setUseForm({ quantityUsed: "", notes: "" });
      fetchItems();
    } catch {
      setError("Network error");
    } finally {
      setSavingUse(false);
    }
  }

  function formatDate(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function lowStock(item: InventoryItem) {
    return item.minQuantity > 0 && item.quantity <= item.minQuantity;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">Inventory</h1>
            <button
              onClick={openAdd}
              className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Item
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full md:w-80 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <p className="text-sm text-on-surface-variant">Total Items</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{items.length}</p>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <p className="text-sm text-on-surface-variant">Total Stock</p>
              <p className="text-2xl font-bold text-on-surface mt-1">
                {items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <p className="text-sm text-on-surface-variant">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{items.filter(lowStock).length}</p>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <p className="text-sm text-on-surface-variant">Categories</p>
              <p className="text-2xl font-bold text-primary mt-1">{new Set(items.map((i) => i.category)).size}</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-x-auto">
            {items.length === 0 ? (
              <p className="text-on-surface-variant text-sm p-6">No inventory items yet. Click &quot;Add Item&quot; to get started.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-left">
                    <th className="py-3 px-4 text-on-surface-variant font-medium">Item</th>
                    <th className="py-3 px-4 text-on-surface-variant font-medium">Category</th>
                    <th className="py-3 px-4 text-on-surface-variant font-medium">Quantity</th>
                    <th className="py-3 px-4 text-on-surface-variant font-medium">Status</th>
                    <th className="py-3 px-4 text-on-surface-variant font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low">
                      <td className="py-3 px-4">
                        <p className="font-medium text-on-surface">{item.name}</p>
                        <p className="text-xs text-on-surface-variant">{item.notes || item.category}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">{item.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${lowStock(item) ? "text-error" : "text-on-surface"}`}>
                          {item.quantity.toLocaleString()} {item.unit}
                        </span>
                        {item.minQuantity > 0 && (
                          <span className="text-xs text-on-surface-variant block">min {item.minQuantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {lowStock(item) ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-error/10 text-error">Low Stock</span>
                        ) : item.quantity === 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-on-surface-variant/10 text-on-surface-variant">Out of Stock</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-secondary/10 text-secondary">In Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => { setUsingItem(item); setError(""); setUseForm({ quantityUsed: "", notes: "" }); }}
                          disabled={item.quantity <= 0}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">remove</span>
                          Use
                        </button>
                        <button
                          onClick={() => openHistory(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 ml-2 rounded-lg text-xs font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">history</span>
                          History
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 ml-2 rounded-lg text-xs font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 ml-2 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <Modal title={editing ? "Edit Item" : "Add Item"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={inputClass}
                placeholder="e.g. Glucometer strips"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Unit</Label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={inputClass}
                  placeholder="pcs, ml, mg, box"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  min={0}
                  className={inputClass}
                />
              </div>
              <div>
                <Label>Min Quantity (low stock alert)</Label>
                <input
                  type="number"
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className={inputClass}
              />
            </div>
            {error && <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-outline-variant/20 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {usingItem && (
        <Modal title={`Use "${usingItem.name}"`} onClose={() => setUsingItem(null)}>
          <p className="text-sm text-on-surface-variant mb-4">
            Available: <strong>{usingItem.quantity.toLocaleString()} {usingItem.unit}</strong>
          </p>
          <form onSubmit={handleUse} className="space-y-4">
            <div>
              <Label>Quantity Used</Label>
              <input
                type="number"
                value={useForm.quantityUsed}
                onChange={(e) => setUseForm({ ...useForm, quantityUsed: e.target.value })}
                required
                min={0}
                step="any"
                className={inputClass}
                placeholder={`In ${usingItem.unit}`}
              />
            </div>
            <div>
              <Label>Notes (where / why it was used)</Label>
              <textarea
                value={useForm.notes}
                onChange={(e) => setUseForm({ ...useForm, notes: e.target.value })}
                rows={3}
                className={inputClass}
                placeholder="e.g. Used for patient X - blood sugar testing"
              />
            </div>
            {error && <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingUse}
                className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {savingUse ? "Recording..." : "Record Usage"}
              </button>
              <button
                type="button"
                onClick={() => setUsingItem(null)}
                className="px-6 py-3 border border-outline-variant/20 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {historyItem && (
        <Modal title={`Usage History - ${historyItem.name}`} onClose={() => setHistoryItem(null)}>
          <p className="text-sm text-on-surface-variant mb-4">
            Current stock: <strong>{historyItem.quantity.toLocaleString()} {historyItem.unit}</strong>
          </p>
          {historyLoading ? (
            <p className="text-sm text-on-surface-variant">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No usage recorded for this item yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-left">
                    <th className="py-2 px-2 text-on-surface-variant font-medium">Date</th>
                    <th className="py-2 px-2 text-on-surface-variant font-medium text-right">Qty Used</th>
                    <th className="py-2 px-2 text-on-surface-variant font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-outline-variant/5">
                      <td className="py-2 px-2 text-on-surface whitespace-nowrap">{formatDate(h.usedAt)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-error">-{h.quantityUsed.toLocaleString()}</td>
                      <td className="py-2 px-2 text-on-surface-variant">{h.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-lg font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
