const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store product images separately from user images
    // if uploading profile image (fieldname 'profileImage') store in public/image-user
    if (file && file.fieldname === 'profileImage') {
      cb(null, path.join(__dirname, '../../public/image-user'));
    } else {
      cb(null, path.join(__dirname, '../../public/image-product'));
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
