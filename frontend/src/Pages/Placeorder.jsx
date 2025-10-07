import React, { useContext } from "react";
import TotalCart from "../Components/TotalCart";
import Title from "../Components/Title";
import { shopContext } from "../Context/ShopContext";
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import formatRupiah from '../utils/formatRupiah';
import { toast } from "react-toastify";
import VisaLogo from "../assets/My_assets/Visa-Logo.png";
import MadaLogo from "../assets/My_assets/Mada.webp";
import BarqLogo from "../assets/My_assets/barq.png";


const Placeorder = () => {
  const [method, setmetod] = React.useState("Visa");
  const { navigate, cartItems, products } = useContext(shopContext);
  const location = useLocation();

  // If navigated with selected items (from Cart or direct checkout), prefer those for the summary
  const navSelected = location.state && Array.isArray(location.state.selected) ? location.state.selected : null;
  const selectedItemsMap = {};
  if (navSelected) {
    navSelected.forEach(item => {
      const key = `${item.id}::${item.size}`;
      selectedItemsMap[key] = true;
    });
  }

  const [formData, setformData] = React.useState({
    first_name: "",
    Last_name: "",
    email: "",
    Password: "",
    Country: "",
    City: "",
    ZipCode: "",
    Street: "",
    Phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setformData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [serverMismatch, setServerMismatch] = React.useState(false);
  const [serverTotal, setServerTotal] = React.useState(null);

  const PlaceOrderClicked = async (e) => {
    e.preventDefault();

    const requiredFields = ['first_name', 'Last_name', 'email', 'Password', 'Country', 'City', 'Street'];
    const numberFieldValid = formData.Phone !== "" && formData.ZipCode !== "";
    const allFieldsValid = requiredFields.every(field => formData[field]?.trim() !== "");

    if (!allFieldsValid || !numberFieldValid) {
      toast.error("Please fill in all required delivery fields.");
      return;
    }

    // Build items to verify: prefer navigation state selected, otherwise use cartItems
    const navSel = location.state && Array.isArray(location.state.selected) ? location.state.selected : null;
    let itemsToVerify = [];
    if (navSel && navSel.length > 0) {
      itemsToVerify = navSel.map(i => ({ id: i.id, size: i.size || 'default', quantity: i.quantity || 1, variantId: i.variantId || null }));
    } else {
      for (const pid in cartItems) {
        for (const sizeKey in cartItems[pid]) {
          const entry = cartItems[pid][sizeKey];
          itemsToVerify.push({ id: pid, size: sizeKey, quantity: entry.quantity || 1, variantId: entry.variantId || null });
        }
      }
    }

    if (itemsToVerify.length === 0) {
      toast.error('Tidak ada item untuk diverifikasi.');
      return;
    }

    try {
      const fetches = itemsToVerify.map(i => api.get(`/products/${i.id}`).then(r => ({ req: i, prod: r.data })));
      const results = await Promise.all(fetches);
      let serverSubtotal = 0;
      results.forEach(({ req, prod }) => {
        let price = prod.price || 0;
        if (req.variantId && prod.variants) {
          const found = prod.variants.find(v => String(v.id) === String(req.variantId) || v.size === req.size);
          if (found && found.price) price = found.price;
        } else if (req.size && req.size !== 'default' && prod.variants) {
          const found2 = prod.variants.find(v => v.size === req.size);
          if (found2 && found2.price) price = found2.price;
        }
        serverSubtotal += Number(price) * Number(req.quantity || 1);
      });

      // compute clientSubtotal from local context/products to compare (best-effort)
      let clientSubtotal = 0;
      itemsToVerify.forEach(it => {
        const prod = products.find(p => String(p.id) === String(it.id));
        const stored = (cartItems[it.id] && cartItems[it.id][it.size]) || null;
        const variantPrice = stored ? stored.variantPrice : null;
        const price = (variantPrice !== null && typeof variantPrice !== 'undefined') ? Number(variantPrice) : (prod ? Number(prod.price || 0) : 0);
        clientSubtotal += price * (it.quantity || 0);
      });

      if (serverSubtotal !== clientSubtotal) {
        setServerMismatch(true);
        setServerTotal(serverSubtotal);
        toast.error('Harga produk berubah. Silakan cek ringkasan harga sebelum konfirmasi.');
        return;
      }

      // All good: proceed
      navigate('/Orders');
      toast.success("The request was completed successfully");
    } catch (err) {
      console.error('Failed verify prices', err);
      toast.error('Gagal memverifikasi harga produk. Silakan coba lagi.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-10">
          <Title text1={"Place "} text2={"Order"} />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Delivery Form */}
          <div className="bg-white p-8 rounded-2xl shadow-md w-full lg:w-2/3">
            <Title text1={"Delivery "} text2={"Information"} />
            <form onSubmit={PlaceOrderClicked} className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="po-first" className="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="po-first"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="First Name"
                    className="input-field p-1"
                  />
                </div>
                <div>
                  <label htmlFor="po-last" className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="po-last"
                    name="Last_name"
                    value={formData.Last_name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Last Name"
                    className="input-field p-1"
                  />
                </div>
              </div>

              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                placeholder="Email"
                className="input-field w-full p-1"
              />

              <input
                name="Password"
                value={formData.Password}
                onChange={handleInputChange}
                type="password"
                placeholder="Password"
                className="input-field w-full p-1"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="po-country" className="text-sm font-medium text-gray-700">Country</label>
                  <input
                    id="po-country"
                    name="Country"
                    value={formData.Country}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Country"
                    className="input-field p-1"
                  />
                </div>
                <div>
                  <label htmlFor="po-city" className="text-sm font-medium text-gray-700">City</label>
                  <input
                    id="po-city"
                    name="City"
                    value={formData.City}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="City"
                    className="input-field p-1"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="po-zip" className="text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    id="po-zip"
                    name="ZipCode"
                    value={formData.ZipCode}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Zip Code"
                    className="input-field p-1"
                  />
                </div>
                <div>
                  <label htmlFor="po-street" className="text-sm font-medium text-gray-700">Street</label>
                  <input
                    id="po-street"
                    name="Street"
                    value={formData.Street}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Street"
                    className="input-field p-1"
                  />
                </div>
              </div>

              <input
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                type="number"
                placeholder="Phone"
                className="input-field w-full p-1"
              />

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mt-2">(Optional)</label>
                <div>
                  <label htmlFor="po-landmark" className="sr-only">Archaeological landmark</label>
                  <input
                    id="po-landmark"
                    type="text"
                    placeholder="Archaeological landmark"
                    className="input-field w-full p-1"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-black text-white text-lg px-6 py-3 rounded-xl hover:bg-gray-800 transition duration-300"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>

          {/* Summary & Payment */}
          <div className="w-full lg:w-1/3 space-y-6">
            <TotalCart cartArray={navSelected || []} selectedItems={navSelected ? selectedItemsMap : {}} />

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Choose Payment Method</h2>
              <div className="flex justify-around items-center gap-4">
                {[
                  { name: "Mada", src: MadaLogo },
                  { name: "Visa", src: VisaLogo },
                  { name: "Barq", src: BarqLogo },
                ].map(({name,src}) => (
                  <div key={name} className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => setmetod(name)}>
                    <div className={`w-4 h-4 rounded-full ${method === name ? "bg-green-600" : "bg-gray-300"}`} />
                    <img
                      src={src}
                      alt={`${name} logo`}
                      className="w-20 h-14 object-contain transition-transform hover:scale-105"
                    />
                    <p className="text-xs text-gray-700">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placeorder;
