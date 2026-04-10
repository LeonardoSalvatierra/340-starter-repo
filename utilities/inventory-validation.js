const { body } = require("express-validator")
const invModel = require("../models/inventory-model")
const { validationResult } = require("express-validator")
const utilities = require("./")

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

/* Check inventory data - redirect to add view on error */
validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
    })
    return
  }
  next()
}

/* Check update data - redirect to edit view on error */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
    })
    return
  }
  next()
}

module.exports = validate