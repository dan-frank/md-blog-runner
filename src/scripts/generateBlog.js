import * as core from "@actions/core"
import dayjs from "dayjs";
import * as fm from "front-matter"
import fs from "fs"
import MarkdownIt from "markdown-it"
import path from "path"
import { writeFile } from "./files.js"

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
  const posts = generateAllPosts(config).sort((a, b) => {
    const date1 = dayjs(a.date).format("ddd, DD MMMM YYYY")
    const date2 = dayjs(b.date).format("ddd, DD MMMM YYYY")
    date2 - date1
  })

  generatePosts(config, posts)
  generateHome(config, posts.slice(0, 8))
}

/**
 * Finds and converts markdown posts to html files.
 * 
 * @param {object} config project configuration
 * @returns {object[]} arposts object
 */
function generateAllPosts(config) {
  const postsDir = "posts"
  const md = new MarkdownIt()

  const posts = fs.readdirSync(path.join(config.rootPath, postsDir))
    .filter(file => { return file.endsWith(".md") })
    .map(postFile => {
      const postName = postFile.substring(0, postFile.indexOf("."))
      const postContent = fs.readFileSync(path.join(config.rootPath, postsDir, `${postName}.md`), "utf-8")
      const {body, attributes} = fm(postContent)

      return {
        body: md.render(body),
        cover: attributes["image"] || attributes["og:image"],
        date: (attributes["date"] ? dayjs(attributes["date"]) : dayjs()).format("YYYY-MMMM-DD"),
        description: attributes["description"] || attributes["og:description"] || "",
        name: postName,
        meta: generateMeta(attributes),
        title: attributes["title"] || attributes["og:title"] || postName
      }
    })

  const postTemplate = fs.readFileSync(path.join(config.actionDir, "src", "templates", "post.html"), "utf-8")

  posts.forEach(post => {
    writeFile(
      path.join(config.outputPath, postsDir),
      `${post.name}.html`,
      postTemplate
        .replace("={meta}=", post.meta)
        .replace("={css}=", `${config.outputUrl}/main.css`)
        .replace("={cover}=", generateCoverImage(post.cover))
        .replace("={date}=", generateDate(post.date))
        .replace("={content}=", post.body)
    )
  })

  return posts
}

/**
 * Generates posts page.
 * 
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generatePosts(config, posts) {
  const postsTemplate = fs.readFileSync(path.join(config.actionDir, "src", "templates", "posts.html"), "utf-8")
  writeFile(
    config.outputPath,
    "posts.html",
    postsTemplate
      .replace("={css}=", `${config.outputUrl}/main.css`)
      .replace("={posts}=", posts.map(post => { return generatePostBlock(post, config.outputUrl) }).join("\n"))
  )
}

/**
 * Generates home page.
 * 
 * @param {object} config project configuration
 * @param {object[]} posts posts objects
 */
function generateHome(config, posts) {
  const homeTemplate = fs.readFileSync(path.join(config.actionDir, "src", "templates", "home.html"), "utf-8")
  writeFile(
    config.outputPath,
    "index.html",
    homeTemplate
      .replace("={css}=", `${config.outputUrl}/main.css`)
      .replace("={posts}=", posts.map(post => { return generatePostBlock(post, config.outputUrl) }).join("\n"))
  )
}

/**
 * Generates meta tags from passed object of attributes.
 * 
 * @param {object} attributes object of attributes, can be empty
 * @returns {string} HTML formatted meta tags
 */
function generateMeta(attributes) {
  const exceptions = ["date"]

  let meta = ""
  for (const attribute in attributes) {
    if (attribute == "title") {
      meta += `<title>${attributes[attribute]}</title>`
        + `<meta property="og:title" content="${attributes[attribute]}" />\n`
    } else if (attribute == "description") {
      meta += `<meta name="description" content="${attributes[attribute]}" />\n`
        + `<meta property="og:description" content="${attributes[attribute]}" />\n`
    } else if (attribute == "image") {
      meta += `<meta property="og:image" content="${attributes[attribute]}" />\n`
    } else if (attribute.startsWith("og:")) {
      meta += `<meta property="${attribute}" content="${attributes[attribute]}" />\n`
    } else if (!exceptions.includes(attribute)) {
      meta += `<meta name="${attribute}" content="${attributes[attribute]}" />\n`
    }
  }
  return meta
}

/**
 * Generates banner image HTML.
 * 
 * @param {string} imageSrc image source
 * @returns {string} HTML formatted image banner
 */
function generateCoverImage(imageSrc) {
  if (!imageSrc) return ""
  return `<div class="aspect-w-16 aspect-h-8 rounded-xl overflow-hidden">
    <img src="${imageSrc}" alt="image" class="object-cover" />
  </div>`
}

/**
 * Generates highlight image HTML.
 * 
 * @param {string} imageSrc image source
 * @returns {string} HTML formatted image highlight
 */
 function generateHighlightImage(imageSrc) {
  if (!imageSrc) return ""
  return `<div class="aspect-w-4 aspect-h-4 rounded-md overflow-hidden">
    <img src="${imageSrc}" alt="image" class="object-cover" />
  </div>`
}

/**
 * Generates banner image HTML.
 * 
 * @param {string} date image source
 * @returns {string} HTML formatted image banner
 */
function generateDate(date) {
  const nicedate = dayjs(date ? date : "").format("ddd, DD MMMM YYYY")

  return `<div class="mb-2 text-normal text-slate-700 dark:text-slate-400"
    <time datetime="${date}">${nicedate}</time>
  </div>`
}

/**
 * Creates and returns HTML post block.
 * 
 * @param {object} post posts object
 * @returns {string} HTML formatted post block
 */
function generatePostBlock(post, sourceUrl) {
  return `          <a href="${sourceUrl}/posts/${post.name}.html" class="bg-white dark:bg-slate-800 rounded-md px-6 py-8 ring-1 ring-slate-900/5 shadow-xl flex flex-col gap-5">
            ${generateHighlightImage(post.cover)}
            <div class="flex flex-col gap-1">
              <h2 class="text-2xl text-slate-900 dark:text-white font-semibold tracking-tight">${post.title}</h2>
              ${post.description ? `<p class="text-slate-500 dark:text-slate-400">${post.description}</p>` : ""}
            </div>
          </a>`
}
