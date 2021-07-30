class Title{

    constructor()
    {
        this.mode = 1;
    }

    Events(dt){
    }

    Update(dt)
    {
        if(Input.IsSingle('KeyS') ) {
            this.mode = 2;
        }
    }

    Render()
    {
        SFX.Box(0,0,SFX.bounds.w, SFX.bounds.h,"#888");
        SFX.Text("0123456789ABCD",100,100,4, 1, "#FFF");       
    }
}

class Game{

    constructor()
    {
        this.mode = 3;
        this.scrollRate = 0.03;
        this.gameObjects = new ObjectPool(); 

        this.player = new Player(new Vector2(-2*32,24*32));
        this.player.auto = new Vector2(16*32,24*32);
        this.gameObjects.Add(this.player);

        this.offset = MAP.ScrollTo(new Vector2(16*32,24*32));

         this.level = 0;           
        this.levelDistance = TRANS[this.level].d;
        this.transition = TRANS[this.level].t;
 

        this.zoomTransition = 0;

        this.ta = 0;
        this.tb = 0;
        this.tc = 0;

        this.ufoWave = 0;
        this.opacity = 0.2;

        this.sky = new Vector2(0,0);
        this.Init(0);
    }

    Init(l)
    {
        if(l==0){
            var b = MAP.ScreenBounds();            
            var s = b.Min.x;

            do {
                this.gameObjects.Add(
                    new Ground(new Vector2(s, b.Max.y), C.ASSETS.GRNDCITY, 32 ));
                s+=256;                  
            } while (s<b.Max.x);

        }
    }

    ObjectGen(type, obj, t, min, max, pos, a){
        if(t < 0 )
        {
            t = Util.Rnd(max)+min;
            var d = this.gameObjects.Is(type);
            if(d){
                d.Set( pos );
            }
            else{
                this.gameObjects.Add(
                    new obj(pos, type, a ));
            }
        }
        return t;
    }

    Events(dt){
        var b = MAP.ScreenBounds();

        if(this.transition > 0){
            this.transition--;
        }
        else{
            this.levelDistance--;
            if(this.levelDistance == 0)
            {
                this.level++;
                this.levelDistance = TRANS[this.level].d;
                this.transition= TRANS[this.level].t;
                this.zoomTransition = TRANS[this.level].z;
            }            
        }

        if(this.level == 0)
        {
            if(this.transition==0){
                this.sky.y++;
                this.ta = this.ObjectGen(C.ASSETS.SHACK, Block, this.ta-dt, 1, 1, new Vector2(b.Max.x + 100, b.Max.y-16), 48);
                this.tb = this.ObjectGen(C.ASSETS.BGSHACK, Block, this.tb-dt, 0.4, 0.5, new Vector2(b.Max.x + 100, b.Max.y-32), 32);

                if(this.ufoWave < WAVE.length ){
                    if((TRANS[this.level].d - this.levelDistance) > WAVE[this.ufoWave].d)
                    {
                        var w = WAVE[this.ufoWave];
                        for (var i = 0; i < w.n; i++) {
                            var d;
                            if(w.t == 1)
                            {
                                d = new Alien1(new Vector2((30+(i*2))*32,(20+(i*2))*32));
                            }
                            this.gameObjects.Add(d);
                            d.target = this.player;  
                        }    
                        
                        this.ufoWave++;
                    }
                }
            }
            this.tc = this.ObjectGen(C.ASSETS.GRNDCITY, Ground, this.tc-dt, 1.4, 0, new Vector2(b.Max.x + 100, b.Max.y), 32);
        }
        if(this.level == 1 || this.level == 2)
        {
            this.ta = this.ObjectGen(C.ASSETS.STAR, Star, this.ta-dt, 0, 0.3, new Vector2(b.Max.x + 100, Util.RndI(b.Min.y, b.Max.y)), Util.RndI(0,3));
        }
        if(this.level == 2){
            if(MAP.scale > 1.5)
            {
                this.zoomTransition = 0;
                MAP.scale = 1.5;
            }
        }
        if(this.level == 3){
            if(MAP.scale < 1)
            {
                MAP.scale = 1;
                this.zoomTransition = 0;
            }
        }
    }

    Update(dt)
    {
        //#region DEBUG
        DEBUG.Print("Z",MAP.scale);
        DEBUG.Print("L",this.level);
        DEBUG.Print("T", this.transition);
        DEBUG.Print("D", this.levelDistance);

        if(Input.IsDown('KeyX') ) {
            MAP.Zoom(0.01);
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }
        else if(Input.IsDown('KeyZ') ) {
            MAP.Zoom(-0.01);	
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }
        //#endregion DEBUG
        
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
    }

    Render()
    {
        var b = MAP.ScreenBounds();
        var bodies = this.gameObjects.Get();

        bodies.sort(function(a, b){
            return a.type - b.type;
        });

        MAP.PreRender("#000");
        if(this.level == 0){
            GFX.Image(GFX.sky.canvas, this.sky, {x:800,y:600}, {x:0,y:0}, {x:64,y:64});
        }

        for (var i = 0; i < bodies.length; i++) {
            bodies[i].Render(this.offset.x, this.offset.y);
        }

        MAP.PostRender();
        if(this.transition){
            SFX.Text(TRANS[this.level].title,350,300,4,1,"#ff0"); 
            SFX.Text(TRANS[this.level].info,350,340,2,1,"#ff0"); 
        }
        //
        //check collisions
        Util.Collisions(bodies, this.offset);
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

        this.offScreen = Util.Context(this.mapSize.x, this.mapSize.y);
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

        this.offScreen.ctx.fillStyle = col;
        this.offScreen.ctx.fillRect(0, 0, sc.x, sc.y);
    }

    PostRender(){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);

        this.screenCtx.drawImage
        (
            this.offScreen.canvas, 
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

        this.sky = Util.Context(64,64);
        //this.sky 
        // this.sky = document.createElement('canvas');
        // this.sky.width = 64;
		// this.sky.height = 64;
        // var ctx = this.sky.getContext('2d');

        this.grd = this.sky.ctx.createLinearGradient(0, 0, 0, 64);
        this.grd.addColorStop(0, "#000");
        this.grd.addColorStop(1, "#390c31");
        this.sky.ctx.fillStyle = this.grd;
        this.sky.ctx.fillRect(0, 0, 64, 64);
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

        this.ctx.fillStyle = col || '#000000';
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




