;
(function () {
  var loadedPacks = {};
  function getPackDataUri(packId, assetId) {
    if (!loadedPacks[packId]) {
      loadedPacks[packId] = {};
      if (typeof document !== 'undefined') {
        var el = document.getElementById('sj-media-pack-' + packId);
        if (el && el.textContent) {
          try {
            loadedPacks[packId] = JSON.parse(el.textContent);
          } catch (e) {}
        }
      }
    }
    return loadedPacks[packId][assetId] || '';
  }
  var reg = window.SEEN_JEEM_DATA && window.SEEN_JEEM_DATA.mediaRegistry;
  if (reg) {
    Object.keys(reg).forEach(function (aid) {
      var item = reg[aid];
      var pId = item.packId || 'covers';
      Object.defineProperty(item, 'dataUri', {
        enumerable: true,
        configurable: true,
        get: function () {
          if (this._cachedUri) return this._cachedUri;
          this._cachedUri = getPackDataUri(pId, aid);
          return this._cachedUri;
        },
        set: function (val) {
          this._cachedUri = val;
        }
      });
    });
  }
})();
