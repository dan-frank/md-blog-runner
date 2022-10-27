import path from "path"
import MarkdownIt from "markdown-it"
import { getFiles, readFile, writeFile } from "./files.js"

/**
 * Sets up and generates all blog files.
 * 
 * @param {object} config project configuration
 */
export async function generateBlog(config) {
  generatePosts(config)
}

/**
 * Finds and converts markdown posts as html files.
 * 
 * @param {object} config project configuration
 */
async function generatePosts(config) {
  const postsDir = "posts"
  getFiles(path.join(config.rootPath, postsDir))
    .then((posts) => {
      const md = new MarkdownIt()
      posts.forEach(postName => {
        const postPath = path.join(config.rootPath, postsDir, postName)
        readFile(postPath)
          .then((postContent) => {
            writeFile(path.join(config.outputPath, postsDir), postName, "html", md.render(postContent))
          })
      });
    })
}
