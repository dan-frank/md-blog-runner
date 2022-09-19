import * as core from "@actions/core"
import path from "path"

import { generateBlog } from "./generateBlog";

( async () => {
  try {
    // Setup
    const rootPath = process.env.GITHUB_WORKSPACE || path.join(__dirname, "../")

    // Generate blog
    generateBlog(rootPath)

    // Deploy to Pages
  } catch (error) {
    core.setFailed(error.message)
  }
} )();
