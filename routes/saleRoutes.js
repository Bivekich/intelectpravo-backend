const express = require("express");
const {
  createOrUpdateSale,
  confirmSale,
  getUserSales,
  getUserBoughts,
  getUserSelled,
  buyUserSales,
  markPaid,
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
router.get("/user-buy", authenticateToken, buyUserSales);
router.get("/user-markPaid", authenticateToken, markPaid);
router.get("/user-sales", authenticateToken, getUserSales);
router.get("/user-boughts", authenticateToken, getUserBoughts);
router.get("/user-selled", authenticateToken, getUserSelled);
router.get("/sales", authenticateToken, getSales);

module.exports = router;
