import * as core from "@actions/core";
import dayjs from "dayjs";
import * as fm from "front-matter";
import fs from "fs";
import MarkdownIt from "markdown-it";
import path from "path";
import { writeFile } from "./files.js";
import {
  buttonComponent,
  coverImageComponent,
  dateComponent,
  featureComponent,
  featuredPersonComponent,
  metaComponent,
  postBlockComponent,
  recentPostsComponent,
  tagsComponent,
  titleComponent,
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
   * - - ~Header + Nav~
   * - - ~Footer~
   */
  const posts = fetchAllPosts(config).sort((a, b) => {
    const date1 = dayjs(a.date).format("YYYYMMDD") * 1;
    const date2 = dayjs(b.date).format("YYYYMMDD") * 1;
    return date2 - date1;
  });
  const taggedPosts = groupPostsByTag(posts);
  const tags = Object.keys(taggedPosts);
  const configPlus = getConfigPlus(config);

  generateAllPosts(configPlus, posts);
  generatePosts(configPlus, posts, tags);
  generateTagPosts(configPlus, taggedPosts, tags);
  generateHome(configPlus, posts, tags);
  generateAbout(configPlus, posts);
  generateContact(configPlus);
}

function renderMarkdownAsHtml(content) {
  const md = new MarkdownIt({
    html: true,
  });
  return md.render(content);
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
        "utf-8",
      );
      const { body, attributes } = fm(postContent);

      return {
        body: body,
        cover: {
          url: attributes["image"] || attributes["og:image"],
          description: attributes["image:description"] || undefined,
          source: attributes["image:source"] || undefined,
        },
        date: (attributes["date"] ? dayjs(attributes["date"]) : dayjs()).format(
          "YYYY-MMMM-DD",
        ),
        description:
          attributes["description"] || attributes["og:description"] || "",
        name: postName,
        meta: attributes,
        tags: ("" + attributes["tags"]).split(", ") || "",
        title: attributes["title"] || attributes["og:title"] || postName,
      };
    });
}

/**
 * Create an object of tags linked to tagged posts.
 *
 * @param {object[]} posts all posts
 */
function groupPostsByTag(posts) {
  let tagged = {};
  for (let i = 0; i < posts.length; i++) {
    const tags = posts[i].tags ? posts[i].tags : ["untagged"];
    tags.forEach((tag) => {
      if (!(tag in tagged)) tagged[tag] = [];
      tagged[tag].push(posts[i]);
    });
  }
  return tagged;
}

/**
 * Generates all single post pages.
 *
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generateAllPosts(config, posts) {
  const postTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "post.html"),
      "utf-8",
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
        .replace("={content}=", renderMarkdownAsHtml(post.body))
        .replace("={tags}=", tagsComponent(config, post.tags)),
    );
  });

  return posts;
}

/**
 * Generates posts page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts post objects array
 * @param {string[]} tags list of tags used on site
 */
function generatePosts(config, posts, tags) {
  const postsTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "posts.html"),
      "utf-8",
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  writeFile(
    config.outputPath,
    "posts.html",
    postsTemplate
      .replace(
        "={meta}=",
        `<title>All posts - ${config.branding.blogName}</title>`,
      )
      .replace("={title}=", titleComponent("All posts"))
      .replace("={tags}=", tagsComponent(config, tags))
      .replace(
        "={posts}=",
        posts
          .map((post) => {
            return postBlockComponent(post, config.outputUrl);
          })
          .join("\n"),
      ),
  );
}

/**
 * Create tag pages based on passed posts.
 *
 * @param {object} config project configuration
 * @param {object[]} taggedPosts tag object of posts
 * @param {string[]} tags list of tags used on site
 */
function generateTagPosts(config, taggedPosts, tags) {
  const tagTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "tag.html"),
      "utf-8",
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  Object.entries(taggedPosts).forEach(([tag, posts]) => {
    writeFile(
      path.join(config.outputPath, config.tagsDir),
      `${tag.toLowerCase().replace(/\s/g, "-")}.html`,
      tagTemplate
        .replace(
          "={meta}=",
          `<title>${tag} posts - ${config.branding.blogName}</title>`,
        )
        .replace(
          "={title}=",
          titleComponent(`<span class="font-extrabold">${tag}</span> posts!`),
        )
        .replace("={tags}=", tagsComponent(config, tags))
        .replace("={tag}=", tag)
        .replace(
          "={posts}=",
          posts
            .map((post) => {
              return postBlockComponent(post, config.outputUrl);
            })
            .join("\n"),
        ),
    );
  });
}

/**
 * Generates home page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts post objects array
 * @param {string[]} tags list of tags used on site
 */
function generateHome(config, posts, tags) {
  const homeTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "home.html"),
      "utf-8",
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);

  writeFile(
    config.outputPath,
    "index.html",
    homeTemplate
      .replace("={meta}=", `<title>${config.branding.blogName}</title>`)
      .replace("={title}=", titleComponent(config.branding.blogName))
      .replace(
        "={feature}=",
        featuredPost ? featureComponent(config.outputUrl, featuredPost) : "",
      )
      .replace("={recentPosts}=", recentPostsComponent(config, recentPosts))
      .replace("={tags}=", tagsComponent(config, tags)),
  );
}

/**
 * Generates about page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts post objects array
 */
function generateAbout(config, posts) {
  const aboutPages = fs
    .readdirSync(path.join(config.rootPath, config.pagesDir))
    .filter((file) => {
      return file.endsWith("about.md");
    })
    .map((pageFile) => {
      const pageName = pageFile.substring(0, pageFile.indexOf("."));
      const pageContent = fs.readFileSync(
        path.join(config.rootPath, config.pagesDir, `${pageName}.md`),
        "utf-8",
      );
      const { body, attributes } = fm(pageContent);

      return {
        body: body,
        cover: {
          url: attributes["image"] || attributes["og:image"],
          description: attributes["image:description"] || undefined,
          source: attributes["image:source"] || undefined,
        },
        description:
          attributes["description"] || attributes["og:description"] || "",
        name: pageName,
        meta: attributes,
        title: attributes["title"] || attributes["og:title"] || pageName,
      };
    });

  if (aboutPages.length <= 0) {
    return;
  }
  const aboutPage = aboutPages[0];

  const recentPosts = posts.slice(0, 6);

  const aboutTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "about.html"),
      "utf-8",
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  writeFile(
    config.outputPath,
    "about.html",
    aboutTemplate
      .replace(
        "={meta}=",
        `<title>About me - ${config.branding.blogName}</title>`,
      )
      .replace(
        "={featuredPerson}=",
        featuredPersonComponent(
          config.outputUrl,
          aboutPage.title,
          aboutPage.description,
          aboutPage.cover,
        ),
      )
      .replace("={about}=", renderMarkdownAsHtml(aboutPage.body))
      .replace("={recentPosts}=", recentPostsComponent(config, recentPosts)),
  );
}

/**
 * Generates contact page.
 *
 * @param {object} config project configuration
 * @param {object[]} posts post objects array
 */
function generateContact(config) {
  const contactPages = fs
    .readdirSync(path.join(config.rootPath, config.pagesDir))
    .filter((file) => {
      return file.endsWith("contact.md");
    })
    .map((pageFile) => {
      const pageName = pageFile.substring(0, pageFile.indexOf("."));
      const pageContent = fs.readFileSync(
        path.join(config.rootPath, config.pagesDir, `${pageName}.md`),
        "utf-8",
      );
      const { body, attributes } = fm(pageContent);

      return {
        body: body,
        cover: {
          url: attributes["image"] || attributes["og:image"],
          description: attributes["image:description"] || undefined,
          source: attributes["image:source"] || undefined,
        },
        description:
          attributes["description"] || attributes["og:description"] || "",
        name: pageName,
        meta: attributes,
        title: attributes["title"] || attributes["og:title"] || pageName,
      };
    });

  if (contactPages.length <= 0) {
    return;
  }
  const contactPage = contactPages[0];

  const contactTemplate = fs
    .readFileSync(
      path.join(config.actionDir, "src", "templates", "contact.html"),
      "utf-8",
    )
    .replace("={header}=", config.globals.header)
    .replace("={footer}=", config.globals.footer);

  writeFile(
    config.outputPath,
    "contact.html",
    contactTemplate
      .replace(
        "={meta}=",
        `<title>Contact me - ${config.branding.blogName}</title>`,
      )
      .replace("={content}=", renderMarkdownAsHtml(contactPage.body)),
  );
}

/**
 * Generates config + header and footer parts.
 *
 * @param {object} config project configuration
 * @returns {object} action config with extra information for theme generation
 */
function getConfigPlus(config) {
  return {
    ...config,
    globals: {
      header: `<html>
    <head>
      ={meta}=
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${config.branding.faviconUrl ? `<link rel="icon" href="${config.branding.faviconUrl}" />` : ""}
      <link rel="icon" type="image/x-icon" href="">
      <link rel="stylesheet" href="${config.outputUrl}/main.css" />
    </head>
    <body class="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <div class="grow-0 shrink-0 relative bg-gray-100 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-900">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="flex items-center justify-between py-6 md:justify-start md:space-x-10">
            <div class="flex justify-start lg:w-0 lg:flex-1">
              <a href="${config.outputUrl}">
                <span class="sr-only">${config.branding.blogName}</span>
                <img
                  class="h-8 w-auto sm:h-10"
                  src="${config.branding.logoUrl}"
                  alt="${config.branding.blogName}"
                >
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
              <a
                href="${config.outputUrl}"
                class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
              >Home</a>
              <a
                href="${config.outputUrl}/posts.html"
                class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
              >Posts</a>
              <a
                href="${config.outputUrl}/about.html"
                class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
              >About</a>
              ${buttonComponent(`${config.outputUrl}/contact.html`, "Contact")}
            </nav>
          </div>
        </div>
        <div class="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden">
          <div class="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="px-5 pt-5 pb-6">
              <div class="flex items-center justify-between">
                <div>
                  <img
                    class="h-8 w-auto"
                    src="${config.branding.logoUrl}"
                    alt="${config.branding.blogName}"
                  >
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
                  <a
                    href="${config.outputUrl}"
                    class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
                  >Home</a>
                  <a
                    href="${config.outputUrl}/posts.html"
                    class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
                  >Posts</a>
                  <a
                    href="${config.outputUrl}/about.html"
                    class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
                  >About</a>
                </nav>
              </div>
            </div>
            <div class="space-y-6 py-6 px-5">
              ${buttonComponent(`${config.outputUrl}/contact.html`, "Contact")}
            </div>
          </div>
        </div>
      </div>
      <main class="grow-0 shrink-0 mx-auto max-w-7xl w-full flex flex-col gap-12 py-16">
`, // TODO: generic meta, rss feed
      footer: `    </main>
      <footer class="grow shrink-0 bg-gray-100 dark:bg-slate-800">
        <div class="mx-auto max-w-7xl">
          <div class="flex flex-col gap-2 justify-center text-gray-800 p-4 border-t-2 border-gray-100 md:flex-row md:justify-between dark:justify-center dark:text-gray-100 dark:border-slate-900">
            <p class="text-slate-500 dark:text-slate-400">
              &copy; ${new Date().getFullYear()} Copyright: <a class="text-gray-700 dark:text-gray-200" href="${config.outputUrl}">${config.branding.blogName}</a>
            </p>
          </div>
        </div>
      </footer>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" integrity="sha512-Jk4AqjWsdSzSWCSuQTfYRIF84Rq/eV0G2+tu07byYwHcbTGfdmLrHjUSwvzp5HvbiqK4ibmNwdcG49Y5RGYPTg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      <script>
        document.addEventListener("DOMContentLoaded", (event) => {
          document.querySelectorAll("pre code").forEach((el) => {
            hljs.highlightElement(el);
          });
        });
      </script>
    </body>
  </html>
`, // TODO: Optional newletter signup / maybe logo, latest posts, site links [home, about, posts, contact]
    },
  };
}
