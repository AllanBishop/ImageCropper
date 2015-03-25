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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Handle = (function () {
    function Handle(x, y, radius) {
        this.over = false;
        this.drag = false;
        this.position = new Point(x, y);
        this.offset = new Point(0, 0);
        this.radius = radius;
    }
    Handle.prototype.setDrag = function (value) {
        this.drag = value;
        this.over = value;
    };
    Handle.prototype.draw = function (ctx) {
    };
    Handle.prototype.setOver = function (over) {
        this.over = over;
    };
    Handle.prototype.touchInBounds = function (x, y) {
        return (x > this.position.x - this.radius && x < this.position.x + this.radius && y > this.position.y - this.radius && y < this.position.y + this.radius);
    };
    Handle.prototype.getPosition = function () {
        return this.position;
    };
    Handle.prototype.setPosition = function (x, y) {
        this.position = new Point(x, y);
    };
    return Handle;
})();
var CropService = (function () {
    function CropService() {
    }
    CropService.init = function (canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    };
    CropService.DEG2RAD = 0.0174532925;
    return CropService;
})();
var DragMarker = (function (_super) {
    __extends(DragMarker, _super);
    function DragMarker(x, y, radius) {
        _super.call(this, x, y, radius);
    }
    DragMarker.prototype.draw = function (ctx) {
        var scale = 1;
        if (this.over || this.drag) {
            scale = 1.2;
        }
        this.drawConnector(ctx, 90, scale);
        this.drawConnector(ctx, 0, scale);
        this.drawArrow(ctx, 0, scale);
        this.drawArrow(ctx, 90, scale);
        this.drawArrow(ctx, 180, scale);
        this.drawArrow(ctx, 270, scale);
    };
    DragMarker.prototype.rotatePoint = function (cx, cy, angle, p) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        p.x -= cx;
        p.y -= cy;
        var xnew = p.x * c - p.y * s;
        var ynew = p.x * s + p.y * c;
        p.x = xnew + cx;
        p.y = ynew + cy;
        return p;
    };
    DragMarker.prototype.drawConnector = function (ctx, angle, scale) {
        angle *= CropService.DEG2RAD;
        var c = new Point(this.position.x, this.position.y);
        var p1 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x - (2 * scale), this.position.y + (9 * scale)));
        var p2 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x + (2 * scale), this.position.y + (9 * scale)));
        var p3 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x + (2 * scale), this.position.y - (9 * scale)));
        var p4 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x - (2 * scale), this.position.y - (9 * scale)));
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,228,0,1)';
        ctx.fill();
    };
    DragMarker.prototype.drawArrow = function (ctx, angle, scale) {
        angle *= CropService.DEG2RAD;
        var c = new Point(this.position.x, this.position.y);
        var p1 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x - (5 * scale), this.position.y + (8 * scale)));
        var p2 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x, this.position.y + (15 * scale)));
        var p3 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x + (5 * scale), this.position.y + (8 * scale)));
        var p4 = this.rotatePoint(c.x, c.y, angle, new Point(this.position.x, this.position.y + (8 * scale)));
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,228,0,1)';
        ctx.fill();
    };
    DragMarker.prototype.recalculatePosition = function (bounds) {
        var c = bounds.getCentre();
        this.setPosition(c.x, c.y);
    };
    return DragMarker;
})(Handle);
var CornerMarker = (function (_super) {
    __extends(CornerMarker, _super);
    function CornerMarker(x, y, radius) {
        _super.call(this, x, y, radius);
    }
    CornerMarker.prototype.drawCornerBorder = function (ctx) {
        var sideLength = 10;
        if (this.over || this.drag) {
            sideLength = 12;
        }
        var hDirection = 1;
        var vDirection = 1;
        if (this.horizontalNeighbour.position.x < this.position.x) {
            hDirection = -1;
        }
        if (this.verticalNeighbour.position.y < this.position.y) {
            vDirection = -1;
        }
        ctx.beginPath();
        ctx.lineJoin = "miter";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + (sideLength * hDirection), this.position.y);
        ctx.lineTo(this.position.x + (sideLength * hDirection), this.position.y + (sideLength * vDirection));
        ctx.lineTo(this.position.x, this.position.y + (sideLength * vDirection));
        ctx.lineTo(this.position.x, this.position.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,228,0,1)';
        ctx.stroke();
    };
    CornerMarker.prototype.drawCornerFill = function (ctx) {
        var sideLength = 10;
        if (this.over || this.drag) {
            sideLength = 12;
        }
        var hDirection = 1;
        var vDirection = 1;
        if (this.horizontalNeighbour.position.x < this.position.x) {
            hDirection = -1;
        }
        if (this.verticalNeighbour.position.y < this.position.y) {
            vDirection = -1;
        }
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + (sideLength * hDirection), this.position.y);
        ctx.lineTo(this.position.x + (sideLength * hDirection), this.position.y + (sideLength * vDirection));
        ctx.lineTo(this.position.x, this.position.y + (sideLength * vDirection));
        ctx.lineTo(this.position.x, this.position.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
    };
    CornerMarker.prototype.moveX = function (x) {
        this.setPosition(x, this.position.y);
    };
    CornerMarker.prototype.moveY = function (y) {
        this.setPosition(this.position.x, y);
    };
    CornerMarker.prototype.move = function (x, y) {
        this.setPosition(x, y);
        this.verticalNeighbour.moveX(x);
        this.horizontalNeighbour.moveY(y);
    };
    CornerMarker.prototype.addHorizontalNeighbour = function (neighbour) {
        this.horizontalNeighbour = neighbour;
    };
    CornerMarker.prototype.addVerticalNeighbour = function (neighbour) {
        this.verticalNeighbour = neighbour;
    };
    CornerMarker.prototype.getHorizontalNeighbour = function () {
        return this.horizontalNeighbour;
    };
    CornerMarker.prototype.getVerticalNeighbour = function () {
        return this.verticalNeighbour;
    };
    CornerMarker.prototype.draw = function (ctx) {
        this.drawCornerFill(ctx);
        this.drawCornerBorder(ctx);
    };
    return CornerMarker;
})(Handle);
var Bounds = (function () {
    function Bounds(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.left = x;
        this.right = x + width;
        this.top = y;
        this.bottom = y + height;
    }
    Bounds.prototype.getWidth = function () {
        return this.right - this.left;
    };
    Bounds.prototype.getHeight = function () {
        return this.bottom - this.top;
    };
    Bounds.prototype.getCentre = function () {
        var w = this.getWidth();
        var h = this.getHeight();
        return new Point(this.left + (w / 2), this.top + (h / 2));
    };
    return Bounds;
})();
var Point = (function () {
    function Point(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var ImageCropper = (function () {
    function ImageCropper(canvas, x, y, width, height, keepAspect, touchRadius) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 50; }
        if (keepAspect === void 0) { keepAspect = true; }
        if (touchRadius === void 0) { touchRadius = 20; }
        this.keepAspect = false;
        this.aspectRatio = 0;
        this.handle = null;
        this.isMouseDown = false;
        this.ratioW = 1;
        this.ratioH = 1;
        this.fileType = 'png';
        CropService.init(canvas);
        this.buffer = document.createElement('canvas');
        this.cropCanvas = document.createElement('canvas');
        this.buffer.width = canvas.width;
        this.buffer.height = canvas.height;
        this.tl = new CornerMarker(x, y, touchRadius);
        this.tr = new CornerMarker(x + width, y, touchRadius);
        this.bl = new CornerMarker(x, y + height, touchRadius);
        this.br = new CornerMarker(x + width, y + height, touchRadius);
        this.tl.addHorizontalNeighbour(this.tr);
        this.tl.addVerticalNeighbour(this.bl);
        this.tr.addHorizontalNeighbour(this.tl);
        this.tr.addVerticalNeighbour(this.br);
        this.bl.addHorizontalNeighbour(this.br);
        this.bl.addVerticalNeighbour(this.tl);
        this.br.addHorizontalNeighbour(this.bl);
        this.br.addVerticalNeighbour(this.tr);
        this.markers = [this.tl, this.tr, this.bl, this.br];
        this.center = new DragMarker(x + (width / 2), y + (height / 2), touchRadius);
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.keepAspect = keepAspect;
        this.aspectRatio = height / width;
        this.draw(this.ctx);
        this.croppedImage = new Image();
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    }
    ImageCropper.prototype.resizeCanvas = function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.buffer.width = width;
        this.buffer.height = height;
        this.draw(this.ctx);
    };
    ImageCropper.prototype.draw = function (ctx) {
        var bounds = this.getBounds();
        if (this.srcImage) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var sourceAspect = this.srcImage.height / this.srcImage.width;
            var canvasAspect = this.canvas.height / this.canvas.width;
            var w = this.canvas.width;
            var h = this.canvas.height;
            if (canvasAspect > sourceAspect) {
                w = this.canvas.width;
                h = this.canvas.width * sourceAspect;
            }
            else {
                h = this.canvas.height;
                w = this.canvas.height / sourceAspect;
            }
            this.ratioW = w / this.srcImage.width;
            this.ratioH = h / this.srcImage.height;
            if (canvasAspect < sourceAspect) {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, this.buffer.width / 2 - w / 2, 0, w, h);
            }
            else {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, 0, this.buffer.height / 2 - h / 2, w, h);
            }
            this.buffer.getContext('2d').drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (canvasAspect < sourceAspect) {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, this.buffer.width / 2 - w / 2, 0, w, h);
            }
            else {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, 0, this.buffer.height / 2 - h / 2, w, h);
            }
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.buffer, bounds.left, bounds.top, Math.max(bounds.getWidth(), 1), Math.max(bounds.getHeight(), 1), bounds.left, bounds.top, bounds.getWidth(), bounds.getHeight());
            for (var i = 0; i < this.markers.length; i++) {
                var marker = this.markers[i];
                marker.draw(ctx);
            }
            this.center.draw(ctx);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,228,0,1)';
            ctx.strokeRect(bounds.left, bounds.top, bounds.getWidth(), bounds.getHeight());
        }
        else {
            ctx.fillStyle = 'rgba(192,192,192,1)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    };
    ImageCropper.prototype.dragCrop = function (x, y, marker) {
        var bounds = this.getBounds();
        var left = x - (bounds.getWidth() / 2);
        var right = x + (bounds.getWidth() / 2);
        var top = y - (bounds.getHeight() / 2);
        var bottom = y + (bounds.getHeight() / 2);
        if (right >= this.canvas.width) {
            x = this.canvas.width - bounds.getWidth() / 2;
        }
        if (left <= 0) {
            x = bounds.getWidth() / 2;
        }
        if (top <= 0) {
            y = bounds.getHeight() / 2;
        }
        if (bottom >= this.canvas.height) {
            y = this.canvas.height - bounds.getHeight() / 2;
        }
        this.tl.moveX(x - (bounds.getWidth() / 2));
        this.tl.moveY(y - (bounds.getHeight() / 2));
        this.tr.moveX(x + (bounds.getWidth() / 2));
        this.tr.moveY(y - (bounds.getHeight() / 2));
        this.bl.moveX(x - (bounds.getWidth() / 2));
        this.bl.moveY(y + (bounds.getHeight() / 2));
        this.br.moveX(x + (bounds.getWidth() / 2));
        this.br.moveY(y + (bounds.getHeight() / 2));
        marker.setPosition(x, y);
    };
    ImageCropper.prototype.dragCorner = function (x, y, marker) {
        if (this.keepAspect) {
            var anchorMarker = marker.getHorizontalNeighbour().getVerticalNeighbour();
            var ax = anchorMarker.getPosition().x;
            var ay = anchorMarker.getPosition().y;
            if (x <= anchorMarker.getPosition().x) {
                if (y <= anchorMarker.getPosition().y) {
                    var iX = ax - (100 / this.aspectRatio);
                    var iY = ay - (100 / this.aspectRatio * this.aspectRatio);
                    var fold = this.getSide(new Point(iX, iY), anchorMarker.getPosition(), new Point(x, y));
                    if (fold > 0) {
                        var newHeight = Math.abs(anchorMarker.getPosition().y - y);
                        var newWidth = newHeight / this.aspectRatio;
                        var newY = anchorMarker.getPosition().y - newHeight;
                        var newX = anchorMarker.getPosition().x - newWidth;
                        marker.move(newX, newY);
                    }
                    else if (fold < 0) {
                        var newWidth = Math.abs(anchorMarker.getPosition().x - x);
                        var newHeight = newWidth * this.aspectRatio;
                        var newY = anchorMarker.getPosition().y - newHeight;
                        var newX = anchorMarker.getPosition().x - newWidth;
                        marker.move(newX, newY);
                    }
                }
                else {
                    var iX = ax - (100 / this.aspectRatio);
                    var iY = ay + (100 / this.aspectRatio * this.aspectRatio);
                    var fold = this.getSide(new Point(iX, iY), anchorMarker.getPosition(), new Point(x, y));
                    if (fold > 0) {
                        var newWidth = Math.abs(anchorMarker.getPosition().x - x);
                        var newHeight = newWidth * this.aspectRatio;
                        var newY = anchorMarker.getPosition().y + newHeight;
                        var newX = anchorMarker.getPosition().x - newWidth;
                        marker.move(newX, newY);
                    }
                    else if (fold < 0) {
                        var newHeight = Math.abs(anchorMarker.getPosition().y - y);
                        var newWidth = newHeight / this.aspectRatio;
                        var newY = anchorMarker.getPosition().y + newHeight;
                        var newX = anchorMarker.getPosition().x - newWidth;
                        marker.move(newX, newY);
                    }
                }
            }
            else {
                if (y <= anchorMarker.getPosition().y) {
                    var iX = ax + (100 / this.aspectRatio);
                    var iY = ay - (100 / this.aspectRatio * this.aspectRatio);
                    var fold = this.getSide(new Point(iX, iY), anchorMarker.getPosition(), new Point(x, y));
                    if (fold < 0) {
                        var newHeight = Math.abs(anchorMarker.getPosition().y - y);
                        var newWidth = newHeight / this.aspectRatio;
                        var newY = anchorMarker.getPosition().y - newHeight;
                        var newX = anchorMarker.getPosition().x + newWidth;
                        marker.move(newX, newY);
                    }
                    else if (fold > 0) {
                        var newWidth = Math.abs(anchorMarker.getPosition().x - x);
                        var newHeight = newWidth * this.aspectRatio;
                        var newY = anchorMarker.getPosition().y - newHeight;
                        var newX = anchorMarker.getPosition().x + newWidth;
                        marker.move(newX, newY);
                    }
                }
                else {
                    var iX = ax + (100 / this.aspectRatio);
                    var iY = ay + (100 / this.aspectRatio * this.aspectRatio);
                    var fold = this.getSide(new Point(iX, iY), anchorMarker.getPosition(), new Point(x, y));
                    if (fold < 0) {
                        var newWidth = Math.abs(anchorMarker.getPosition().x - x);
                        var newHeight = newWidth * this.aspectRatio;
                        var newY = anchorMarker.getPosition().y + newHeight;
                        var newX = anchorMarker.getPosition().x + newWidth;
                        marker.move(newX, newY);
                    }
                    else if (fold > 0) {
                        var newHeight = Math.abs(anchorMarker.getPosition().y - y);
                        var newWidth = newHeight / this.aspectRatio;
                        var newY = anchorMarker.getPosition().y + newHeight;
                        var newX = anchorMarker.getPosition().x + newWidth;
                        marker.move(newX, newY);
                    }
                }
            }
        }
        else {
            marker.move(x, y);
        }
        this.center.recalculatePosition(this.getBounds());
    };
    ImageCropper.prototype.getSide = function (a, b, c) {
        return this.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    };
    ImageCropper.prototype.sign = function (x) {
        if (+x === x) {
            return (x === 0) ? x : (x > 0) ? 1 : -1;
        }
        return NaN;
    };
    ImageCropper.prototype.handleRelease = function () {
        if (this.handle) {
            this.handle.setDrag(false);
        }
        this.handle = null;
    };
    ImageCropper.prototype.handleMove = function (x, y) {
        if (this.handle != null) {
            var clampedPositions = this.clampPosition(x - this.handle.offset.x, y - this.handle.offset.y);
            x = clampedPositions.x;
            y = clampedPositions.y;
            if (this.handle instanceof CornerMarker) {
                this.dragCorner(x, y, this.handle);
            }
            else {
                this.dragCrop(x, y, this.handle);
            }
        }
        else {
            for (var i = 0; i < this.markers.length; i++) {
                var marker = this.markers[i];
                if (marker.touchInBounds(x, y)) {
                    this.handle = marker;
                    marker.setDrag(true);
                    this.handle.offset.x = x - this.handle.position.x;
                    this.handle.offset.y = y - this.handle.position.y;
                    this.dragCorner(x - this.handle.offset.x, y - this.handle.offset.y, this.handle);
                    break;
                }
            }
            if (this.handle == null) {
                if (this.center.touchInBounds(x, y)) {
                    this.handle = this.center;
                    this.handle.setDrag(true);
                    this.handle.offset.x = x - this.handle.position.x;
                    this.handle.offset.y = y - this.handle.position.y;
                    this.dragCrop(x - this.handle.offset.x, y - this.handle.offset.y, this.center);
                }
            }
        }
    };
    ImageCropper.prototype.clampPosition = function (x, y) {
        if (x < 0) {
            x = 0;
        }
        if (x > this.canvas.width) {
            x = this.canvas.width;
        }
        if (y < 0) {
            y = 0;
        }
        if (y > this.canvas.height) {
            y = this.canvas.height;
        }
        return { x: x, y: y };
    };
    ImageCropper.prototype.setImage = function (img) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var bufferContext = this.buffer.getContext('2d');
        bufferContext.clearRect(0, 0, this.buffer.width, this.buffer.height);
        var splitName = img.src.split('.');
        var fileType = splitName[1];
        if (fileType == 'png' || fileType == 'jpg') {
            this.fileType = fileType;
        }
        this.srcImage = img;
        this.draw(this.ctx);
    };
    ImageCropper.prototype.getCroppedImage = function (fillWidth, fillHeight) {
        var bounds = this.getBounds();
        if (fillWidth && fillHeight) {
            var sourceAspect = this.srcImage.height / this.srcImage.width;
            var canvasAspect = this.canvas.height / this.canvas.width;
            var w = this.canvas.width;
            var h = this.canvas.height;
            if (canvasAspect > sourceAspect) {
                w = this.canvas.width;
                h = this.canvas.width * sourceAspect;
            }
            else if (canvasAspect < sourceAspect) {
                h = this.canvas.height;
                w = this.canvas.height / sourceAspect;
            }
            else {
                h = this.canvas.height;
                w = this.canvas.width;
            }
            this.ratioW = w / this.srcImage.width;
            this.ratioH = h / this.srcImage.height;
            this.cropCanvas.width = fillWidth;
            this.cropCanvas.height = fillHeight;
            var offsetH = (this.buffer.height - h) / 2 / this.ratioH;
            var offsetW = (this.buffer.width - w) / 2 / this.ratioW;
            var boundsMultiWidth = 1;
            var boundsMultiHeight = 1;
            if (this.ratioW < 1) {
                boundsMultiWidth = this.ratioW;
            }
            if (this.ratioH < 1) {
                boundsMultiHeight = this.ratioH;
            }
            this.cropCanvas.getContext('2d').drawImage(this.srcImage, (bounds.left) / this.ratioW - offsetW, (bounds.top) / this.ratioH - offsetH, Math.max(bounds.getWidth() / boundsMultiWidth, 1), Math.max(bounds.getHeight() / boundsMultiHeight, 1), 0, 0, fillWidth, fillHeight);
            this.croppedImage.width = fillWidth;
            this.croppedImage.height = fillHeight;
        }
        else {
            this.cropCanvas.width = Math.max(bounds.getWidth(), 1);
            this.cropCanvas.height = Math.max(bounds.getHeight(), 1);
            this.cropCanvas.getContext('2d').drawImage(this.buffer, bounds.left, bounds.top, Math.max(bounds.getWidth(), 1), Math.max(bounds.getHeight(), 1), 0, 0, bounds.getWidth(), bounds.getHeight());
            this.croppedImage.width = this.cropCanvas.width;
            this.croppedImage.height = this.cropCanvas.height;
        }
        this.croppedImage.src = this.cropCanvas.toDataURL("image/" + this.fileType);
        return this.croppedImage;
    };
    ImageCropper.prototype.getBounds = function () {
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        for (var i = 0; i < this.markers.length; i++) {
            var marker = this.markers[i];
            if (marker.getPosition().x < minX) {
                minX = marker.getPosition().x;
            }
            if (marker.getPosition().x > maxX) {
                maxX = marker.getPosition().x;
            }
            if (marker.getPosition().y < minY) {
                minY = marker.getPosition().y;
            }
            if (marker.getPosition().y > maxY) {
                maxY = marker.getPosition().y;
            }
        }
        var bounds = new Bounds();
        bounds.left = minX;
        bounds.right = maxX;
        bounds.top = minY;
        bounds.bottom = maxY;
        return bounds;
    };
    ImageCropper.prototype.getMousePos = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
    ImageCropper.prototype.onMouseMove = function (e) {
        var mousePosition = this.getMousePos(this.canvas, e);
        var cursorDrawn = false;
        if (this.handle == this.center) {
            var el = e.target;
            el.style.cursor = 'move';
            cursorDrawn = true;
        }
        if (this.handle != null && this.handle instanceof CornerMarker) {
            this.drawCornerCursor(this.handle, mousePosition.x, mousePosition.y, e);
            cursorDrawn = true;
        }
        var didDraw = false;
        if (!cursorDrawn) {
            for (var i = 0; i < this.markers.length; i++) {
                didDraw = didDraw || this.drawCornerCursor(this.markers[i], mousePosition.x, mousePosition.y, e);
            }
            if (!didDraw) {
                var el = e.target;
                el.style.cursor = 'initial';
            }
        }
        if (!didDraw && !cursorDrawn && this.center.touchInBounds(mousePosition.x, mousePosition.y)) {
            this.center.setOver(true);
            var el = e.target;
            el.style.cursor = 'move';
        }
        else {
            this.center.setOver(false);
        }
        this.draw(this.ctx);
        if (!this.isMouseDown) {
            return;
        }
        this.handleMove(mousePosition.x, mousePosition.y);
    };
    ImageCropper.prototype.drawCornerCursor = function (marker, x, y, e) {
        if (marker.touchInBounds(x, y)) {
            marker.setOver(true);
            if (marker.getHorizontalNeighbour().getPosition().x > marker.getPosition().x) {
                if (marker.getVerticalNeighbour().getPosition().y > marker.getPosition().y) {
                    var el = e.target;
                    el.style.cursor = 'nwse-resize';
                }
                else {
                    var el = e.target;
                    el.style.cursor = 'nesw-resize';
                }
            }
            else {
                if (marker.getVerticalNeighbour().getPosition().y > marker.getPosition().y) {
                    var el = e.target;
                    el.style.cursor = 'nesw-resize';
                }
                else {
                    var el = e.target;
                    el.style.cursor = 'nwse-resize';
                }
            }
            return true;
        }
        marker.setOver(false);
        return false;
    };
    ImageCropper.prototype.onMouseDown = function (e) {
        this.isMouseDown = true;
    };
    ImageCropper.prototype.onMouseUp = function (e) {
        this.isMouseDown = false;
        this.handleRelease();
    };
    return ImageCropper;
})();