import * as core from "@actions/core"
import fs from "fs"
import path from "path"

/**
 * Reads all files from directory.
 * 
 * @param {string} dirPath directory to read files from
 * @returns {string[]} array of all found files
 */
export async function getFiles(dirPath) {
  return fs.promises.readdir(dirPath)
    .then((files) => {
      if (files === undefined) return []
      return files
    })
    .catch((error) => {
      core.setFailed(error)
      return []
    })
}

/**
 * Reads file from passed path.
 * 
 * @param {string} path path to file
 * @returns {string} contents of the file or empty string
 */
export async function readFile(path) {
  return fs.promises.readFile(path)
    .then((post) => {
      return ""+post
    })
    .catch((error) => {
      core.warning(`Failed to read post of path '${postPath}' due to -- ${error}`)
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
 * @param {string} name file name to write
 * @param {string} extension file extension to write
 * @param {string} content file content to include in new file
 * @returns {Promise} for file writting success
 */
export async function writeFile(dirPath, name, extension, content) {
  createDirIfNotExists(dirPath)
    .then(() => {
      const file = `${name.substring(0, name.indexOf("."))}.${extension}`

      const filePath = path.join(dirPath, file)
      return fs.promises.writeFile(filePath, content)
        .then(() => { return true })
        .catch((error) => {
          core.warning(`Failed to write to path '${filePath}' due to -- ${error}`)
        })
    });
}
