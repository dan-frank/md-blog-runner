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

  const configPlus = {
    ...config,
    globals: {
      header: `<html>
    <head>
      ={meta}=
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="${config.outputUrl}/main.css" />
    </head>
    <body class="bg-white dark:bg-slate-900">
      <main class="container mx-auto flex flex-col gap-12 py-16">
`, // head [general meta, *replace* meta], nav
      footer: `    </main>
      <footer>
        This will be a footer
      </footer>
    </body>
  </html>
`, // logo, latest posts, site links [home, about, posts, contact]
    },
  };

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
        .replace("={meta}=", metaComponent(post.meta))
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
      .replace("={meta}=", `<title>My Super Awesome Posts!</title>`)
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
      .replace("={meta}=", `<title>My Super Awesome Blog!</title>`)
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
