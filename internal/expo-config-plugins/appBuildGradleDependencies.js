const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = withAppBuildGradleDependencies = (config, customName) => {
  return withAppBuildGradle(config, (config) => {
    const initialIndex = config.modResults.contents.indexOf("dependencies {");

    config.modResults.contents =
      config.modResults.contents.slice(0, initialIndex) +
      `dependencies {
    implementation 'com.squareup.okhttp3:logging-interceptor:5.0.0-alpha.11'
    implementation 'com.squareup.okhttp3:okhttp:5.0.0-alpha.11'
    implementation 'com.squareup.okhttp3:okhttp-urlconnection:5.0.0-alpha.11'` +
      config.modResults.contents.slice(initialIndex + "dependencies {".length);

    return config;
  });
};
