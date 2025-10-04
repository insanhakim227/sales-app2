const axios = require("axios");

// GET semua provinsi
const getProvinsi = async (req, res) => {
  try {
    const { data } = await axios.get("https://ibnux.github.io/data-indonesia/propinsi.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil provinsi", error: err.message });
  }
};

// GET kabupaten berdasarkan ID provinsi
const getKabupaten = async (req, res) => {
  try {
    const { id_provinsi } = req.params;
    const { data } = await axios.get(`https://ibnux.github.io/data-indonesia/kabupaten/${id_provinsi}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil kabupaten", error: err.message });
  }
};

// GET kecamatan berdasarkan ID kabupaten
const getKecamatan = async (req, res) => {
  try {
    const { id_kabupaten } = req.params;
    const { data } = await axios.get(`https://ibnux.github.io/data-indonesia/kecamatan/${id_kabupaten}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil kecamatan", error: err.message });
  }
};

// GET kelurahan berdasarkan ID kecamatan
const getKelurahan = async (req, res) => {
  try {
    const { id_kecamatan } = req.params;
    const { data } = await axios.get(`https://ibnux.github.io/data-indonesia/kelurahan/${id_kecamatan}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil kelurahan", error: err.message });
  }
};

module.exports = {
  getProvinsi,
  getKabupaten,
  getKecamatan,
  getKelurahan,
};
