export const UserRole = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const CategoryScope = {
  DOMESTIC: 'domestic',
  INTERNATIONAL: 'international',
} as const;
export type CategoryScope = (typeof CategoryScope)[keyof typeof CategoryScope];

export const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductType = {
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  INJECTION: 'injection',
  SYRUP: 'syrup',
  CREAM: 'cream',
  SOLUTION: 'solution',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  scope: CategoryScope;
  description?: string;
  parentCategory?: string | ICategory;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITag {
  _id: string;
  name: string;
  slug: string;
  group?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPackaging {
  size?: string;
  type?: string;
  unitCount?: number;
}

export interface IPricing {
  currency?: string;
  salePrice?: number;
  mrp?: number;
  unitLabel?: string;
}

export interface IInventory {
  isInStock: boolean;
  stockQty: number;
}

export interface IImage {
  _id?: string;
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface IBrochure {
  url: string;
  publicId?: string;
}

export interface IAdditionalSpec {
  _id?: string;
  label: string;
  value: string;
}

export interface ISeo {
  title?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  genericName?: string;
  brandName?: string;
  category: ICategory | string;
  tags: (ITag | string)[];
  productType: ProductType;
  strength?: string;
  dosageForm?: string;
  composition?: string;
  packaging?: IPackaging;
  manufacturer?: string;
  countryOfOrigin?: string;
  treatment?: string;
  description?: string;
  prescriptionRequired: boolean;
  minOrderQuantity?: number;
  pricing?: IPricing;
  inventory?: IInventory;
  images: IImage[];
  brochure?: IBrochure;
  additionalSpecs: IAdditionalSpec[];
  seo?: ISeo;
  status: ProductStatus;
  publishedAt?: string;
  createdBy: string;
  updatedBy: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}
