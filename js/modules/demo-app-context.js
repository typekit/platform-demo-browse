var japaneseModeStr = 'japanese';

module.exports = {
  browseMode: null,
  fontListPageNum: 1,
  fontListCardsPerPage: 16,
  lastFontListScrollPos: 0,

  isJapaneseBrowseMode: function() {
    return this.browseMode === japaneseModeStr;
  },

  setJapaneseMode: function(toJapanese) {
    if (toJapanese) {
      this.browseMode = japaneseModeStr;
    }
    else {
      this.browseMode = null;
    }
  },

  captureFontListScrollPos: function() {
    this.lastFontListScrollPos = document.body.scrollTop;
  },

  setFontListScrollPos: function(pos) {
    document.body.scrollTop = pos;
  },

  restoreFontListScrollPos: function() {
    this.setFontListScrollPos(this.lastFontListScrollPos);
  }
}
