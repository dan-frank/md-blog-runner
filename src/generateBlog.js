import * as core from "@actions/core"
import path from "path"
import MarkdownIt from "markdown-it"

import { getFiles, readFile } from "./files.js"

export async function generateBlog(rootPath) {
  generatePosts(rootPath)
}

async function generatePosts(rootPath) {
  getFiles(rootPath, "posts")
    .then((posts) => {
      posts.forEach(postName => {
        const postPath = path.join(rootPath, "posts", postName)
        readFile(postPath)
          .then((postContent) => {
            const md = new MarkdownIt()
            core.info(md.render(postContent))
          })
      });
    })
}
