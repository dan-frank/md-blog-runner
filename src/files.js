import * as core from "@actions/core"
import fs from "fs"
import path from "path"

export async function getFiles(rootPath, dirname = "") {
  const dirPath = path.join(rootPath, dirname);
  // return fs.promises.readdir(dirPath)
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

export async function readFile(filePath) {
  return fs.promises.readFile(filePath)
    .then((post) => {
      return ""+post
    })
    .catch((error) => {
      core.warning(`Failed to read post of path '${postPath}' due to -- ${error}`)
      return ""
    })
}

/*
 * @author https://www.30secondsofcode.org/js/s/create-dir-if-not-exists
 */
const createDirIfNotExists = (dir) =>
  !fs.existsSync(dir) ? fs.mkdirSync(dir) : undefined;

export async function writeFile(dirPath, fileName, extension, content) {
  createDirIfNotExists(dirPath);

  const file = `${fileName.substring(0, fileName.indexOf("."))}.${extension}`

  const filePath = path.join(dirPath, file)
  return fs.promises.writeFile(filePath, content)
    .then(() => { return true })
    .catch((error) => {
      core.warning(`Failed to write to path '${filePath}' due to -- ${error}`)
    })
}
