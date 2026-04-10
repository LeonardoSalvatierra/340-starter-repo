const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to login view
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)
// Route to registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process registration
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.get(
  "/",
  utilities.requireLogin,
  utilities.handleErrors(accountController.buildManagement)
)

router.get("/logout", utilities.handleErrors(accountController.logoutAccount))
router.post(
  "/logout",
  utilities.handleErrors(accountController.logoutAccount)
)

// Update account view (GET)
router.get(
  "/update/:account_id",
  utilities.requireLogin,
  utilities.handleErrors(accountController.buildUpdateView)
)

// Update account info (POST)
router.post(
  "/update",
  utilities.requireLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Update password (POST)
router.post(
  "/update-password",
  utilities.requireLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router