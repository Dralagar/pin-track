import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import type {
  DashboardSummary,
  DbData,
  PaymentType,
  Pin,
  PinStatus,
  Product,
  Salesperson,
  SalespersonStockItem,
  StockRequest,
  StockRequestStatus,
  WaitlistEntry,
  WarehouseStockItem,
  StockBatch,
  CreatePinInput,
  AllocateStockInput,
  WarehouseRestockInput,
  CreateStockRequestInput,
  AddWaitlistInput,
} from "./types";

const dbRelativePath = join(".pintrack", "db.json");

function getDbPath() {
  return join(process.cwd(), dbRelativePath);
}

function seedDb(): DbData {
  const products: Product[] = [
    { id: randomUUID(), sku: "X", name: "X", unitPrice: 50, commissionPerUnit: 2, active: true, qtyPerBox: 20 },
    { id: randomUUID(), sku: "X2", name: "X2", unitPrice: 100, commissionPerUnit: 3, active: true, qtyPerBox: 20 },
    { id: randomUUID(), sku: "X3", name: "X3", unitPrice: 150, commissionPerUnit: 4, active: true, qtyPerBox: 20 },
    { id: randomUUID(), sku: "X5", name: "X5", unitPrice: 300, commissionPerUnit: 6, active: true, qtyPerBox: 10 },
    { id: randomUUID(), sku: "G-BAG-SEEDLESS", name: "G-Bag Seedless", unitPrice: 1000, commissionPerUnit: 20, active: true, qtyPerBox: 5 },
    { id: randomUUID(), sku: "G-BAG-BANANA", name: "G-Bag Banana", unitPrice: 1000, commissionPerUnit: 20, active: true, qtyPerBox: 5 },
  ];

  const salespeople: Salesperson[] = [
    { id: randomUUID(), name: "Jeff", active: true, role: "SALESPERSON" },
    { id: randomUUID(), name: "Collo", active: true, role: "SALESPERSON" },
    { id: randomUUID(), name: "Edu", active: true, role: "NIGHT_SHIFT", nightPickTime: "23:00" },
    { id: randomUUID(), name: "Bunny", active: true, role: "BOSS" },
  ];  

  const warehouseStock: WarehouseStockItem[] = products.map((p) => ({ 
    productId: p.id, 
    qty: 100,
    totalGiven: 0,
    totalRestocked: 100,
    batches: []
  }));
  const salespersonStock: SalespersonStockItem[] = [];

  // Default morning allocation for a seamless start.
  for (const s of salespeople) {
    for (const p of products) {
      const warehouseItem = warehouseStock.find((x) => x.productId === p.id)!;
      const allocQty = Math.min(10, warehouseItem.qty);
      warehouseItem.qty -= allocQty;
      salespersonStock.push({ salespersonId: s.id, productId: p.id, qty: allocQty });
    }
  }

  return {
    products,
    salespeople,
    pins: [],
    warehouseStock,
    salespersonStock,
    stockRequests: [],
    waitlist: [],
  };
}

function normalizeDb(db: any): DbData {
  const next = db as DbData;

  if (!Array.isArray((next as any).warehouseStock)) (next as any).warehouseStock = [];
  if (!Array.isArray((next as any).salespersonStock)) (next as any).salespersonStock = [];
  if (!Array.isArray((next as any).stockRequests)) (next as any).stockRequests = [];
  if (!Array.isArray((next as any).waitlist)) (next as any).waitlist = [];

  // Ensure role field exists
  for (const s of next.salespeople ?? []) {
    if (!s.role) s.role = "SALESPERSON";
  }

  for (const p of next.products ?? []) {
    const has = (next as any).warehouseStock.some((x: WarehouseStockItem) => x.productId === p.id);
    if (!has) (next as any).warehouseStock.push({ productId: p.id, qty: 0, totalGiven: 0, totalRestocked: 0, batches: [] });
  }

  // Normalize warehouse stock items
  for (const ws of (next as any).warehouseStock ?? []) {
    if (ws.totalGiven === undefined) ws.totalGiven = 0;
    if (ws.totalRestocked === undefined) ws.totalRestocked = 0;
    if (!ws.batches) ws.batches = [];
  }

  // Normalize salesperson stock items
  for (const ss of (next as any).salespersonStock ?? []) {
    if (ss.totalGiven === undefined) ss.totalGiven = 0;
    if (ss.totalReceivedToday === undefined) ss.totalReceivedToday = 0;
    if (!ss.batches) ss.batches = [];
  }

  // If legacy DB has no allocations, create a small default allocation (if warehouse has stock).
  if (((next as any).salespersonStock as SalespersonStockItem[]).length === 0 && (next.salespeople?.length ?? 0) > 0) {
    for (const s of next.salespeople ?? []) {
      for (const p of next.products ?? []) {
        const warehouseItem = (next as any).warehouseStock.find((x: WarehouseStockItem) => x.productId === p.id);
        if (!warehouseItem) continue;
        const allocQty = Math.min(5, warehouseItem.qty);
        if (allocQty <= 0) continue;
        warehouseItem.qty -= allocQty;
        (next as any).salespersonStock.push({ 
          salespersonId: s.id, 
          productId: p.id, 
          qty: allocQty,
          totalGiven: allocQty,
          totalReceivedToday: allocQty,
          batches: []
        });
      }
    }
  }

  return next;
}

async function ensureDbExists(): Promise<void> {
  const dbPath = getDbPath();
  const dbDir = join(process.cwd(), ".pintrack");

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await mkdir(dbDir, { recursive: true });
    const initial = seedDb();
    await writeFile(dbPath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readDb(): Promise<DbData> {
  await ensureDbExists();
  const raw = await readFile(getDbPath(), "utf8");
  const parsed = JSON.parse(raw) as DbData;
  const normalized = normalizeDb(parsed);
  if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
    await writeDb(normalized);
  }
  return normalized;
}

async function writeDb(next: DbData): Promise<void> {
  const dbPath = getDbPath();
  const tmpPath = `${dbPath}.tmp`;
  await writeFile(tmpPath, JSON.stringify(next, null, 2), "utf8");
  await rename(tmpPath, dbPath);
}

export async function listProducts(): Promise<Product[]> {
  const db = await readDb();
  return db.products;
}

export async function listSalespeople(): Promise<Salesperson[]> {
  const db = await readDb();
  return db.salespeople;
}

export async function listPins(): Promise<Pin[]> {
  const db = await readDb();
  return db.pins.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createPin(input: CreatePinInput): Promise<Pin> {
  const db = await readDb();

  const salesperson = db.salespeople.find((s) => s.id === input.salespersonId && s.active);
  if (!salesperson) {
    throw new Error("Invalid salesperson");
  }

  const product = db.products.find((p) => p.id === input.productId && p.active);
  if (!product) {
    throw new Error("Invalid product");
  }

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const paymentType = input.paymentType;

  if (paymentType === "MPESA" && input.mpesaReceipt && input.mpesaReceipt.length > 64) {
    throw new Error("Mpesa receipt is too long");
  }

  if (paymentType === "CREDIT") {
    if (!input.customerName || !input.customerPhone) {
      throw new Error("Credit sales require customer name and phone");
    }
  }

  const unitPrice = product.unitPrice;
  const total = unitPrice * qty;

  // Enforce stock on salesperson allocation.
  const stockItem = db.salespersonStock.find(
    (s) => s.salespersonId === salesperson.id && s.productId === product.id
  );
  const available = stockItem?.qty ?? 0;
  if (available < qty) {
    throw new Error(`Insufficient stock for ${salesperson.name}. Available: ${available}`);
  }
  if (stockItem) {
    stockItem.qty -= qty;
  }

  const pin: Pin = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    salespersonId: salesperson.id,
    productId: product.id,
    qty,
    unitPrice,
    total,
    paymentType,
    mpesaReceipt: input.mpesaReceipt?.trim() || undefined,
    customerName: input.customerName?.trim() || undefined,
    customerPhone: input.customerPhone?.trim() || undefined,
    dueDate: input.dueDate?.trim() || undefined,
    status: "PENDING" satisfies PinStatus,
    notes: input.notes?.trim() || undefined,
  };

  db.pins.push(pin);
  await writeDb(db);

  return pin;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = await readDb();

  const today = new Date().toISOString().slice(0, 10);

  let todayPins = 0;
  let mpesaTotal = 0;
  let cashTotal = 0;
  let creditOutstanding = 0;
  let commissionOwed = 0;

  for (const pin of db.pins) {
    if (pin.status === "CANCELED") continue;

    const product = db.products.find((p) => p.id === pin.productId);
    const commission = (product?.commissionPerUnit ?? 0) * pin.qty;
    commissionOwed += commission;

    if (pin.createdAt.slice(0, 10) === today) {
      todayPins += 1;
      if (pin.paymentType === "MPESA") mpesaTotal += pin.total;
      if (pin.paymentType === "CASH") cashTotal += pin.total;
      if (pin.paymentType === "CREDIT") creditOutstanding += pin.total;
    } else {
      if (pin.paymentType === "CREDIT") creditOutstanding += pin.total;
    }
  }

  const unmatchedMpesa = db.pins.filter((p) => p.paymentType === "MPESA" && !p.mpesaReceipt).length;

  return {
    todayPins,
    mpesaTotal,
    cashTotal,
    creditOutstanding,
    commissionOwed,
    unmatchedMpesa,
  };
}

export async function resolveSalespersonName(id: string): Promise<string> {
  const db = await readDb();
  return db.salespeople.find((s) => s.id === id)?.name ?? "Unknown";
}

export async function resolveProductLabel(id: string): Promise<string> {
  const db = await readDb();
  const p = db.products.find((x) => x.id === id);
  if (!p) return "Unknown";
  return `${p.sku} - ${p.name}`;
}

function upsertWarehouseStockItem(db: DbData, productId: string): WarehouseStockItem {
  let item = db.warehouseStock.find((x) => x.productId === productId);
  if (!item) {
    item = { productId, qty: 0 };
    db.warehouseStock.push(item);
  }
  return item;
}

function upsertSalespersonStockItem(db: DbData, salespersonId: string, productId: string): SalespersonStockItem {
  let item = db.salespersonStock.find((x) => x.salespersonId === salespersonId && x.productId === productId);
  if (!item) {
    item = { salespersonId, productId, qty: 0 };
    db.salespersonStock.push(item);
  }
  return item;
}

function maybeNotifyWaitlist(db: DbData, productId: string) {
  const warehouse = upsertWarehouseStockItem(db, productId);
  if (warehouse.qty <= 0) return;
  for (const w of db.waitlist) {
    if (w.productId === productId && w.status === "WAITING") {
      w.status = "NOTIFIED";
    }
  }
}

export async function getInventorySnapshot() {
  const db = await readDb();
  return {
    products: db.products,
    salespeople: db.salespeople,
    warehouseStock: db.warehouseStock,
    salespersonStock: db.salespersonStock,
    stockRequests: db.stockRequests,
    waitlist: db.waitlist,
  };
}

export async function allocateStock(input: AllocateStockInput) {
  const db = await readDb();

  const salesperson = db.salespeople.find((s) => s.id === input.salespersonId && s.active);
  if (!salesperson) throw new Error("Invalid salesperson");
  const product = db.products.find((p) => p.id === input.productId && p.active);
  if (!product) throw new Error("Invalid product");

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be greater than 0");

  const warehouse = upsertWarehouseStockItem(db, product.id);
  if (warehouse.qty < qty) {
    throw new Error(`Insufficient warehouse stock. Available: ${warehouse.qty}`);
  }

  warehouse.qty -= qty;
  const spStock = upsertSalespersonStockItem(db, salesperson.id, product.id);
  spStock.qty += qty;

  await writeDb(db);
  return { warehouse, spStock };
}

export async function warehouseRestock(input: WarehouseRestockInput) {
  const db = await readDb();
  const product = db.products.find((p) => p.id === input.productId);
  if (!product) throw new Error("Invalid product");

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be greater than 0");

  const timestamp = new Date().toISOString();
  const batchId = randomUUID();

  const warehouse = upsertWarehouseStockItem(db, product.id);
  warehouse.qty += qty;
  warehouse.totalRestocked = (warehouse.totalRestocked ?? 0) + qty;
  if (!warehouse.batches) warehouse.batches = [];
  warehouse.batches.push({ batchId, qty, timestamp, notes: input.notes });

  maybeNotifyWaitlist(db, product.id);
  await writeDb(db);
  return warehouse;
}

export async function createStockRequest(input: CreateStockRequestInput): Promise<StockRequest> {
  const db = await readDb();

  const salesperson = db.salespeople.find((s) => s.id === input.salespersonId && s.active);
  if (!salesperson) throw new Error("Invalid salesperson");
  const product = db.products.find((p) => p.id === input.productId && p.active);
  if (!product) throw new Error("Invalid product");

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be greater than 0");

  const req: StockRequest = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    salespersonId: salesperson.id,
    productId: product.id,
    qty,
    status: "OPEN" satisfies StockRequestStatus,
    notes: input.notes?.trim() || undefined,
  };

  db.stockRequests.push(req);
  await writeDb(db);
  return req;
}

export async function fulfillStockRequest(requestId: string) {
  const db = await readDb();
  const req = db.stockRequests.find((r) => r.id === requestId);
  if (!req) throw new Error("Request not found");
  if (req.status !== "OPEN") throw new Error("Request is not open");

  const warehouse = upsertWarehouseStockItem(db, req.productId);
  if (warehouse.qty < req.qty) throw new Error(`Insufficient warehouse stock. Available: ${warehouse.qty}`);

  const salesperson = db.salespeople.find((s) => s.id === req.salespersonId);
  const timestamp = new Date().toISOString();
  const batchId = randomUUID();

  // Track warehouse stock given
  warehouse.qty -= req.qty;
  warehouse.totalGiven = (warehouse.totalGiven ?? 0) + req.qty;
  if (!warehouse.batches) warehouse.batches = [];
  warehouse.batches.push({ batchId, qty: req.qty, timestamp, notes: `Fulfilled request for ${salesperson?.name ?? "Unknown"}` });

  // Track salesperson stock received
  const spStock = upsertSalespersonStockItem(db, req.salespersonId, req.productId);
  spStock.qty += req.qty;
  spStock.totalGiven = (spStock.totalGiven ?? 0) + req.qty;
  
  // Check if this is today's allocation
  const today = new Date().toISOString().slice(0, 10);
  if (timestamp.slice(0, 10) === today) {
    spStock.totalReceivedToday = (spStock.totalReceivedToday ?? 0) + req.qty;
  }
  
  if (!spStock.batches) spStock.batches = [];
  spStock.batches.push({ batchId, qty: req.qty, timestamp, notes: `Fulfilled stock request` });

  req.status = "FULFILLED";

  await writeDb(db);
  return { req, warehouse, spStock };
}

export async function addWaitlistEntry(input: AddWaitlistInput): Promise<WaitlistEntry> {
  const db = await readDb();
  const product = db.products.find((p) => p.id === input.productId);
  if (!product) throw new Error("Invalid product");

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be greater than 0");
  if (!input.customerName?.trim() || !input.customerPhone?.trim()) throw new Error("Customer name and phone are required");

  const entry: WaitlistEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    productId: product.id,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    qty,
    status: "WAITING",
    notes: input.notes?.trim() || undefined,
  };

  db.waitlist.push(entry);
  await writeDb(db);
  return entry;
}

export async function updateWaitlistStatus(entryId: string, status: "WAITING" | "NOTIFIED" | "CLOSED") {
  const db = await readDb();
  const entry = db.waitlist.find((w) => w.id === entryId);
  if (!entry) throw new Error("Waitlist entry not found");
  entry.status = status;
  await writeDb(db);
  return entry;
}

export async function getSalespersonProfile(salespersonId: string) {
  const db = await readDb();
  const salesperson = db.salespeople.find((s) => s.id === salespersonId && s.active);
  if (!salesperson) throw new Error("Salesperson not found");

  const today = new Date().toISOString().slice(0, 10);
  const pins = db.pins.filter((p) => p.salespersonId === salespersonId && p.status !== "CANCELED");
  const todayPins = pins.filter((p) => p.createdAt.slice(0, 10) === today);
  const stockAllocations = db.salespersonStock.filter((s) => s.salespersonId === salespersonId);

  const todayRevenue = todayPins.reduce((sum, p) => sum + p.total, 0);
  const totalRevenue = pins.reduce((sum, p) => sum + p.total, 0);
  const commissionEarned = pins.reduce((sum, p) => {
    const product = db.products.find((pr) => pr.id === p.productId);
    return sum + (product?.commissionPerUnit ?? 0) * p.qty;
  }, 0);
  const creditOutstanding = pins
    .filter((p) => p.paymentType === "CREDIT")
    .reduce((sum, p) => sum + p.total, 0);

  const recentPins = pins
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  return {
    salesperson,
    todayPins: todayPins.length,
    todayRevenue,
    totalPins: pins.length,
    totalRevenue,
    commissionEarned,
    creditOutstanding,
    stockAllocations,
    recentPins,
  };
}

export async function getAllSalespersonProfiles() {
  const db = await readDb();
  const profiles = [];
  for (const sp of db.salespeople.filter((s) => s.active)) {
    const profile = await getSalespersonProfile(sp.id);
    profiles.push(profile);
  }
  return profiles;
}
