import path from "path"
import MarkdownIt from "markdown-it"
import { getFiles, readFile, writeFile } from "./files.js"

/**
 * Sets up and generates all blog files.
 * 
 * @param {object} config project configuration
 */
export async function generateBlog(config) {
  await generatePosts(config)
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
            /**
             * TODO
             * - Add specific style classes for edge case HTML tags
             * - Add ID's to headings that consist of the heading text
             * - Create template for posts page
             * - - Create header and footer
             */
            var postHtml = `<article class="prose lg:prose-xl">${md.render(postContent)}</article>`
            // var postHtml = md.render(postContent)
            //   .replaceAll("<h1>", "<h1 class=\"text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight\">")
            //   .replaceAll("<p>", "<p class=\"text-normal text-gray-800\">")
            writeFile(path.join(config.outputPath, postsDir), postName, "html", postHtml)
          })
      })
    })
}
