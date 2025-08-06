const multer = require("multer");

// almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
