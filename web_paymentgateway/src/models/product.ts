export type ProductCategory = "Makanan" | "Minuman";

export interface ProductSchema {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: ProductCategory;
  isActive: boolean;
}

export const productSchemaFields: Record<keyof ProductSchema, string> = {
  name: "string",
  description: "string",
  price: "number",
  stock: "number",
  image: "string",
  category: "string",
  isActive: "boolean",
};