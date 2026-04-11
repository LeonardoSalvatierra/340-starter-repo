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
    const inv_id = parseInt(req.params.inv_id)
    const data = await invModel.getInventoryById(inv_id)
    const detail = await utilities.buildVehicleDetail(data)
    const nav = await utilities.getNav()
    const reviews = await invModel.getReviewsByInventoryId(inv_id)

    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav,
      detail,
      reviews,
      inv_id,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Add Review
 * ************************** */
invCont.addReview = async function (req, res, next) {
  try {
    const { review_text, review_rating, inv_id } = req.body
    const account_id = res.locals.accountData.account_id

    await invModel.addReview(review_text, review_rating, inv_id, account_id)

    req.flash("notice", "Your review was submitted successfully!")
    res.redirect(`/inv/detail/${inv_id}`)
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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year,
      inv_miles, inv_color, classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year,
      inv_miles, inv_color, classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteConfirmView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult.rowCount) {
      req.flash("notice", "The vehicle was successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont