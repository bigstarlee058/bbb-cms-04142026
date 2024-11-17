const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
    },
  },
  babel: {
    plugins: [
      '@babel/plugin-transform-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ],
  },
  presets: [
    '@babel/preset-env',
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ],
};
// const path = require('path');

// module.exports = {
//   webpack: {
//     configure: (webpackConfig) => {
//       // Add alias for date-fns and src
//       webpackConfig.resolve.alias = {
//         ...webpackConfig.resolve.alias,
//         '@': path.resolve(__dirname, 'src'),
//         'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
//       };

//       // Add rule to handle .mjs files
//       webpackConfig.module.rules = [
//         ...webpackConfig.module.rules,
//         {
//           test: /\.mjs$/,
//           include: /node_modules/,
//           type: "javascript/auto",
//         },
//       ];

//       // Ensure that Webpack can resolve .mjs files
//       webpackConfig.resolve.extensions = [
//         '.js',
//         '.jsx',
//         '.ts',
//         '.tsx',
//         '.mjs',  // Added .mjs extension
//       ];

//       return webpackConfig;
//     },
//   },
//   babel: {
//     plugins: [
//       '@babel/plugin-transform-nullish-coalescing-operator',
//       '@babel/plugin-proposal-optional-chaining', // Add this line
//     ],
//   },
//   style: {
//     postcss: {
//       plugins: [require('tailwindcss'), require('autoprefixer')],
//     },
//   },
// };