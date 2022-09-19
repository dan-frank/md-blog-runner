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
      core.warning(`Failed to read post of path '${postPath}' with error:\n\n-- ${error}`)
      return ""
    })
}
