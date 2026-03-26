/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 *  View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index Route
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)

app.get("/error", (req, res, next) => {
  throw new Error("This is a test error")
})

/* ***********************
 * 404 Handler
 *************************/
app.use((req, res, next) => {
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "Sorry, the page you are looking for does not exist."
  })
})

/* ***********************
 * Error Handler
 *************************/
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: err.message,
    nav: '' // agregamos nav vacío para que navigation.ejs no falle
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})