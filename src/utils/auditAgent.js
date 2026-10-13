
import {
  auditCatalog,
  suggestCorrection
} from "./catalogAudit";

export function createAuditPlan(products) {
  const audit = auditCatalog(products);

  const actions = audit.issues.map(issue => {
    const product = products.find(
      p => p.id === issue.productId
    );

    const correction = product
      ? suggestCorrection(product, issue)
      : null;

    return {
      id: issue.id,
      productId: issue.productId,
      productName: issue.productName,
      severity: issue.severity,
      problem: issue.message,
      recommendation: issue.recommendation,
      correction,
      requiresApproval: true,
      status: correction ? "ready_for_review" : "manual_review"
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    qualityScore: audit.qualityScore,
    totalIssues: audit.totalIssues,
    actions,
    automaticallyFixable: actions.filter(
      action => action.correction !== null
    ).length,
    manualReview: actions.filter(
      action => action.correction === null
    ).length
  };
}

export function applyApprovedAction(products, action) {
  if (!action?.correction) {
    throw new Error("This action requires manual correction.");
  }

  const { field, value } = action.correction;

  const allowedFields = ["description"];

  if (!allowedFields.includes(field)) {
    throw new Error("This correction is not permitted.");
  }

  const product = products.find(
    p => p.id === action.productId
  );

  if (!product) {
    throw new Error("Product no longer exists.");
  }

  // Recompute the suggestion against current product data.
  // Reject stale plans rather than overwriting newer edits.
  const freshPlan = createAuditPlan(products);
  const freshAction = freshPlan.actions.find(
    item => item.id === action.id
  );

  if (
    !freshAction?.correction ||
    freshAction.correction.field !== field ||
    freshAction.correction.value !== value
  ) {
    throw new Error(
      "The product changed. Run the audit again."
    );
  }

  const updatedProducts = products.map(p =>
    p.id === action.productId
      ? {
          ...p,
          [field]: value,
          syncStatus: "Not synced"
        }
      : p
  );

  return {
    products: updatedProducts,
    updatedAudit: auditCatalog(updatedProducts)
  };
}
