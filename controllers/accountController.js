const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  if (res.locals.loggedin) {
    return res.redirect("/account/")
  }

  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  let hashedPassword

  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Error processing registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // ✅ IMPORTANTE
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* *****************************
 * Process Login
 * *************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()

  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Invalid email or password.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {

      const token = jwt.sign(
        {
          account_id: accountData.account_id,
          account_email: accountData.account_email,
          account_firstname: accountData.account_firstname,
          account_type: accountData.account_type,
        },
        process.env.SESSION_SECRET,
        { expiresIn: "1h" }
      )

      res.cookie("jwt", token, { httpOnly: true })

      req.flash("notice", `Welcome back ${accountData.account_firstname}`)
      return res.redirect("/account/")

    } else {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }

  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/account/")
}

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/index", {
    title: "My Account",
    nav,
    accountData: res.locals.accountData, 
    errors: null,
  })
}

async function buildUpdateView(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  } catch (error) {
    next(error)
  }
}

async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const updateResult = await accountModel.updateAccount(
      account_firstname, account_lastname, account_email, account_id
    )
    if (updateResult) {
      // Actualizar el JWT con los nuevos datos
      const token = jwt.sign(
        {
          account_id: updateResult.account_id,
          account_email: updateResult.account_email,
          account_firstname: updateResult.account_firstname,
          account_type: updateResult.account_type,
        },
        process.env.SESSION_SECRET,
        { expiresIn: "1h" }
      )
      res.cookie("jwt", token, { httpOnly: true })
      req.flash("notice", "Account updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Account update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    next(error)
  }
}

async function updatePassword(req, res, next) {
  try {
    const { account_id, account_password } = req.body
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Password update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  logoutAccount,
  buildManagement,
  buildUpdateView,
  updateAccount,
  updatePassword,
}