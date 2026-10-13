
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Use an isolated data directory so tests never modify
// the demo catalog or synchronization history.
const testDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "productsync-test-")
);

process.env.WOO_MODE = "mock";
process.env.SYNC_DATA_DIR = testDirectory;

const app = require("../server");

const product = {
  name: "Test Running Shoes",
  sku: "TEST-SHOE-001",
  category: "Footwear",
  price: 1999,
  stock: 8,
  description: "Comfortable running shoes",
  color: "Black",
  size: "UK 8",
  material: "Mesh",
  status: "Active"
};

test("GET /api/health returns healthy status", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.mode, "mock");
});

test("POST /api/sync/product creates a product", async () => {
  const response = await request(app)
    .post("/api/sync/product")
    .send(product);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.result.action, "created");
});

test("POST /api/sync/product updates an existing SKU", async () => {
  const response = await request(app)
    .post("/api/sync/product")
    .send({ ...product, stock: 15 });

  assert.equal(response.status, 200);
  assert.equal(response.body.result.action, "updated");
});

test("POST /api/sync/product rejects invalid data", async () => {
  const response = await request(app)
    .post("/api/sync/product")
    .send({ ...product, price: -100 });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.result.status, "failed");
});

test("GET /api/sync/products returns the updated product", async () => {
  const response = await request(app).get("/api/sync/products");

  assert.equal(response.status, 200);
  assert.equal(response.body.products.length, 1);
  assert.equal(response.body.products[0].stock_quantity, 15);
});

test("GET /api/sync/history includes all attempts", async () => {
  const response = await request(app).get("/api/sync/history");

  assert.equal(response.status, 200);
  assert.equal(response.body.history.length, 3);
  assert.equal(
    response.body.history.filter(item => item.status === "failed").length,
    1
  );
});

test.after(() => {
  fs.rmSync(testDirectory, {
    recursive: true,
    force: true
  });
});
