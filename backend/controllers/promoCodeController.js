import PromoCode from "../models/PromoCode.js";

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const isWithinValidityWindow = (promoCodeDoc, now = new Date()) => {
  if (!promoCodeDoc?.isActive) {
    return false;
  }

  const startsAt = promoCodeDoc.validFrom
    ? new Date(promoCodeDoc.validFrom)
    : null;
  const endsAt = promoCodeDoc.validUntil
    ? new Date(promoCodeDoc.validUntil)
    : null;

  if (startsAt && now < startsAt) {
    return false;
  }

  if (endsAt && now > endsAt) {
    return false;
  }

  return true;
};

const serializePromoCode = (doc) => ({
  _id: doc._id,
  code: doc.code,
  discountPercent: Number(doc.discountPercent || 0),
  isActive: Boolean(doc.isActive),
  validFrom: doc.validFrom || null,
  validUntil: doc.validUntil || null,
  notes: doc.notes || "",
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: promoCodes.map(serializePromoCode),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch promo codes",
    });
  }
};

export const createPromoCode = async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code);
    const discountPercent = Number(req.body?.discountPercent);
    const notes = String(req.body?.notes || "").trim();
    const isActive = req.body?.isActive !== false;
    const validFrom = req.body?.validFrom ? new Date(req.body.validFrom) : null;
    const validUntil = req.body?.validUntil
      ? new Date(req.body.validUntil)
      : null;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, error: "Promo code is required" });
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent > 100
    ) {
      return res.status(400).json({
        success: false,
        error: "Discount percent must be between 0.01 and 100",
      });
    }

    if (validFrom && validUntil && validFrom > validUntil) {
      return res.status(400).json({
        success: false,
        error: "Valid from date cannot be after valid until date",
      });
    }

    const existing = await PromoCode.findOne({ code });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Promo code already exists" });
    }

    const created = await PromoCode.create({
      code,
      discountPercent,
      isActive,
      validFrom,
      validUntil,
      notes,
    });

    return res
      .status(201)
      .json({ success: true, data: serializePromoCode(created) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to create promo code",
    });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res
        .status(404)
        .json({ success: false, error: "Promo code not found" });
    }

    if (typeof req.body?.code !== "undefined") {
      const nextCode = normalizeCode(req.body.code);
      if (!nextCode) {
        return res
          .status(400)
          .json({ success: false, error: "Promo code cannot be empty" });
      }

      const duplicate = await PromoCode.findOne({
        code: nextCode,
        _id: { $ne: promoCode._id },
      });
      if (duplicate) {
        return res
          .status(409)
          .json({ success: false, error: "Promo code already exists" });
      }

      promoCode.code = nextCode;
    }

    if (typeof req.body?.discountPercent !== "undefined") {
      const nextPercent = Number(req.body.discountPercent);
      if (
        !Number.isFinite(nextPercent) ||
        nextPercent <= 0 ||
        nextPercent > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "Discount percent must be between 0.01 and 100",
        });
      }
      promoCode.discountPercent = nextPercent;
    }

    if (typeof req.body?.isActive !== "undefined") {
      promoCode.isActive = Boolean(req.body.isActive);
    }

    if (typeof req.body?.notes !== "undefined") {
      promoCode.notes = String(req.body.notes || "").trim();
    }

    if (typeof req.body?.validFrom !== "undefined") {
      promoCode.validFrom = req.body.validFrom
        ? new Date(req.body.validFrom)
        : null;
    }

    if (typeof req.body?.validUntil !== "undefined") {
      promoCode.validUntil = req.body.validUntil
        ? new Date(req.body.validUntil)
        : null;
    }

    if (
      promoCode.validFrom &&
      promoCode.validUntil &&
      promoCode.validFrom > promoCode.validUntil
    ) {
      return res.status(400).json({
        success: false,
        error: "Valid from date cannot be after valid until date",
      });
    }

    await promoCode.save();

    return res.json({ success: true, data: serializePromoCode(promoCode) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update promo code",
    });
  }
};

export const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res
        .status(404)
        .json({ success: false, error: "Promo code not found" });
    }

    await promoCode.deleteOne();

    return res.json({ success: true, message: "Promo code deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete promo code",
    });
  }
};

export const validatePromoCode = async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code || req.query?.code);
    const subtotal = Number(req.body?.subtotal ?? req.query?.subtotal ?? 0);

    if (!code) {
      return res
        .status(400)
        .json({ success: false, error: "Promo code is required" });
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Subtotal is invalid" });
    }

    const promoCode = await PromoCode.findOne({ code });

    if (!promoCode || !isWithinValidityWindow(promoCode)) {
      return res.status(404).json({
        success: false,
        error: "Promo code is invalid or inactive",
      });
    }

    const discountRate = Number(promoCode.discountPercent || 0) / 100;
    const discountAmount = Number((subtotal * discountRate).toFixed(2));

    return res.json({
      success: true,
      data: {
        code: promoCode.code,
        discountPercent: Number(promoCode.discountPercent || 0),
        discountRate,
        discountAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to validate promo code",
    });
  }
};

export const resolvePromoCodeDiscount = async ({
  coupon,
  subtotal,
  session,
}) => {
  const normalizedCoupon = normalizeCode(coupon);

  if (!normalizedCoupon) {
    return {
      coupon: "",
      discountRate: 0,
      discountPrice: 0,
    };
  }

  const query = PromoCode.findOne({ code: normalizedCoupon });
  if (session) {
    query.session(session);
  }

  const promoCode = await query;

  if (!promoCode || !isWithinValidityWindow(promoCode)) {
    const error = new Error("INVALID_COUPON");
    error.statusCode = 409;
    throw error;
  }

  const discountRate = Number(promoCode.discountPercent || 0) / 100;
  const discountPrice = Number(
    (Number(subtotal || 0) * discountRate).toFixed(2),
  );

  return {
    coupon: promoCode.code,
    discountRate,
    discountPrice,
  };
};
