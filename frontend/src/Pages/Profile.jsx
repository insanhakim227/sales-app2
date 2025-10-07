import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";

export default function Profile() {
  // Wilayah states
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [province, setProvince] = useState("");
  const [regency, setRegency] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingRegency, setLoadingRegency] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingVillage, setLoadingVillage] = useState(false);

  // Auth & Profile
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Ambil provinsi
  useEffect(() => {
    setLoadingProvince(true);
    api.get("/wilayah/provinsi")
      .then(res => setProvinces(res.data))
      .catch(err => console.error("Gagal ambil provinsi:", err))
      .finally(() => setLoadingProvince(false));
  }, []);

  // Fetch kabupaten
  useEffect(() => {
    if (!provinceId) return setRegencies([]);
    setLoadingRegency(true);
    api.get(`/wilayah/kabupaten/${provinceId}`)
      .then(res => setRegencies(res.data))
      .finally(() => setLoadingRegency(false));

    setRegency(""); setDistrict(""); setVillage("");
    setRegencyId(""); setDistrictId(""); setVillageId("");
  }, [provinceId]);

  // Fetch kecamatan
  useEffect(() => {
    if (!regencyId) return setDistricts([]);
    setLoadingDistrict(true);
    api.get(`/wilayah/kecamatan/${regencyId}`)
      .then(res => setDistricts(res.data))
      .finally(() => setLoadingDistrict(false));

    setDistrict(""); setVillage("");
    setDistrictId(""); setVillageId("");
  }, [regencyId]);

  // Fetch kelurahan
  useEffect(() => {
    if (!districtId) return setVillages([]);
    setLoadingVillage(true);
    api.get(`/wilayah/kelurahan/${districtId}`)
      .then(res => setVillages(res.data))
      .finally(() => setLoadingVillage(false));

    setVillage(""); setVillageId("");
  }, [districtId]);

 // Setelah ambil daftar provinsi
useEffect(() => {
  if (provinces.length > 0 && user?.province) {
    const match = provinces.find(p => p.nama === user.province);
    if (match) {
      setProvinceId(match.id); // isi ID
      setProvince(match.nama); // isi Nama
    }
  }
}, [provinces, user?.province]);

// Setelah ambil daftar kabupaten
useEffect(() => {
  if (regencies.length > 0 && user?.regency) {
    const match = regencies.find(r => r.nama === user.regency);
    if (match) {
      setRegencyId(match.id);
      setRegency(match.nama);
    }
  }
}, [regencies, user?.regency]);

// Kecamatan
useEffect(() => {
  if (districts.length > 0 && user?.district) {
    const match = districts.find(d => d.nama === user.district);
    if (match) {
      setDistrictId(match.id);
      setDistrict(match.nama);
    }
  }
}, [districts, user?.district]);

// Kelurahan
useEffect(() => {
  if (villages.length > 0 && user?.village) {
    const match = villages.find(v => v.nama === user.village);
    if (match) {
      setVillageId(match.id);
      setVillage(match.nama);
    }
  }
}, [villages, user?.village]);


  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append("profileImage", selectedImageFile);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("mobile", mobile);
        formData.append("gender", gender);
        formData.append("address", address);
        formData.append("province", province);
        formData.append("regency", regency);
        formData.append("district", district);
        formData.append("village", village);
        response = await api.put("/users/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put("/users/profile", { 
          name, email, mobile, gender, address, province, regency, district, village 
        });
      }
      const { data } = response;
      setUser(data);
      setProfileImageUrl(data.profileImageUrl);
      setSelectedImageFile(null);
      toast.success("Profil berhasil diupdate");

      if (data.role === "ADMIN" || data.role === "SUPERADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error("Gagal update profil");
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Unauthorized</div>;

 return (
  <div className="p-6 w-full min-h-screen bg-gray-50">
    <h2 className="text-xl font-bold mb-4">Profil Saya</h2>

    {/* Foto Profil */}
    <div className="flex flex-col items-center mb-6">
      <label htmlFor="profileImageUpload" className="cursor-pointer">
        {selectedImageFile ? (
          <img src={URL.createObjectURL(selectedImageFile)} alt={name} className="w-24 h-24 rounded-full object-cover shadow" />
        ) : profileImageUrl ? (
          <img src={profileImageUrl.startsWith("/image-user/") ? `${IMAGE_URL}${profileImageUrl}` : profileImageUrl} alt={name} className="w-24 h-24 rounded-full object-cover shadow" />
        ) : (
          <span className="w-24 h-24 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-3xl">-</span>
        )}
      </label>
      <input
        id="profileImageUpload"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files[0];
          if (file) setSelectedImageFile(file);
        }}
        disabled={loading}
      />
    </div>

    {/* Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input id="profile-name" type="text" className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed" value={name} disabled />
      </div>
      <div>
        <label htmlFor="profile-email" className="text-sm font-medium text-gray-700">Email</label>
        <input id="profile-email" type="email" className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed" value={email} disabled />
      </div>
      <div>
        <label htmlFor="profile-mobile" className="text-sm font-medium text-gray-700">Mobile</label>
        <input id="profile-mobile" type="text" className="w-full border px-3 py-2 rounded" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile" />
      </div>

      <div>
        <label htmlFor="profile-gender" className="text-sm font-medium text-gray-700">Gender</label>
        <select id="profile-gender" className="w-full border px-3 py-2 rounded" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Pilih Gender</option>
          <option value="MALE">Laki-laki</option>
          <option value="FEMALE">Perempuan</option>
          <option value="OTHER">Lainnya</option>
        </select>
      </div>

      {/* Grid untuk wilayah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provinsi */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Provinsi</label>
          {loadingProvince ? (
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <select
              value={provinceId}
              onChange={e => {
                const selected = provinces.find(p => p.id === e.target.value);
                setProvinceId(e.target.value);
                setProvince(selected ? selected.nama : "");
              }}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">{province ? province : "-- Pilih Provinsi --"}</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          )}
        </div>

        {/* Kabupaten */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Kabupaten</label>
          {loadingRegency ? (
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <select
              value={regencyId}
              onChange={e => {
                const selected = regencies.find(r => r.id === e.target.value);
                setRegencyId(e.target.value);
                setRegency(selected ? selected.nama : "");
              }}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">{regency ? regency : "-- Pilih Kabupaten --"}</option>
              {regencies.map(r => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          )}
        </div>

        {/* Kecamatan */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Kecamatan</label>
          {loadingDistrict ? (
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <select
              value={districtId}
              onChange={e => {
                const selected = districts.find(d => d.id === e.target.value);
                setDistrictId(e.target.value);
                setDistrict(selected ? selected.nama : "");
              }}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">{district ? district : "-- Pilih Kecamatan --"}</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          )}
        </div>

        {/* Kelurahan */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Kelurahan</label>
          {loadingVillage ? (
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <select
              value={villageId}
              onChange={e => {
                const selected = villages.find(v => v.id === e.target.value);
                setVillageId(e.target.value);
                setVillage(selected ? selected.nama : "");
              }}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">{village ? village : "-- Pilih Kelurahan --"}</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.nama}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="profile-address" className="text-sm font-medium text-gray-700">Alamat Detail</label>
        <input id="profile-address" type="text" className="w-full border px-3 py-2 rounded" value={address} onChange={e => setAddress(e.target.value)} placeholder="Alamat Detail" />
      </div>

      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  </div>
);
}