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
        SFX.Text("INVADERS",100,100,4, 1, "#FFF");
        SFX.Text("FROM",100,100,4, 1, "#FFF");
        SFX.Text("JUPITER",100,100,4, 1, "#FFF");
    }
}

class Game{

    constructor()
    {
        this.mode = 3;
        this.scrollRate = 0.03;
        this.gameObjects = new ObjectPool(); 
        this.particles = new ObjectPool(); 

        this.player = new Player(new Vector2(-2*32,24*32));
        this.player.auto = new Vector2(16*32,24*32);
        this.gameObjects.Add(this.player);

        this.offset = MAP.ScrollTo(new Vector2(16*32,24*32));

        this.level = 0;           
        this.levelDistance = TRANS[this.level].d;
        this.transition = TRANS[this.level].t;
 
        this.Lives = 3;
        this.zoomTransition = 0;

        this.timer1 = 0;
        this.timer2 = 0;
        this.timer3 = 0;
        this.ufoTimer = 1;

        this.opacity = 0.2;
        this.Init(0);        
    }

    PlayerDie(p){
        this.Lives --;
        if(this.Lives==0){
            this.mode = 4;
        }
        p.pos = new Vector2(-2*32,24*32);
        p.auto = new Vector2(8*32,24*32);
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

    ParticleGen(pos, n, col)
    {
        for (var i = 0; i < n; i++) {
            var b = this.particles.Is(0);

            if(!b){
                b = new Particle(pos.Clone(), 0, col);
                this.particles.Add(b);
            }
            b.pos = pos.Clone();
            b.body = [
                [0,[-2,2, -2,-2, 2,-2, 2,2]]
            ];
            b.enabled = 1;
            b.op = 1;
            b.col = [col];
            b.rgb = Util.ToRGB(col);
            var s = 8*(i%3);
            b.speed = Util.RndI(s,s+4);
            b.dir = new Vector2(Util.Rnd(2)-1, Util.Rnd(2)-1);
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
                this.timer1 = this.ObjectGen(C.ASSETS.SHACK, Block, this.timer1-dt, 1, 1, new Vector2(b.Max.x + 100, b.Max.y-16), 48);
                this.timer2 = this.ObjectGen(C.ASSETS.BGSHACK, Block, this.timer2-dt, 0.4, 0.5, new Vector2(b.Max.x + 100, b.Max.y-32), 32);

                if(!this.player.auto){
                    this.ufoTimer-=dt;
                    if(this.ufoTimer < 0 ){

                        var bs = new Boss(new Vector2(18*32,24*32),
                        [
                            [0,[3,[-16,-16,16,-16,16,16,-16,16]]],
                            [0,[2,[-48,-48,-16,-48,-16,-16,-48,-16]]],
                            [0,[2,[-48,-16,-16,-16,-16,16,-48,16]]],
                            [0,[2,[-48,16,-16,16,-16,48,-48,48]]],
                            [0,[3,[-16,-48,16,-48,16,-16,-16,-16]]],
                            [0,[3,[-16,16,16,16,16,48,-16,48]]],
                            [1,[1,[-16,-80,16,-80,16,-48,-16,-48],5,[-7,-70,6,-70,6,-58,-7,-58]]],
                            [2,[4,[-16,48,16,48,16,80,-16,80],5,[-7,58,6,58,6,70,-7,70]]],
                            [0,[3,[-48,48,-16,48,-16,80]]],
                            [0,[0,[-16,-80,-16,-48,-48,-48]]]
                        ]);
                        bs.target = this.player;
                        this.gameObjects.Add(bs);
                        this.ufoTimer = 999;

                        //regular alien
                        //var n = Util.RndI(3,6);                   
                        //var y = Util.RndI(b.Min.y+(2*32), b.Max.y-((n*2)*32));

                        //this is not pooling??
                        
                        // for (var i = 0; i < n; i++) {
                        //     var p = new Vector2((b.Max.x+(2*32)) + ((i*2)*32),  y + ((i*1)*32)) ;

                        //     // var d = new Alien2(p);
                        //     // d.targetPos = new Vector2(b.Min.x-100, p.y);
                        //     // d.target = this.player;

                        //     // var d = new Alien1(p);
                        //     // d.target = this.player;
                        //     // this.gameObjects.Add(d);
                        // }    
                        // this.ufoTimer = Util.Rnd(2)+2;
                    }
                }

            }
            this.timer3 = this.ObjectGen(C.ASSETS.GRNDCITY, Ground, this.timer3-dt, 1.4, 0, new Vector2(b.Max.x + 100, b.Max.y), 32);
        }
        if(this.level == 1 || this.level == 2)
        {
            this.timer1 = this.ObjectGen(C.ASSETS.STAR, Star, this.timer1-dt, 0, 0.3, new Vector2(b.Max.x + 100, Util.RndI(b.Min.y, b.Max.y)), Util.RndI(0,3));
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
        if(this.level == 5){
            if(MAP.scale == MAP.maxScale)
            {
                this.zoomTransition = 0;
            }
        }
    }

    Update(dt)
    {
        //#region DEBUG
        DEBUG.Print("Z",MAP.scale+" "+MAP.minScale+" "+MAP.maxScale);
        DEBUG.Print("L",this.level);
        DEBUG.Print("T", this.transition);
        DEBUG.Print("D", this.levelDistance);
        DEBUG.Print("GO", this.gameObjects.Count(true));
        DEBUG.Print("P", this.particles.Count(true));

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

        var p = this.particles.Get();

        for (var i = 0; i < p.length; i++) {
            p[i].Update(dt);
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
            GFX.Image(GFX.sky.canvas, new Vector2(0, Util.Remap(0, 1000, b.Max.y-b.Min.y,0, this.levelDistance)), 
                {x:b.Max.x-b.Min.x,y:b.Max.y-b.Min.y}, {x:0,y:0}, {x:64,y:64});
        }

        for (var i = 0; i < bodies.length; i++) {
            bodies[i].Render(this.offset.x, this.offset.y);
        }

        var p = this.particles.Get();
        for (var i = 0; i < p.length; i++) {
            p[i].Render(this.offset.x, this.offset.y);
        }

        MAP.PostRender();
        if(this.transition){
            var d = 800;//b.Max.x - b.Min.x
            var txt = TRANS[this.level];
            SFX.Text(txt.title,(d/2)-((txt.title.length*(4*4))/2),200,4,1,"#ff0"); 
            for (var i = 0; i < txt.info.length; i++) {
                SFX.Text(txt.info[i],(d/2)-((txt.info[i].length*(4*2))/2),
                240 + (i*16),2,0,"#ff0");            
            }            
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
        return {Min:this.offset, Max:sc};
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

        this.grd = this.sky.ctx.createLinearGradient(0, 0, 0, 64);
        this.grd.addColorStop(0, "#000");
        this.grd.addColorStop(1, "#7140c6");
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




