import api from "@/lib/api/client";
import { Category } from "@/types/category.types";

export const CategoryService = {
  /**
   * Fetch all categories
   * Endpoint: GET http://192.168.29.213:8080/api/v1/categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[] | { data: Category[] }>(
      "/categories",
    );

    // Handles both direct array responses and wrapped `{ data: [] }` responses
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },

  /**
   * Fetch category details by ID
   * Endpoint: GET http://192.168.29.213:8080/api/v1/categories/:id
   */
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<Category | { data: Category }>(
      `/categories/${id}`,
    );
    return "data" in response.data && !("id" in response.data)
      ? response.data.data
      : (response.data as Category);
  },

  /**
   * Fetch category details or products by slug
   * Endpoint: GET http://192.168.29.213:8080/api/v1/categories/:slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<Category | { data: Category }>(
      `/categories/${slug}`,
    );
    return "data" in response.data && !("id" in response.data)
      ? response.data.data
      : (response.data as Category);
  },
};
