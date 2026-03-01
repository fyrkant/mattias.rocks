const dayjs = require('dayjs');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const fs = require('fs');
const { promisify } = require('util');
const crypto = require('crypto');
const readFile = promisify(fs.readFile);
dayjs.extend(advancedFormat);

const hashPath = async (path) => {
  console.log(path);
  if (/.css$/.test(path)) {
    console.log('hello', path);
    return `${path}?v=${new Date().getTime()}`;
  }

  const file = await readFile(`_site${path}`, {
    encoding: 'utf-8',
  });
  const hash = crypto.createHash('sha512').update(file).digest('hex');
  const hashedPath = `${path}?hash=${hash.substr(0, 10)}`;
  console.log('hashed', hashedPath);
  return hashedPath;
};

module.exports = async function (eleventyConfig) {
  const { default: EleventyVitePlugin } = await import("@11ty/eleventy-plugin-vite");
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    viteOptions: { build: { emptyOutDir: false } },
  });
  eleventyConfig.addPassthroughCopy("js");
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
