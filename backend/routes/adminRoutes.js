import express from "express";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";
import verifyAdmin from "../middlewares/admin-middleware.js";
import AdminController from "../controllers/adminController.js";

const router = express.Router();

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);
router.use(verifyAdmin);

router.get("/test", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Admin access granted",
  });
});

// Dashboard
router.get("/stats", AdminController.getDashboardStats);
router.get("/activity", AdminController.getRecentActivity);

// User Management
router.get("/users", AdminController.getUsers);
router.get("/users/:id", AdminController.getUserDetails);
router.post("/users/:id/ban", AdminController.banUser);
router.post("/users/:id/unban", AdminController.unbanUser);

// Tutor Management
router.get("/tutors/pending", AdminController.getPendingTutors);
router.get("/tutors/active", AdminController.getActiveTutors);
router.post("/tutors/:id/verify", AdminController.verifyTutor);
router.post("/tutors/:id/reject", AdminController.rejectTutor);
router.post("/tutors/:id/demote", AdminController.demoteTutor);

// Assignments
router.get("/assignments", AdminController.getAssignments);
router.get("/assignments/:id", AdminController.getAssignmentDetails);
router.post("/assignments/:id/delete", AdminController.deleteAssignment);
router.post("/assignments/:id/force-cancel", AdminController.forceCancelAssignment);

// Finance
router.get("/transactions", AdminController.getTransactions);
router.get("/withdrawals", AdminController.getWithdrawalRequests);
router.post("/withdrawals/:id/process", AdminController.processWithdrawal);

// Disputes
router.get("/disputes", AdminController.getDisputes);
router.get("/disputes/:id", AdminController.getDisputeDetails);
router.post("/disputes/:id/resolve", AdminController.resolveDispute);

export default router;
