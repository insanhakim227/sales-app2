import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        toast.success("Email berhasil diverifikasi. Silakan login.");
      })
      .catch(() => {
        setStatus("invalid");
        toast.error("Token verifikasi tidak valid atau kadaluarsa.");
      });
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        {status === "loading" && <p>Memverifikasi email...</p>}
        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Email berhasil diverifikasi!</h2>
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Login sekarang
            </Link>
          </>
        )}
        {status === "invalid" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-700">Verifikasi gagal</h2>
            <p>Token tidak valid atau sudah kadaluarsa.</p>
          </>
        )}
      </div>
    </div>
  );
}