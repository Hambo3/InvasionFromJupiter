class Title{

    constructor(skip,hi)
    {
        this.high = hi;
        this.skip = skip;
        this.mode = 1;
        this.col = new Color("#555",0);
        this.cols = [new Color("#f00"),new Color("#ff0")];
        this.doods = [];

        this.timer = 0;

        this.scene = 0;
        this.sceneTimer = 6;
        
        this.scenes=[
            {nr:0,mn:"BREAKING NEWS",hd:"OBJECTS SEEN IN SKY OVER BLETCHLEY",sb:"RESIDENTS COMPLAIN",sp:"REPORTS ARE COMING IN OF STRANGE OBJECTS",
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:"SEEN IN THE SKY YESTERDAY OVER BLETCHLEY",
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:"WE ASKED AN EXPERT FOR AN OPINION",
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:"WHAT CAN YOU TELL US",
                        ex:1,exp:1,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:0,
                            ex:1,exp:1,ext:"ALIENS!"},
            {nr:0,mn:0,hd:0,sb:0,sp:"ALIENS?",
                                ex:1,exp:1,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:0,
                                ex:1,exp:1,ext:"FROM JUPITER PROBABLY!"},
            {nr:0,mn:"JUST IN",hd:"JUPITER INVADES. EARTH IN DANGER",sb:0,sp:0,
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:"ALIENS FROM JUPITER IN BOUND",sp:"EVERYONE IS URGED TO STAY IN DOORS",
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:"TOILET ROLL RATIONING BEGINS FROM MIDNIGHT",sp:"AND NOT RUN SCREAMING FOR THE HILLS",
                        ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:0, ex:0,exp:0,ext:0},
            {nr:0,mn:0,hd:0,sb:0,sp:"OUR BEST PILOTS ARE BEING PREPARED", ex:1,exp:0,ext:0,alt:"ARROW KEYS OR WASD TO MOVE"},
            {nr:0,mn:0,hd:0,sb:0,sp:"TO BATTLE THE THE EVIL JUPITARIAN WARLORD", ex:1,exp:0,ext:0,alt:"K TO FIRE"},
            {nr:0,mn:0,hd:0,sb:0,sp:0, ex:1,exp:0,ext:0,alt:"AND DONT CRASH INTO ANYTHING"},
            {nr:0,mn:0,hd:0,sb:0,sp:0, ex:1,exp:0,ext:0,alt:"GOOD LUCK SPACE CADET"},
            {nr:0,mn:0,hd:0,sb:0,sp:0, ex:1,exp:0,ext:0,alt:"GET GOING ALREADY!"},
            {nr:0,mn:0,hd:0,sb:0,sp:0, ex:0,exp:0,ext:0},
        ];

        this.doods.push(new Dood(new Vector2(400,500),4,3));//news guy
        this.doods.push(new Dood(new Vector2(700,280),3,2,
        "CHRIS CHAMBERLAIN", "EXPERT"));//exp1

        for (let i = 0; i<2; i++) {
            this.doods.push(new Dood(new Vector2(400,500),3,4) );
        }

        this.current = {nr:0,mn:0,hd:0,sb:0,sp:0,ex:0,exp:0,ext:0,alt:0};
        this.current.nr = this.scenes[0].nr;
        this.current.mn = this.scenes[0].mn;
        this.current.hd = this.scenes[0].hd;
        this.current.sb = this.scenes[0].sb;
        this.current.sp = this.scenes[0].sp;
        this.current.ex = this.scenes[0].ex;
        this.current.exp = this.scenes[0].exp;
        this.current.ext = this.scenes[0].ext;
        this.current.alt = this.scenes[0].alt;
    }

    Events(dt){
    }

    Update(dt)
    {
        if(this.timer>= (this.skip ? 2 : 10) && Input.Fire1() ) {
            this.mode = 2;
        }

        //if(this.timer < 20){
            this.timer += dt;
        //}

        this.sceneTimer -= dt;
        if(this.sceneTimer <=0)
        {
            this.sceneTimer = 6;
            this.scene++;
            if(this.scene==this.scenes.length)
            {
                this.scene=0;
            }

            this.current.nr = this.scenes[this.scene].nr;
            this.current.mn = this.scenes[this.scene].mn || this.current.mn;
            this.current.hd = this.scenes[this.scene].hd || this.current.hd;
            this.current.sb = this.scenes[this.scene].sb || this.current.sb;
            this.current.sp = this.scenes[this.scene].sp;
            this.current.ex = this.scenes[this.scene].ex;
            this.current.exp = this.scenes[this.scene].exp;
            this.current.ext = this.scenes[this.scene].ext;
            this.current.alt = this.scenes[this.scene].alt;
        } 

        this.doods[this.current.nr].Update(dt);
        console.log(this.timer);
    }

    Render()
    {
        var w = SFX.bounds.w;
        var h = SFX.bounds.h;
        var d = 896;
        SFX.Box(0,0,w,h,"#555"); 

        if(this.timer>1)
        {
            this.doods[this.current.nr].Render();

            SFX.Box(0,h-40,w, 40,"#777");
            SFX.Text(this.current.sb,20,h-30,3, 0, "#000");

            SFX.Box(0,h-140,w, 100,"#ccc");
            SFX.Text(this.current.hd,20,h-130,5, 0, "#000");

            SFX.Box(0,h-180,260, 40,"#eee");
            SFX.Text(this.current.mn,20,h-170,4, 0, "#000");  

            if(this.current.sp)
            {
                var txt = "[ "+this.current.sp+" ]";                
                SFX.Text(txt,(d/2)-((txt.length*(4*4))/2),
                h-216,4, 0, "#ccc");  
            }

            SFX.Box(w-366,16,350,280,"#000");
            if(this.current.ex){
                SFX.Box(w-362,20,342,272,"#222");

                if(this.current.exp){
                    this.doods[this.current.exp].Render();
                    SFX.Box(w-362,252,342,40,"#000");
                    SFX.Text(this.doods[this.current.exp].name,w-350,256,2, 0, "#ccc");  
                    SFX.Text(this.doods[this.current.exp].title,w-350,270,2, 0, "#ccc");  
                }

                if(this.current.ext)
                {
                    var bd = 342;
                    var txt = "[ "+this.current.ext+" ]";
                    SFX.Text(txt,w-362 + (bd/2)-((txt.length*(4*3))/2) ,220, 3, 0, "#eee");  
                }

                if(this.current.alt)
                {
                    var bd = 342;
                    var txt = this.current.alt;
                    SFX.Text(txt,w-362 + (bd/2)-((txt.length*(4*3))/2) ,100, 3, 0, "#eee");  
                }
            }
        }

         
        var a = this.skip>0 ? [1,3] : [25,31];       
        var b = this.skip>0 ? [2,4] : [30,34]; 
        for (let i = 0; i < 2; i++) {
            var c = this.col.Clone().Lerp(this.cols[i], 
                Util.Remap(a[0],a[1], 0,1, this.timer)).RGBA(); 

            SFX.Text("INVASION",30-i,10-i,6, 1, c);
            SFX.Text("FROM",80-i,54-i,4, 1, c);
            SFX.Text("JUPITER",40-i,86-i,7, 1, c);

            var c2 = this.col.Clone().Lerp(this.cols[i], 
                Util.Remap(b[0],b[1], 0,1, this.timer)).RGBA();  

            SFX.Text("IN",90-i,136-i,4, 1, c2);
            SFX.Text("SPACE",60-i,170-i,8, 1, c2); 
        }

        if(this.timer>= a[1] ){
            SFX.Text("HIGH: "+ Util.NumericText(this.high,5),360,30,4, 0, this.cols[0]);
            SFX.Text("FIRE TO START [K]",20,300,4, 0, this.cols[0]); 
        }
    }
}

class Game{

    constructor(hi)
    {
        this.mode = 3;
        this.high = hi;
        this.scrollRate = 0.03;
        this.gameObjects = new ObjectPool(); 
        this.particles = new ObjectPool(); 

        this.bossCol1 = new Color("#071");
        this.bossCol2 = new Color("#a11");

        this.player = new Player(new Vector2(-2*32,24*32));
        this.player.auto = new Vector2(16*32,24*32);
        this.gameObjects.Add(this.player);

        MAP.scale = 1;
        this.offset = MAP.ScrollTo(new Vector2(16*32,24*32));

        this.level = 0;           
        this.levelDistance = TRANS[this.level].d;
        this.transition = TRANS[this.level].t; 

        this.Lives = 5;
        this.zoomTransition = 0;
        this.levelSpeed = 24;
        this.timer1 = 0;
        this.timer2 = 0;
        this.timer3 = 0;
        this.ufoTimer = 1;
        this.boss = null;

        this.Init(0);  
    }

    Extra(){
        this.Lives++;
        AUDIO.Play(6);
    }
    PlayerDie(p){        
        this.Lives--;
        if(this.Lives==0){            
            this.level=7;
            this.transition = TRANS[this.level].t;
            this.player.enabled = 0;
        }

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

    //type, timer, movementstyle, wave, num, pos
    AlienGen(type, t, m, w, n, pos){
        if(t < 0 && this.levelDistance > 150)
        {
            t = Util.Rnd(2)+Util.Remap(0, 5, 5,3, this.level);
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
                   this.ufoTimer=this.AlienGen(0, this.ufoTimer-dt, 
                    this.levelDistance>1500 ? 1 : Util.RndI(0,2), 
                        Util.RndI(0,2), Util.RndI(3,6));
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
        if(this.level == 1 || this.level == 3 || this.level == 4){
            if(this.transition==0){
                if(!this.player.auto){
                    var t = [1];
                    if(this.level == 3){
                        t = [0,1];
                    }else if(this.level == 4){
                        t = [0,1,2];
                    }
                    this.ufoTimer=this.AlienGen(Util.OneOf(t), this.ufoTimer-dt, Util.RndI(0,3), Util.RndI(0,2), Util.RndI(3,6));
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
                this.boss.armed=1;
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
                this.Extra();
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
            if(this.zoomTransition > 0 && MAP.scale == MAP.maxScale)
            {
                this.zoomTransition = 0;
                this.gameObjects.Remove([C.ASSETS.ENEMY]);
                this.particles.Clear();
                this.boss.armed=1;
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
        if(this.level == 7){
            if(this.transition==0){
                this.mode = 4;
            }
        }
    }

    Update(dt)
    {
        var b = MAP.ScreenBounds();

        if(!this.player.enabled)
        {
            if(this.Lives >0 && this.gameObjects.Count(false, [C.ASSETS.ENEMY]) == 0 && (!this.boss || this.boss.pos.x > b.Min.x + ((b.Max.x - b.Min.x)/2) ) )
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
        if(this.player.score > this.high){
            this.high = this.player.score;
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
        SFX.Text("1UP: " + Util.NumericText(this.player.score,5),40, 4, 3, 0, "#fff");
        SFX.Text("HIGH: " + Util.NumericText(this.high,5),380, 4, 3, 0, "#fff");
        for (var i = 0; i < this.Lives-1; i++) {
            SFX.Sprite(102+(i*20), 27, LIVES, ["#fff"], 1.4);
        }

        if(this.boss)
        {
            var c2 = this.bossCol1.Clone().Lerp(this.bossCol2, 
                Util.Remap(this.boss.maxLife,this.boss.dieAt, 0,1, this.boss.lives)).RGBA(); 
            SFX.Text("BOSS:",380, 32, 3, 0, "#fff");
            SFX.Box(440,32,
                Util.Remap(this.boss.maxLife,this.boss.dieAt, 100,0, this.boss.lives)
                , 15, c2);
        }

        if(this.transition){
            var d = 896;
            var txt = TRANS[this.level];
            SFX.Text(txt.title,(d/2)-((txt.title.length*(5*4))/2),200,4,1,"#ff0"); 
            for (var i = 0; i < txt.info.length; i++) {
                var tx = txt.info[i].replace("###", Util.NumericText(this.player.score,5));
                SFX.Text(tx, (d/2)-((tx.length*(4*2))/2),
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




