// lib/types.ts
export type PaymentType = "MPESA" | "CASH" | "CREDIT";

export type PinStatus = "PENDING" | "CONFIRMED" | "CANCELED";

export type StockRequestStatus = "OPEN" | "FULFILLED" | "CANCELED";

export type WaitlistStatus = "WAITING" | "NOTIFIED" | "CLOSED";

export type Product = {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  commissionPerUnit: number;
  active: boolean;
  qtyPerBox?: number;
};

export type Salesperson = {
  id: string;
  name: string;
  email?: string;           // Added for authentication
  pin?: string;             // Added for PIN-based login
  active: boolean;
  role?: "BOSS" | "SALESPERSON" | "NIGHT_SHIFT";
  nightPickTime?: "23:00" | "00:00"; // 11 PM or 12 AM (midnight)
};

export type Pin = {
  id: string;
  createdAt: string;
  salespersonId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  total: number;
  paymentType: PaymentType;
  mpesaReceipt?: string;
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  status: PinStatus;
  notes?: string;
};

export type WarehouseStockItem = {
  productId: string;
  qty: number;
  batches?: StockBatch[];
  totalGiven?: number; // Total quantity given over time
  totalRestocked?: number; // Total quantity restocked over time
};

export type SalespersonStockItem = {
  salespersonId: string;
  productId: string;
  qty: number;
  batches?: StockBatch[];
  totalGiven?: number; // Total quantity given to this salesperson
  totalReceivedToday?: number; // Total quantity received today
};

export type StockBatch = {
  batchId: string;
  qty: number;
  timestamp: string;
  notes?: string;
};

export type StockRequest = {
  id: string;
  createdAt: string;
  salespersonId: string;
  productId: string;
  qty: number;
  status: StockRequestStatus;
  notes?: string;
};

export type WaitlistEntry = {
  id: string;
  createdAt: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  qty: number;
  status: WaitlistStatus;
  notes?: string;
};

export type SalespersonProfile = {
  salesperson: Salesperson;
  todayPins: number;
  todayRevenue: number;
  totalPins: number;
  totalRevenue: number;
  commissionEarned: number;
  commissionOwed: number; // Commission owed but not yet paid
  creditOutstanding: number;
  stockAllocations: SalespersonStockItem[];
  recentPins: Pin[];
  itemsSoldByProduct?: Array<{ productId: string; productName: string; qty: number; revenue: number }>;
  stockReceivedToday: number; // Total stock items received today
  merchandiseTypes?: string[]; // Types of products they're selling
};

export type CreatePinInput = {
  salespersonId: string;
  productId: string;
  qty: number;
  paymentType: PaymentType;
  mpesaReceipt?: string;
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  notes?: string;
};

export type AllocateStockInput = {
  salespersonId: string;
  productId: string;
  qty: number;
};

export type WarehouseRestockInput = {
  productId: string;
  qty: number;
  notes?: string;
};

export type CreateStockRequestInput = {
  salespersonId: string;
  productId: string;
  qty: number;
  notes?: string;
};

export type AddWaitlistInput = {
  productId: string;
  customerName: string;
  customerPhone: string;
  qty: number;
  notes?: string;
};

export type DbData = {
  products: Product[];
  salespeople: Salesperson[];
  pins: Pin[];
  warehouseStock: WarehouseStockItem[];
  salespersonStock: SalespersonStockItem[];
  stockRequests: StockRequest[];
  waitlist: WaitlistEntry[];
};

export type DashboardSummary = {
  todayPins: number;
  mpesaTotal: number;
  cashTotal: number;
  creditOutstanding: number;
  commissionOwed: number;
  unmatchedMpesa: number;
};