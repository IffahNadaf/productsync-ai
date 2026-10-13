
export const AUDIT_RULES = [
  {
    id: "missing_name",
    severity: "high",
    message: "Product name is missing",
    check: p => !p.name?.trim(),
    recommendation: "Add a descriptive product name."
  },
  {
    id: "missing_sku",
    severity: "high",
    message: "Product SKU is missing",
    check: p => !p.sku?.trim(),
    recommendation: "Assign a unique SKU before synchronization."
  },
  {
    id: "invalid_price",
    severity: "high",
    message: "Product price is invalid",
    check: p =>
      p.price === "" ||
      p.price === null ||
      p.price === undefined ||
      !Number.isFinite(Number(p.price)) ||
      Number(p.price) <= 0,
    recommendation: "Set a valid price greater than zero."
  },
  {
    id: "invalid_stock",
    severity: "high",
    message: "Stock quantity is invalid",
    check: p =>
      p.stock === "" ||
      p.stock === null ||
      p.stock === undefined ||
      !Number.isInteger(Number(p.stock)) ||
      Number(p.stock) < 0,
    recommendation: "Enter a non-negative whole-number stock quantity."
  },
  {
    id: "missing_category",
    severity: "medium",
    message: "Category is missing",
    check: p => !p.category?.trim(),
    recommendation: "Assign a suitable product category."
  },
  {
    id: "missing_description",
    severity: "medium",
    message: "Product description is missing",
    check: p => !p.description?.trim(),
    recommendation: "Add a clear description using the product's attributes."
  },
  {
    id: "missing_color",
    severity: "low",
    message: "Color attribute is missing",
    check: p => !p.color?.trim(),
    recommendation: "Specify the product color if applicable."
  },
  {
    id: "missing_material",
    severity: "low",
    message: "Material attribute is missing",
    check: p => !p.material?.trim(),
    recommendation: "Specify the product material if applicable."
  },
  {
    id: "out_of_stock",
    severity: "medium",
    message: "Product is out of stock",
    check: p => Number(p.stock) === 0,
    recommendation: "Review inventory before restocking."
  },
  {
    id: "low_stock",
    severity: "low",
    message: "Product stock is running low",
    check: p => Number(p.stock) > 0 && Number(p.stock) <= 5,
    recommendation: "Consider replenishing inventory."
  }
];

const SEVERITY_WEIGHTS = {
  high: 10,
  medium: 5,
  low: 2
};

export function auditCatalog(products) {
  const issues = [];

  const skuCounts = new Map();

  for (const product of products) {
    const sku = String(product.sku ?? "").trim().toUpperCase();

    if (sku) {
      skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
    }
  }

  for (const product of products) {
    for (const rule of AUDIT_RULES) {
      if (rule.check(product)) {
        issues.push({
          id: `${product.id}-${rule.id}`,
          productId: product.id,
          productName: product.name || "Unnamed Product",
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          recommendation: rule.recommendation
        });
      }
    }

    const sku = String(product.sku ?? "").trim().toUpperCase();

    if (sku && skuCounts.get(sku) > 1) {
      issues.push({
        id: `${product.id}-duplicate_sku`,
        productId: product.id,
        productName: product.name || "Unnamed Product",
        ruleId: "duplicate_sku",
        severity: "high",
        message: `Duplicate SKU: ${sku}`,
        recommendation: "Assign a unique SKU to this product."
      });
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };

  issues.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const totalPenalty = issues.reduce(
    (sum, issue) => sum + SEVERITY_WEIGHTS[issue.severity],
    0
  );

  const maximumScore = products.length * 100;

  const qualityScore = products.length === 0
    ? 100
    : Math.max(
        0,
        Math.round(
          ((maximumScore - totalPenalty) / maximumScore) * 100
        )
      );

  return {
    productsScanned: products.length,
    issues,
    totalIssues: issues.length,
    highIssues: issues.filter(i => i.severity === "high").length,
    mediumIssues: issues.filter(i => i.severity === "medium").length,
    lowIssues: issues.filter(i => i.severity === "low").length,
    qualityScore
  };
}

export function suggestCorrection(product, issue) {
  if (issue.ruleId === "missing_description") {
    const parts = [
      product.name,
      product.color,
      product.material,
      product.category
    ].filter(Boolean);

    return {
      field: "description",
      value: parts.join(" - "),
      explanation: "Drafted from existing product information."
    };
  }

  return null;
}
