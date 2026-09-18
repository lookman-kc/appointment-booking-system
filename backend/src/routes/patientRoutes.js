const express = require("express");
const controller = require("../controllers/patientController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("patient"));

router.get("/doctors", controller.listDoctors);
router.get("/doctors/:doctorId/slots", controller.listSlots);

router.post("/appointments", controller.bookAppointment);
router.get("/appointments", controller.listAppointments);
router.patch("/appointments/:id/cancel", controller.cancelAppointment);

module.exports = router;
