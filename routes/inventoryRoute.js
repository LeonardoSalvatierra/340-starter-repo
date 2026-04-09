const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidation = require("../utilities/inventory-validation") 

// Management view
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Inventory detail
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
)

// Add Classification routes
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassificationForm)
)

router.post(
  "/add-classification",
  inventoryValidation.addClassificationRules(),
  utilities.handleErrors(invController.addClassification)
)

// Trigger intentional error
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router