const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const dayjs = require('dayjs')
const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)
 
module.exports = function(eleventyConfig) {
    const cacheBusterOptions = {};
    eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));
    eleventyConfig.addFilter('formatDate', (val) => {
      return dayjs(val).format('dddd, Do of MMMM YYYY')
    })
};