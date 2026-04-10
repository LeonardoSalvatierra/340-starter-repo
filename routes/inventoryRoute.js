const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidation = require("../utilities/inventory-validation") 

// Management view
router.get(
  "/",
  utilities.requireLogin,
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildManagementView)
)

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
  utilities.requireLogin,
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildAddClassificationForm)
)

router.post(
  "/add-classification",
  utilities.requireLogin,
  utilities.requireEmployeeOrAdmin, 
  inventoryValidation.addClassificationRules(),
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory Form (GET)
router.get(
  "/add-inventory",
  utilities.requireLogin,
  utilities.requireEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildAddInventoryForm)
)

// Add Inventory (POST)
router.post(
  "/add-inventory",
  utilities.requireLogin,
  utilities.requireEmployeeOrAdmin, 
  inventoryValidation.addInventoryRules(),
  utilities.handleErrors(invController.addInventory)
)

// Trigger intentional error
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

module.exports = router