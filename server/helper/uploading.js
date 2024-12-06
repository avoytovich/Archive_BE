const multer = require('multer');
const path = require('path');
const fs = require('fs');
  
// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadDir); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
      cb(null, `${Date.now()}-${sanitizedFilename}`); // Unique filename
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      if (ext !== '.pdf') {
          return cb(new Error('Only .pdf files are allowed!'), false);
      }
      cb(null, true);
  },
});

module.exports = {
  upload
};
