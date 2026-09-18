const express = require("express");
const controller = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.post("/doctors", controller.createDoctor);
router.get("/doctors", controller.listDoctors);
router.get("/doctors/:id", controller.getDoctor);
router.patch("/doctors/:id", controller.updateDoctor);

router.post("/availability", controller.createAvailability);
router.patch("/availability/:id", controller.updateAvailability);
router.get("/availability", controller.listAvailability);

router.post("/breaks", controller.createBreak);
router.get("/breaks", controller.listBreaks);

router.get("/patients", controller.listPatients);

router.get("/appointments", controller.listAppointments);

module.exports = router;
