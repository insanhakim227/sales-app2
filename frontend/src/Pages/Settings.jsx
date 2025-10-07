import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", { password: newPassword, oldPassword });
      toast.success("Password berhasil diubah");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error("Gagal ubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (t) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    toast.success(`Tema diubah ke ${t}`);
  };

  if (!user) return <div>Unauthorized</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Pengaturan Akun</h2>
      <form onSubmit={handlePasswordUpdate} className="space-y-4 mb-8">
        <div className="font-semibold mb-2">Ubah Password</div>
        <div>
          <label htmlFor="old-password" className="text-sm font-medium text-gray-700">Password Lama</label>
          <input
            id="old-password"
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder="Password lama"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="text-sm font-medium text-gray-700">Password Baru</label>
          <input
            id="new-password"
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Password baru"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Ubah Password"}
        </button>
      </form>
      <div className="mb-4">
        <div className="font-semibold mb-2">Tema</div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${theme === "light" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
            onClick={() => handleThemeChange("light")}
          >
            Light
          </button>
          <button
            className={`px-4 py-2 rounded ${theme === "dark" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
            onClick={() => handleThemeChange("dark")}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
