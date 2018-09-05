# AvailableSpaceImages
JavaScript to display the best image source in relation to the embedding available space.
Loads the image source when the image enters the viewport.

## Typical img-tag definition

There should be some variants of the image in different widths. All set in data-src-WIDTH attributes:

```
<img src="320.png" alt="" width="1000" height="500"
	data-method="mab-available-space-image"
	data-default-width="320"
	data-src-500="500.png"
	data-src-1000="1000.png"
	data-src-1500="1500.png"
	data-src-2000="2000.png"
/>
```

## make instance

```
<script src="AvailableSpaceImages.js" type="text/javascript"></script>
<script>
new AvailableSpaceImages();
</script>
```

## or load with requirejs

```
<script>
require(["AvailableSpaceImages"], function (AvailableSpaceImages) {
  new AvailableSpaceImages();
});
</script>
```

## Options

```
new AvailableSpaceImages({
  querySelector: "[data-method=\"mab-available-space-image\"]",
  // string used to get the image elements with document.querySelectorAll
  
  onInit: null
  // function, which is called after all is initiated
});
```
