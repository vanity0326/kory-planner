const { getStore } = require('@netlify/blobs');

// Some deploy configurations don't get Netlify's automatic Blobs context
// injected. Falling back to explicit siteID + token (set as environment
// variables in Netlify's dashboard) makes this work regardless of that.
function openStore() {
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
    return getStore({
      name: 'kory-planner',
      siteID: process.env.BLOBS_SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });
  }
  return getStore('kory-planner');
}

module.exports = { openStore };
