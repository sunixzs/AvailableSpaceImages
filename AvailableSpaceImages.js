/**
 * Displays the best image source in relation to the embedding available space.
 * Loads the image source when the image enters the viewport.
 * 
 * There should be some variants of the image in different widths. All set in data-src-WIDTH attributes:
 * 
 * <img src="320.png" alt="" width="1000" height="500"
 * 	data-method="mab-available-space-image"
 * 	data-src-500="500.png"
 * 	data-src-1000="1000.png"
 * 	data-src-1500="1500.png"
 * 	data-src-2000="2000.png"
 * />
 */

(function (window) {
	'use strict';

	var AvailableSpaceImages = function (params) {
		this.settings = {
			querySelector: "[data-method=\"mab-available-space-image\"]",
			onInit: null
		}

		if (typeof params === "object") {
			for (var key in params) {
				if (params.hasOwnProperty(key) && typeof this.settings[key] !== "undefined") {
					this.settings[key] = params[key];
				}
			}
		}

		this.devicePixelRatio = window.devicePixelRatio || 1;
		this.imageSets = [];
		this.observer = null;
		this.imageCollection = document.querySelectorAll(this.settings.querySelector);

		this.init();
	}

	AvailableSpaceImages.prototype = {
		init: function () {
			var self = this;

			

			// build images data
			var i = 0;
			this.imageCollection.forEach(function (image) {
				if (image.tagName.toLowerCase() !== "img") {
					return; // continue
				}

				// build source-set
				var sourceSet = [{
					width: 320,
					src: image.getAttribute("src")
				}];

				for (var a = 0; a < image.attributes.length; a++) {
					if (image.attributes[a].nodeName.indexOf("data-src-") === 0) {
						var k = parseInt(image.attributes[a].nodeName.replace("data-src-", ""));
						if (k) {
							sourceSet.push({
								width: k,
								src: image.attributes[a].nodeValue
							});
						}
					}
				}
				sourceSet.sort(function (a, b) {
					var r = 0;
					if (a.width > b.width) {
						r = 1;
					} else if (b.width > a.width) {
						r = -1;
					}
					return r;
				});

				image.setAttribute("data-src-num", i);

				self.imageSets[i] = {
					sourceSet: sourceSet,
					image: image,
					loadingImage: null
				};
				i++;
			});

			if (typeof this.settings.onInit === "function") {
				this.settings.onInit(this);
			}

			// Without observers load all directly
			// if directCallCallback is set: load all directly
			if (!window.IntersectionObserver) {
				this.imageSets.forEach(function (imageSet) {
					self.loadImage(imageSet.image);
				});
				return;
			}

			this.observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.intersectionRatio > 0) {
						//self.observer.unobserve(entry.target);
						self.loadImage(entry.target);
					}
				});
			}, {
					root: null,
					rootMargin: "0px",
					threshold: [0]
				});

			this.imageSets.forEach(function (imageSet) {
				self.observer.observe(imageSet.image);
			});
		},

		getBestImageSrc: function (imageSet) {
			var targetWidth = imageSet.image.parentNode.clientWidth * this.devicePixelRatio;

			for (var i = 0; i < imageSet.sourceSet.length; i++) {
				if (targetWidth < imageSet.sourceSet[i].width) {
					return imageSet.sourceSet[i].src;
				}
			}
			
			return imageSet.sourceSet[imageSet.sourceSet.length].src; // largest src fallback
		},

		loadImage: function (image) {
			var n = parseInt(image.getAttribute("data-src-num")),
				is = this.imageSets[n],
				newSrc = this.getBestImageSrc(is),
				self = this;

			if (newSrc !== image.getAttribute("src")) {
				is.loadingImage = new Image();
				is.loadingImage.setAttribute("src", newSrc);
				is.loadingImage.setAttribute("data-src-num", n);
				is.loadingImage.addEventListener("load", function (evt) {
					var m = parseInt(evt.target.getAttribute("data-src-num"));
					if (self.imageSets[m]) {
						self.imageSets[m].image.setAttribute("src", evt.target.getAttribute("src"));
					}
				});
			}
		}
	};

	if (typeof define === 'function' && define.amd) {
		define(function () {
			return AvailableSpaceImages;
		});
	} else {
		window.AvailableSpaceImages = AvailableSpaceImages;
	}

})(window);