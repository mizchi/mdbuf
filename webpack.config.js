const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { GenerateSW } = require("workbox-webpack-plugin");
const pkg = require("./package");

const tsLoader = {
  loader: "ts-loader",
  options: {
    transpileOnly: true,
  },
};

module.exports = (env, argv) => ({
  entry: {
    main: path.join(__dirname, "src/main"),
  },
  output: {
    globalObject: "self",
    filename: "[name].js",
    chunkFilename: "[name].[id].[contenthash].js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.worker\.(js|ts)$/i,
        use: [
          {
            loader: "comlink-loader",
            options: {
              singleton: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.tsx?/,
        use: [tsLoader],
      },
    ],
  },

  plugins: [
    // new MonacoWebpackPlugin(),
    new CleanWebpackPlugin(),
    new WorkerPlugin(),
    new webpack.DefinePlugin({
      "process.env.VERSION": JSON.stringify(pkg.version),
    }),
    new HTMLPlugin({
      template: path.join(__dirname, "src/main/index.html"),
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/manifest.webmanifest",
          to: "manifest.webmanifest",
        },
        {
          from: "src/assets",
          to: "assets",
        },
      ],
    }),
    ...(argv.mode === "production"
      ? [
          new GenerateSW({
            // globDirectory: path.join(__dirname, "dist"),
            // globPatterns: ["*.{html,js,css}"],
            swDest: "service-worker.js",
            clientsClaim: true,
            skipWaiting: true,
          }),
        ]
      : []),
  ],
});
