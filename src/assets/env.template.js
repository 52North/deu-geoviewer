(function (window) {
  window.env = window.env || {};
  // Environment variables
  window["env"]["proxyUrl"] = "${PROXY_URL}";
  window["env"]["deployUrl"] = "${DEPLOY_URL}";
})(this);
