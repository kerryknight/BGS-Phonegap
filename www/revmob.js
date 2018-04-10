/*
 * revmob.js
 * Adapted by Kerry Knight on 2013-10-15
 */

 (function(cordova) {
 	function RevMob() {};

 	var cdva = cordova,
 	service = 'RevMobPlugin';

 	RevMob.prototype.initWithAppId = function(appId, success, error) {
 		if(!appId) return false;

 		var s = this;
 		s.TEST_DISABLED = 0;
 		s.TEST_WITH_ADS = 1;
 		s.TEST_WITHOUT_ADS = 2;

 		return cdva.exec(success, error, service, "startSession", [appId]);
 	};

 	RevMob.prototype.showFullscreen = function(success, error) {
 		return cdva.exec(success, error, service, "showFullscreen", []);
 	};

 	RevMob.prototype.openAdLink = function(success, error) {
 		return cdva.exec(success, error, service, "openAdLink", []);
 	};

 	RevMob.prototype.showPopup = function(success, error) {
 		return cdva.exec(success, error, service, "showPopup", []);
 	};

 	RevMob.prototype.setTestingMode = function(testingMode) {
 		return cdva.exec(null, null, service, "setTestingMode", [testingMode]);
 	};

 	RevMob.prototype.printEnvironmentInformation = function() {
 		return cdva.exec(null, null, service, "printEnvironmentInformation", []);
 	};

 	RevMob.prototype.setTimeoutInSeconds = function(seconds) {
 		return cdva.exec(null, null, service, "setTimeoutInSeconds", [seconds]);
 	};

	if (cdva && cdva.addConstructor) {
		cdva.addConstructor(function() {
			if (!window.plugins) window.plugins = {};
 			window.plugins.revMob = new RevMob();
		});
	} 
	
})(window.cordova || window.Cordova || window.Phonegap || window.phonegap || window.PhoneGap);
