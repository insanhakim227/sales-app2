<!-- FRONTEND -->

src/api/axios.js: Konfigurasi instance Axios untuk komunikasi HTTP dengan backend.
src/Components/: Kumpulan komponen React seperti:
NavBar.jsx, Navigation.jsx: Navigasi utama aplikasi.
Footer.jsx: Footer aplikasi.
ProductItem.jsx, BestSellers.jsx, LatestCollections.jsx, RelatedProducts.jsx: Menampilkan produk dan koleksi.
CartProduct.jsx, TotalCart.jsx: Menampilkan produk di keranjang dan total harga.
SearchBar.jsx: Fitur pencarian produk.
ProtectedRoute.jsx, GuestRoute.jsx: Proteksi akses halaman berdasarkan status login.
src/Context/:
AuthContext.jsx: State global untuk autentikasi user.
ShopContext.jsx: State global untuk data toko, produk, dan keranjang.
src/Pages/: Halaman-halaman utama seperti Home, Login, Register, Cart, Orders, Dashboard, dsb.
src/utils/: Fungsi utilitas, misal:
formatRupiah.js: Format angka ke mata uang Rupiah.
getImageUrl.js: Mendapatkan URL gambar produk.


<!-- BACKEND -->

src/index.js: Entry point server Express.js.
src/prisma.js: Inisialisasi dan koneksi Prisma ORM ke database.
src/controller/: Kumpulan controller untuk menangani request:
authController.js: Login, register, autentikasi user.
cartController.js: Operasi keranjang belanja.
orderController.js: Proses pemesanan dan manajemen order.
paymentController.js: Integrasi dan proses pembayaran.
reviewController.js: Manajemen review produk.
userController.js: Manajemen data user.
wishlistController.js: Manajemen wishlist user.
src/middleware/:
auth.js: Middleware autentikasi JWT.
audit.js: Logging aktivitas user.
src/routes/: Routing endpoint API sesuai resource (auth, cart, order, payment, review, user, wishlist).
src/utils/:
seed.js: Seed data awal ke database.
reset.js: Reset data database.
prisma/schema.prisma: Skema database untuk Prisma ORM.