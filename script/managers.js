class Title{

    constructor()
    {
        this.mode = 1;
        this.col = new Color("#555");
        this.cols = [new Color("#f00"),new Color("#ff0")];
        this.doods = [];

        this.timer = 0;

        this.scene = 0;
        this.sceneTimer = 6;
        this.scenes=[
            {hd:"OBJECTS SEEN IN SKY",sb:"BLETCHLEY RESIDENTS CONFUSED"},
            {hd:"OBJECTS SEEN IN SKY",sb:"FREE DOGHNUTS AT JOES CAFE"}
        ];

        this.doods.push(new Dood(new Vector2(400,500)));
    }

    Events(dt){
    }

    Update(dt)
    {
        if(this.timer>=6 && Input.Fire1() ) {
            this.mode = 2;
        }

        if(this.timer < 6){
            this.timer += dt;
        }

        this.sceneTimer -= dt;
        if(this.sceneTimer <=0)
        {
            this.sceneTimer = 6;
            this.scene++;
            if(this.scene>1)
            {
                this.scene=0;
            }
        } 
    }

    Render()
    {
        var w = SFX.bounds.w;
        var h = SFX.bounds.h;
        SFX.Box(0,0,w,h,"#555"); 

        if(this.timer>1)
        {
            for (let i = 0; i < this.doods.length; i++) {
                this.doods[i].Render();
            }

            SFX.Box(0,h-40,w, 40,"#777");
            SFX.Text(this.scenes[this.scene].sb,20,h-30,3, 0, "#000");

            SFX.Box(0,h-140,w, 100,"#ccc");
            SFX.Text(this.scenes[this.scene].hd,20,h-130,5, 0, "#000");

            SFX.Box(0,h-180,260, 40,"#eee");
            SFX.Text("BREAKING NEWS",20,h-170,4, 0, "#000");  
        }

        if(this.timer > 3)
        {
            for (let i = 0; i < 2; i++) {
                var c = this.col.Clone().Lerp(this.cols[i], 
                    Util.Remap(3, 6, 0,1, this.timer)).RGBA(); 
                SFX.Text("JUPITERS",30-i,10-i,6, 1, c);
                SFX.Text("INVASION",40-i,54-i,6, 1, c);
                SFX.Text("ON BLETCHLEY",50-i,100-i,4, 1, c);
                SFX.Text("FROM",70-i,134-i,4, 1, c);
                SFX.Text("SPACE",60-i,170-i,8, 1, c);   
            }
        }

        if(this.timer>=6){
            SFX.Text("FIRE TO START [K]",320,440,4, 0, this.cols[0]); 
        }
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
        this.levelSpeed = 24;
        this.timer1 = 0;
        this.timer2 = 0;
        this.timer3 = 0;
        this.ufoTimer = 1;
        this.boss = null;
        this.opacity = 0.2;
        this.Init(0);  
    }

    PlayerDie(p){
        //REINSERT THIS
        // this.Lives --;
        // if(this.Lives==0){
        //     this.mode = 4;
        // }
        //REINSERT THIS
        var b = MAP.ScreenBounds();
        p.pos = new Vector2(b.Min.x-(2*32), b.Max.y-((b.Max.y-b.Min.y)/2));
        p.auto = p.pos.Clone();
        p.auto.x+=(10*32);

        this.ready = 0;
        this.player.enabled = 0;
        this.levelDistance += 350;
    }
    Init(l)
    {
        if(l==0){
            var b = MAP.ScreenBounds();
            var s = b.Min.x;

            do {
                this.gameObjects.Add(
                    new Ground(new Vector2(s, b.Max.y), C.ASSETS.GRNDCITY, this.levelSpeed *0.7 ));
                s+=256;
            } while (s<b.Max.x);

        }
    }

    CanShoot(){
        return this.transition == 0;
    }
    ParticleGen(pos, n, cols, sz)
    {        
        var s = sz || 2;
        var ln = cols.length;
        for (var i = 0; i < n*4; i++) {
            var b = this.particles.Is(0);

            if(!b){
                b = new Particle(pos.Clone());
                this.particles.Add(b);
            }
            var l = Util.RndI(0,ln);
            b.pos = pos.Clone();
            b.body = [
                [0,[-s,s, -s,-s, s,-s, s,s]]
            ];
            b.enabled = 1;
            b.op = 1;
            b.rgb = cols[l] instanceof Object ? cols[l] : new Color(cols[l]);

            var sp = 4 + (parseInt(i/4)*4);
            b.speed = Util.RndI(sp, sp+4);
            b.dir = new Vector2(Util.Rnd(2)-1, Util.Rnd(2)-1);
        }
    }

    ObjectGen(type, obj, t, min, max, pos, sp, i){
        if(t < 0 )
        {
            t = Util.Rnd(max)+min;
            var d = this.gameObjects.Is(type);
            if(d){
                d.Set( pos, i, sp);
            }
            else{
                this.gameObjects.Add(new obj(pos, type, sp, i));
            }
        }
        return t;
    }

    AlienGen(type, t, m, w, n, pos){
        if(t < 0 && this.levelDistance > 150)
        {
            t = Util.Rnd(2)+2;
            var b = MAP.ScreenBounds();
            n = n || Util.RndI(3,6);
            var y = pos ? pos.y : Util.RndI(b.Min.y+(2*32), b.Max.y-((n*2)*32));

            //this is not pooling??
            for (var i = 0; i < n; i++) {
                var x = pos ? pos.x : (b.Max.x+(2*32)) + ((i*2)*32);
                var p = new Vector2(x, y);
                if(w==1){
                    p.y += (i*1)*32;
                }

                var d = new Alien(p, type, m);
                this.gameObjects.Add(d);

                if(m==1 || m==2){
                    d.targetPos = new Vector2(b.Min.x-100, p.y);
                }

                d.target = this.player;
                d.chase = Util.Rnd(4)+4;
            }
        }
        return t;
    }

    BossGen(boss, b){
        this.boss = new Boss(new Vector2(b.Max.x + (10*32), 24*32), boss);
        this.boss.target = this.player;
        this.boss.targetPos = new Vector2(b.Max.x + (2*32), 24*32 );
        this.gameObjects.Add(this.boss);
    }
    Events(dt){
        var b = MAP.ScreenBounds();

        if(this.transition > 0){
            this.transition--;
        }
        else{
            this.levelDistance--;
            if(this.levelDistance <= 0)
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
                this.timer1 = this.ObjectGen(C.ASSETS.SHACK, Block, this.timer1-dt, 1, 2, 
                                new Vector2(b.Max.x + 100, b.Max.y-16), this.levelSpeed);
                this.timer2 = this.ObjectGen(C.ASSETS.BGSHACK, Block, this.timer2-dt, 0.4, 1, 
                                new Vector2(b.Max.x + 100, b.Max.y-32), this.levelSpeed*0.7);

                if(!this.player.auto){
                   this.ufoTimer=this.AlienGen(Util.RndI(0,2), this.ufoTimer-dt, Util.RndI(0,2), Util.RndI(0,2), Util.RndI(3,6));
                }
            }  

            this.timer3 = this.ObjectGen(C.ASSETS.GRNDCITY, Ground, this.timer3-dt, 1.4, 0, 
                                new Vector2(b.Max.x + 100, b.Max.y), this.levelSpeed*0.7);
        }
        if(this.level > 0)      //its space!
        {
            this.timer1 = this.ObjectGen(C.ASSETS.STAR, Star, this.timer1-dt, 0, 0.3, 
                        new Vector2(b.Max.x + 100, Util.RndI(b.Min.y, b.Max.y)), Util.RndI(0,3));
        }
        if(this.level == 1 || this.level == 3){
            if(this.transition==0){
                if(!this.player.auto){
                   this.ufoTimer=this.AlienGen(1, this.ufoTimer-dt, Util.RndI(0,2), Util.RndI(0,2), Util.RndI(3,6));
                }
            }
            else{
                this.ufoTimer = 1;
                if(this.transition==1){
                    this.gameObjects.Remove([C.ASSETS.ENEMY]);
                    this.particles.Clear();
                }
            }
        }

        if(this.level == 2){    //first boss
            if(MAP.scale > 1.5)
            {
                this.zoomTransition = 0;
                MAP.scale = 1.5;
                this.gameObjects.Remove([C.ASSETS.ENEMY]);
                this.particles.Clear();
            }

            //if(this.transition==1){
                
                if(!this.boss){
                    this.player.auto = new Vector2(8*32,24*32);
                    this.BossGen(BOSS1, b);
                }
                else{
                    if(!this.boss.enabled){
                        this.levelDistance = 0;
                        this.boss = null;
                    }
                }
            //}

        }
        if(this.level == 3){
            if(MAP.scale < 1)
            {
                MAP.scale = 1;
                this.zoomTransition = 0;
            }

            if(this.zoomTransition == 0 && this.transition==0){
                var t = Util.OneIn(2);
                this.timer1 = this.ObjectGen(C.ASSETS.HILL, Hill, this.timer1-dt, 1, 2, 
                                    new Vector2(b.Max.x + 100, t ? b.Min.y: b.Max.y-16), this.levelSpeed, t);

                this.timer3 = this.ObjectGen(C.ASSETS.GRNDCITY, Ground, this.timer3-dt, 1.4, 0, 
                                    new Vector2(b.Max.x + 100, b.Max.y), this.levelSpeed);
            }
        }

        if(this.level == 4){

        }
        if(this.level == 5){
            if(MAP.scale == MAP.maxScale)
            {
                this.zoomTransition = 0;
                this.gameObjects.Remove([C.ASSETS.ENEMY]);
                this.particles.Clear();
            }

            if(!this.boss){
                this.player.auto = new Vector2(8*32,24*32);
                this.BossGen(BOSS2, b);
            }
            else{
                if(!this.boss.enabled){
                    this.levelDistance = 0;
                    this.boss = null;
                }
            }
        }
        if(this.level == 6){
            if(MAP.scale < 1)
            {
                MAP.scale = 1;
                this.zoomTransition = 0;
            }

            if(this.transition==0){
                this.mode = 4;
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

        DEBUG.Print("EM", this.gameObjects.Count(false, [C.ASSETS.ENEMY]));

        if(Input.IsDown('KeyX') ) {
            MAP.Zoom(0.01);
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }
        else if(Input.IsDown('KeyZ') ) {
            MAP.Zoom(-0.01);	
            this.offset = MAP.ScrollTo(this.player.pos, this.scrollRate);
        }
        else if(Input.IsSingle('KeyI') ) {
            this.levelDistance = 500;          
        }
        //#endregion DEBUG
        
        if(!this.player.enabled)
        {
            if(this.gameObjects.Count(false, [C.ASSETS.ENEMY]) == 0 )
            {
                this.player.enabled = 1;
            }
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
            GFX.Image(GFX.sky.canvas, new Vector2(0, Util.Remap(0, 3000, b.Max.y-b.Min.y,0, this.levelDistance)), 
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
        //scores
        SFX.Box(0,0,SFX.bounds.w, 32,"rgba(100,100,100,0.2)");
        SFX.Text("1UP: 00000",40, 4, 3, 0, "#fff");
        SFX.Text("HIGH: 00000",380, 4, 3, 0, "#fff");
        for (var i = 0; i < this.Lives; i++) {
            SFX.Sprite(102+(i*20), 27, LIVES, ["#fff"], 1.4);
        }

        if(this.transition){
            var d = 800;
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




