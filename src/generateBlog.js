import * as core from "@actions/core"
import path from "path"
import MarkdownIt from "markdown-it"

import { getFiles, readFile, writeFile } from "./files.js"

export async function generateBlog(config) {
  generatePosts(config)
}

async function generatePosts(config) {
  getFiles(config.rootPath, "posts")
    .then((posts) => {
      const md = new MarkdownIt()
      posts.forEach(postName => {
        const postPath = path.join(config.rootPath, "posts", postName)
        readFile(postPath)
          .then((postContent) => {
            writeFile(config.outputPath, postName, "html", md.render(postContent))
          })
      });
    })
}
