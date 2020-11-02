const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const dayjs = require('dayjs')
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)
 
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
    const cacheBusterOptions = {};
    eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));
    eleventyConfig.addFilter('formatDate', (val) => {
      return dayjs(val).format('dddd, Do of MMMM YYYY')
    })
    eleventyConfig.addPassthroughCopy("img");
};