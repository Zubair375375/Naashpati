import { jest } from "@jest/globals";
import mongoose from "mongoose";

const Product = {
  find: jest.fn(),
};

const ProductMetric = {
  find: jest.fn(),
};

jest.unstable_mockModule("../models/Product.js", () => ({
  default: Product,
}));

jest.unstable_mockModule("../models/ProductMetric.js", () => ({
  default: ProductMetric,
}));

const { getCollectionBestsellerProductIds } =
  await import("../controllers/productController.js");

describe("productController collection bestseller filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses sales metrics to choose bestseller products in a collection", async () => {
    const idA = new mongoose.Types.ObjectId();
    const idB = new mongoose.Types.ObjectId();

    Product.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: idA }, { _id: idB }]),
      }),
    });
    ProductMetric.find.mockReturnValue({
      distinct: jest.fn().mockResolvedValue([idA]),
    });

    const result = await getCollectionBestsellerProductIds({
      isActive: true,
      status: { $ne: "draft" },
      productCollection: "male",
    });

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      status: { $ne: "draft" },
      productCollection: "male",
    });

    expect(ProductMetric.find).toHaveBeenCalledWith({
      productId: { $in: [idA, idB] },
      totalSales: { $gte: 2 },
    });

    expect(result).toEqual([String(idA)]);
  });

  test("returns an empty result when a gender collection has no valid bestseller sales", async () => {
    const idA = new mongoose.Types.ObjectId();

    Product.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: idA }]),
      }),
    });
    ProductMetric.find.mockReturnValue({
      distinct: jest.fn().mockResolvedValue([]),
    });

    const result = await getCollectionBestsellerProductIds({
      productCollection: "female",
    });

    expect(result).toEqual([]);
  });
});
