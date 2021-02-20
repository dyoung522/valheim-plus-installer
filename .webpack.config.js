// define child rescript
module.exports = config => {
  config.node.__dirname = true;
  config.target = "electron-renderer";
  config.resolve.alias = {
    ...config.resolve.alias,
    "react-dom": "@hot-loader/react-dom"
  };

  return config;
};
