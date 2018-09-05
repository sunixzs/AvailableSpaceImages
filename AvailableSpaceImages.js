/**
 * Displays the best image source in relation to the embedding available space.
 * Loads the image source when the image enters the viewport.
 *
 * There should be some variants of the image in different widths. All set in data-src-WIDTH attributes:
 *
 * <img src="320.png" alt="" width="1000" height="500"
 * 	data-method="mab-available-space-image"
 *  data-default-width="320"
 * 	data-src-500="500.png"
 * 	data-src-1000="1000.png"
 * 	data-src-1500="1500.png"
 * 	data-src-2000="2000.png"
 * />
 */

(function(window) {
    "use strict";

    var AvailableSpaceImages = function(params) {
        this.settings = {
            querySelector: '[data-method="available-space-image"]',
            onInit: null
        };

        // override settings
        if (typeof params === "object") {
            for (var key in params) {
                if (params.hasOwnProperty(key) && typeof this.settings[key] !== "undefined") {
                    this.settings[key] = params[key];
                }
            }
        }

        this.devicePixelRatio = window.devicePixelRatio || 1; // display pixel depth
        this.imageSets = []; // storage for all image stuff
        this.observer = null; // IntersectionObserver
        this.imageCollection = document.querySelectorAll(this.settings.querySelector); // found images

        // start the magick
        this.init();
    };

    AvailableSpaceImages.prototype = {
        /**
         * IE/Edge in iframes have a problem to detect, if an image is in viewport.
         */
        isExplorer: function() {
            return document.documentMode || /Edge/.test(navigator.userAgent);
        },
        isInIframe: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        /**
         *
         */
        init: function() {
            var self = this;

            // build images data
            var iNum = 0;
            for (var i = 0; i < this.imageCollection.length; i++) {
                var img = this.imageCollection[i];

                if (img.tagName.toLowerCase() !== "img") {
                    return; // continue
                }

                // build source-set
                var sourceSet = [
                    {
                        width: img.getAttribute("data-default-width") ? parseInt(img.getAttribute("data-default-width")) : 320,
                        src: img.getAttribute("src")
                    }
                ];

                for (var a = 0; a < img.attributes.length; a++) {
                    var ia = img.attributes[a];
                    if (ia.nodeName.indexOf("data-src-") === 0) {
                        var k = parseInt(ia.nodeName.replace("data-src-", ""));
                        if (k) {
                            sourceSet.push({
                                width: k,
                                src: ia.nodeValue
                            });
                        }
                    }
                }

                // sort narrowest image first
                sourceSet.sort(function(a, b) {
                    var r = 0;
                    if (a.width > b.width) {
                        r = 1;
                    } else if (b.width > a.width) {
                        r = -1;
                    }
                    return r;
                });

                // note the key in array for further reference
                img.setAttribute("data-src-num", iNum);

                // add to set
                this.imageSets[iNum] = {
                    sourceSet: sourceSet,
                    image: img,
                    loadingImage: null
                };
                iNum++;
            }

            // init callback?
            if (typeof this.settings.onInit === "function") {
                this.settings.onInit(this);
            }

            // Without observers load all directly
            // or explorer/edge in iframe
            if (!window.IntersectionObserver || (this.isExplorer() && this.isInIframe())) {
                for (var i = 0; i < this.imageSets.length; i++) {
                    this.loadImage(this.imageSets[i].image);
                }
                return;
            }

            // observe each image
            this.observer = new IntersectionObserver(
                function(entries) {
                    for (var i = 0; i < entries.length; i++) {
                        if (entries[i].intersectionRatio > 0) {
                            self.loadImage(entries[i].target);
                        }
                    }
                },
                {
                    root: null,
                    rootMargin: "0px",
                    threshold: [0]
                }
            );

            for (var i = 0; i < this.imageSets.length; i++) {
                this.observer.observe(this.imageSets[i].image);
            }
        },

        /**
         * @param {object} imageSet
         */
        getBestImageSrc: function(imageSet) {
            var targetWidth = imageSet.image.parentNode.clientWidth * this.devicePixelRatio;
            for (var i = 0; i < imageSet.sourceSet.length; i++) {
                if (targetWidth < imageSet.sourceSet[i].width) {
                    return imageSet.sourceSet[i].src;
                }
            }
            return imageSet.sourceSet[imageSet.sourceSet.length - 1].src; // largest src fallback
        },

        /**
         * @param {oject} image
         */
        loadImage: function(image) {
            var n = parseInt(image.getAttribute("data-src-num")),
                is = this.imageSets[n],
                newSrc = this.getBestImageSrc(is),
                self = this;

            if (newSrc !== image.getAttribute("src")) {
                // load new image before setting it
                is.loadingImage = new Image();
                is.loadingImage.setAttribute("src", newSrc);
                is.loadingImage.setAttribute("data-src-num", n);
                is.loadingImage.addEventListener("load", function(evt) {
                    var m = parseInt(evt.target.getAttribute("data-src-num"));
                    if (self.imageSets[m]) {
                        self.imageSets[m].image.setAttribute("src", evt.target.getAttribute("src"));
                    }
                });
            }
        }
    };

    if (typeof define === "function" && define.amd) {
        define(function() {
            return AvailableSpaceImages;
        });
    } else {
        window.AvailableSpaceImages = AvailableSpaceImages;
    }
})(window);
