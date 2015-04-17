var ClypTestOptions = function() {
	var self = this;
	self.apiUrl = 'https://apistaging.clyp.it/';
	self.uploadResource = 'https://uploadstaging.clyp.it/upload/';
	self.featuredListResource = self.apiUrl + 'featuredlist';
	self.getAudioFileResource = function(audioFileId) {
		return self.apiUrl + audioFileId;
	};
}

exports.create = function() {
	return new ClypTestOptions();
};