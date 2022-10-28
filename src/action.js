import * as core from "@actions/core"
import * as github from '@actions/github'
import path from "path"
import { deploy } from "./scripts/deploy"
import { generateBlog } from "./scripts/generateBlog"
import { prepareTheme } from "./scripts/prepareTheme"

( async () => {
  try {
    const { pusher, repository } = github.context.payload

    const repoName = repository?.full_name || process.env.GITHUB_REPOSITORY
    const repoToken = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN || github.token
    const rootPath = process.env.GITHUB_WORKSPACE || path.join(__dirname, "../")
    
    const config = {
      actionDir: path.join(__dirname, "../"),
      actionName: "Ready Markdown Blog",
      outputPath: path.join(rootPath, "/output"),
      pusherEmail: pusher?.email || process.env.GITHUB_PUSHER_EMAIL,
      pusherName: pusher?.name || process.env.GITHUB_PUSHER_NAME,
      repoBranch: "gh-pages",
      repoName: repoName,
      rootPath: rootPath,
      repoUrl: `https://${`x-access-token:${repoToken}`}@github.com/${repoName}.git`
    }

    await generateBlog(config)
    await prepareTheme(config)
    await deploy(config)
  } catch (error) {
    core.setFailed(error.message)
  }
} )();
