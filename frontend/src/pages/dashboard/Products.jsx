
import React, { useEffect, useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Tag,
  Image as ImageIcon,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { formatPrice } from "../../lib/utils";
import api from "../../lib/api";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal, // <--- 1. Make sure this is imported
} from "@/components/ui/dropdown-menu";
// ══════════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD PANEL
// ══════════════════════════════════════════════════════════════════════════════
const ImageUploadPanel = ({ product, onClose }) => {
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const res = await api.get(`/products/${product.id}/images`);
      setImages(res.data);
    } catch {
      toast.error("Failed to load images");
    }
  };

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) {
      toast.error("Please select image files only");
      return;
    }
    setUploading(true);
    setProgress(arr.map((f) => ({ name: f.name, status: "pending" })));
    for (let i = 0; i < arr.length; i++) {
      setProgress((p) =>
        p.map((x, idx) => (idx === i ? { ...x, status: "uploading" } : x)),
      );
      const form = new FormData();
      form.append("file", arr[i]);
      form.append("alt", arr[i].name.replace(/\.[^/.]+$/, ""));
      form.append("sort_order", String(images.length + i));
      try {
        await api.post(`/products/${product.id}/images/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProgress((p) =>
          p.map((x, idx) => (idx === i ? { ...x, status: "done" } : x)),
        );
      } catch (e) {
        setProgress((p) =>
          p.map((x, idx) => (idx === i ? { ...x, status: "error" } : x)),
        );
        toast.error(
          `${arr[i].name}: ${e.response?.data?.detail || "upload failed"}`,
        );
      }
    }
    setUploading(false);
    await loadImages();
    setProgress([]);
    toast.success(`Done! ${arr.length} image(s) processed.`);
  };

  const handleDelete = async (imageId) => {
    try {
      await api.delete(`/products/${product.id}/images/${imageId}`);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Image removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const statusIcon = {
    pending: "⏳",
    uploading: "⬆️",
    done: "✅",
    error: "❌",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-[#F2F0EB]">
        <ImageIcon className="w-4 h-4 text-[#C5A059]" />
        <p className="text-sm text-gray-600">
          Images for <strong className="text-[#2C2C2C]">{product.title}</strong>
        </p>
        {images.length > 0 && (
          <span className="ml-auto bg-[#C5A059]/10 text-[#C5A059] text-xs px-2 py-0.5 rounded-full font-semibold">
            {images.length} photo{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragOver
            ? "border-[#C5A059] bg-[#FDF8F0] scale-[1.01]"
            : "border-gray-200 hover:border-[#C5A059]/60"
        }`}
      >
        <Upload
          className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[#C5A059]" : "text-gray-300"}`}
        />
        <p className="text-sm font-semibold text-[#2C2C2C] mb-1">
          {dragOver ? "Drop to upload!" : "Drag & drop multiple images here"}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          JPEG · PNG · WebP · GIF · Max 10 MB each
        </p>
        <label className="inline-block cursor-pointer">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase font-bold transition-all rounded-none ${
              uploading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#2C2C2C] text-white hover:bg-[#C5A059]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Browse Files"}
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {progress.length > 0 && (
        <div className="bg-[#F9F8F5] rounded-lg p-3 space-y-1.5">
          {progress.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{statusIcon[p.status]}</span>
              <span className="flex-1 truncate text-gray-700 text-xs">
                {p.name}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
      {images.length > 0 ? (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            All Images — first is the cover
          </p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative group aspect-square bg-[#F2F0EB] rounded-lg overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C5A059] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Cover
                  </span>
                )}
              </div>
            ))}
            <label className="aspect-square bg-[#F9F8F5] rounded-lg border-2 border-dashed border-gray-200 hover:border-[#C5A059] flex items-center justify-center cursor-pointer transition-colors group">
              <div className="text-center">
                <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#C5A059] mx-auto transition-colors" />
                <p className="text-[10px] text-gray-400 mt-1">Add more</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-[#F9F8F5] rounded-xl">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No images yet — upload above</p>
        </div>
      )}
      <div className="flex justify-end pt-3 border-t border-[#F2F0EB]">
        <Button variant="outline" onClick={onClose} className="text-sm px-6">
          Done
        </Button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DISCOUNT PANEL
// ══════════════════════════════════════════════════════════════════════════════
const DiscountPanel = ({ product, onClose }) => {
  const [discounts, setDiscounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "percentage",
    value: "",
    starts_at: "",
    ends_at: "",
    active: true,
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const res = await api.get(`/products/${product.id}/discounts`);
      setDiscounts(res.data);
    } catch {
      toast.error("Failed to load discounts");
    }
  };

  const preview = () => {
    const v = parseFloat(form.value);
    if (!v || isNaN(v) || v <= 0) return null;
    return form.type === "percentage"
      ? product.base_price * (1 - v / 100)
      : Math.max(0, product.base_price - v);
  };

  const handleSave = async () => {
    const v = parseFloat(form.value);
    if (!v || v <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }
    if (form.type === "percentage" && v > 100) {
      toast.error("Can't exceed 100%");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/discounts`, {
        type: form.type,
        value: v,
        active: form.active,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      });
      toast.success("Discount saved!");
      setForm({
        type: "percentage",
        value: "",
        starts_at: "",
        ends_at: "",
        active: true,
      });
      loadDiscounts();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const previewPrice = preview();
  const activeDiscount = discounts.find((d) => d.active);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between pb-3 border-b border-[#F2F0EB]">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Product
          </p>
          <p className="font-heading font-semibold text-[#2C2C2C]">
            {product.title}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Base Price</p>
          <p className="font-bold text-lg">{formatPrice(product.base_price)}</p>
        </div>
      </div>
      {activeDiscount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
              Active Discount
            </p>
            <p className="text-sm text-green-800 mt-0.5">
              {activeDiscount.type === "percentage"
                ? `${activeDiscount.value}% off`
                : `₹${activeDiscount.value} off`}
              {" → "}
              <strong>
                {formatPrice(
                  activeDiscount.type === "percentage"
                    ? product.base_price * (1 - activeDiscount.value / 100)
                    : Math.max(0, product.base_price - activeDiscount.value),
                )}
              </strong>
            </p>
          </div>
          <Tag className="w-5 h-5 text-green-500" />
        </div>
      )}
      <div className="bg-[#F9F8F5] rounded-xl p-4 space-y-4">
        <p className="text-xs font-bold text-[#2C2C2C] uppercase tracking-widest">
          New Discount
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Type</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:border-[#C5A059] outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              {form.type === "percentage" ? "%" : "₹"} Value
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 500"}
              className="bg-white focus:border-[#C5A059] text-sm"
            />
          </div>
        </div>
        {previewPrice !== null && (
          <div className="flex items-center gap-3 bg-white border border-[#C5A059]/30 rounded-lg px-4 py-3">
            <span className="text-lg font-bold text-[#C5A059]">
              {formatPrice(previewPrice)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.base_price)}
            </span>
            <span className="ml-auto text-xs text-green-600 font-semibold">
              Save{" "}
              {form.type === "percentage"
                ? `${parseFloat(form.value)}%`
                : formatPrice(product.base_price - previewPrice)}
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Start (optional)
            </Label>
            <Input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="bg-white text-xs focus:border-[#C5A059]"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              End (optional)
            </Label>
            <Input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="bg-white text-xs focus:border-[#C5A059]"
            />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-[#C5A059] w-4 h-4"
          />
          <span className="text-sm text-gray-700">Activate immediately</span>
        </label>
        <Button
          onClick={handleSave}
          disabled={saving || !form.value}
          className="w-full bg-[#2C2C2C] text-white hover:bg-[#C5A059] transition-colors rounded-none uppercase text-xs tracking-widest font-bold py-3"
        >
          <Tag className="w-3.5 h-3.5 mr-2" />
          {saving ? "Saving…" : "Save Discount"}
        </Button>
      </div>
      {discounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            All Discounts
          </p>
          {discounts.map((d) => (
            <div
              key={d.id}
              className={`flex items-center justify-between px-3.5 py-3 rounded-lg border text-sm ${
                d.active
                  ? "border-green-200 bg-green-50"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag
                  className={`w-3.5 h-3.5 ${d.active ? "text-green-500" : "text-gray-400"}`}
                />
                <span className="font-medium">
                  {d.type === "percentage"
                    ? `${d.value}% off`
                    : `₹${d.value} off`}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    d.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {d.active ? "Active" : "Off"}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await api.put(`/products/${product.id}/discounts/${d.id}`, {
                      active: !d.active,
                    });
                    loadDiscounts();
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {d.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={async () => {
                    await api.delete(
                      `/products/${product.id}/discounts/${d.id}`,
                    );
                    loadDiscounts();
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end pt-3 border-t border-[#F2F0EB]">
        <Button variant="outline" onClick={onClose} className="text-sm px-6">
          Done
        </Button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD / EDIT PRODUCT FORM — full-featured slide-in panel
// ══════════════════════════════════════════════════════════════════════════════
const ProductForm = ({ open, onClose, editing, categories, onSaved }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    base_price: "",
    sku: "",
    category_id: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  // Populate form when editing changes
  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description || "",
        base_price: String(editing.base_price),
        sku: editing.sku,
        category_id: editing.category_id || "",
        active: editing.active,
      });
    } else {
      setForm({
        title: "",
        description: "",
        base_price: "",
        sku: "",
        category_id: "",
        active: true,
      });
    }
    // Focus title after open
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (
      !form.base_price ||
      isNaN(parseFloat(form.base_price)) ||
      parseFloat(form.base_price) < 0
    ) {
      toast.error("Enter a valid price");
      return;
    }
    if (!form.sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      base_price: parseFloat(form.base_price),
      sku: form.sku.trim(),
      active: form.active,
      ...(form.category_id ? { category_id: form.category_id } : {}),
    };

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created! Add images using the 🖼 button.");
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div className="relative ml-auto w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#F2F0EB] bg-[#F9F8F5] shrink-0">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[#2C2C2C]">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editing
                ? `Editing: ${editing.title}`
                : "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-7 py-6 space-y-6">
            {/* Visibility toggle — prominent at top */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                form.active
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
              onClick={() => setForm({ ...form, active: !form.active })}
            >
              <div className="flex items-center gap-3">
                {form.active ? (
                  <Eye className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p
                    className={`font-semibold text-sm ${form.active ? "text-green-700" : "text-gray-500"}`}
                  >
                    {form.active ? "Visible on store" : "Hidden from store"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {form.active
                      ? "Customers can find and buy this product"
                      : "Product is saved but not shown to customers"}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <div
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  form.active ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    form.active ? "left-6" : "left-0.5"
                  }`}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label
                htmlFor="pf-title"
                className="text-sm font-semibold text-[#2C2C2C]"
              >
                Product Title <span className="text-red-400">*</span>
              </Label>
              <Input
                ref={titleRef}
                id="pf-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Banarsi Silk Saree"
                required
                autoComplete="off"
                className="mt-1.5 text-base bg-white border-[#E8E5E0] focus:border-[#C5A059] h-11"
                data-testid="product-title-input"
              />
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="pf-desc"
                className="text-sm font-semibold text-[#2C2C2C]"
              >
                Description
              </Label>
              <Textarea
                id="pf-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the product — fabric, occasion, craftsmanship…"
                rows={4}
                className="mt-1.5 bg-white border-[#E8E5E0] focus:border-[#C5A059] resize-none"
                data-testid="product-description-input"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.description.length} characters
              </p>
            </div>

            {/* Price + SKU side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="pf-price"
                  className="text-sm font-semibold text-[#2C2C2C]"
                >
                  Base Price (₹) <span className="text-red-400">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                    ₹
                  </span>
                  <Input
                    id="pf-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.base_price}
                    onChange={(e) =>
                      setForm({ ...form, base_price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    className="pl-7 bg-white border-[#E8E5E0] focus:border-[#C5A059] h-11"
                    data-testid="product-price-input"
                  />
                </div>
                {form.base_price && !isNaN(parseFloat(form.base_price)) && (
                  <p className="text-xs text-[#C5A059] mt-1 font-medium">
                    = {formatPrice(parseFloat(form.base_price))}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="pf-sku"
                  className="text-sm font-semibold text-[#2C2C2C]"
                >
                  SKU <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="pf-sku"
                  value={form.sku}
                  onChange={(e) =>
                    setForm({ ...form, sku: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SKU-001"
                  required
                  autoComplete="off"
                  className="mt-1.5 bg-white border-[#E8E5E0] focus:border-[#C5A059] h-11 font-mono text-sm uppercase"
                  data-testid="product-sku-input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unique product code
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label
                htmlFor="pf-cat"
                className="text-sm font-semibold text-[#2C2C2C]"
              >
                Category
              </Label>
              <select
                id="pf-cat"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full mt-1.5 px-3 h-11 border border-[#E8E5E0] rounded-md text-sm bg-white focus:border-[#C5A059] outline-none"
                data-testid="product-category-select"
              >
                <option value="">— No Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!form.category_id && (
                <p className="text-xs text-gray-400 mt-1">
                  Optional — helps customers browse
                </p>
              )}
            </div>

            {/* Price preview card */}
            {form.base_price && parseFloat(form.base_price) > 0 && (
              <div className="bg-[#F9F8F5] border border-[#F2F0EB] rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Preview
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-lg font-semibold text-[#2C2C2C]">
                      {form.title || "Product Name"}
                    </p>
                    {form.category_id && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {
                          categories.find((c) => c.id === form.category_id)
                            ?.name
                        }
                      </p>
                    )}
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      {form.sku || "SKU"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#C5A059]">
                      {formatPrice(parseFloat(form.base_price))}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs mt-1 font-semibold ${
                        form.active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {form.active ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {form.active ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer actions — always visible */}
        <div className="px-7 py-5 border-t border-[#F2F0EB] bg-white shrink-0 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-2 flex-1 bg-[#2C2C2C] text-white hover:bg-[#C5A059] transition-colors font-semibold"
            data-testid="save-product-button"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : editing ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // product id being toggled
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imgProduct, setImgProduct] = useState(null);
  const [discProduct, setDiscProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all"); // all | active | hidden

  useEffect(() => {
    fetchAll();
  }, []);

  // const fetchAll = async () => {
  //   try {
  //     // include_inactive=true so dashboard shows ALL products including hidden
  //     const [pRes, cRes] = await Promise.all([
  //       api.get("/products?limit=1000&include_inactive=true"),
  //       api.get("/categories"),
  //     ]);
  //     setProducts(pRes.data);
  //     setCategories(cRes.data);
  //   } catch {
  //     toast.error("Failed to load data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Inside Products.jsx
  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        // Change 1000 to 500 here
        api.get("/products?limit=500&include_inactive=true"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Quick toggle visibility without opening form
  const toggleVisibility = async (product) => {
    setToggling(product.id);
    try {
      await api.put(`/products/${product.id}`, { active: !product.active });
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, active: !p.active } : p,
        ),
      );
      toast.success(
        product.active
          ? `"${product.title}" hidden from store`
          : `"${product.title}" is now visible`,
      );
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (
      !window.confirm(
        `Delete "${title}" and all its images? This cannot be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`"${title}" deleted`);
    } catch {
      toast.error("Delete failed");
    }
  };

  // Filtered list
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? p.active
          : !p.active;
    return matchSearch && matchFilter;
  });

  const activeCount = products.filter((p) => p.active).length;
  const hiddenCount = products.filter((p) => !p.active).length;

  return (
    <div className="p-8" data-testid="products-page">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-[#2C2C2C]">
            Products
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount} visible · {hiddenCount} hidden
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-[#2C2C2C] text-white hover:bg-[#C5A059] transition-colors"
          data-testid="add-product-button"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* ── Filter + Search bar ──────────────────────────────── */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU…"
            className="pl-9 bg-white border-[#E8E5E0] focus:border-[#C5A059]"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: `All (${products.length})` },
            { key: "active", label: `Visible (${activeCount})`, icon: Eye },
            { key: "hidden", label: `Hidden (${hiddenCount})`, icon: EyeOff },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                filterStatus === key
                  ? "bg-[#2C2C2C] text-white border-[#2C2C2C]"
                  : "bg-white text-gray-500 border-[#E8E5E0] hover:border-[#C5A059] hover:text-[#C5A059]"
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Form panel ───────────────────────────────── */}
      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
        categories={categories}
        onSaved={fetchAll}
      />

      {/* ── Images dialog ────────────────────────────────────── */}
      <Dialog
        open={!!imgProduct}
        onOpenChange={(o) => {
          if (!o) {
            setImgProduct(null);
            fetchAll();
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#C5A059]" /> Manage Product
              Images
            </DialogTitle>
          </DialogHeader>
          {imgProduct && (
            <ImageUploadPanel
              product={imgProduct}
              onClose={() => {
                setImgProduct(null);
                fetchAll();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Discount dialog ──────────────────────────────────── */}
      <Dialog
        open={!!discProduct}
        onOpenChange={(o) => {
          if (!o) {
            setDiscProduct(null);
            fetchAll();
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#C5A059]" /> Manage Discount
            </DialogTitle>
          </DialogHeader>
          {discProduct && (
            <DiscountPanel
              product={discProduct}
              onClose={() => {
                setDiscProduct(null);
                fetchAll();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Table ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#F2F0EB] rounded-xl">
          <div className="w-16 h-16 bg-[#F2F0EB] rounded-full flex items-center justify-center mx-auto mb-4">
            {search ? (
              <Search className="w-7 h-7 text-gray-300" />
            ) : (
              <ImageIcon className="w-7 h-7 text-gray-300" />
            )}
          </div>
          <p className="text-gray-500 font-medium mb-1">
            {search ? `No products matching "${search}"` : "No products yet"}
          </p>
          {!search && (
            <>
              <p className="text-sm text-gray-400 mb-5">
                Add your first product to get started
              </p>
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="bg-[#2C2C2C] text-white hover:bg-[#C5A059]"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </>
          )}
        </div>
      ) : (
        // <div className="bg-white border border-[#F2F0EB] rounded-xl overflow-hidden">
        <div className="bg-white border border-[#F2F0EB] rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F8F5] hover:bg-[#F9F8F5]">
                <TableHead className="w-16 pl-5">Photo</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const cover = p.images?.[0]?.url;
                const imgCount = p.images?.length ?? 0;
                const disc = p.discount?.active ? p.discount : null;
                const isToggling = toggling === p.id;

                return (
                  // <TableRow
                  //   key={p.id}
                  //   className={`hover:bg-[#F9F8F5]/60 transition-colors ${!p.active ? "opacity-60" : ""}`}
                  //   data-testid="product-row"
                  // >
                  <TableRow
                    key={p.id}
                    className={`hover:bg-[#F9F8F5]/60 transition-colors relative ${
                      !p.active ? "opacity-60" : ""
                    } ${imgProduct?.id === p.id || discProduct?.id === p.id ? "z-50" : "z-0"}`}
                    data-testid="product-row"
                  >
                    {/* Thumbnail */}
                    <TableCell className="pl-5">
                      <div
                        onClick={() => setImgProduct(p)}
                        title="Click to manage images"
                        className="relative w-12 h-12 bg-[#F2F0EB] rounded-lg overflow-hidden cursor-pointer group ring-2 ring-transparent hover:ring-[#C5A059] transition-all"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                            <span className="text-[8px] text-gray-300">
                              Add
                            </span>
                          </div>
                        )}
                        {imgCount > 1 && (
                          <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 leading-4 rounded-tl">
                            +{imgCount - 1}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-[#2C2C2C]">{p.title}</p>
                      {p.category_id && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {categories.find((c) => c.id === p.category_id)
                            ?.name || ""}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="text-gray-400 text-sm font-mono">
                      {p.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(p.base_price)}
                    </TableCell>

                    <TableCell>
                      {disc ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/25 px-2 py-0.5 rounded-full font-semibold">
                          <Tag className="w-2.5 h-2.5" />
                          {disc.type === "percentage"
                            ? `${disc.value}% off`
                            : `₹${disc.value} off`}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {p.inventory?.quantity ?? 0}
                    </TableCell>

                    {/* Visibility toggle */}
                    <TableCell>
                      <button
                        onClick={() => toggleVisibility(p)}
                        disabled={isToggling}
                        title={
                          p.active
                            ? "Click to hide from store"
                            : "Click to show on store"
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                          isToggling
                            ? "opacity-50 cursor-wait"
                            : p.active
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {isToggling ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : p.active ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {p.active ? "Visible" : "Hidden"}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge variant="outline" className="cursor-pointer">
                            {/* FIX: changed 'user.role' to 'p.active ? "Active" : "Inactive"' 
           or whatever product property you want to show */}
                            {p.active ? "Active" : "Inactive"}{" "}
                            <ChevronDown className="ml-1 w-3 h-3" />
                          </Badge>
                        </DropdownMenuTrigger>

                        <DropdownMenuPortal>
                          <DropdownMenuContent className="z-[100] bg-white border shadow-xl p-2 rounded-lg">
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
                              Product Actions
                            </div>
                            {/* FIX: changed updateRole(user.id) to your product functions */}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
                            >
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(p.id, p.title)}
                              className="text-red-600"
                            >
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-[#F2F0EB] bg-[#F9F8F5]">
            <p className="text-xs text-gray-400">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              Click <Eye className="inline w-3 h-3 mx-0.5" /> to instantly
              show/hide on store
            </p>
          </div>
        </div>
      )}
    </div>
  );
};;

export default Products;