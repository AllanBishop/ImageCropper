/**
 * Copyright (c) 2015 Allan Bishop http://www.allanbishop.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/
/// <reference path="ImageCropper.ts"/>
var crop;
window.onload = function () {
    var canvas = document.getElementById("imageCanvas");
    var width = 600;
    var height = 300;
    crop = new ImageCropper(canvas, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height, true);
    window.addEventListener('mouseup', preview);
    window.addEventListener('touchend', preview);
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
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
//# sourceMappingURL=ImageCropperTest.js.map