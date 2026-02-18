const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Workaround for EAS Android build failure:
 *   createBundleReleaseJsAndAssets -> hermesc finished with non-zero exit value 2
 *
 * The prebuilt hermesc (linux64-bin) can fail on EAS build servers. Disabling
 * Hermes bytecode compilation skips the hermesc step; the app still uses the
 * Hermes engine but runs JS from the plain bundle (slightly slower cold start).
 */
function withDisableHermesBytecode(config) {
  return withGradleProperties(config, (config) => {
    const items = config.modResults;
    // React Native checks "hermesEnabled" first, then "react.hermesEnabled"
    // Both must be false - hermesEnabled=true in Expo template overrides react.hermesEnabled
    for (const key of ["hermesEnabled", "react.hermesEnabled"]) {
      const existing = items.find(
        (item) => item.type === "property" && item.key === key
      );
      if (existing) {
        existing.value = "false";
      } else {
        items.push({ type: "property", key, value: "false" });
      }
    }
    return config;
  });
}

module.exports = withDisableHermesBytecode;
