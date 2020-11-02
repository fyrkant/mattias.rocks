const dayjs = require('dayjs');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const fs = require('fs');
const { promisify } = require('util');
const hasha = require('hasha');
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
  const hash = await hasha.async(file);
  const hashedPath = `${path}?hash=${hash.substr(0, 10)}`;
  console.log('hashed', hashedPath);
  return hashedPath;
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addFilter('formatDate', (val) => {
    return dayjs(val).format('dddd, Do of MMMM YYYY');
  });
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addNunjucksAsyncFilter('addHash', (path, cb) => {
    hashPath(path).then((x) => cb(null, x)).catch((e) => cb(e))
  });
};
