
const express = require("express");
const cors = require("cors");
const crypto = require("node:crypto");
require("dotenv").config();

const { readData, writeData } = require("./services/storage");
const {
  getMode,
  validateProduct,
  mapToWooCommerce,
  syncLiveProduct
} = require("./services/wooCommerce");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

// Prevent simultaneous sync requests from overwriting stored history.
let syncInProgress = false;

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "ProductSync AI Backend",
    mode: getMode(),
    message: "API server is running"
  });
});

app.post("/api/sync/product", async (req, res) => {
  if (syncInProgress) {
    return res.status(409).json({
      success: false,
      message: "Another synchronization is in progress. Please retry."
    });
  }

  syncInProgress = true;

  try {
    const product = req.body;
    const errors = validateProduct(product);
    const mode = getMode();
    const timestamp = new Date().toISOString();

    if (errors.length > 0) {
      const result = {
        id: crypto.randomUUID(),
        timestamp,
        sku: product?.sku || "Unknown",
        status: "failed",
        mode,
        errors
      };

      const data = readData();
      data.history.unshift(result);
      writeData(data);

      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        result
      });
    }

    const sku = String(product.sku).trim().toUpperCase();
    const payload = mapToWooCommerce(product);

    let action;
    let externalId;

    if (mode === "live") {
      const response = await syncLiveProduct(product);

      action = response.action;
      externalId = response.externalId;
    } else {
      // MOCK MODE: no request is sent to WooCommerce.
      const data = readData();
      const existing = data.products.find(p => p.sku === sku);

      action = existing ? "updated" : "created";
      externalId = existing?.mockId || `mock_${sku}`;

      const record = {
        mockId: externalId,
        ...payload
      };

      if (existing) {
        data.products = data.products.map(p =>
          p.sku === sku ? record : p
        );
      } else {
        data.products.push(record);
      }

      // Save mock product before recording the sync result.
      writeData(data);
    }

    const result = {
      id: crypto.randomUUID(),
      timestamp,
      sku,
      status: "success",
      action,
      mode,
      externalId,
      message: `Product ${action} in ${
        mode === "live" ? "WooCommerce" : "mock WooCommerce store"
      }`
    };

    const data = readData();
    data.history.unshift(result);
    writeData(data);

    return res.json({
      success: true,
      message: result.message,
      result,
      mappedProduct: payload
    });

  } catch (error) {
    console.error("Synchronization error:", error.message);

    const mode = getMode();

    // Do not expose credentials or raw remote errors to the browser.
    const result = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sku: req.body?.sku || "Unknown",
      status: "failed",
      mode,
      errors: [
        mode === "live"
          ? "WooCommerce synchronization failed. Check backend logs."
          : "Synchronization failed. Check backend logs."
      ]
    };

    try {
      const data = readData();
      data.history.unshift(result);
      writeData(data);
    } catch (storageError) {
      console.error("History storage error:", storageError.message);
    }

    return res.status(500).json({
      success: false,
      message: result.errors[0],
      result
    });

  } finally {
    syncInProgress = false;
  }
});

app.get("/api/sync/history", (req, res) => {
  try {
    const data = readData();

    res.json({
      success: true,
      mode: getMode(),
      history: data.history
    });
  } catch (error) {
    console.error("History read error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not load synchronization history."
    });
  }
});

app.get("/api/sync/products", (req, res) => {
  try {
    const data = readData();

    res.json({
      success: true,
      mode: getMode(),
      products: getMode() === "mock" ? data.products : []
    });
  } catch (error) {
    console.error("Product read error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not load mock products."
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `ProductSync AI Backend running on http://localhost:${PORT}`
    );
    console.log(
      `WooCommerce integration mode: ${getMode().toUpperCase()}`
    );
  });
}

module.exports = app;
