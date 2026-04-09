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

module.exports = validate