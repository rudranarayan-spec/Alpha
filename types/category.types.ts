// ─── Product ──────────────────────────────────────────────────────────────────
// All price fields come from the API as decimal strings ("2352.00") — keep as
// string to avoid floating-point drift. Parse only when displaying or computing.

export interface Product {
  id: number;
  category_id: number;
  hsn: string;
  product_name: string;
  slug: string;
  image: string;
  description: string;
  pack_size: string;
  stock: number;
  mrp: string;
  cost_price: string;
  selling_price: string;
  vat: number;
  /** API returns "1" for active, "0" for inactive */
  status: "1" | "0" | string;
  created_at: string;
  updated_at: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  title: string;
  slug: string;
  img_path: string;
  parent_category?: number | null;
  /** API returns "1" for active, "0" for inactive */
  status: "1" | "0" | string;
  created_at: string;
  updated_at: string;
  /** Present on GET /categories (list endpoint) */
  products_count?: number;
  /** Present on GET /category/:slug (single endpoint) */
  products?: Product[];
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface CategoriesApiResponse {
  status: "success" | "error" | string;
  data: Category[];
}

export interface SingleCategoryApiResponse {
  status: "success" | "error" | string;
  data: Category;
}

/** Shape returned when the API sends an error */
export interface ApiErrorResponse {
  status: "error" | string;
  message?: string;
}
