const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-preset-env')(),
    require('cssnano'),
    purgecss({
      content: ['./_site/**/*.html'],
    }),
  ],
};
