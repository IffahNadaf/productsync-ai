
const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = process.env.SYNC_DATA_DIR
  ? path.resolve(process.env.SYNC_DATA_DIR)
  : path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "sync-data.json");

function defaultData() {
  return {
    products: [],
    history: []
  };
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return defaultData();
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.products) || !Array.isArray(data.history)) {
    throw new Error("Invalid synchronization data file.");
  }

  return data;
}

function writeData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const temporaryFile = `${DATA_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  fs.renameSync(temporaryFile, DATA_FILE);
}

module.exports = {
  readData,
  writeData
};
