const express = require("express");
const {
  createOrUpdateSale,
  confirmSale,
  getUserSales,
  getSales,
} = require("../controllers/saleController");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.post(
  "/create",
  authenticateToken,
  upload.single("file"),
  createOrUpdateSale
);
router.post("/confirm", authenticateToken, confirmSale);
router.get("/user-sales", authenticateToken, getUserSales);
router.get("/sales", authenticateToken, getSales);

module.exports = router;
