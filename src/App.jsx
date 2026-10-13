import "./productSyncPremium.css";

import { useEffect, useMemo, useState } from "react";

import {

  LayoutDashboard, Package, Tags, Warehouse,

  BrainCircuit, RefreshCw, Plus, Search,

  Pencil, Trash2, AlertTriangle, CheckCircle2,

  Boxes, Menu, X

} from "lucide-react";

import { auditCatalog, suggestCorrection } from "./utils/catalogAudit";

import {

  createAuditPlan,

  applyApprovedAction

} from "./utils/auditAgent";

import {

  syncProduct,

  getSyncHistory,

  getSyncedProducts

} from "./services/syncApi";

const STORAGE_KEY = "productsync_products_v1";

const CATEGORY_KEY = "productsync_categories_v1";

const DEFAULT_CATEGORIES = ["Clothing", "Footwear", "Accessories"];

function loadCategories() {

  try {

    const saved = JSON.parse(localStorage.getItem(CATEGORY_KEY) || "null");

    return Array.isArray(saved) ? saved : DEFAULT_CATEGORIES;

  } catch {

    return DEFAULT_CATEGORIES;

  }

}

const seedProducts = [

  {

    id: "p1",

    name: "Classic Denim Jacket",

    sku: "JKT-001",

    category: "Clothing",

    price: 2499,

    stock: 12,

    description: "Classic blue cotton denim jacket",

    color: "Blue",

    size: "M",

    material: "Cotton",

    status: "Active",

    syncStatus: "Not synced"

  },

  {

    id: "p2",

    name: "Running Sneakers",

    sku: "SHO-002",

    category: "Footwear",

    price: 3499,

    stock: 3,

    description: "",

    color: "White",

    size: "UK 8",

    material: "Mesh",

    status: "Active",

    syncStatus: "Not synced"

  },

  {

    id: "p3",

    name: "Leather Backpack",

    sku: "BAG-003",

    category: "Accessories",

    price: 1899,

    stock: 0,

    description: "Everyday travel backpack",

    color: "Black",

    size: "One Size",

    material: "Leather",

    status: "Draft",

    syncStatus: "Not synced"

  }

];

const emptyForm = {

  name: "", sku: "", category: "Clothing",

  price: "", stock: "", description: "",

  color: "", size: "", material: "", status: "Draft"

};

const navItems = [

  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },

  { id: "products", label: "Products", icon: Package },

  { id: "attributes", label: "Categories & Attributes", icon: Tags },

  { id: "inventory", label: "Inventory", icon: Warehouse },

  { id: "audit", label: "AI Catalog Auditor", icon: BrainCircuit },

  { id: "sync", label: "WooCommerce Sync", icon: RefreshCw }

];

function loadProducts() {

  try {

    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : seedProducts;

  } catch {

    return seedProducts;

  }

}

function Badge({ children, tone = "gray" }) {

  const styles = {

    green: "bg-emerald-50 text-emerald-700",

    red: "bg-red-50 text-red-700",

    amber: "bg-amber-50 text-amber-700",

    blue: "bg-blue-50 text-blue-700",

    gray: "bg-slate-100 text-slate-600"

  };

  return (

    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>

      {children}

    </span>

  );

}

function StatCard({ title, value, icon: Icon, color }) {

  return (

    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-500">{title}</span>

        <div className={`rounded-lg p-2 ${color}`}>

          <Icon size={19} />

        </div>

      </div>

      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>

    </div>

  );

}

export default function App() {

  const [page, setPage] = useState("dashboard");

  const [products, setProducts] = useState(loadProducts);

  const [managedCategories, setManagedCategories] = useState(loadCategories);

  const [newCategory, setNewCategory] = useState("");

  const [categoryError, setCategoryError] = useState("");

  const [attributeProductId, setAttributeProductId] = useState("");

  const [attributeForm, setAttributeForm] = useState({ color: "", size: "", material: "" });

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [syncHistory, setSyncHistory] = useState([]);

const [syncedProducts, setSyncedProducts] = useState([]);

const [syncingSku, setSyncingSku] = useState(null);

const [syncError, setSyncError] = useState("");

const [syncMessage, setSyncMessage] = useState("");

const [syncLoading, setSyncLoading] = useState(false);

  const audit = useMemo(() => auditCatalog(products), [products]);

  const auditPlan = useMemo(

  () => createAuditPlan(products),

  [products]

);

function approveAgentAction(action) {

  if (!action.correction) return;

  const approved = window.confirm(

    `Approve suggested change for ${action.productName}?\n\n` +

    `${action.correction.field}:\n${action.correction.value}`

  );

  if (!approved) return;

  try {

    const result = applyApprovedAction(products, action);

    setProducts(result.products);

  } catch (error) {

    window.alert(error.message);

  }

}

  useEffect(() => {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

  }, [products]);

  useEffect(() => {

  if (page === "sync") {

    loadSyncData();

  }

}, [page]);

  const categories = [...new Set([...managedCategories, ...products.map(p => p.category).filter(Boolean)])];

  useEffect(() => {

    localStorage.setItem(CATEGORY_KEY, JSON.stringify(managedCategories));

  }, [managedCategories]);

  function addCategory(e) {

    e.preventDefault();

    const name = newCategory.trim();

    if (!name) return setCategoryError("Enter a category name.");

    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {

      return setCategoryError("That category already exists.");

    }

    setManagedCategories(prev => [...prev, name]);

    setNewCategory("");

    setCategoryError("");

  }

  function renameCategory(oldName) {

    const input = window.prompt("New category name:", oldName);

    if (input === null) return;

    const name = input.trim();

    if (!name || categories.some(c => c.toLowerCase() === name.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {

      return window.alert("Choose a nonempty, unique category name.");

    }

    if (name === oldName) return;

    setManagedCategories(prev => [...new Set(prev.map(c => c === oldName ? name : c).concat(name))]);

    setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: name, syncStatus: "Not synced" } : p));

  }

  function deleteCategory(name) {

    if (products.some(p => p.category === name)) {

      return window.alert("This category is used by products. Reassign those products before deleting it.");

    }

    if (!window.confirm(`Delete category "${name}"?`)) return;

    setManagedCategories(prev => prev.filter(c => c !== name));

  }

  function chooseAttributeProduct(id) {

    setAttributeProductId(id);

    const p = products.find(item => item.id === id);

    setAttributeForm({ color: p?.color || "", size: p?.size || "", material: p?.material || "" });

  }

  function saveAttributes(e) {

    e.preventDefault();

    if (!attributeProductId) return;

    setProducts(prev => prev.map(p => p.id === attributeProductId

      ? { ...p, ...Object.fromEntries(Object.entries(attributeForm).map(([k,v]) => [k, v.trim()])), syncStatus: "Not synced" }

      : p));

    window.alert("Product attributes saved. Re-sync the product to update the mock store.");

  }

  const stats = useMemo(() => ({

    total: products.length,

    active: products.filter(p => p.status === "Active").length,

    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,

    outOfStock: products.filter(p => p.stock === 0).length,

    incomplete: products.filter(p => !p.description?.trim()).length

  }), [products]);

  const filtered = products.filter(p =>

    `${p.name} ${p.sku} ${p.category}`.toLowerCase()

      .includes(search.toLowerCase())

  );

  function openAdd() {

    setEditingId(null);

    setForm({ ...emptyForm, category: categories[0] || "" });

    setError("");

    setModal(true);

  }

  function openEdit(product) {

    setEditingId(product.id);

    setForm({

      name: product.name,

      sku: product.sku,

      category: product.category,

      price: product.price,

      stock: product.stock,

      description: product.description,

      color: product.color,

      size: product.size,

      material: product.material,

      status: product.status

    });

    setError("");

    setModal(true);

  }

  function saveProduct(e) {

    e.preventDefault();

    const name = form.name.trim();

    const sku = form.sku.trim().toUpperCase();

    const price = Number(form.price);

    const stock = Number(form.stock);

    if (!name || !sku || form.price === "" || form.stock === "") {

      setError("Name, SKU, price and stock are required.");

      return;

    }

    if (!Number.isFinite(price) || price < 0 ||

        !Number.isInteger(stock) || stock < 0) {

      setError("Enter a valid non-negative price and whole-number stock.");

      return;

    }

    if (products.some(p => p.sku.toUpperCase() === sku && p.id !== editingId)) {

      setError("This SKU already exists. Please use a unique SKU.");

      return;

    }

    const data = {

      ...form,

      name,

      sku,

      price,

      stock,

      id: editingId || crypto.randomUUID(),

      syncStatus: "Not synced"

    };

    setProducts(prev =>

      editingId

        ? prev.map(p => p.id === editingId ? data : p)

        : [...prev, data]

    );

    setModal(false);

  }

async function loadSyncData() {

  setSyncLoading(true);

  try {

    const [historyData, productsData] = await Promise.all([

      getSyncHistory(),

      getSyncedProducts()

    ]);

    setSyncHistory(historyData.history);

    setSyncedProducts(productsData.products);

    setSyncError("");

  } catch (error) {

    setSyncError(error.message);

  } finally {

    setSyncLoading(false);

  }

}

async function handleSyncProduct(product) {

  setSyncingSku(product.sku);

  setSyncError("");

  setSyncMessage("");

  try {

    const response = await syncProduct(product);

    setSyncMessage(response.message);

    setProducts(prev =>

      prev.map(p =>

        p.id === product.id

          ? { ...p, syncStatus: "Mock synced" }

          : p

      )

    );

    await loadSyncData();

  } catch (error) {

    setSyncError(error.message);

    setProducts(prev =>

      prev.map(p =>

        p.id === product.id

          ? { ...p, syncStatus: "Failed" }

          : p

      )

    );

    await loadSyncData();

  } finally {

    setSyncingSku(null);

  }

}

  function deleteProduct(id) {

    if (window.confirm("Are you sure you want to delete this product?")) {

      setProducts(prev => prev.filter(p => p.id !== id));

    }

  }

  const inputClass =

    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const productTable = (list) => (

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50 text-slate-500">

          <tr>

            {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"]

              .map(h => <th key={h} className="px-5 py-4 font-medium">{h}</th>)}

          </tr>

        </thead>

        <tbody>

          {list.map(p => (

            <tr key={p.id} className="border-t border-slate-100">

              <td className="px-5 py-4 font-semibold text-slate-800">{p.name}</td>

              <td className="px-5 py-4 text-slate-500">{p.sku}</td>

              <td className="px-5 py-4">{p.category}</td>

              <td className="px-5 py-4">₹{p.price.toLocaleString("en-IN")}</td>

              <td className="px-5 py-4">

                <Badge tone={p.stock === 0 ? "red" : p.stock <= 5 ? "amber" : "green"}>

                  {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Low: ${p.stock}` : p.stock}

                </Badge>

              </td>

              <td className="px-5 py-4">

                <Badge tone={p.status === "Active" ? "green" : "gray"}>{p.status}</Badge>

              </td>

              <td className="px-5 py-4">

                <div className="flex gap-3">

                  <button aria-label={`Edit ${p.name}`} onClick={() => openEdit(p)}

                    className="text-indigo-600 hover:text-indigo-800">

                    <Pencil size={17} />

                  </button>

                  <button aria-label={`Delete ${p.name}`} onClick={() => deleteProduct(p.id)}

                    className="text-red-500 hover:text-red-700">

                    <Trash2 size={17} />

                  </button>

                </div>

              </td>

            </tr>

          ))}

          {list.length === 0 && (

            <tr><td colSpan="7" className="py-12 text-center text-slate-400">

              No products found.

            </td></tr>

          )}

        </tbody>

      </table>

    </div>

  );

  return (

    <div className="ps-app min-h-screen bg-slate-50 text-slate-900">

      <aside className={`ps-sidebar fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">

          <div className="rounded-lg bg-indigo-600 p-2"><Boxes size={22}/></div>

          <div>

            <div className="text-lg font-bold">ProductSync AI</div>

            <div className="text-xs text-slate-400">PIM Management Platform</div>

          </div>

        </div>

        <nav className="space-y-1 p-4">

          {navItems.map(item => {

            const Icon = item.icon;

            return (

              <button key={item.id}

                onClick={() => { setPage(item.id); setSidebarOpen(false); }}

                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${

                  page === item.id

                    ? "bg-indigo-600 text-white"

                    : "text-slate-400 hover:bg-slate-800 hover:text-white"

                }`}>

                <Icon size={19}/>{item.label}

              </button>

            );

          })}

        </nav>

        <div className="absolute bottom-5 left-5 text-xs text-slate-500">

          Kilowott Hackathon • MVP

        </div>

      </aside>

      <div className="lg:ml-64">

        <header className="ps-header sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-9">

          <div className="flex items-center gap-3">

            <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>

              {sidebarOpen ? <X/> : <Menu/>}

            </button>

            <div>

              <h1 className="text-xl font-bold">

                {navItems.find(n => n.id === page)?.label}

              </h1>

              <p className="text-xs text-slate-400">Manage your product information efficiently</p>

            </div>

          </div>

          <Badge tone="blue">Demo Environment</Badge>

        </header>

        <main className="ps-main mx-auto max-w-7xl space-y-7 p-5 lg:p-9">

          {page === "dashboard" && (

            <>

              <section className="ps-hero">

                <div className="ps-hero-content">

                  <div className="ps-eyebrow"><span className="ps-live-dot" /> PRODUCT INTELLIGENCE PLATFORM</div>

                  <h2>Make every product <span>shine.</span></h2>

                  <p>One beautiful workspace to organize, audit, and sync your entire catalog.</p>

                  <div className="ps-hero-actions">

                    <button onClick={() => setPage("products")} className="ps-primary-action"><Plus size={17} /> Manage products</button>

                    <button onClick={() => setPage("audit")} className="ps-secondary-action"><BrainCircuit size={17} /> Explore auditor</button>

                  </div>

                </div>

                <div className="ps-hero-visual" aria-hidden="true">

                  <div className="ps-orbit ps-orbit-one"/><div className="ps-orbit ps-orbit-two"/>

                  <div className="ps-cube"><div className="ps-cube-face ps-cube-front"><Package size={48}/></div><div className="ps-cube-face ps-cube-right"/><div className="ps-cube-face ps-cube-top"/></div>

                  <div className="ps-float-pill ps-pill-top">✦ Catalog intelligence</div>

                  <div className="ps-float-pill ps-pill-bottom">● Sync ready</div>

                </div>

              </section>

              <div>

                <h2 className="text-2xl font-bold">Catalog Overview</h2>

                <p className="mt-1 text-sm text-slate-500">Real-time statistics from your product catalog.</p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard title="Total Products" value={stats.total} icon={Package} color="bg-indigo-50 text-indigo-600"/>

                <StatCard title="Active Products" value={stats.active} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600"/>

                <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-amber-50 text-amber-600"/>

                <StatCard title="Out of Stock" value={stats.outOfStock} icon={Warehouse} color="bg-red-50 text-red-600"/>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-white p-6">

                  <h3 className="font-semibold">Catalog Health</h3>

                  <p className="mt-4 text-3xl font-bold">

  {audit.qualityScore}%

  <span className="ml-2 text-sm font-normal text-slate-400">

    Catalog Quality Score

  </span>

</p>

<p className="mt-2 text-sm text-slate-500">

  {audit.totalIssues} issues detected across {audit.productsScanned} products.

</p>

                  <button onClick={() => setPage("audit")} className="mt-5 text-sm font-semibold text-indigo-600">

                    Open Catalog Auditor →

                  </button>

                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6">

                  <h3 className="font-semibold">Categories</h3>

                  <p className="mt-4 text-3xl font-bold">{categories.length}</p>

                  <p className="mt-2 text-sm text-slate-500">{categories.join(", ") || "No categories yet"}</p>

                </div>

              </div>

              <div>

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="text-lg font-semibold">Recent Products</h3>

                  <button onClick={() => setPage("products")} className="text-sm font-medium text-indigo-600">View all →</button>

                </div>

                {productTable(products.slice(-5).reverse())}

              </div>

            </>

          )}

          {page === "products" && (

            <>

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold">Product Catalog</h2>

                  <p className="text-sm text-slate-500">Create, edit and manage your products.</p>

                </div>

                <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">

                  <Plus size={18}/> Add Product

                </button>

              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">

                <Search size={18} className="text-slate-400"/>

                <input className="w-full outline-none" placeholder="Search by name, SKU or category..."

                  value={search} onChange={e => setSearch(e.target.value)}/>

              </div>

              {productTable(filtered)}

            </>

          )}

          {page === "attributes" && (

            <div className="space-y-6">

              <div>

                <h2 className="text-2xl font-bold">Categories & Attributes</h2>

                <p className="mt-1 text-sm text-slate-500">Organize your catalog and maintain consistent product details.</p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h3 className="text-lg font-semibold">Manage Categories</h3>

                <form onSubmit={addCategory} className="mt-4 flex flex-wrap gap-3">

                  <input className={`${inputClass} max-w-sm`} placeholder="New category name" value={newCategory} onChange={e => {setNewCategory(e.target.value); setCategoryError("");}} />

                  <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">+ Add Category</button>

                </form>

                {categoryError && <p className="mt-2 text-sm text-red-600">{categoryError}</p>}

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

                  {categories.map(category => (

                    <div key={category} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">

                      <div className="min-w-0">

                        <p className="truncate font-semibold">{category}</p>

                        <p className="text-xs text-slate-500">{products.filter(p => p.category === category).length} products</p>

                      </div>

                      <div className="flex gap-3">

                        <button aria-label={`Rename ${category}`} title="Rename category" onClick={() => renameCategory(category)} className="text-indigo-600"><Pencil size={17}/></button>

                        <button aria-label={`Delete ${category}`} title="Delete unused category" onClick={() => deleteCategory(category)} className="text-red-500"><Trash2 size={17}/></button>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h3 className="text-lg font-semibold">Edit Product Attributes</h3>

                <p className="mt-1 text-sm text-slate-500">Select a product and update its color, size, and material.</p>

                <select className={`${inputClass} mt-4 max-w-lg`} value={attributeProductId} onChange={e => chooseAttributeProduct(e.target.value)}>

                  <option value="">Select a product</option>

                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}

                </select>

                {attributeProductId && (

                  <form onSubmit={saveAttributes} className="mt-4 space-y-4">

                    <div className="grid gap-4 sm:grid-cols-3">

                      {["color", "size", "material"].map(field => (

                        <label key={field} className="text-sm font-medium capitalize">{field}

                          <input className={`mt-2 ${inputClass}`} value={attributeForm[field]} onChange={e => setAttributeForm(prev => ({...prev, [field]: e.target.value}))}/>

                        </label>

                      ))}

                    </div>

                    <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Save Attributes</button>

                  </form>

                )}

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h3 className="font-semibold">Product Attribute Overview</h3>

                <div className="mt-4 overflow-x-auto">

                  <table className="w-full text-left text-sm">

                    <thead className="bg-slate-50 text-slate-500"><tr>{["Product", "Category", "Color", "Size", "Material"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>

                    <tbody>{products.map(p => <tr key={p.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3">{p.category}</td><td className="px-4 py-3">{p.color || "—"}</td><td className="px-4 py-3">{p.size || "—"}</td><td className="px-4 py-3">{p.material || "—"}</td></tr>)}</tbody>

                  </table>

                </div>

              </div>

            </div>

          )}

          {page === "inventory" && (

            <>

              <h2 className="text-2xl font-bold">Inventory Monitoring</h2>

              <div className="grid gap-4 sm:grid-cols-2">

                <StatCard title="Low Stock Products" value={stats.lowStock} icon={AlertTriangle} color="bg-amber-50 text-amber-600"/>

                <StatCard title="Out of Stock Products" value={stats.outOfStock} icon={Warehouse} color="bg-red-50 text-red-600"/>

              </div>

              {productTable(products.filter(p => p.stock <= 5))}

            </>

          )}

{page === "audit" && (

  <div className="space-y-6">

<div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">

  <div className="flex items-center gap-3">

    <BrainCircuit size={26} className="text-indigo-600" />

    <div>

      <h3 className="text-lg font-bold">

        Intelligent Audit Action Plan

      </h3>

      <p className="text-sm text-slate-600">

        Analyze → Prioritize → Recommend → Approve → Revalidate

      </p>

    </div>

  </div>

  <div className="mt-5 grid gap-3 sm:grid-cols-3">

    <div className="rounded-lg bg-white p-4">

      <p className="text-sm text-slate-500">Issues Analyzed</p>

      <p className="text-2xl font-bold">

        {auditPlan.totalIssues}

      </p>

    </div>

    <div className="rounded-lg bg-white p-4">

      <p className="text-sm text-slate-500">Suggested Fixes</p>

      <p className="text-2xl font-bold">

        {auditPlan.automaticallyFixable}

      </p>

    </div>

    <div className="rounded-lg bg-white p-4">

      <p className="text-sm text-slate-500">Manual Review</p>

      <p className="text-2xl font-bold">

        {auditPlan.manualReview}

      </p>

    </div>

  </div>

  <h4 className="mt-6 font-semibold">

    Recommended Actions

  </h4>

  <div className="mt-3 space-y-3">

    {auditPlan.actions.length === 0 && (

      <p className="rounded-lg bg-white p-4 text-sm text-emerald-700">

        No issues detected. Your catalog passed the current rules.

      </p>

    )}

    {auditPlan.actions.map(action => (

      <div

        key={action.id}

        className="flex flex-col justify-between gap-3 rounded-lg bg-white p-4 sm:flex-row sm:items-center"

      >

        <div>

          <p className="font-semibold">

            {action.productName}

          </p>

          <p className="mt-1 text-sm text-red-600">

            {action.problem}

          </p>

          <p className="mt-1 text-xs text-slate-500">

            {action.recommendation}

          </p>

          <p className="mt-1 text-xs text-indigo-600">

            Priority: {action.severity.toUpperCase()}

          </p>

        </div>

        {action.correction ? (

          <button

            onClick={() => approveAgentAction(action)}

            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"

          >

            Review & Approve

          </button>

        ) : (

          <button

            onClick={() => {

              const product = products.find(

                p => p.id === action.productId

              );

              if (product) {

                setPage("products");

                openEdit(product);

              }

            }}

            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"

          >

            Fix Manually

          </button>

        )}

      </div>

    ))}

  </div>

</div>

    <div>

      <h2 className="text-2xl font-bold">Smart Catalog Auditor</h2>

      <p className="mt-1 text-sm text-slate-500">

        Rule-based product quality analysis and correction recommendations.

      </p>

    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard

        title="Products Scanned"

        value={audit.productsScanned}

        icon={Package}

        color="bg-indigo-50 text-indigo-600"

      />

      <StatCard

        title="Quality Score"

        value={`${audit.qualityScore}%`}

        icon={CheckCircle2}

        color="bg-emerald-50 text-emerald-600"

      />

      <StatCard

        title="Issues Detected"

        value={audit.totalIssues}

        icon={AlertTriangle}

        color="bg-amber-50 text-amber-600"

      />

      <StatCard

        title="High Priority"

        value={audit.highIssues}

        icon={BrainCircuit}

        color="bg-red-50 text-red-600"

      />

    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-6">

      <div className="mb-3 flex items-center justify-between">

        <h3 className="font-semibold">Catalog Health Score</h3>

        <span className="text-lg font-bold">

          {audit.qualityScore}/100

        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div

          className={`h-full rounded-full transition-all ${

            audit.qualityScore >= 80

              ? "bg-emerald-500"

              : audit.qualityScore >= 50

              ? "bg-amber-500"

              : "bg-red-500"

          }`}

          style={{ width: `${audit.qualityScore}%` }}

        />

      </div>

      <p className="mt-3 text-xs text-slate-500">

        Score based on validation issues, weighted by severity.

        High: 10 points, Medium: 5 points, Low: 2 points.

      </p>

    </div>

    <div className="rounded-xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 p-5">

        <h3 className="font-semibold">Audit Findings</h3>

        <p className="mt-1 text-sm text-slate-500">

          {audit.totalIssues} issues across {audit.productsScanned} products

        </p>

      </div>

      {audit.issues.length === 0 ? (

        <div className="p-10 text-center text-emerald-600">

          <CheckCircle2 className="mx-auto mb-3" size={32} />

          No catalog issues detected.

        </div>

      ) : (

        <div className="divide-y divide-slate-100">

          {audit.issues.map(issue => {

            const product = products.find(

              p => p.id === issue.productId

            );

            const suggestion = product

              ? suggestCorrection(product, issue)

              : null;

            return (

              <div

                key={issue.id}

                className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between"

              >

                <div className="space-y-2">

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="font-semibold">

                      {issue.productName}

                    </span>

                    <Badge

                      tone={

                        issue.severity === "high"

                          ? "red"

                          : issue.severity === "medium"

                          ? "amber"

                          : "blue"

                      }

                    >

                      {issue.severity.toUpperCase()}

                    </Badge>

                  </div>

                  <p className="text-sm text-red-600">

                    {issue.message}

                  </p>

                  <p className="text-sm text-slate-500">

                    Recommendation: {issue.recommendation}

                  </p>

                  {suggestion && (

                    <p className="text-xs text-indigo-600">

                      Suggested value: {suggestion.value}

                    </p>

                  )}

                </div>

                <div className="flex gap-2">

                  {suggestion ? (

                    <button

                      onClick={() => {

                          const action = auditPlan.actions.find(a => a.id === issue.id);

                          if (action) approveAgentAction(action);

                        }}

                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"

                    >

                      Review & Apply

                    </button>

                  ) : (

                    <button

                      onClick={() => {

                        if (product) {

                          setPage("products");

                          openEdit(product);

                        }

                      }}

                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"

                    >

                      Edit Product

                    </button>

                  )}

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  </div>

)}

{page === "sync" && (

  <div className="space-y-7">

    <div className="flex flex-wrap items-center justify-between gap-4">

      <div>

        <h2 className="text-2xl font-bold">

          WooCommerce Synchronization

        </h2>

        <p className="mt-1 text-sm text-slate-500">

          Synchronize your product catalog through the backend API.

        </p>

      </div>

      <Badge tone="amber">MOCK MODE — No live WooCommerce store</Badge>

    </div>

    <div className="grid gap-4 sm:grid-cols-3">

      <StatCard

        title="Local Products"

        value={products.length}

        icon={Package}

        color="bg-indigo-50 text-indigo-600"

      />

      <StatCard

        title="Mock Store Products"

        value={syncedProducts.length}

        icon={CheckCircle2}

        color="bg-emerald-50 text-emerald-600"

      />

      <StatCard

        title="Sync Attempts"

        value={syncHistory.length}

        icon={RefreshCw}

        color="bg-blue-50 text-blue-600"

      />

    </div>

    {syncError && (

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

        {syncError}

      </div>

    )}

    {syncMessage && (

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

        {syncMessage}

      </div>

    )}

    <div className="rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center justify-between border-b border-slate-100 p-5">

        <div>

          <h3 className="font-semibold">Product Synchronization</h3>

          <p className="mt-1 text-xs text-slate-500">

            Select a product to send it to the mock WooCommerce store.

          </p>

        </div>

        <button

          onClick={loadSyncData}

          disabled={syncLoading}

          className="flex items-center gap-2 text-sm font-medium text-indigo-600 disabled:opacity-50"

        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-slate-500">

            <tr>

              <th className="px-5 py-4">Product</th>

              <th className="px-5 py-4">SKU</th>

              <th className="px-5 py-4">Price</th>

              <th className="px-5 py-4">Stock</th>

              <th className="px-5 py-4">Sync Status</th>

              <th className="px-5 py-4">Action</th>

            </tr>

          </thead>

          <tbody>

            {products.map(product => (

              <tr key={product.id} className="border-t border-slate-100">

                <td className="px-5 py-4 font-medium">

                  {product.name}

                </td>

                <td className="px-5 py-4">{product.sku}</td>

                <td className="px-5 py-4">

                  ₹{Number(product.price).toLocaleString("en-IN")}

                </td>

                <td className="px-5 py-4">{product.stock}</td>

                <td className="px-5 py-4">

                  <Badge

                    tone={

                      product.syncStatus === "Mock synced"

                        ? "green"

                        : product.syncStatus === "Failed"

                        ? "red"

                        : "gray"

                    }

                  >

                    {product.syncStatus || "Not synced"}

                  </Badge>

                </td>

                <td className="px-5 py-4">

                  <button

                    onClick={() => handleSyncProduct(product)}

                    disabled={syncingSku !== null}

                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"

                  >

                    {syncingSku === product.sku

                      ? "Syncing..."

                      : "Sync Product"}

                  </button>

                </td>

              </tr>

            ))}

            {products.length === 0 && (

              <tr>

                <td colSpan="6" className="py-10 text-center text-slate-400">

                  No products available.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

    <div className="rounded-xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 p-5">

        <h3 className="font-semibold">Synchronization History</h3>

        <p className="mt-1 text-xs text-slate-500">

          Backend records of mock synchronization attempts.

        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-slate-500">

            <tr>

              <th className="px-5 py-4">Time</th>

              <th className="px-5 py-4">SKU</th>

              <th className="px-5 py-4">Action</th>

              <th className="px-5 py-4">Status</th>

              <th className="px-5 py-4">Mode</th>

            </tr>

          </thead>

          <tbody>

            {syncHistory.map((entry, index) => (

              <tr key={`${entry.id}-${index}`} className="border-t border-slate-100">

                <td className="px-5 py-4">

                  {new Date(entry.timestamp).toLocaleString()}

                </td>

                <td className="px-5 py-4">{entry.sku}</td>

                <td className="px-5 py-4 capitalize">

                  {entry.action || "Validation"}

                </td>

                <td className="px-5 py-4">

                  <Badge tone={entry.status === "success" ? "green" : "red"}>

                    {entry.status}

                  </Badge>

                </td>

                <td className="px-5 py-4 uppercase text-slate-500">

                  {entry.mode}

                </td>

              </tr>

            ))}

            {syncHistory.length === 0 && (

              <tr>

                <td colSpan="5" className="py-10 text-center text-slate-400">

                  No synchronization attempts yet.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  </div>

)}

        </main>

      </div>

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>

              <button onClick={() => setModal(false)} aria-label="Close form"><X size={20}/></button>

            </div>

            <form onSubmit={saveProduct} className="space-y-4">

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">

                {[

                  ["name", "Product Name", "text"],

                  ["sku", "SKU", "text"],

                  ["price", "Price (₹)", "number"],

                  ["stock", "Stock Quantity", "number"],

                  ["color", "Color", "text"],

                  ["size", "Size", "text"],

                  ["material", "Material", "text"]

                ].map(([key, label, type]) => (

                  <label key={key} className="block text-sm font-medium">

                    {label}

                    <input type={type} min={type === "number" ? 0 : undefined}

                      step={key === "stock" ? 1 : key === "price" ? "0.01" : undefined}

                      value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}

                      className={`mt-1 ${inputClass}`}/>

                  </label>

                ))}

                <label className="block text-sm font-medium">

                  Category

                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}

                    className={`mt-1 ${inputClass}`}>

                    {[...new Set([...categories, form.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}

                  </select>

                </label>

                <label className="block text-sm font-medium">

                  Status

                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}

                    className={`mt-1 ${inputClass}`}>

                    <option>Draft</option><option>Active</option>

                  </select>

                </label>

              </div>

              <label className="block text-sm font-medium">

                Description

                <textarea rows="3" value={form.description}

                  onChange={e => setForm({...form, description: e.target.value})}

                  className={`mt-1 ${inputClass}`}/>

              </label>

              <div className="flex justify-end gap-3 pt-2">

                <button type="button" onClick={() => setModal(false)}

                  className="rounded-lg border px-5 py-2.5 text-sm">Cancel</button>

                <button type="submit"

                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">

                  {editingId ? "Save Changes" : "Create Product"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
