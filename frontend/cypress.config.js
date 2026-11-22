/* eslint-disable no-undef */
import { defineConfig } from 'cypress'

export default defineConfig({
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
