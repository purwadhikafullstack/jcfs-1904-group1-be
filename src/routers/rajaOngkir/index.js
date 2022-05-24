const express = require("express");
const router = express.Router();
const axios = require("axios");

axios.defaults.baseURL = "https://api.rajaongkir.com/starter";
axios.defaults.headers.common["key"] = "5b9c967d78cc42d99bffe21a16737ea6";
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

router.get("/province", async (req, res, next) => {
  try {
    const response = await axios.get("/province");
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/city/:provId", async (req, res, next) => {
  try {
    const id = req.params.provId;
    const response = await axios.get(`/city?province=${id}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/cost/:origin/:destination/:weight/:courier",
  async (req, res, next) => {
    try {
      const response = await axios.post("/cost", {
        origin: req.params.origin,
        destination: req.params.destination,
        weight: req.params.weight,
        courier: req.params.courier,
      });
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
