import fs from "fs"

// ❌ Delete multiple files grouped by field (e.g. req.files from multer)
export const deleteFilesWithField = (filesArray) => {
  for (const key in filesArray) {
    filesArray[key].forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log("Couldn't delete the file!", file.path)
        } else {
          console.log("File deleted successfully!", file.path)
        }
      })
    })
  }
}

// ❌ Delete single file
export const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.log("Couldn't delete the file!", path)
    } else {
      console.log("File deleted successfully!", path)
    }
  })
}

// ❌ Delete multiple files by paths
export const deleteFiles = (paths) => {
  if (!paths) return
  const flatPaths = Array.isArray(paths) ? paths.flat() : [paths]

  for (const filePath of flatPaths) {
    if (typeof filePath !== "string") continue
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Couldn't delete the file! :-", filePath)
      } else {
        console.log("File deleted successfully! :-", filePath)
      }
    })
  }
}
