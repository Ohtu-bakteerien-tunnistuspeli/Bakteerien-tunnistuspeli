/* eslint-disable no-undef */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    videoCompression: false,
    viewportWidth: 1800,
    viewportHeight: 1200,
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    },
})
