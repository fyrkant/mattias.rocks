const dayjs = require('dayjs');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const fs = require('fs');
const { promisify } = require('util');
const crypto = require('crypto');
const readFile = promisify(fs.readFile);
dayjs.extend(advancedFormat);

const hashPath = async (path) => {
  const file = await readFile(`_site${path}`, { encoding: 'utf-8' });
  const hash = crypto.createHash('sha512').update(file).digest('hex');
  return `${path}?hash=${hash.substr(0, 10)}`;
};

module.exports = async function (eleventyConfig) {
  // Hide test posts on production; show them on branch/preview deploys and locally
  if (process.env.CONTEXT === 'production') {
    eleventyConfig.ignores.add('posts/*.test.md');
  }

  const { default: EleventyVitePlugin } = await import("@11ty/eleventy-plugin-vite");
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    viteOptions: { build: { emptyOutDir: false } },
  });
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addFilter('formatDate', (val) => {
    return dayjs(val).format('dddd, Do of MMMM YYYY');
  });
  eleventyConfig.addFilter('isoDate', (val) => {
    return dayjs(val).format('YYYY-MM-DD');
  });
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addNunjucksAsyncFilter('addHash', (path, cb) => {
    hashPath(path).then((x) => cb(null, x)).catch((e) => cb(e))
  });
};
