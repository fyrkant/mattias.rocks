const cssnext = require('postcss-cssnext');
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    cssnext({
      features: {
        customProperties: {
          preserve: true,
        },
      },
    }),
    require('cssnano'),
    purgecss({
      content: ['./_site/**/*.html'],
    }),
  ],
};
