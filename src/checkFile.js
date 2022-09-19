import * as core from "@actions/core"
import fs from "fs"

export async function checkFile(filePath) {
  return fs.promises.access(filePath)
    .then(() => {
      core.info(`File ${filePath} exists`)
      return true
    })
    .catch(() => {
      core.setFailed(`File ${filePath} does not exist`)
      return false
    })
}
