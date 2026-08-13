import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "tests/validation.test.js",
      "tests/user.test.js",
    ],
  },
})
