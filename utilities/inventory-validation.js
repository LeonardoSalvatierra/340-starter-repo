const { body } = require("express-validator")
const invModel = require("../models/inventory-model")

const validate = {}

validate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isLength({ min: 2 })
      .withMessage("Classification name must be at least 2 characters.")
      .custom(async (classification_name) => {
        const existing = await invModel.getClassifications()

        if (
          existing.rows.find(
            c =>
              c.classification_name.toLowerCase() ===
              classification_name.toLowerCase()
          )
        ) {
          throw new Error("Classification already exists.")
        }
      }),
  ]
}

validate.addInventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Valid year is required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Valid price is required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Valid miles is required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").notEmpty().withMessage("Please select a classification."),
  ]
}

module.exports = validate