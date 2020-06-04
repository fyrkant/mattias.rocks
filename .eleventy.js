const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
 
module.exports = function(eleventyConfig) {
    const cacheBusterOptions = {};
    eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));
};