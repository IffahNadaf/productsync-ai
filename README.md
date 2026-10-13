# ProductSync AI
### AI-Assisted Product Information Management System

**Kilowott Hackathon 2026 | PIM System Integration Challenge**

ProductSync AI is a web-based Product Information Management (PIM) application designed to simplify product catalog management, inventory monitoring, and e-commerce synchronization.

Built using **React, Vite, JavaScript, Node.js, and Express.js**, the application provides a centralized workspace for managing product information, identifying catalog inconsistencies, and preparing product data for WooCommerce integration.

The project demonstrates how automation and AI-inspired workflows can improve product data quality, reduce repetitive administrative tasks, and support efficient e-commerce operations.

---

## Problem Statement

E-commerce businesses often manage large product catalogs containing product names, descriptions, prices, stock quantities, categories, and attributes.

Maintaining accurate and consistent information can become challenging as catalogs grow. Common problems include:

- Missing or incomplete product descriptions
- Incorrect or inconsistent product attributes
- Low-stock inventory
- Incomplete product records
- Repetitive manual catalog validation
- Product synchronization challenges across platforms

**ProductSync AI addresses these challenges through centralized catalog management, automated auditing, and structured synchronization workflows.**

---

## Key Features

### 1. Interactive Dashboard
- Centralized overview of product catalog information
- Inventory and catalog health indicators
- Quick access to product management modules
- Clean and responsive user interface

### 2. Product Management
- Add new products
- View existing product records
- Edit product information
- Delete products
- Search and manage product listings
- Manage product prices, descriptions, and stock quantities

### 3. Categories & Attributes
- Create and manage product categories
- Organize products into appropriate categories
- Maintain product attributes such as color, size, and material
- Improve catalog organization and consistency

### 4. Inventory Management
- Monitor available stock quantities
- Identify low-stock products
- Track product inventory status
- Highlight products requiring attention

### 5. Automated Catalog Auditor
- Analyze product records for incomplete information
- Detect catalog quality issues
- Generate rule-based improvement suggestions
- Prioritize identified problems
- Support a human-in-the-loop approval workflow
- Revalidate product information after approved corrections

### 6. WooCommerce Synchronization Prototype
- Demonstrate product synchronization through backend REST APIs
- Create and update synchronized product records
- Maintain synchronization history
- Validate product data before synchronization
- Simulate WooCommerce integration using mock mode

**Note:** WooCommerce synchronization currently operates in mock mode. Live WooCommerce store integration is outside the demonstrated prototype.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Component-based user interface |
| Build Tool | Vite | Fast development and production builds |
| Programming Language | JavaScript | Frontend and backend application logic |
| Styling | CSS / Tailwind CSS | Responsive interface styling |
| Backend | Node.js | Server-side JavaScript runtime |
| API Framework | Express.js | REST API development |
| Data Storage | Browser LocalStorage | Client-side product and category persistence |
| Synchronization | Mock WooCommerce API workflow | Demonstration of product synchronization |
| Testing | Node.js Test Runner | Backend unit and integration testing |
| Version Control | Git & GitHub | Source code management |

---

## System Architecture

The application follows a frontend-backend architecture.

```text
                  ProductSync AI
                        |
                 React + Vite
                        |
          -----------------------------
          |             |             |
      Product       Inventory      Catalog
     Management     Management     Auditor
          |             |             |
          -----------------------------
                        |
              Product Data Storage
               (LocalStorage)
                        |
                Sync API Requests
                        |
                 Node.js + Express
                        |
              Mock WooCommerce Sync
                        |
            Sync Records & History
```

### Application Workflow

1. Users create and manage products through the React dashboard.
2. Product information is maintained in browser LocalStorage.
3. The inventory module monitors stock quantities.
4. The catalog auditor identifies incomplete or inconsistent records.
5. Suggested corrections are presented for user approval.
6. Approved changes are applied and revalidated.
7. Product records can be sent to the mock synchronization backend.
8. Synchronization results and history can be reviewed.

---

## Project Structure

```text
kilowatt/
|
|-- backend/
|   |-- server.js
|   |-- tests/
|   |-- package.json
|
|-- public/
|-- src/
|   |-- App.jsx
|   |-- main.jsx
|   |-- utils/
|
|-- index.html
|-- package.json
|-- vite.config.js
|-- README.md
```

The structure above highlights the main application files and directories.

---

## Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- A modern web browser
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/IffahNadaf/productsync-ai.git
cd productsync-ai
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Frontend

```bash
npm run dev
```

Open the local address displayed by Vite in your terminal.

### 4. Install Backend Dependencies

Open a separate terminal:

```bash
cd backend
npm install
```

### 5. Configure the Backend

Create a `.env` file inside the `backend` directory.

Configure the environment variables required by `server.js`, including:

```env
WOO_MODE=mock
```

Additional configuration may be required depending on the backend's current implementation.

### 6. Start the Backend

From the `backend` directory:

```bash
node server.js
```

Keep both the frontend and backend running while testing synchronization features.

---

## Testing

The backend uses Node.js's built-in test runner.

To run the API integration tests:

```bash
cd backend
node --test tests/api.test.js
```

**Verified result:** 6 API integration tests passed.

These tests cover:

- Backend health endpoint
- Product synchronization creation
- Existing product updates
- Invalid product data rejection
- Synchronized product retrieval
- Synchronization history retrieval

Additional unit tests and frontend workflows should be verified before final submission.

---

## AI-Assisted Workflow

ProductSync AI incorporates an automated catalog analysis workflow inspired by agent-based problem-solving.

The workflow consists of:

1. **Observation:** Inspect product records.
2. **Analysis:** Detect missing or inconsistent information.
3. **Recommendation:** Generate structured correction suggestions.
4. **Approval:** Allow users to review proposed modifications.
5. **Execution:** Apply approved corrections.
6. **Verification:** Revalidate updated product information.

The current catalog auditor is primarily rule-based. It does not claim autonomous LLM reasoning or independent AI tool calling.

This approach provides a practical foundation for future integration with intelligent AI agents.

---

## Future Enhancements

- Live WooCommerce REST API integration
- LLM-powered catalog management agent
- AI-generated product descriptions
- Automated product categorization
- Advanced inventory forecasting
- Duplicate product detection
- Database-backed product storage
- Multi-store synchronization
- Role-based access control

---

## Scope and Limitations

ProductSync AI was developed as a functional hackathon prototype.

Current limitations include:

- Product and category data are stored locally in the browser.
- WooCommerce synchronization is demonstrated using mock mode.
- The catalog auditor uses predefined validation rules.
- Live multi-user collaboration is not implemented.
- Production authentication and deployment are not included in the verified scope.

These limitations define the current MVP and provide opportunities for future development.

---

## Developer

**Iffah Malik Nadaf**

Electronics and Computer Engineering  
Padre Conceição College of Engineering, Goa

**GitHub:** https://github.com/IffahNadaf

**Project Repository:** https://github.com/IffahNadaf/productsync-ai

---

## Hackathon

**Event:** Kilowott Hackathon 2026  
**Challenge:** PIM System Integration  
**Project:** ProductSync AI

*Simplifying product information. Improving catalog quality. Streamlining e-commerce operations.*