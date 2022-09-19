import * as core from "@actions/core"
import path from "path"

import { generateBlog } from "./generateBlog";

( async () => {
  try {
    // Setup
    const rootPath = process.env.GITHUB_WORKSPACE || path.join(__dirname, "../")
    const config = {
      outputPath: path.join(rootPath, "/output"),
      rootPath: rootPath
    }

    // Generate blog
    generateBlog(config)

    // Deploy to Pages
  } catch (error) {
    core.setFailed(error.message)
  }
} )();
