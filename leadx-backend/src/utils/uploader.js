import multer from "multer"
import path from "path"
import fs from "fs"

const uploader = (
  uploadFolder = "others",
  filetypes = /jpg|jpeg|png|gif|webp|mp3|aac|wav|mpeg|ogg|m4a/
) => {
  // Storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const subFolder = file.fieldname

      const fullPath = `./public/uploads/${uploadFolder}/${subFolder}`

      fs.mkdir(fullPath, { recursive: true }, (err) => {
        if (err) return cb(err, fullPath)
        cb(null, fullPath)
      })
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path
          .extname(file.originalname)
          .toLowerCase()}`
      )
    },
  })

  // Upload
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
      const mimeCheck = filetypes.test(file.mimetype)
      const extCheck = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      )

      if (!mimeCheck || !extCheck) {
        return cb(
          new Error(
            `File type is not supported. Supported types are ${filetypes}`
          )
        )
      }
      cb(null, true)
    },
  })
}

// Export
export default uploader

export const normalizeUploadPath = (filePath) => {
  return filePath.replace(/\\/g, "/")
}
