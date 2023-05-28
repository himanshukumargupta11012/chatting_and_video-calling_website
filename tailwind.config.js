/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*'],
  theme: {
    extend: {
      flexShrink: {
        2: '2'
      }
    }
  },
  plugins: [],
  // corePlugins: {
  //   preflight: false,
  // },

}
