function generateURL(length) {
  const template =
    "0123456789QWERTYUIOPASDFGHJKLMNBVCXZqwertyuioplkjhgfdsazxcbnm";
  let url = "";
  for (let i = 0; i < length; i++) {
    url += template[Math.floor(template.length * Math.random())];
  }
  return url;
}

module.exports = { generateURL };
