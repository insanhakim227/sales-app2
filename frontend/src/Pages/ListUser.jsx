import { useEffect, useState, useContext } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { FaRegMoon } from "react-icons/fa";
import api from "../api/axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ListUser() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") return;
    api.get("/users").then(res => {
      // Filter hanya user yang sudah verified
      const verifiedUsers = res.data.filter(u => u.isVerified);
      setUsers(verifiedUsers);
    });
  }, [user]);

  // Persist filter/search state in localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("listUserRoleFilter");
    const savedSearch = localStorage.getItem("listUserActiveSearch");
    if (savedRole) setRoleFilter(savedRole);
    if (savedSearch) setActiveSearch(savedSearch);
  }, []);

  useEffect(() => {
    localStorage.setItem("listUserRoleFilter", roleFilter);
  }, [roleFilter]);
  useEffect(() => {
    localStorage.setItem("listUserActiveSearch", activeSearch);
  }, [activeSearch]);


  // Filter and search logic
  useEffect(() => {
    let result = [...users];
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    if (activeSearch) {
      const s = activeSearch.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      );
    }
    setFilteredUsers(result);
    setPage(1);
  }, [users, roleFilter, activeSearch]);

  if (user?.role !== "SUPERADMIN") return <div className="p-6 text-red-600 font-bold">Forbidden</div>;

  // Pagination logic
  const totalPage = Math.ceil(filteredUsers.length / perPage);
  const pagedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold text-indigo-700">Daftar User Terverifikasi</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1">
            <input
              type="text"
              className="pl-8 pr-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200 text-sm"
              placeholder="Cari nama/email..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value === "") setActiveSearch("");
              }}
              onKeyDown={e => {
                if (e.key === "Enter") setActiveSearch(search);
              }}
            />
            <button
              className="absolute left-2 top-2 text-gray-400"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              onClick={() => setActiveSearch(search)}
              title="Cari"
            >
              <FaSearch />
            </button>
          </div>
          <div className="relative">
            <button
              className="px-2 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center gap-1 text-sm"
              onClick={() => setShowFilter(f => !f)}
              title="Filter by Role"
            >
              <FaFilter />
              Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                <div className="flex flex-col gap-1 p-2">
                  <span className="font-semibold text-gray-600 text-sm mb-1">Role:</span>
                  <button
                    className={`px-3 py-1 rounded text-sm border w-full text-left transition-colors
                      ${roleFilter === '' ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-indigo-500 hover:text-white'}`}
                    onClick={() => { setRoleFilter(""); setShowFilter(false); }}
                  >
                    Semua
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm border w-full text-left transition-colors
                      ${roleFilter === 'USER' ? 'bg-green-500 text-white' : 'bg-white hover:bg-green-500 hover:text-white'}`}
                    onClick={() => { setRoleFilter("USER"); setShowFilter(false); }}
                  >
                    User
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm border w-full text-left transition-colors
                      ${roleFilter === 'ADMIN' ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-yellow-500 hover:text-white'}`}
                    onClick={() => { setRoleFilter("ADMIN"); setShowFilter(false); }}
                  >
                    Admin
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm border w-full text-left transition-colors
                      ${roleFilter === 'SUPERADMIN' ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-500 hover:text-white'}`}
                    onClick={() => { setRoleFilter("SUPERADMIN"); setShowFilter(false); }}
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-100">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Foto</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-center">Last Login</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaRegMoon className="text-5xl text-indigo-300 animate-bounce" />
                    <span className="text-lg font-semibold">User tidak ditemukan</span>
                    <span className="text-sm text-gray-400">Coba ubah pencarian atau filter role</span>
                  </div>
                </td>
              </tr>
            ) : (
              pagedUsers.map((u, idx) => (
                <tr key={u.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-2">
                    {u.profileImageUrl ? (
                      <img src={u.profileImageUrl ? (u.profileImageUrl.startsWith("/image-user/") ? `${import.meta.env.VITE_IMAGE_URL || ""}${u.profileImageUrl}` : u.profileImageUrl) : "/assets/profile_icon.png"} alt={u.name} className="w-8 h-8 rounded-full object-cover mx-auto" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-semibold">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold
                        ${u.role === "SUPERADMIN" ? "bg-red-100 text-red-700" :
                          u.role === "ADMIN" ? "bg-yellow-100 text-yellow-700" :
                          u.role === "USER" ? "bg-green-100 text-green-700" : "bg-gray-100"}
                      `}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded shadow text-sm"
                      onClick={() => navigate(`/dashboard/users/${u.id}`)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          &lt; Prev
        </button>
        {[...Array(totalPage)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded text-sm ${page === i + 1 ? "bg-indigo-500 text-white" : "bg-gray-100"}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          disabled={page === totalPage}
          onClick={() => setPage(page + 1)}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}