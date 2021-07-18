class Game{

    constructor()
    {
        this.scrollRate = 0.1;
        this.gameObjects = new ObjectPool(); 

        this.player = new Player(new Vector2(-2*32,24*32));
        this.player.auto = new Vector2(16*32,24*32);
        this.gameObjects.Add(this.player);

        this.offset = MAP.ScrollTo(new Vector2(16*32,24*32));

        this.level = 0;
        this.transition = 0;
        this.gameTimer = 10;
        this.zoomTransition = 0;

        this.ta = 0;
        this.tb = 0;
    }

    Events(dt){
        var b = MAP.ScreenBounds();
        this.ta -= dt;
        this.tb -= dt;
        this.gameTimer -= dt;

        if(this.gameTimer < 0)
        {
            this.gameTimer = 20;
            this.level ++;

            if(this.level == 1)
            {
                this.transition = 3;
            }
            if(this.level == 2)
            {
                this.transition = 0;
                this.zoomTransition = 0.01;
            }
        }

        if(this.level == 0)
        {
            if(this.ta < 0 )
            {
                this.ta = Util.Rnd(1)+1;
                var d = this.gameObjects.Is( C.ASSETS.SHACK);
                if(d){
                    d.Reset( new Vector2(b.Max.x + 100, b.Max.y-16) );
                }
                else{
                    this.gameObjects.Add(
                        new Scrollable(new Vector2(b.Max.x + 100, b.Max.y-16), C.ASSETS.SHACK, 48 ));
                }
            }
            if(this.tb < 0)
            {
                this.tb = Util.Rnd(0.5)+0.5;
                var d = this.gameObjects.Is( C.ASSETS.BGSHACK);
                if(d){
                    d.Reset( new Vector2(b.Max.x + 100, b.Max.y-32) );
                }
                else{
                    this.gameObjects.Add(
                        new Scrollable(new Vector2(b.Max.x + 100, b.Max.y-32), C.ASSETS.BGSHACK, 32 ));
                }
            }
        }
        if(this.level == 1 || this.level == 2)
        {
            if(this.transition > 0)
            {
                this.transition -= dt;
            }
            else{
                if(this.ta < 0)
                {
                    this.ta = Util.Rnd(0.3);
                    var d = this.gameObjects.Is( C.ASSETS.STAR);
                    if(d){
                        d.Reset( new Vector2(b.Max.x + 100, Util.RndI(b.Min.y, b.Max.y)) );
                    }
                    else{
                        this.gameObjects.Add(
                            new Star(new Vector2(b.Max.x + 100, Util.RndI(b.Min.y, b.Max.y)), Util.RndI(0,3) ));
                    }
                }
            }
        }

        if(this.level == 2){
            if(MAP.scale > 1.5)
            {
                this.zoomTransition = 0;
            }
        }
    }

    Update(dt)
    {
        DEBUG.Print("Z",MAP.scale);
        DEBUG.Print("L",this.level);
        DEBUG.Print("T", this.gameTimer);

        if(Input.IsDown('KeyX') ) {
            MAP.Zoom(0.01);
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }
        else if(Input.IsDown('KeyZ') ) {
            MAP.Zoom(-0.01);	
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }

        
        if(this.zoomTransition != 0)
        {
            MAP.Zoom(this.zoomTransition);
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }

        //timed events
        this.Events(dt);

        var bodies = this.gameObjects.Get();

        for (var i = 0; i < bodies.length; i++) {
            bodies[i].Update(dt);
        }

        //check collisions
        Util.Collisions(bodies, this.offset);
    }

    Render()
    {
        var b = MAP.ScreenBounds();
        var asses = this.gameObjects.Get();

        asses.sort(function(a, b){
            return a.type - b.type;
        });

        MAP.PreRender("#000");
        GFX.Box(0, (b.Max.y-b.Min.y)-32, (b.Max.x-b.Min.x), 32, "#555");

        for (var i = 0; i < asses.length; i++) {
            asses[i].Render(this.offset.x, this.offset.y);
        }

        //GFX.Text("0123456789ABCD",100,100,4); 

        MAP.PostRender();
    }
}

class MapManger{

    constructor(ctx, md, b){
        this.mapData = md.data;

        this.offset = new Vector2();
        this.planSize = new Vector2(md.size.world.width, md.size.world.height);
        this.mapSize = new Vector2(md.size.world.width, md.size.world.height);
        this.mapSize.Multiply(md.size.tile.width);
        this.screenSize = new Vector2(md.size.screen.width, md.size.screen.height);
        this.screenSize.Multiply(md.size.tile.width);

        this.bounds = new Vector2(this.mapSize.x+b.x,this.mapSize.y+b.y);

        this.tileSize = md.size.tile.width;
        this.scale = 1;
        this.maxScale = 1;
        this.minScale = 0.5;

        this.screenCtx = ctx;
        this.tileCanvas = document.createElement('canvas');
        this.tileCanvas.width = this.mapSize.x;
		this.tileCanvas.height = this.mapSize.y;
        this.tileCtx = this.tileCanvas.getContext('2d');

        this.osCanvas = document.createElement('canvas');
        this.osCanvas.width = this.mapSize.x;
		this.osCanvas.height = this.mapSize.y;
        this.osCtx = this.osCanvas.getContext('2d');

        this.rend = new Render(this.tileCtx);
    }

    Zoom(rate){
        this.scale = Util.Clamp(this.scale+rate, this.minScale, this.maxScale);
    }

    ScrollTo(target, lerp){
        var sc = this.screenSize.Clone();
        var bn = this.bounds.Clone();
        sc.Multiply(this.scale);

        var destx = target.x - (sc.x/2);
        var desty = target.y - (sc.y/2);

        if(lerp)
        {
            destx = Util.Lerp(this.offset.x, target.x - (sc.x/2), lerp);
            desty = Util.Lerp(this.offset.y, target.y - (sc.y/2), lerp);
        }

        if(destx < 0){
            destx = 0;
        }
        if(destx > bn.x - (sc.x)){
            destx = bn.x - (sc.x);
        }

        if(desty < 0){
            desty = 0;
        }
        if(desty > bn.y - (sc.y)){
            desty = bn.y - (sc.y);
        }

        this.offset.x = destx;
        this.offset.y = desty;

        return this.offset;        
    }

    ScreenBounds(){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);
        sc.Add(this.offset);
        return {Min:this.offset,
                Max:sc};
    }

    PreRender(col){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);

        this.osCtx.fillStyle = col;
        this.osCtx.fillRect(0, 0, sc.x, sc.y);
    }

    PostRender(){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);

        this.screenCtx.drawImage
        (
            this.osCanvas, 
            0, 0, sc.x, sc.y,
            0, 0, this.screenSize.x, this.screenSize.y
        );
    }

}

class Render{

    constructor(context, width, height)
    {
        this.ctx = context;
        this.bounds = {w:width,h:height};
    }

    PT(p){
        return Math.round(p);
    }

    Sprite(x, y, poly, col, size)
    {
        for(var i = 0; i < poly.length; i+=2) 
        {
            this.Plane(x, y, poly[i+1],  col[poly[i]],  size);
        } 
    }

    Plane(x, y, pts, col, sz)
    {
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        var pt = {x:pts[0]*sz, y:pts[1]*sz};
        this.ctx.moveTo(
            this.PT(pt.x  + x), 
            this.PT(pt.y + y)
            );

        for(var p = 2; p < pts.length; p+=2) {
            pt = {x:pts[p]*sz, y:pts[p+1]*sz};
            this.ctx.lineTo(
                this.PT(pt.x + x), 
                this.PT(pt.y + y)
                ); 
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    Image(img, pos, size, src, clip){
        this.ctx.drawImage
        (
            img, 
            src.x, src.y, clip.x, clip.y,
            pos.x, pos.y, size.x, size.y
        );
    }

    Clear(){
        this.ctx.clearRect(0, 0, this.bounds.w, this.bounds.h);
    }
    Box(x,y,w,h,c){
        this.ctx.fillStyle = c || '#000000';
        this.ctx.fillRect(x, y, w, h);
    }

    Text(str, xs, ys, size, sc, col) {

        ctx.fillStyle = col || '#000000';
        var cr = xs;

        for (var i = 0; i < str.length; i++) {
            var xp = 0;
            var yp = 0;
            var mx = 0; 

            var chr = str.charAt(i);                     
            if(chr == '+')
            {
                ys += (size*8);
                xs=cr;
            }
            else
            {
                var l = FONT[str.charAt(i)];

                for (var r = 0; r < l.length; r++) 
                {                
                    xp = 0;
                    var row = l[r];
                    for (var c = 0; c < row.length; c++) 
                    {                    
                        var szx = (sc && c==row.length-1) ? size*2 : size;
                        var szy = (sc && r==l.length-1) ? size*2 : size;
                        if (row[c]) {
                            this.ctx.fillRect(Math.round(xp + xs), Math.round(yp + ys), szx, szy);
                        }
                        xp += szx;
                    }
                    mx = xp>mx ? xp : mx;
                    yp += szy;
                }
                xs += mx + size; 
            }
        }
    } 
}




