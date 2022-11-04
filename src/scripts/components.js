import dayjs from "dayjs";

/**
 * Generates meta tags from passed object of attributes.
 *
 * @param {object} attributes object of attributes, can be empty
 * @returns {string} HTML formatted meta tags
 */
export function metaComponent(attributes) {
  const exceptions = ["date"];

  let meta = "";
  for (const attribute in attributes) {
    if (attribute == "title") {
      meta +=
        `<title>${attributes[attribute]}</title>` +
        `<meta property="og:title" content="${attributes[attribute]}" />\n`;
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
 * Generates banner image HTML.
 *
 * @param {string} imageSrc image source
 * @returns {string} HTML formatted image banner
 */
export function coverImageComponent(imageSrc) {
  if (!imageSrc) return "";
  return `<div class="aspect-w-16 aspect-h-8 rounded-xl overflow-hidden">
    <img src="${imageSrc}" alt="image" class="object-cover" />
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
 * Creates and returns HTML post block.
 *
 * @param {object} post posts object
 * @returns {string} HTML formatted post block
 */
export function postBlockComponent(post, sourceUrl) {
  return `          <a href="${sourceUrl}/posts/${
    post.name
  }.html" class="bg-white dark:bg-slate-800 rounded-md px-6 py-8 ring-1 ring-slate-900/5 shadow-xl flex flex-col gap-5">
            ${
              !post.cover
                ? ""
                : `<div class="aspect-w-4 aspect-h-4 rounded-md overflow-hidden">
              <img src="${post.cover}" alt="image" class="object-cover" />
            </div>`
            }
            <div class="flex flex-col gap-1">
              <h2 class="text-2xl text-slate-900 dark:text-white font-semibold tracking-tight">${
                post.title
              }</h2>
              ${
                post.description
                  ? `<p class="text-slate-500 dark:text-slate-400">${post.description}</p>`
                  : ""
              }
            </div>
          </a>`;
}
