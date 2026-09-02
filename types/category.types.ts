export interface Product {
  id: number;
  // Add product fields as your backend provides them
  [key: string]: any;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  img_path: string;
  parent_category: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  products: Product[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
}
