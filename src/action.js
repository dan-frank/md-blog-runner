import * as core from "@actions/core";
import * as github from "@actions/github";
import path from "path";
import { deploy } from "./scripts/deploy";
import { generateBlog } from "./scripts/generateBlog";
import { prepareTheme } from "./scripts/prepareTheme";

(async () => {
  try {
    const { pusher, repository } = github.context.payload;

    const pusherName = pusher?.name || process.env.GITHUB_PUSHER_NAME;
    const repoName = repository?.full_name || process.env.GITHUB_REPOSITORY;
    const repoToken =
      core.getInput("GITHUB_TOKEN") || process.env.GITHUB_TOKEN || github.token;
    const rootPath =
      process.env.GITHUB_WORKSPACE || path.join(__dirname, "../");

    const logoUrl = core.getInput("LOGO_URL");
    const faviconUrl = core.getInput("FAVICON_URL");
    const blogName = core.getInput("BLOG_NAME");

    const url =
      core.getInput("URL") ||
      `https://${pusherName}.github.io/${repoName.substring(repoName.indexOf("/") + 1, repoName.length)}`;
    const safeUrl = url.charAt(url.length - 1) === "/" ? url.slice(0, -1) : url;

    const config = {
      actionDir: path.join(__dirname, "../"),
      actionName: "Ready Markdown Blog",
      blogName: "My Super Awesome Blog!",
      branding: {
        logoUrl: logoUrl,
        faviconUrl: faviconUrl,
        blogName: blogName,
      },
      outputPath: path.join(rootPath, "/output"),
      outputUrl: safeUrl,
      pagesDir: "pages",
      postsDir: "posts",
      pusherEmail: pusher?.email || process.env.GITHUB_PUSHER_EMAIL,
      pusherName: pusherName,
      repoBranch: "gh-pages",
      repoName: repoName,
      rootPath: rootPath,
      repoUrl: `https://${`x-access-token:${repoToken}`}@github.com/${repoName}.git`,
      tagsDir: "tags",
    };

    await generateBlog(config);
    await prepareTheme(config);
    await deploy(config);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
