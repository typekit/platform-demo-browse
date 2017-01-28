var japaneseModeStr = 'japanese';

module.exports = {
  browseMode: null,
  fontListPageNum: 1,
  fontListCardsPerPage: 16,
  lastFontListScrollPos: 0,
  searchText: '',
  sort: 'featured_rank',
  currentCollection: 'full',

  imsClientID : 'TypekitPlatformDemoApp', // Replace this with your client-id

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
  },

  getClientID: function() {
    return this.imsClientID;
  },

  setSearchText: function(searchText) {
    this.searchText = searchText;
  },

  getSearchText: function() {
    return this.searchText;
  },

  setSortOrder: function(sort) {
    this.sort = sort;
  },

  getSortOrder: function() {
    return this.sort;
  },

  setCurrentCollection: function(collection) {
    this.currentCollection = collection;
  },

  getCurrentCollection: function() {
    return this.currentCollection;
  },
}
