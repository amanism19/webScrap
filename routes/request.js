const express = require("express");
const axios = require("axios");

const router=express.Router();

router.get("/", async (req, res) => {
    await axios.get("https://www.mtlnovel.com/json/88978-c-15-15.json?__amp_source_origin=https%3A%2F%2Fwww.mtlnovel.com")
    .then((res) => {
        console.log(res.data);
        res.json({success: true, data: res.data});
    })
    .catch(err=> {
        console.log(err);
        res.json({success: false})
    })
});
module.exports = router;