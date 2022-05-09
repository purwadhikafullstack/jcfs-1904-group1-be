const multer = require("multer");
const path = require("path");

// avatar
const avatarDirectory = path.join(__dirname, "../../../public/avatar");
const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDirectory);
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const uploadImageAvatar = multer({
  storage: storageAvatar,
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    const allowedExtension = [".png", ".jpg", ".jpeg"];
    const extname = path.extname(file.originalname);

    if (!allowedExtension.includes(extname))
      return cb(new Error("Please upload image with ext (jpg, jpeg, png)"));
    cb(null, true);
  },
});

//image product
const imageDirectory = path.join(__dirname, "../../../public/images/products/");
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDirectory);
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    const allowedExtension = [".png", ".jpg", ".jpeg"];
    const extname = path.extname(file.originalname);

    if (!allowedExtension.includes(extname))
      return cb(new Error("Please upload image with ext (jpg, jpeg, png)"));
    cb(null, true);
  },
});

const imageDirectoryPayment = path.join(
  __dirname,
  "../../../public/images/payments/"
);
const imageStoragePayment = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDirectoryPayment);
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const uploadImagePayment = multer({
  storage: imageStoragePayment,
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    const allowedExtension = [".png", ".jpg", ".jpeg"];
    const extname = path.extname(file.originalname);

    if (!allowedExtension.includes(extname))
      return cb(new Error("Please upload image with ext (jpg, jpeg, png)"));
    cb(null, true);
  },
});

const imageDirectoryPrescription = path.join(
  __dirname,
  "../../../public/images/prescriptions/"
);
const imageStoragePrescription = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDirectoryPrescription);
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const uploadImagePrescription = multer({
  storage: imageStoragePrescription,
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    const allowedExtension = [".png", ".jpg", ".jpeg"];
    const extname = path.extname(file.originalname);

    if (!allowedExtension.includes(extname))
      return cb(new Error("Please upload image with ext (jpg, jpeg, png)"));
    cb(null, true);
  },
});

module.exports = {
  uploadImage,
  uploadImagePayment,
  uploadImagePrescription,
  uploadImageAvatar,
};
