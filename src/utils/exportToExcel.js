/**
 * exportToExcel – converts arrays of objects to a multi-sheet Excel workbook
 * and triggers an immediate browser download.
 *
 * Usage (single sheet):
 *   exportToExcel([{ name: "Products", data: productsArray }], "products.xlsx");
 *
 * Usage (multi-sheet):
 *   exportToExcel(
 *     [
 *       { name: "Products", data: productsArray },
 *       { name: "Orders",   data: ordersArray   },
 *     ],
 *     "dashboard-export.xlsx",
 *   );
 */

/**
 * @param {Array<{ name: string, data: object[] }>} sheets
 * @param {string} [filename]
 */
export async function exportToExcel(sheets, filename = "export.xlsx") {
  // Dynamically import exceljs so it is NOT included in the initial JS bundle.
  // It is only downloaded the first time the user clicks Export.
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  const sanitizeExcelString = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return /^[=+\-@]/.test(value) ? `'${value}` : value;
  };

  const normalizeSheetName = (name, index) => {
    const fallback = `Sheet ${index + 1}`;
    const value = String(name || fallback).trim() || fallback;
    const sanitized = value.replace(/[\[\]:*?/\\]/g, "_");
    const normalized = sanitized.trim() || fallback;
    return normalized.slice(0, 31);
  };

  const usedSheetNames = new Set();

  const getUniqueSheetName = (name, index) => {
    const baseName = normalizeSheetName(name, index);
    const baseKey = baseName.toLowerCase();

    if (!usedSheetNames.has(baseKey)) {
      usedSheetNames.add(baseKey);
      return baseName;
    }

    let suffixIndex = 2;

    while (true) {
      const suffix = ` (${suffixIndex})`;
      const maxBaseLength = 31 - suffix.length;
      const candidateBase = baseName.slice(0, Math.max(maxBaseLength, 0));
      const candidate = `${candidateBase}${suffix}`;
      const candidateKey = candidate.toLowerCase();

      if (!usedSheetNames.has(candidateKey)) {
        usedSheetNames.add(candidateKey);
        return candidate;
      }

      suffixIndex += 1;
    }
  };

  const toCellValue = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "bigint") {
      const asNumber = Number(value);
      return Number.isFinite(asNumber) ? asNumber : String(value);
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (value === null || value === undefined) {
      return "";
    }

    return sanitizeExcelString(String(value));
  };

  (Array.isArray(sheets) ? sheets : []).forEach(
    ({ name, data }, sheetIndex) => {
      const worksheet = workbook.addWorksheet(
        getUniqueSheetName(name, sheetIndex),
      );

      if (!Array.isArray(data) || data.length === 0) {
        worksheet.addRow(["No data available"]);
        worksheet.columns = [{ width: 18 }];
        return;
      }

      const headers = Object.keys(data[0] || {});
      worksheet.addRow(headers);

      const widths = headers.map((header) =>
        Math.max(String(header).length + 2, 14),
      );

      data.forEach((row) => {
        const rowValues = headers.map((header, colIndex) => {
          const cellValue = toCellValue(row?.[header]);
          const displayLength = String(cellValue ?? "").length;
          widths[colIndex] = Math.max(
            widths[colIndex],
            Math.min(displayLength + 2, 60),
          );
          return cellValue;
        });

        worksheet.addRow(rowValues);
      });

      worksheet.columns = headers.map((header, index) => ({
        key: header,
        width: widths[index],
      }));
    },
  );

  const fileBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([fileBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const normalizedFilename = (() => {
    const raw = String(filename ?? "").trim();
    const safe = raw || "export.xlsx";
    return /\.xlsx$/i.test(safe) ? safe : `${safe}.xlsx`;
  })();

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = normalizedFilename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

// ─── Formatter helpers ─────────────────────────────────────────────────────

/** Flatten a products array into export-friendly rows */
export function formatProductsForExport(products) {
  return products.map((p) => ({
    ID: p._id,
    SKU: p.sku || "",
    Name: p.name,
    Category: p.category,
    "Cost Price (PKR)": p.costPrice ?? "",
    "Price (PKR)": p.price,
    Stock: p.stock,
    Rating: p.rating ?? 0,
    Reviews: p.numReviews ?? 0,
    Active: p.isActive ? "Yes" : "No",
    "Created At": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
  }));
}

/** Flatten an orders array into export-friendly rows */
export function formatOrdersForExport(orders) {
  const formatBatchAllocations = (item) => {
    const allocations = Array.isArray(item?.batchAllocations)
      ? item.batchAllocations
      : [];

    if (allocations.length === 0) {
      return "—";
    }

    return allocations
      .map(
        (allocation) =>
          `${allocation.batchNumber || "Unknown"}: ${Number(allocation.quantity || 0)}`,
      )
      .join(" | ");
  };

  return orders.flatMap((o) => {
    const items = Array.isArray(o.orderItems) ? o.orderItems : [];
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const shippingCost = Number(o.shippingPrice || 0);
    const taxAmount = Number(o.taxPrice || 0);
    const totalOrderValue = Number(o.totalPrice ?? o.total ?? 0);
    const discountApplied = Math.max(
      subtotal + shippingCost + taxAmount - totalOrderValue,
      0,
    );

    const baseRow = {
      "Order ID": o._id,
      "Customer Name": o.user?.name || "—",
      "Customer Email": o.user?.email || "—",
      "Total Order Value (PKR)": totalOrderValue,
      "Payment Status": o.isPaid ? "Paid" : "Unpaid",
      "Order Status": o.status || "pending",
      "Discount Applied (PKR)": discountApplied,
      "Shipping Cost (PKR)": shippingCost,
      "Payment Method": o.paymentMethod || "—",
      "Placed At": o.createdAt
        ? new Date(o.createdAt).toLocaleDateString()
        : "",
    };

    if (items.length === 0) {
      return [
        {
          ...baseRow,
          "Product Name": "—",
          Quantity: 0,
          "Price Per Item (PKR)": 0,
          "Batch Allocations": "—",
        },
      ];
    }

    return items.map((item, index) => ({
      ...baseRow,
      "Total Order Value (PKR)": index === 0 ? totalOrderValue : "",
      "Product Name": item.name || item.product?.name || "—",
      Quantity: Number(item.quantity || 0),
      "Price Per Item (PKR)": Number(item.price || 0),
      "Batch Allocations": formatBatchAllocations(item),
    }));
  });
}

/** Flatten a users array into export-friendly rows */
export function formatUsersForExport(users) {
  return users.map((u) => ({
    ID: u._id,
    "First Name": u.firstName || (u.name ? u.name.split(" ")[0] : ""),
    "Last Name":
      u.lastName || (u.name ? u.name.split(" ").slice(1).join(" ") : ""),
    Email: u.email,
    Role: u.role,
    "Joined At": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
  }));
}

/** Flatten a categories array into export-friendly rows */
export function formatCategoriesForExport(categories) {
  return categories.map((c) => ({
    ID: c._id,
    Name: c.name,
    Value: c.value,
    Description: c.description || "",
    Active: c.isActive ? "Yes" : "No",
  }));
}
