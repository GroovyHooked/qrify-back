require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const authRouter = require("./routes/auth");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var customersRouter = require("./routes/customers");

var app = express();
app.use(cors({ origin: "*" }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/customers", customersRouter);

module.exports = app;
