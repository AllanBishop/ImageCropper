# Image Cropper

An HTML5 image cropping tool. Features a rectangular crop area. The crop area's aspect ratio can be enforced during dragging. The crop image can either be 1:1 or scaled to fit an area. Also supports multitouch on touch supported devices.

## Screenshot

![Screenshot](https://raw.githubusercontent.com/AllanBishop/ImageCropper/master/screenshots/screenshot.jpg "Screenshot")

## Live demo

[Live demo on JSBin](http://jsbin.com/pajiha/45/edit?html,js,output)

## Requirements

 - A modern browser (mobile or desktop) supporting ```<canvas>```

## Installing

### Download

- [Download ImageCropper](https://github.com/AllanBishop/ImageCropper/archive/master.zip) files from GitHub.

### Add files

Add the script to your application.

```html
<script src="ImageCropper.min.js"></script>

```

## Public Functions

### ImageCropper(canvas, x, y, width, height, keepAspect, touchRadius):void

Constructor function that initializes the image cropper.

| Parameter | Description |
| ------ | ----------- |
| canvas | The canvas element that the cropping tool will display on.|
| x      | *Optional:* The left position of the crop area. |
| y      | *Optional:* The top position of the crop area.|
| width  | *Optional:* The initial width of the crop area.|
| height | *Optional:* The initial height of the crop area. |
| keepAspect   | *Optional:* Enforces that the aspect ratio is kept when dragging the crop area. The aspect ratio is defined by the width and height paramater. |
| touchRadius  | *Optional:* The radius for detecting touches/clicks on the corner drag markers and the centre drag marker. |


### getCroppedImage(fillWidth, fillHeight):Image

Returns an image that is cropped from the source image based on the crop area. If no fillWidth and fillHeight is set the image will be a 1:1 crop. If fillWidth and fillHeight are set the cropped image will scale to fit. It is recommended to ensure the fillWidth and fillHeight are set to the same aspect ratio as the crop area to prevent distortion.

| Parameter | Description |
| ------ | ----------- |
| fillWidth| *Optional:* The fill width that the cropped area will map to.|
| fillHeight| *Optional:* The fill height that the cropped area will map to. |

### setImage(image)

Set the image for the image cropper.

| Parameter | Description |
| ------ | ----------- |
| image| The image that will be used for cropping.

### isImageSet():boolean

Checks to see if an image has been set.

### getCropBounds():Bounds

Returns the bounds (left, right, top, bottom) of the crop area relative to the original source image.

## Example code


```html
<!DOCTYPE html>
<html>
<head lang="en">
		<meta charset="UTF-8">
		<title>Image Cropper Test</title>
	</head>
	<body>
		<div>
			Select image to crop: <input type="file" id="fileInput" name="file" multiple="" />
		</div>
		<div>
			<canvas id="imageCanvas" width="600" height="400" style="border:0px solid #000000;">
			</canvas>
		</div>
		<div>
		Cropped image:
		</div>
		<div id="preview"></div>
		<script src="ImageCropperTest.js"></script>
		<script src="ImageCropper.js"></script>
	</body>
</html>
```

ImageCropperTest.js


```javascript
var crop;
window.onload = function () {
    var canvas = document.getElementById("imageCanvas");
    var width = 600;
    var height = 300;
    crop = new ImageCropper(canvas, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height, true);
    window.addEventListener('mouseup', preview);
};
function preview() {
    if (crop.isImageSet()) {
        var img = crop.getCroppedImage(400, 200);
        img.onload = (function () { return previewLoaded(img); });
    }
}
function previewLoaded(img) {
    if (img) {
        document.getElementById("preview").appendChild(img);
    }
}
function handleFileSelect(evt) {
    var file = evt.target.files[0];
    var reader = new FileReader();
    var img = new Image();
    //listener required for FireFox
    img.addEventListener("load", function () {
        crop.setImage(img);
        preview();
    }, false);
    reader.onload = function () {
        img.src = reader.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}

```


## License

See the [LICENSE](https://github.com/AllanBishop/ImageCropper/blob/master/LICENSE.md) file.