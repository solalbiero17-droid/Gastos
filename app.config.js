// Dynamic overlay on top of app.json. Only used to set a URL base path when
// building for GitHub Pages (which serves this repo under /<repo-name>/,
// not the domain root) — local dev and native builds are unaffected since
// GH_PAGES_BASE_URL is only set by the Pages deploy workflow.
module.exports = ({ config }) => {
  const baseUrl = process.env.GH_PAGES_BASE_URL;
  if (baseUrl) {
    config.experiments = { ...config.experiments, baseUrl };
  }
  return config;
};
