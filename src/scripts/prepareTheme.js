import path from "path"
import { readFile, writeFile } from "./files.js"

/**
 * ~~Creates and~~ adds theme files to blog.
 * 
 * @param {object} config project configuration
 */
export async function prepareTheme(config) {
  await fetchCss(config)
}

/**
 * Finds and adds compiled css to blog.
 * 
 * @param {object} config project configuration
 */
async function fetchCss(config) {
  readFile(path.join(config.actionDir, "dist", "main.css"))
    .then((cssContent) => {
      writeFile(path.join(config.outputPath), "main.css", cssContent) 
    })
}
