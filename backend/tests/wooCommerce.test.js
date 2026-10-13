
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateProduct,
  mapToWooCommerce
} = require("../services/wooCommerce");

const product = {
  name: "Classic Denim Jacket",
  sku: "JKT-001",
  category: "Clothing",
  price: 2499,
  stock: 12,
  description: "Blue denim jacket",
  color: "Blue",
  size: "M",
  material: "Cotton",
  status: "Active"
};

test("Valid product passes validation", () => {
  assert.deepEqual(validateProduct(product), []);
});

test("Missing SKU is rejected", () => {
  assert.ok(
    validateProduct({ ...product, sku: "" }).length > 0
  );
});

test("Negative price is rejected", () => {
  assert.ok(
    validateProduct({ ...product, price: -100 }).length > 0
  );
});

test("Negative stock is rejected", () => {
  assert.ok(
    validateProduct({ ...product, stock: -5 }).length > 0
  );
});

test("Fractional stock is rejected", () => {
  assert.ok(
    validateProduct({ ...product, stock: 2.5 }).length > 0
  );
});

test("WooCommerce price mapping is correct", () => {
  const mapped = mapToWooCommerce(product);

  assert.equal(mapped.regular_price, "2499.00");
  assert.equal(mapped.sku, "JKT-001");
});

test("Active products are published", () => {
  const mapped = mapToWooCommerce(product);

  assert.equal(mapped.status, "publish");
});

test("Product attributes are mapped", () => {
  const mapped = mapToWooCommerce(product);

  assert.ok(
    mapped.attributes.some(
      a => a.name === "Color" && a.options.includes("Blue")
    )
  );
});
