import api from "@/lib/api/client";
import {
  CategoriesApiResponse,
  Category,
  SingleCategoryApiResponse,
} from "@/types/category.types";

// ─── Why no parsePayload helper? ──────────────────────────────────────────────
// Axios already parses the JSON response body into response.data before this
// code ever runs. The API always returns:
//   { status: "success", data: <payload> }
// So we validate the envelope shape directly — no string-parsing needed.
// If the API ever changes to return a raw string body, that belongs in the
// Axios instance's transformResponse config, not scattered across services.

// ─── Internal guard ───────────────────────────────────────────────────────────

/**
 * Throws a descriptive error if the API envelope signals failure.
 * This catches both network-level errors (Axios throws before we get here)
 * and application-level errors (status !== "success" from a 200 response).
 */
function assertSuccess(status: string, context: string): void {
  if (status !== "success") {
    throw new Error(
      `[CategoryService] ${context}: API returned status "${status}"`,
    );
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const CategoryService = {
  /**
   * GET /categories
   * Returns all active categories with their product counts.
   *
   * API contract:
   *   { status: "success", data: Category[] }
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<CategoriesApiResponse>("/categories");
    const body = response.data;

    // Guard: API envelope must signal success
    assertSuccess(body.status, "getCategories");

    // Guard: data must be an array (catches accidental null/object from server)
    if (!Array.isArray(body.data)) {
      console.warn(
        "[CategoryService.getCategories] Expected array in data, got:",
        typeof body.data,
      );
      return [];
    }

    return body.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    if (!slug) {
      throw new Error("[CategoryService.getCategoryBySlug] slug is required");
    }

    const response = await api.get<SingleCategoryApiResponse>(
      `/category/${encodeURIComponent(slug)}`,
    );
    const body = response.data;

    // Guard: API envelope must signal success
    assertSuccess(body.status, `getCategoryBySlug("${slug}")`);

    // Guard: data must be a non-null object
    if (!body.data || typeof body.data !== "object") {
      throw new Error(
        `[CategoryService.getCategoryBySlug] No category data returned for slug "${slug}"`,
      );
    }

    return body.data;
  },
};
