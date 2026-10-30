import express from "express";
import { body } from "express-validator";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();

const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Please provide a valid email."),
  body("comment").trim().notEmpty().withMessage("Message is required."),
  body("phone").optional({ values: "null" }).trim(),
  body("orderId").optional({ values: "null" }).trim(),
];

router.post("/", contactValidation, sendContactMessage);

export default router;
