
const WooCommerceRestApi =
  require("@woocommerce/woocommerce-rest-api").default;

function getMode() {
  return process.env.WOO_MODE === "live" ? "live" : "mock";
}

function createClient() {
  const url = process.env.WOO_URL;
  const consumerKey = process.env.WOO_CONSUMER_KEY;
  const consumerSecret = process.env.WOO_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    throw new Error(
      "Live WooCommerce credentials are not configured."
    );
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: "wc/v3",
    queryStringAuth: false
  });
}

function validateProduct(product) {
  const errors = [];

  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return ["A valid product object is required."];
  }

  if (!String(product.name ?? "").trim()) {
    errors.push("Product name is required.");
  }

  if (!String(product.sku ?? "").trim()) {
    errors.push("SKU is required.");
  }

  if (
    product.price === "" ||
    product.price === null ||
    product.price === undefined ||
    !Number.isFinite(Number(product.price)) ||
    Number(product.price) <= 0
  ) {
    errors.push("Price must be greater than zero.");
  }

  if (
    product.stock === "" ||
    product.stock === null ||
    product.stock === undefined ||
    !Number.isInteger(Number(product.stock)) ||
    Number(product.stock) < 0
  ) {
    errors.push("Stock must be a non-negative whole number.");
  }

  return errors;
}

function mapToWooCommerce(product) {
  return {
    name: String(product.name).trim(),
    type: "simple",
    status: product.status === "Active" ? "publish" : "draft",
    sku: String(product.sku).trim().toUpperCase(),
    regular_price: Number(product.price).toFixed(2),
    description: product.description || "",
    manage_stock: true,
    stock_quantity: Number(product.stock),
    attributes: [
      { name: "Color", visible: true, options: product.color ? [product.color] : [] },
      { name: "Size", visible: true, options: product.size ? [product.size] : [] },
      { name: "Material", visible: true, options: product.material ? [product.material] : [] }
    ].filter(attribute => attribute.options.length > 0)
  };
}

async function syncLiveProduct(product) {
  const client = createClient();
  const payload = mapToWooCommerce(product);

  // Search by SKU before deciding whether to create or update.
  const searchResponse = await client.get("products", {
    sku: payload.sku
  });

  const existing = searchResponse.data.find(
    item => item.sku?.toUpperCase() === payload.sku
  );

  if (existing) {
    const response = await client.put(
      `products/${existing.id}`,
      payload
    );

    return {
      action: "updated",
      externalId: response.data.id,
      mappedProduct: payload
    };
  }

  const response = await client.post("products", payload);

  return {
    action: "created",
    externalId: response.data.id,
    mappedProduct: payload
  };
}

module.exports = {
  getMode,
  validateProduct,
  mapToWooCommerce,
  syncLiveProduct
};
