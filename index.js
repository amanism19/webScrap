const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Bodyparser middleware
app.use(express.json());
app.use(cors());

app.use("/api", require("./routes/index"));
app.use("/request", require("./routes/request"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server started on port ${port}`));