import * as core from "@actions/core";
import dayjs from "dayjs";
import * as fm from "front-matter";
import fs from "fs";
import MarkdownIt from "markdown-it";
import path from "path";
import { writeFile } from "./files.js";
import {
  coverImageComponent,
  dateComponent,
  metaComponent,
  postBlockComponent,
} from "./components";

/**
 * Sets up and generates all blog files.
 *
 * @param {object} config project configuration
 */
export async function generateBlog(config) {
  /**
   * TODO
   * - Add specific style classes for edge case HTML tags
   * - - Footnotes have no styling
   * - - Table
   * - - - Overflows width, no scroll
   * - - - Headers same color as body
   * - - - Rows don"t alternate colors
   * - - - Text no dark mode
   * - - Code blocks have no syntax highlighting
   * - Add ID's to headings that consist of the heading text
   * - Create templates
   * - - ~Post~
   * - - ~Posts~
   * - - ~Home~
   * - - Header + Nav
   * - - Footer
   */
  const posts = fetchAllPosts(config).sort((a, b) => {
    const date1 = dayjs(a.date).format("YYYYMMDD") * 1;
    const date2 = dayjs(b.date).format("YYYYMMDD") * 1;
    return date2 - date1;
  });
  const configPlus = getConfigPlus(config);

  generateAllPosts(configPlus, posts);
  generatePosts(configPlus, posts);
  generateHome(configPlus, posts.slice(0, 8));
}

/**
 * Finds and converts markdown posts to html files.
 *
 * @param {object} config project configuration
 * @returns {object[]} posts object
 */
function fetchAllPosts(config) {
  return fs
    .readdirSync(path.join(config.rootPath, config.postsDir))
    .filter((file) => {
      return file.endsWith(".md");
    })
    .map((postFile) => {
      const postName = postFile.substring(0, postFile.indexOf("."));
      const postContent = fs.readFileSync(
        path.join(config.rootPath, config.postsDir, `${postName}.md`),
        "utf-8"
      );
      const { body, attributes } = fm(postContent);

      return {
        body: body,
        cover: attributes["image"] || attributes["og:image"],
        date: (attributes["date"] ? dayjs(attributes["date"]) : dayjs()).format(
          "YYYY-MMMM-DD"
        ),
        description:
          attributes["description"] || attributes["og:description"] || "",
        name: postName,
        meta: attributes,
        title: attributes["title"] || attributes["og:title"] || postName,
      };
    });
}

/**
 * Generates all single post pages.
 *
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generateAllPosts(config, posts) {
  const md = new MarkdownIt();

  const postTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "post.html"),
      "utf-8"
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  posts.forEach((post) => {
    writeFile(
      path.join(config.outputPath, config.postsDir),
      `${post.name}.html`,
      postTemplate
        .replace("={meta}=", metaComponent(config, post.meta))
        .replace("={cover}=", coverImageComponent(post.cover))
        .replace("={date}=", dateComponent(post.date))
        .replace("={content}=", md.render(post.body))
    );
  });

  return posts;
}

/**
 * Generates posts page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generatePosts(config, posts) {
  const postsTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "posts.html"),
      "utf-8"
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  writeFile(
    config.outputPath,
    "posts.html",
    postsTemplate
      .replace(
        "={meta}=",
        `<title>My Super Awesome Posts! - ${config.blogName}</title>`
      )
      .replace("={css}=", `${config.outputUrl}/main.css`)
      .replace(
        "={posts}=",
        posts
          .map((post) => {
            return postBlockComponent(post, config.outputUrl);
          })
          .join("\n")
      )
  );
}

/**
 * Generates home page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generateHome(config, posts) {
  const homeTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "home.html"),
      "utf-8"
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  writeFile(
    config.outputPath,
    "index.html",
    homeTemplate
      .replace("={meta}=", `<title>${config.blogName}</title>`)
      .replace("={css}=", `${config.outputUrl}/main.css`)
      .replace(
        "={posts}=",
        posts
          .map((post) => {
            return postBlockComponent(post, config.outputUrl);
          })
          .join("\n")
      )
  );
}

/**
 * Generates config + header and footer parts.
 *
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function getConfigPlus(config) {
  return {
    ...config,
    globals: {
      header: `<html>
    <head>
      ={meta}=
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="${config.outputUrl}/main.css" />
    </head>
    <body class="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <div class="grow-0 shrink-0 relative bg-white dark:bg-slate-800 border-b-2 border-gray-100 dark:border-slate-900">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="flex items-center justify-between py-6 md:justify-start md:space-x-10">
            <div class="flex justify-start lg:w-0 lg:flex-1">
              <a href="${config.outputUrl}">
                <span class="sr-only">${config.blogName}</span>
                <img class="h-8 w-auto sm:h-10" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="">
              </a>
            </div>
            <div class="-my-2 -mr-2 md:hidden">
              <button type="button" class="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
                <span class="sr-only">Open menu</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
            <nav class="hidden space-x-10 md:flex md:items-center">
              <a href="${config.outputUrl}" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">Home</a>
              <a href="${config.outputUrl}/posts.html" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">Posts</a>
              <!--
              <a href="${config.outputUrl}/about.html" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">About</a>
              <a href="${config.outputUrl}/contact.html" class="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700">Contact</a>
              -->
            </nav>
          </div>
        </div>
        <div class="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden">
          <div class="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="px-5 pt-5 pb-6">
              <div class="flex items-center justify-between">
                <div>
                  <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="${config.blogName}">
                </div>
                <div class="-mr-2">
                  <button type="button" class="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span class="sr-only">Close menu</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="mt-6">
                <nav class="grid gap-y-8">
                <a href="${config.outputUrl}" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">Home</a>
                <a href="${config.outputUrl}/posts.html" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">Posts</a>
                <!--
                <a href="${config.outputUrl}/about.html" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200">About</a>
                -->
                </nav>
              </div>
            </div>
            <!--
            <div class="space-y-6 py-6 px-5">
              <div>
                <a href="${config.outputUrl}/contact.html" class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm">Contact</a>
              </div>
            </div>
            -->
          </div>
        </div>
      </div>
      <main class="grow-0 shrink-0 mx-auto max-w-7xl w-full flex flex-col gap-12 py-16">
`, // TODO generic meta, rss feed
      footer: `    </main>
      <footer class="grow shrink-0 bg-gray-100 dark:bg-slate-800">
        <div class="mx-auto max-w-7xl">
          <div class="flex flex-col justify-center text-gray-800 p-4 border-t-2 border-gray-100 md:flex-row md:justify-between dark:justify-center dark:text-gray-100 dark:border-slate-900">
            <p class="text-slate-500 dark:text-slate-400">
              &copy; 2021 Copyright: <a class="text-gray-700 dark:text-gray-200" href="${config.outputUrl}">${config.blogName}</a>
            </p>
            <p class="text-slate-500 dark:text-slate-400">
              Social links...
            </p>
          </div>
        </div>
      </footer>
    </body>
  </html>
`, // TODO Optional newletter signup / maybe logo, latest posts, site links [home, about, posts, contact]
    },
  };
}
