import * as core from "@actions/core"
import fs from "fs"
import path from "path"

// /**
//  * Reads all files from directory.
//  * 
//  * @param {string} dirPath directory to read files from
//  * @param {string} extensionFilter if not empty string, filter found files to only those with extension
//  * @returns {string[]} array of all found files
//  */
// export async function getFiles(dirPath, extensionFilter = "") {
//   try {
//     const files = fs.readdirSync(dirPath)

//     if (files === undefined) return []
//     else if (extensionFilter != "") { const filterFiles = files.filter(file => { return file.endsWith(`.${extensionFilter}`) })
//       return (filterFiles === undefined ? [] : filterFiles)
//     }
//     else return files
//   } catch (error) {
//     core.setFailed(error)
//     return []
//   }
// }

/**
 * Reads file from passed path.
 * 
 * @param {string} path path to file
 * @returns {string} contents of the file or empty string
 */
export async function readFile(path) {
  return fs.promises.readFile(path)
    .then((file) => {
      return ""+file
    })
    .catch((error) => {
      core.warning(`Failed to read file on path '${path}' due to -- ${error}`)
      return ""
    })
}

/**
 * Creates directory if it doesn't already exist.
 * 
 * @param {string} dir directory path to create
 * @author https://www.30secondsofcode.org/js/s/create-dir-if-not-exists
 * @author https://stackoverflow.com/a/26815894
 */
async function createDirIfNotExists(dir) {
  !fs.existsSync(dir) ? fs.mkdirSync(dir, { recursive: true }) : undefined
}

/**
 * Create file from passed content.
 * 
 * @param {string} dirPath directory path to write files too
 * @param {string} file file name to write
 * @param {string} content file content to include in new file
 * @returns {Promise} for file writting success
 */
export async function writeFile(dirPath, file, content) {
  createDirIfNotExists(dirPath)
    .then(async () => {
      const filePath = path.join(dirPath, file)
      try {
        await fs.promises.writeFile(filePath, content)
        return true
      } catch (error) {
        core.warning(`Failed to write to path '${filePath}' due to -- ${error}`)
        return false
      }
    });
}
