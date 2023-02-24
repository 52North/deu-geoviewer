(function (window) {
  window.env = window.env || {};
  // Environment variables
  // window["env"]["proxyUrl"] = "https://www.europeandataportal.eu/mapapps-proxy?";
  // window["env"]["apiUrl"] = "https://www.europeandataportal.eu/data/api/";
  // window["env"]["deployUrl"] = "https://www.europeandataportal.eu/";

  //const host = "ppe.data.europa.eu";
  const host = "data.europa.eu";
  window["env"]["deployUrl"] = `https://${host}/`;
  window["env"]["proxyUrl"] = `https://${host}/deu-proxy?`;
  window["env"]["apiUrl"] = `https://${host}/api/hub/repo/`;
})(this);
