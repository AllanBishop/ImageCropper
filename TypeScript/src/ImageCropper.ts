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

class Handle
{
    protected position:Point;
    protected offset:Point;
    protected radius:number;
    protected over:boolean = false;
    protected drag:boolean = false;

    constructor(x:number, y:number, radius:number)
    {
        this.position = new Point(x,y);
        this.offset = new Point(0,0);
        this.radius = radius;
    }

    setDrag(value:boolean)
    {
        this.drag = value;
        this.over = value;
    }

    draw(ctx)
    {

    }

    setOver(over:boolean)
    {
        this.over = over;
    }

    touchInBounds(x:number, y:number):boolean
    {
        return (x> this.position.x-this.radius && x <
        this.position.x+this.radius && y >this.position.y-this.radius && y <
        this.position.y+this.radius);
    }

    getPosition():Point
    {
        return this.position;
    }

    setPosition(x:number, y:number)
    {
        this.position = new Point(x,y);
    }
}

class CropService {

    public static canvas:HTMLCanvasElement;
    public static ctx;
    public static DEG2RAD = 0.0174532925;

    public static init (canvas:HTMLCanvasElement)
    {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    }
}

class DragMarker extends Handle
{
    constructor(x:number, y:number, radius:number)
    {
        super(x,y,radius);
    }

    draw(ctx)
    {
        var scale = 1;

        if(this.over || this.drag)
        {
            scale = 1.2;

        }

        this.drawConnector(ctx,90,scale);
        this.drawConnector(ctx,0,scale);
        this.drawArrow(ctx,0,scale);
        this.drawArrow(ctx,90,scale);
        this.drawArrow(ctx,180,scale);
        this.drawArrow(ctx,270,scale);
    }

    rotatePoint(cx:number,cy:number,angle:number,p:Point):Point
    {
        var s:number = Math.sin(angle);
        var c:number = Math.cos(angle);

        p.x -= cx;
        p.y -= cy;

        var xnew:number = p.x*c-p.y*s;
        var ynew:number = p.x*s+p.y*c;

        p.x = xnew+cx;
        p.y = ynew+cy;

        return p;
    }


    drawConnector(ctx, angle,scale)
    {
        angle*=CropService.DEG2RAD;

        var c:Point = new Point(this.position.x,this.position.y);

        var p1:Point =
            this.rotatePoint(c.x,c.y,angle, new
                Point(this.position.x-(2*scale),this.position.y+(9*scale)));
        var p2:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x+(2*scale),this.position.y+(9*scale)));
        var p3:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x+(2*scale),this.position.y-(9*scale)));
        var p4:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x-(2*scale),this.position.y-(9*scale)));

        ctx.beginPath();
        ctx.moveTo(p4.x,p4.y);
        ctx.lineTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.lineTo(p3.x,p3.y);
        ctx.lineTo(p4.x,p4.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,228,0,1)';
        ctx.fill();
    }

    drawArrow(ctx, angle, scale)
    {
        angle*=CropService.DEG2RAD;

        var c:Point = new Point(this.position.x,this.position.y);

        var p1:Point =
            this.rotatePoint(c.x,c.y,angle, new
                Point(this.position.x-(5*scale),this.position.y+(8*scale)));
        var p2:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x,this.position.y+(15*scale)));
        var p3:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x+(5*scale),this.position.y+(8*scale)));
        var p4:Point =
            this.rotatePoint(c.x,c.y,angle,new
                Point(this.position.x,this.position.y+(8*scale)));

        ctx.beginPath();
        ctx.moveTo(p4.x,p4.y);
        ctx.lineTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.lineTo(p3.x,p3.y);
        ctx.lineTo(p4.x,p4.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,228,0,1)';
        ctx.fill();
    }

    recalculatePosition(bounds)
    {
        var c:Point = bounds.getCentre();
        this.setPosition(c.x,c.y);
    }

}

class CornerMarker extends Handle
{
    private horizontalNeighbour:CornerMarker;
    private verticalNeighbour:CornerMarker;

    constructor(x:number, y:number, radius:number)
    {
        super(x,y,radius);
    }

    drawCornerBorder(ctx)
    {
        var sideLength:number = 10;

        if(this.over || this.drag)
        {
            sideLength = 12;
        }

        var hDirection = 1;
        var vDirection = 1;

        if(this.horizontalNeighbour.position.x<this.position.x)
        {
            hDirection = -1;
        }

        if(this.verticalNeighbour.position.y<this.position.y)
        {
            vDirection = -1;
        }

        ctx.beginPath();
        ctx.lineJoin = "miter";
        ctx.moveTo(this.position.x,this.position.y);
        ctx.lineTo(this.position.x+(sideLength*hDirection),this.position.y);

        ctx.lineTo(this.position.x+(sideLength*hDirection),this.position.y+(sideLength*vDirection));
        ctx.lineTo(this.position.x,this.position.y+(sideLength*vDirection));
        ctx.lineTo(this.position.x,this.position.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,228,0,1)';
        ctx.stroke();
    }

    drawCornerFill(ctx)
    {
        var sideLength:number = 10;

        if(this.over || this.drag)
        {
            sideLength = 12;
        }

        var hDirection = 1;
        var vDirection = 1;

        if(this.horizontalNeighbour.position.x<this.position.x)
        {
            hDirection = -1;
        }

        if(this.verticalNeighbour.position.y<this.position.y)
        {
            vDirection = -1;
        }

        ctx.beginPath();
        ctx.moveTo(this.position.x,this.position.y);
        ctx.lineTo(this.position.x+(sideLength*hDirection),this.position.y);

        ctx.lineTo(this.position.x+(sideLength*hDirection),this.position.y+(sideLength*vDirection));
        ctx.lineTo(this.position.x,this.position.y+(sideLength*vDirection));
        ctx.lineTo(this.position.x,this.position.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
    }

    moveX(x:number)
    {
        this.setPosition(x,this.position.y);
    }

    moveY(y:number)
    {
        this.setPosition(this.position.x,y);
    }

    move(x:number, y:number)
    {
        this.setPosition(x,y);
        this.verticalNeighbour.moveX(x);
        this.horizontalNeighbour.moveY(y);
    }

    addHorizontalNeighbour(neighbour:CornerMarker)
    {
        this.horizontalNeighbour = neighbour;
    }

    addVerticalNeighbour(neighbour:CornerMarker)
    {
        this.verticalNeighbour = neighbour;
    }

    getHorizontalNeighbour():CornerMarker
    {
        return  this.horizontalNeighbour;
    }

    getVerticalNeighbour():CornerMarker
    {
        return this.verticalNeighbour;
    }

    draw(ctx)
    {
        this.drawCornerFill(ctx);
        this.drawCornerBorder(ctx);
    }
}

class Bounds
{
    left:number;
    right:number;
    top:number;
    bottom:number;

    constructor(x:number = 0, y:number =0, width:number=0, height:number=0)
    {
        this.left = x;
        this.right = x+width;
        this.top = y;
        this.bottom = y+height;
    }

    getWidth():number
    {
        return this.right-this.left;
    }

    getHeight():number
    {
        return this.bottom-this.top;
    }

    getCentre():Point
    {
        var w = this.getWidth();
        var h = this.getHeight();

        return new Point(this.left+(w/2),this.top+(h/2));
    }
}

class Point
{
    x:number;
    y:number;

    constructor(x:number = 0, y:number=0)
    {
        this.x = x;
        this.y = y;
    }
}

class ImageCropper
{
    tl:CornerMarker;
    tr:CornerMarker;
    bl:CornerMarker;
    br:CornerMarker;
    center:DragMarker;
    canvas:HTMLCanvasElement;
    ctx;
    keepAspect:boolean = false;
    aspectRatio:number = 0;
    markers:Array<CornerMarker>;
    handle = null;
    srcImage:HTMLImageElement;
    buffer:HTMLCanvasElement;
    cropCanvas:HTMLCanvasElement;
    isMouseDown:boolean = false;
    croppedImage:HTMLImageElement;
    ratioW:number = 1;
    ratioH:number = 1;
    fileType:string = 'png';
    minXClamp:number;
    maxXClamp:number;
    minYClamp:number;
    maxYClamp:number;
    imageSet:boolean = false;

    constructor(canvas,x:number = 0, y:number = 0, width:number = 100, height:number = 50, keepAspect:boolean = true, touchRadius:number = 20)
    {
        CropService.init(canvas);
        this.buffer = document.createElement('canvas');
        this.cropCanvas = document.createElement('canvas');
        this.buffer.width = canvas.width;
        this.buffer.height = canvas.height;
        this.tl = new CornerMarker(x,y,touchRadius);
        this.tr = new CornerMarker(x+width,y, touchRadius);
        this.bl = new CornerMarker(x,y+height, touchRadius);
        this.br = new CornerMarker(x+width,y+height, touchRadius);

        this.tl.addHorizontalNeighbour(this.tr);
        this.tl.addVerticalNeighbour(this.bl);

        this.tr.addHorizontalNeighbour(this.tl);
        this.tr.addVerticalNeighbour(this.br);

        this.bl.addHorizontalNeighbour(this.br);
        this.bl.addVerticalNeighbour(this.tl);

        this.br.addHorizontalNeighbour(this.bl);
        this.br.addVerticalNeighbour(this.tr);

        this.markers = [this.tl,this.tr,this.bl,this.br];
        this.center = new DragMarker(x+(width/2),y+(height/2), touchRadius);
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.keepAspect = keepAspect;
        this.aspectRatio = height/width;

        this.draw(this.ctx);
        this.croppedImage = new Image();

        window.addEventListener('mousemove',  this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this)) ;
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this)) ;
    }

    public resizeCanvas(width:number, height:number)
    {
        this.canvas.width = width;
        this.canvas.height = height;
        this.buffer.width = width;
        this.buffer.height = height;
        this.draw(this.ctx);
    }

    draw(ctx)
    {
        var bounds:Bounds = this.getBounds();

        if(this.srcImage)
        {
            ctx.clearRect(0, 0, this.canvas.width , this.canvas.height);
            var sourceAspect = this.srcImage.height/this.srcImage.width;
            var canvasAspect = this.canvas.height/this.canvas.width;

            var w = this.canvas.width;
            var h = this.canvas.height;

            if(canvasAspect> sourceAspect)
            {
                w = this.canvas.width;
                h = this.canvas.width*sourceAspect;
            }
            else
            {
                h = this.canvas.height;
                w = this.canvas.height/sourceAspect;
            }

            this.ratioW = w/this.srcImage.width;
            this.ratioH = h/this.srcImage.height;

            if(canvasAspect< sourceAspect)
            {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, this.buffer.width / 2 - w / 2, 0, w, h);
            }
            else
            {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, 0, this.buffer.height / 2 - h / 2, w, h);
            }


            this.buffer.getContext('2d').drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height);

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if(canvasAspect< sourceAspect)
            {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, this.buffer.width / 2 - w /2, 0, w, h);
            }
            else
            {
                ctx.drawImage(this.srcImage, 0, 0, this.srcImage.width, this.srcImage.height, 0,this.buffer.height / 2 - h / 2, w, h);
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.buffer,bounds.left, bounds.top,
                Math.max(bounds.getWidth(),1), Math.max(bounds.getHeight(),1),bounds.left,
                bounds.top, bounds.getWidth(),bounds.getHeight());

            var marker:CornerMarker;
            for(var i:number = 0; i<this.markers.length;i++)
            {
                marker = this.markers[i];
                marker.draw(ctx);
            }

            this.center.draw(ctx);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,228,0,1)';
            ctx.strokeRect(bounds.left, bounds.top, bounds.getWidth(),bounds.getHeight());

        }
        else
        {
            ctx.fillStyle = 'rgba(192,192,192,1)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    dragCrop(x:number,y:number, marker:DragMarker)
    {
        var bounds:Bounds = this.getBounds();
        var left = x-(bounds.getWidth()/2);
        var right = x+(bounds.getWidth()/2);
        var top = y-(bounds.getHeight()/2);
        var bottom = y+(bounds.getHeight()/2);

        if(right >= this.maxXClamp)
        {
            x = this.maxXClamp-bounds.getWidth()/2;
        }

        if(left <= this.minXClamp)
        {
            x = bounds.getWidth()/2+this.minXClamp;
        }

        if(top <this.minYClamp)
        {
            y = bounds.getHeight()/2+this.minYClamp;
        }

        if(bottom >= this.maxYClamp)
        {
            y = this.maxYClamp-bounds.getHeight()/2;
        }

        this.tl.moveX(x-(bounds.getWidth()/2));
        this.tl.moveY(y-(bounds.getHeight()/2));
        this.tr.moveX(x+(bounds.getWidth()/2));
        this.tr.moveY(y-(bounds.getHeight()/2));
        this.bl.moveX(x-(bounds.getWidth()/2));
        this.bl.moveY(y+(bounds.getHeight()/2));
        this.br.moveX(x+(bounds.getWidth()/2));
        this.br.moveY(y+(bounds.getHeight()/2));

        marker.setPosition(x,y);
    }

    dragCorner(x:number,y:number, marker:CornerMarker)
    {
        var iX:number = 0;
        var iY:number =0;
        var ax:number = 0;
        var ay:number = 0;
        var newHeight:number =0;
        var newWidth:number =0;
        var newY:number =0;
        var newX:number =0;
        var anchorMarker:CornerMarker;
        var fold:number = 0;

        if(this.keepAspect)
        {
            anchorMarker = marker.getHorizontalNeighbour().getVerticalNeighbour();
            ax = anchorMarker.getPosition().x;
            ay = anchorMarker.getPosition().y;

            if(x <= anchorMarker.getPosition().x)
            {

                if(y <= anchorMarker.getPosition().y)
                {
                    iX = ax-(100/this.aspectRatio);
                    iY = ay-(100/this.aspectRatio*this.aspectRatio);
                    fold = this.getSide(new Point(iX,iY),anchorMarker.getPosition(), new Point(x,y));

                    if(fold >0)
                    {
                        newHeight = Math.abs(anchorMarker.getPosition().y-y);
                        newWidth = newHeight/this.aspectRatio;
                        newY = anchorMarker.getPosition().y-newHeight;
                        newX = anchorMarker.getPosition().x-newWidth;
                        marker.move(newX,newY);

                    }
                    else if(fold < 0)
                    {
                        newWidth = Math.abs(anchorMarker.getPosition().x-x);
                        newHeight = newWidth*this.aspectRatio;
                        newY = anchorMarker.getPosition().y-newHeight;
                        newX = anchorMarker.getPosition().x-newWidth;
                        marker.move(newX,newY);
                    }
                }
                else
                {
                    iX = ax-(100/this.aspectRatio);
                    iY = ay+(100/this.aspectRatio*this.aspectRatio);
                    fold = this.getSide(new Point(iX,iY),anchorMarker.getPosition(), new Point(x,y));

                    if(fold >0)
                    {
                        newWidth = Math.abs(anchorMarker.getPosition().x-x);
                        newHeight = newWidth*this.aspectRatio;
                        newY = anchorMarker.getPosition().y+newHeight;
                        newX = anchorMarker.getPosition().x-newWidth;
                        marker.move(newX,newY);
                    }
                    else if(fold < 0)
                    {
                        newHeight = Math.abs(anchorMarker.getPosition().y-y);
                        newWidth = newHeight/this.aspectRatio;
                        newY = anchorMarker.getPosition().y+newHeight;
                        newX = anchorMarker.getPosition().x-newWidth;
                        marker.move(newX,newY);
                    }
                }
            }
            else
            {
                if(y <= anchorMarker.getPosition().y)
                {
                    iX = ax+(100/this.aspectRatio);
                    iY = ay-(100/this.aspectRatio*this.aspectRatio);
                    fold = this.getSide(new Point(iX,iY),anchorMarker.getPosition(), new Point(x,y));

                    if(fold <0)
                    {
                        newHeight = Math.abs(anchorMarker.getPosition().y-y);
                        newWidth = newHeight/this.aspectRatio;
                        newY = anchorMarker.getPosition().y-newHeight;
                        newX = anchorMarker.getPosition().x+newWidth;
                        marker.move(newX,newY);
                    }
                    else if(fold > 0)
                    {
                        newWidth = Math.abs(anchorMarker.getPosition().x-x);
                        newHeight = newWidth*this.aspectRatio;
                        newY = anchorMarker.getPosition().y-newHeight;
                        newX = anchorMarker.getPosition().x+newWidth;
                        marker.move(newX,newY);
                    }
                }
                else
                {
                    iX = ax+(100/this.aspectRatio);
                    iY = ay+(100/this.aspectRatio*this.aspectRatio);
                    fold = this.getSide(new Point(iX,iY),anchorMarker.getPosition(), new Point(x,y));

                    if(fold <0)
                    {
                        newWidth = Math.abs(anchorMarker.getPosition().x-x);
                        newHeight = newWidth*this.aspectRatio;
                        newY = anchorMarker.getPosition().y+newHeight;
                        newX = anchorMarker.getPosition().x+newWidth;
                        marker.move(newX,newY);

                    }
                    else if(fold > 0)
                    {
                        newHeight = Math.abs(anchorMarker.getPosition().y-y);
                        newWidth = newHeight/this.aspectRatio;
                        newY = anchorMarker.getPosition().y+newHeight;
                        newX = anchorMarker.getPosition().x+newWidth;
                        marker.move(newX,newY);
                    }
                }
            }
        }
        else
        {
            marker.move(x,y);
        }

        this.center.recalculatePosition(this.getBounds());
    }

    getSide(a:Point,b:Point,c:Point):number
    {
        return this.sign((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
    }

    sign(x):number
    {
        if( +x === x )
        {
            return (x === 0) ? x : (x > 0) ? 1 : -1;
        }
        return NaN;
    }

    handleRelease()
    {
        if(this.handle)
        {
            this.handle.setDrag(false);
        }

        this.handle = null;
    }

    handleMove(x:number,y:number)
    {
        if(this.handle!=null)
        {
            var clampedPositions =
                this.clampPosition(x-this.handle.offset.x,y-this.handle.offset.y);
            x = clampedPositions.x;
            y = clampedPositions.y;

            if(this.handle instanceof CornerMarker)
            {
                this.dragCorner(x,y,this.handle);
            }
            else
            {
                this.dragCrop(x,y,this.handle)
            }
        }
        else
        {
            //give corners precedence so the crop area can always be expanded
            for(var i:number = 0; i<this.markers.length;i++)
            {
                var marker:CornerMarker = this.markers[i];

                if(marker.touchInBounds(x,y))
                {
                    this.handle = marker;
                    marker.setDrag(true);
                    this.handle.offset.x = x-this.handle.position.x;
                    this.handle.offset.y = y-this.handle.position.y;
                    this.dragCorner(x-this.handle.offset.x,y-this.handle.offset.y,this.handle);
                    break;
                }
            }

            if(this.handle==null)
            {
                if(this.center.touchInBounds(x,y))
                {
                    this.handle = this.center;
                    this.handle.setDrag(true);
                    this.handle.offset.x = x-this.handle.position.x;
                    this.handle.offset.y = y-this.handle.position.y;
                    this.dragCrop(x- this.handle.offset.x,y-
                    this.handle.offset.y,this.center);
                }
            }
        }
    }


    updateClampBounds()
    {
            var sourceAspect = this.srcImage.height/this.srcImage.width;
            var canvasAspect = this.canvas.height/this.canvas.width;

            var w = this.canvas.width;
            var h = this.canvas.height;

            if(canvasAspect> sourceAspect)
            {
                w = this.canvas.width;
                h = this.canvas.width*sourceAspect;
            }
            else
            {
                h = this.canvas.height;
                w = this.canvas.height/sourceAspect;
            }

            this.minXClamp = this.canvas.width/2-w/2;
            this.minYClamp = this.canvas.height/2-h/2;
            this.maxXClamp = this.canvas.width/2+w/2;
            this.maxYClamp = this.canvas.height/2+h/2;
    }

    clampPosition(x:number,y:number):Point
    {

            if(x< this.minXClamp)
            {
                x = this.minXClamp;
            }

            if(x> this.maxXClamp)
            {
                x = this.maxXClamp;
            }

            if(y< this.minYClamp)
            {
                y = this.minYClamp;
            }

            if(y> this.maxYClamp)
            {
                y = this.maxYClamp;
            }

        return new Point(x,y);
    }

    isImageSet():boolean
    {
        return this.imageSet;
    }

    setImage(img:HTMLImageElement)
    {
        if(!img)
        {
            throw "Image is null";
        }

        this.imageSet = true;
        this.ctx.clearRect(0, 0, this.canvas.width , this.canvas.height);

        var bufferContext = this.buffer.getContext('2d');
        bufferContext.clearRect(0, 0, this.buffer.width , this.buffer.height);

        var splitName = img.src.split('.');
        var fileType = splitName[1];
        if(fileType=='png' || fileType=='jpg')
        {
            this.fileType = fileType;
        }
        this.srcImage = img;

        this.updateClampBounds();

        var sourceAspect = this.srcImage.height/this.srcImage.width;
        var cropBounds = this.getBounds();
        var cropAspect = cropBounds.getHeight()/cropBounds.getWidth();

        var w = this.canvas.width;
        var h = this.canvas.height;

        var cX = this.canvas.width / 2;
        var cY = this.canvas.height / 2;

        var tlPos:Point = new Point(cX - cropBounds.getWidth() / 2, cY + cropBounds.getHeight() / 2);
        var trPos:Point = new Point(cX + cropBounds.getWidth() / 2, cY + cropBounds.getHeight() / 2);

        var blPos:Point = new Point(cX - cropBounds.getWidth() / 2, cY - cropBounds.getHeight() / 2);
        var brPos:Point = new Point(cX + cropBounds.getWidth() / 2, cY - cropBounds.getHeight() / 2);

        this.tl.setPosition(tlPos.x,tlPos.y);
        this.tr.setPosition(trPos.x,trPos.y);
        this.bl.setPosition(blPos.x,blPos.y);
        this.br.setPosition(brPos.x,brPos.y);

        this.center.setPosition(cX,cY);

        if(cropAspect> sourceAspect)
        {
            var imageH = Math.min(w*sourceAspect,h);

            if(cropBounds.getHeight() > imageH)
            {
                var cropW = imageH/cropAspect;

                tlPos = new Point(cX - cropW / 2, cY + imageH / 2);
                trPos = new Point(cX + cropW / 2, cY + imageH / 2);
                blPos = new Point(cX - cropW / 2, cY - imageH / 2);
                brPos = new Point(cX + cropW / 2, cY - imageH / 2);

                this.tl.setPosition(tlPos.x,tlPos.y);
                this.tr.setPosition(trPos.x,trPos.y);
                this.bl.setPosition(blPos.x,blPos.y);
                this.br.setPosition(brPos.x,brPos.y);
            }
        }
        else if(cropAspect < sourceAspect)
        {
            var imageW = Math.min(h/sourceAspect,w);

            if(cropBounds.getWidth() > imageW)
            {
                var cropH = imageW*cropAspect;

                tlPos = new Point(cX-imageW/2,cY+cropH/2);
                trPos = new Point(cX+imageW/2,cY+cropH/2);
                blPos = new Point(cX-imageW/2,cY-cropH/2);
                brPos = new Point(cX+imageW/2,cY-cropH/2);

                this.tl.setPosition(tlPos.x,tlPos.y);
                this.tr.setPosition(trPos.x,trPos.y);
                this.bl.setPosition(blPos.x,blPos.y);
                this.br.setPosition(brPos.x,brPos.y);
            }
        }

        this.draw(this.ctx);
    }

    getCroppedImage(fillWidth?:number, fillHeight?:number)
    {
        var bounds:Bounds = this.getBounds();

        if(!this.srcImage)
        {
            throw "Source image not set.";
        }

        if(fillWidth && fillHeight)
        {
            var sourceAspect = this.srcImage.height/this.srcImage.width;
            var canvasAspect = this.canvas.height/this.canvas.width;

            var w = this.canvas.width;
            var h = this.canvas.height;

            if(canvasAspect> sourceAspect)
            {
                w = this.canvas.width;
                h = this.canvas.width*sourceAspect;
            }
            else if(canvasAspect < sourceAspect)
            {
                h = this.canvas.height;
                w = this.canvas.height/sourceAspect;
            }
            else
            {
                h = this.canvas.height;
                w = this.canvas.width;
            }

            this.ratioW = w/this.srcImage.width;
            this.ratioH = h/this.srcImage.height;

            this.cropCanvas.width = fillWidth;
            this.cropCanvas.height = fillHeight;

            var offsetH = (this.buffer.height- h)/2/this.ratioH;
            var offsetW = (this.buffer.width-w)/2/this.ratioW;

            var boundsMultiWidth = 1;
            var boundsMultiHeight = 1;

            if(this.ratioW<1)
            {
                boundsMultiWidth= this.ratioW;
            }

            if(this.ratioH <1)
            {
                boundsMultiHeight = this.ratioH;
            }

            this.cropCanvas.getContext('2d').drawImage(this.srcImage,Math.max(Math.round((bounds.left)/this.ratioW-offsetW),0),
                Math.max(Math.round(bounds.top/this.ratioH-offsetH),0), Math.max(Math.round(bounds.getWidth()/boundsMultiWidth),1),
                Math.max(Math.round(bounds.getHeight()/boundsMultiHeight),1),0, 0, fillWidth,fillHeight);


            this.croppedImage.width = fillWidth;
            this.croppedImage.height = fillHeight;

        }
        else
        {

            this.cropCanvas.width = Math.max(bounds.getWidth(),1);
            this.cropCanvas.height = Math.max(bounds.getHeight(),1);
            this.cropCanvas.getContext('2d').drawImage(this.buffer,bounds.left,
                bounds.top, Math.max(bounds.getWidth(),1),
                Math.max(bounds.getHeight(),1),0, 0, bounds.getWidth(),bounds.getHeight());

            this.croppedImage.width = this.cropCanvas.width;
            this.croppedImage.height = this.cropCanvas.height;
        }

        this.croppedImage.src = this.cropCanvas.toDataURL("image/"+this.fileType);
        return this.croppedImage;
    }

    getBounds():Bounds
    {
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;

        for(var i:number = 0; i<this.markers.length;i++)
        {
            var marker:CornerMarker = this.markers[i];

            if(marker.getPosition().x < minX)
            {
                minX = marker.getPosition().x;
            }

            if(marker.getPosition().x > maxX)
            {
                maxX = marker.getPosition().x;
            }

            if(marker.getPosition().y < minY)
            {
                minY = marker.getPosition().y;
            }

            if(marker.getPosition().y > maxY)
            {
                maxY = marker.getPosition().y;
            }
        }

        var bounds:Bounds = new Bounds();
        bounds.left = minX;
        bounds.right = maxX;
        bounds.top = minY;
        bounds.bottom = maxY;

        return bounds;
    }

    getMousePos(canvas, evt)
    {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    onMouseMove(e:MouseEvent)
    {
        var mousePosition = this.getMousePos(this.canvas, e);
        var cursorDrawn = false;

        if(this.handle==this.center)
        {
            this.canvas.style.cursor = 'move';
            cursorDrawn = true;
        }

        if(this.handle!=null && this.handle instanceof CornerMarker)
        {
            this.drawCornerCursor(this.handle,mousePosition.x,mousePosition.y,e);
            cursorDrawn = true;
        }

        var didDraw = false;

        if(!cursorDrawn)
        {
            for (var i:number = 0; i < this.markers.length; i++)
            {
                didDraw = didDraw ||
                this.drawCornerCursor(this.markers[i],mousePosition.x,mousePosition.y,e);
            }

            if(!didDraw)
            {
                var el:HTMLElement = <HTMLElement>e.target;
                el.style.cursor = 'initial';
            }
        }

        if (!didDraw && !cursorDrawn && this.center.touchInBounds(mousePosition.x, mousePosition.y))
        {
            this.center.setOver(true);
            this.canvas.style.cursor = 'move';
        }
        else
        {
            this.center.setOver(false);
        }

        this.draw(this.ctx);

        if(!this.isMouseDown)
        {
            return;
        }

        this.handleMove(mousePosition.x,mousePosition.y);
    }

    drawCornerCursor(marker:CornerMarker, x:number, y:number, e:MouseEvent)
    {
        var el:HTMLElement;

        if (marker.touchInBounds(x, y))
        {
            marker.setOver(true);

            if (marker.getHorizontalNeighbour().getPosition().x >
                marker.getPosition().x)
            {
                if(marker.getVerticalNeighbour().getPosition().y >
                    marker.getPosition().y)
                {
                    el = <HTMLElement>e.target;
                    el.style.cursor = 'nwse-resize';
                }
                else
                {
                    el = <HTMLElement>e.target;
                    el.style.cursor = 'nesw-resize';
                }
            }
            else
            {
                if(marker.getVerticalNeighbour().getPosition().y >
                    marker.getPosition().y)
                {
                    el = <HTMLElement>e.target;
                    el.style.cursor = 'nesw-resize';
                }
                else
                {
                    el = <HTMLElement>e.target;
                    el.style.cursor = 'nwse-resize';
                }
            }

            return true;
        }

        marker.setOver(false);

        return false;
    }

    onMouseDown(e:MouseEvent)
    {
        this.isMouseDown = true;
    }

    onMouseUp(e:MouseEvent)
    {
        this.isMouseDown = false;
        this.handleRelease();
    }
}