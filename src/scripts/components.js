import dayjs from "dayjs";
import { truncateText } from "./helpers";

export function buttonComponent(link, text) {
  return `<a
    href="${link}"
    class="relative overflow-hidden text-white font-medium transition ease duration-300 bg-blue-600 rounded-md px-10 py-3 hover:bg-blue-800"
  >
    <span class="absolute bottom-0 left-0 h-full -ml-2">
      <svg viewBox="0 0 487 487" class="w-auto h-full opacity-100 object-stretch" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z" fill="#FFF" fill-rule="nonzero" fill-opacity=".1"></path>
      </svg>
    </span>
    <span class="absolute top-0 right-0 w-12 h-full -mr-3">
      <svg viewBox="0 0 487 487" class="object-cover w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z" fill="#FFF" fill-rule="nonzero" fill-opacity=".1"></path>
      </svg>
    </span>
    <span class="relative">${text}</span>
  </a>`;
}

/**
 * Generates banner image HTML.
 *
 * @param {object} image object containing image url, description and source
 * @returns {string} HTML formatted image banner
 */
export function coverImageComponent(image) {
  if (!image.url) return "";
  return `<div class="flex flex-col gap-3">
  <div class="aspect-w-16 aspect-h-8 rounded-xl overflow-hidden">
      <img src="${image.url}" alt="${image.description || "image"}" class="object-cover" />
    </div>
    ${
      image.description
        ? image.source
          ? `<a href="${image.source}" class="px-2 text-slate-400 dark:text-slate-500" target="_blank">
            ${image.description}
          </a>`
          : `<p class="px-2 text-slate-400 dark:text-slate-500">${image.description}</p>`
        : ""
    }
    </div>`;
}

/**
 * Generates banner image HTML.
 *
 * @param {string} date image source
 * @returns {string} HTML formatted image banner
 */
export function dateComponent(date) {
  const nicedate = dayjs(date ? date : "").format("ddd, DD MMMM YYYY");

  return `<div class="mb-2 text-normal text-slate-700 dark:text-slate-400"
    <time datetime="${date}">${nicedate}</time>
  </div>`;
}

/**
 * Generates feature component.
 *
 * @param {object} post post object
 * @param {string} title feature title
 * @param {string} text feature description
 * @returns {string} HTML formatted feature
 */
export function featureComponent(sourceUrl, post) {
  return `<div href="" class="grid grid-cols-2 gap-6">
    <div class="flex flex-col justify-center gap-6">
      <div class="flex flex-col gap-3">
        <h2 class="text-2xl text-slate-900 dark:text-white font-semibold tracking-tight">${post.title}</h2>
        <p class="text-slate-500 dark:text-slate-400">${post.description}</p>
      </div>
      <div>
        ${buttonComponent(`${sourceUrl}/posts/${post.name}.html`, "View post")}
      </div>
    </div>
    <div class="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
      <img src="${post.cover.url}" alt="${post.cover.description || "image"}" class="object-cover" />
    </div>
  </div>`;
}

/**
 * Generates featured person component.
 *
 * @param {string} sourceUrl base url to build links
 * @param {string} title feature title
 * @param {string} description feature description
 * @param {object} image object containing url, description, and source for feature
 * @returns {string} HTML formatted featured person
 */
export function featuredPersonComponent(sourceUrl, title, description, image) {
  return `<div href="" class="grid grid-cols-2 gap-6">
    <div class="flex flex-col justify-center gap-6">
      <div class="flex flex-col gap-3">
        <h1 class="text-5xl text-slate-900 dark:text-white font-bold">
          ${title}
        </h1>
        <p class="text-slate-500 dark:text-slate-400">
          ${description}
        </p>
      </div>
      <div>
        ${buttonComponent(`${sourceUrl}/posts`, "View all posts")}
      </div>
    </div>
    <div class="aspect-w-4 aspect-h-4 rounded-full overflow-hidden">
      <img src="${image.url}" alt="${image.description || "image"}" class="object-cover" />
    </div>
    ${
      image.description
        ? image.source
          ? `<a href="${image.source}" class="text-slate-500 dark:text-slate-400">${image.description}</a>`
          : `<p class="text-slate-500 dark:text-slate-400">${image.description}</p>`
        : ""
    }
</div>`;
}

/**
 * Generates meta tags from passed object of attributes.
 *
 * @param {object} config project configuration
 * @param {object} attributes object of attributes, can be empty
 * @returns {string} HTML formatted meta tags
 */
export function metaComponent(config, attributes) {
  const exceptions = ["date"];

  let meta = "";
  for (const attribute in attributes) {
    if (attribute == "title") {
      meta +=
        `<title>${attributes[attribute]} - ${config.branding.blogName}</title>` +
        `<meta property="og:title" content="${attributes[attribute]} - ${config.branding.blogName}" />\n`;
    } else if (attribute == "description") {
      meta +=
        `<meta name="description" content="${attributes[attribute]}" />\n` +
        `<meta property="og:description" content="${attributes[attribute]}" />\n`;
    } else if (attribute == "image") {
      meta += `<meta property="og:image" content="${attributes[attribute]}" />\n`;
    } else if (attribute.startsWith("og:")) {
      meta += `<meta property="${attribute}" content="${attributes[attribute]}" />\n`;
    } else if (!exceptions.includes(attribute)) {
      meta += `<meta name="${attribute}" content="${attributes[attribute]}" />\n`;
    }
  }
  return meta;
}

/**
 * Creates and returns HTML post block.
 *
 * @param {object} post posts object
 * @param {string} sourceUrI domain source url
 * @returns {string} HTML formatted post block
 */
export function postBlockComponent(post, sourceUrl) {
  return `<a href="${sourceUrl}/posts/${post.name}.html" class="flex flex-col gap-5">
    ${
      !post.cover.url
        ? ""
        : `<div class="aspect-w-4 aspect-h-3 rounded-md overflow-hidden">
      <img src="${post.cover.url}" alt="${post.cover.description || "image"}" class="object-cover" />
    </div>`
    }
    <div class="flex flex-col gap-1 px-1">
      <h2 class="text-2xl text-slate-900 dark:text-white font-semibold tracking-tight">
        ${post.title}
      </h2>
      ${
        post.description
          ? `<p class="text-slate-500 dark:text-slate-400">${truncateText(post.description)}</p>`
          : ""
      }
    </div>
  </a>`;
}

/**
 * Creates and returns HTML recent posts block.
 *
 * @param {object} config project configuration
 * @param {object[]} posts post objects array
 * @returns {string} HTML formatted recent posts block
 */
export function recentPostsComponent(config, posts) {
  return `<div class="flex flex-col gap-4">
    ${
      posts.length <= 0
        ? ""
        : `<h2 class="text-2xl text-slate-900 dark:text-white font-semibold tracking-tight">
        Most recent posts
      </h2>`
    }
    <div class="grid gap-6 grid-cols-3">
      ${posts
        .map((post) => {
          return postBlockComponent(post, config.outputUrl);
        })
        .join("\n")}
    </div>
    ${
      posts.length > 1
        ? `<div class="flex flex-row justify-center">
        ${buttonComponent(`${config.outputUrl}/posts.html`, "See all posts")}
      </div>`
        : ""
    }
  </div>`;
}

/**
 * Creates and returns HTML for tags list.
 *
 * @param {object} config project configuration
 * @param {string[]} tags list of unique tags
 * @returns
 */
export function tagsComponent(config, tags) {
  if (!tags) if (tags.length == 0) return "";

  return `<div class="flex flex-row flex-wrap gap-4">
      ${tags
        .map(
          (tag) =>
            `<a
            href="${config.outputUrl}/${config.tagsDir}/${tag
              .toLowerCase()
              .replace(/\s/g, "-")}.html"
            class="inline-block px-2 py-1 rounded-full bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-200 text-xs font-semibold tracking-wide"
            >
            ${tag}
          </a>`,
        )
        .join("\n")}
    </div>`;
}

/**
 * Creates and returns HTML title component.
 *
 * @param {string} title the title text
 * @returns {string} HTML formatted component
 */
export function titleComponent(title) {
  return `<h1 class="text-5xl text-slate-900 dark:text-white font-bold">
    ${title}
  </h1>`;
}
