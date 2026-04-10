const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator") // para validación

const invCont = {}

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* Build inventory detail view */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const data = await invModel.getInventoryById(inv_id)
    const detail = await utilities.buildVehicleDetail(data)
    const nav = await utilities.getNav()

    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav,
      detail,
    })
  } catch (error) {
    next(error)
  }
}

/* Trigger intentional error */
invCont.triggerError = async function (req, res, next) {
  throw new Error("Intentional 500 error")
}

/* Build Management View */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Add Classification
 ************************/

/* Show Add Classification Form */
invCont.buildAddClassificationForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name: "",
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

/* Process Add Classification Form */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const nav = await utilities.getNav()
    const errors = validationResult(req)  

    if (!errors.isEmpty()) {
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),  
        classification_name,
      })
    }

    await invModel.addClassification(classification_name)

    req.flash(
      "success",
      `Classification "${classification_name}" added successfully!`
    )
    res.redirect("/inv")
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Show Add Inventory Form
 ************************/
invCont.buildAddInventoryForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

/* Process Add Inventory */
invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const errors = validationResult(req)

    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    if (!errors.isEmpty()) {
      const classificationList = await utilities.buildClassificationList(classification_id)

      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: errors.array(),
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
    }

    await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })

    req.flash("success", "Vehicle added successfully!")
    res.redirect("/inv")

  } catch (error) {
    next(error)
  }
}

module.exports = invCont