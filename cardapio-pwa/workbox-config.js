module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,png,svg,json,ico}"
  ],
  swDest: "dist/sw.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "html-cache",
        expiration: {
          maxEntries: 10
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources"
      }
    }
  ]
};
