const express = require("express");
const {
  getProvinsi,
  getKabupaten,
  getKecamatan,
  getKelurahan,
} = require("../controller/wilayahController");

const router = express.Router();

router.get("/provinsi", getProvinsi);
router.get("/kabupaten/:id_provinsi", getKabupaten);
router.get("/kecamatan/:id_kabupaten", getKecamatan);
router.get("/kelurahan/:id_kecamatan", getKelurahan);

module.exports = router;
