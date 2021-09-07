class Color
{
    constructor(c,a=1) { 
        var s = c.split(''); 
        var rgb = [];
        for (var i = 1; i < s.length; i++) {
            rgb.push(parseInt(s[i], 16));
        }
        this.r=rgb[0]*16;this.g=rgb[1]*16;this.b=rgb[2]*16;this.a=a; 
    }    
    Clone(s=1) { 
        var r = new Color("#000", this.a*s); 
        r.r = this.r*s;
        r.g = this.g*s;
        r.b = this.b*s; 
        return r;
    }
    Subtract(c)                  { this.r-=c.r;this.g-=c.g;this.b-=c.b;this.a-=c.a; return this; }
    Lerp(c,p)                    { return c.Clone().Subtract(c.Clone().Subtract(this).Clone(1-p)); }
    RGBA()                       { return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
    }
}

class Vector2 
{
    constructor(x=0, y=0) { this.x = x; this.y = y; }
    Copy(v)               { this.x = v.x; this.y = v.y; return this; }
    Clone(s=1)            { return (new Vector2(this.x, this.y)).Multiply(s); }
	Add(v)                { (v instanceof Vector2)? (this.x += v.x, this.y += v.y) : (this.x += v, this.y += v); return this;  }
	Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
    Normalize(scale=1)    { let l = this.Length();  return l > 0 ? this.Multiply(scale/l) : this.Set(scale,y=0);  }
    ClampLength(length)   { let l = this.Length(); return l > length ? this.Multiply(length/l) : this; }
    Length()              { return Math.hypot(this.x, this.y ); }
}

class Anim{
    constructor(r, m ){
        this.rate = r;
        this.max = m;
        this.count = 0;
    }

    Next(frame){
        if(++this.count == this.rate){
            this.count = 0;
            if(++frame==this.max)
            {
                return 0;
            }
        }
        return frame;
    }
}

class GameObject{

    constructor(pos, type)
    {
        this.type = type;
        this.enabled = false;
        this.pos = pos;	
        this.velocity = new Vector2();
        this.body;

        this.motion = 0;
        this.frame = 0;
        this.speed = 0;
        this.damping = 0.8;
        this.width = 0;
        this.height = 0;
        this.hit = [];
        this.col = 0;
        this.size = 1;
    }

    Update(dt){
        if(this.enabled){

            this.pos.Add(this.velocity);

            // apply physics
            this.velocity.Multiply(this.damping);
        }
    }

    Render(x,y){
        if(this.enabled){
            GFX.Sprite(this.pos.x-x, this.pos.y-y, 
                this.Body(), this.col, this.size);
        }
    }

    Body(){
        return this.body[this.motion];
    }

    Width(){
        return this.width * this.size;
    }
    Length(){
        return this.length * this.size;
    }
    Collider(perp){

    }
    Die(){
        this.enabled = 0;
        this.velocity = new Vector2();
    }
}


class Player extends GameObject {
    
    constructor(pos)
    {
        super(pos, C.ASSETS.PLAYER);
        this.col = ["#ccc", "#999", "#888", "#777", "#555", "#19a", "#1a9", "#852"];
        this.speed = 48;
        this.damping = 0.8;
        this.auto = null;
        this.body = [
            [4,[-18,-4,-13,-3,-13,1,-18,3],1,[-12,-7,-6,-7,-8,-3,10,-3,7,0,-16,0],2,[-16,0,14,0,12,2,-9,3],0,[10,-3,16,-2,14,0,6,0],3,[-18,-13,-12,-7,-16,0,-18,-10],5,[-6,-7,1,-7,-1,-3,-8,-3],6,[1,-7,10,-3,-1,-3],3,[-13,-1,0,-1,0,1,-13,1]]
        ];
        this.size = 1.0;
        this.width = 32*this.size;
        this.height = 16*this.size;
        this.deadly = [C.ASSETS.SHACK, C.ASSETS.ENEMY, C.ASSETS.BOSSPART,C.ASSETS.HILL];
        this.hit = Util.HitBox([-15,-7,15,-2,12,1,-16,2]);
        this.enabled = 1; 
    }
    
    Die(){
        if(!this.auto){
            GAME.ParticleGen(this.pos, 3, this.col, 3);
            GAME.PlayerDie(this);
            AUDIO.Play(2);
        }
    }
    Collider (perp){
        if(!this.auto){
            perp.Die();
            this.Die();
            super.Collider(perp);
        }
    }

    Update(dt){

        var d = {
            up:Input.Up(),
            down:Input.Down(),
            left:Input.Left(),
            right:Input.Right()
        };

        if(this.auto)
        {
            if(this.pos.x < this.auto.x)
            {
                d = {
                    up:0,
                    down:0,
                    left:0,
                    right:1
                };
            }
            else{
                this.auto = null;
            }         
        }
        else{
            if(Input.Fire1())
            {
                var bodies = GAME.gameObjects.Get([C.ASSETS.PLRSHOT]);
                if(bodies.length < 5){
                    var sh = GAME.gameObjects.Is( C.ASSETS.PLRSHOT);
                    if(sh){
                        sh.Set( new Vector2(this.pos.x+32, this.pos.y) );
                    }
                    else{
                        GAME.gameObjects.Add(
                            new Lazer(new Vector2(this.pos.x+32, this.pos.y), C.ASSETS.PLRSHOT ));
                    }

                    AUDIO.Play(0);
                }
            }

            var b = MAP.ScreenBounds();
            this.pos.x = Util.Clamp(this.pos.x, b.Min.x, b.Max.x);
            this.pos.y = Util.Clamp(this.pos.y, b.Min.y, b.Max.y);   
        }

        var acc = new Vector2(d.left ? -1 : d.right ? 1 : 0, 
            d.up ? -1 : d.down ? 1 : 0);

        if (acc.x || acc.y)
        {
            acc.Normalize(dt).Multiply(this.speed);
            this.velocity.Add(acc);
        }
        else
        {
            this.motion = 0;
            this.frame = 0;
        }
        super.Update(dt);
    }
}

class Alien extends GameObject {
    
    constructor(pos, t, m)
    {
        super(pos, C.ASSETS.ENEMY);        

        this.width = 32;
        this.height = 32;

        this.damping = 0.99;
        this.targetPos;
        this.target;
        this.chase=0;
        this.deadly = null;

        this.dpos;
        this.Set(pos,t,m);
    }
    
    Collider (perp){
        this.Die();
    }

    Die(){
        GAME.ParticleGen(this.pos, 2, this.col, 3);
        super.Die();
    }
    
    Set(p, t, m){
        var bodies = [
            {
                bod:[
                    [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-10,-2,-7,-2,-7,1,-10,1],2,[-4,-2,-1,-2,-1,1,-4,1],2,[2,-2,5,-2,5,1,2,1],2,[8,-2,10,-2,10,1,8,1]],
                    [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-8,-2,-5,-2,-5,1,-8,1],2,[-2,-2,1,-2,1,1,-2,1],2,[4,-2,7,-2,7,1,4,1]],
                    [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-6,-2,-3,-2,-3,1,-6,1],2,[0,-2,3,-2,3,1,0,1],2,[6,-2,9,-2,9,1,6,1],2,[-10,-2,-9,-2,-9,1,-10,1]]
                ],
                col:["#888","#777","#AAA"],
                hit:[-17,10,-10,4,-10,-4,-3,-8,3,-8,10,-4,10,4,17,10],
                anim:{a:8,b:3},
                shot:0,
                sp:3,
                sz:1
            },
            {
                bod:[
                    [0,[-18,0,-9,-6,9,-6,18,0],1,[-18,2,18,2,14,5,-14,5],2,[-18,0,18,0,18,2,-18,2],3,[-11,-2,-6,-2,-6,0,-11,0],3,[-3,-2,2,-2,2,0,-3,0],3,[5,-2,10,-2,10,0,5,0]]
                ],
                col:["#3b0", "#190", "#2A0", "#fb0"],
                hit:[-9,-5,9,-5,18,1,13,4,-13,4,-18,1],
                anim:null,
                shot:1,
                sp:3,
                sz:0.8
            }
        ];
        this.mtype = m;

        this.body = bodies[t].bod;
        this.col = bodies[t].col;
        this.anim = bodies[t].anim 
                    ? new Anim(bodies[t].anim.a, bodies[t].anim.b) 
                    : null;
        this.hit = Util.HitBox(bodies[t].hit);        
        this.shotTimer = bodies[t].shot;
        this.speed = bodies[t].sp;
        this.size = bodies[t].sz;
        this.dpos = p;
        this.pos = p;
        this.targetPos = null;
        this.enabled = 1;
    }

    Update(dt){
        var b = MAP.ScreenBounds();
        if(this.mtype == 0)
        {
            if(this.target){    //chase target       

                if(this.chase < 0 || this.target.auto > 0)
                {
                    this.targetPos = new Vector2(b.Min.x - 64, this.pos.y);
                    this.mtype = 1;
                    this.shotTimer = 0;
                }

                var accel = this.target.pos.Clone().Subtract(this.pos);    
                accel.Normalize(dt).Multiply(this.speed);    
                this.velocity.Add(accel);
                this.chase-=dt;
            } 
            super.Update(dt);
        }
        else if(this.mtype == 1 || this.mtype == 2) //chase point
        {
            if(this.targetPos){
                if((this.pos.x + this.width) < b.Min.x)
                {
                    this.enabled = 0;
                }
  
                var accel = this.targetPos.Clone().Subtract(this.dpos);    
                accel.Normalize(dt).Multiply(this.speed);
                this.velocity.Add(accel);
    
                this.dpos.Add(this.velocity);
                // apply physics
                this.velocity.Multiply(this.damping);
                
                this.pos.x = this.dpos.x;
                this.pos.y = this.dpos.y;

                if(this.mtype == 2){
                    //re calculate the real y
                    var p = Util.Wave(4, 0.01, this.dpos.x, this.dpos.y);
                    this.pos.y=p;
                }
            }
        }


        if(this.shotTimer > 0 && GAME.CanShoot()){
            if(this.target && this.target.auto <= 0)
            {
                this.shotTimer -= dt;
                if(this.shotTimer <= 0 ){
                    var s = GAME.gameObjects.Is( C.ASSETS.EMYSHOT);

                    var d = new Vector2();
                    d.Copy(this.target.pos).Subtract(this.pos); 
                    d.x+=Util.RndI(-32,32);
                    d.y+=Util.RndI(-32,32);
                    d.Normalize(1);

                    var p = this.pos.Clone().Add(d.Multiply(16));
                    if(s){
                        s.Set(p, d);
                    }
                    else{
                        s = new Bullet(p, C.ASSETS.EMYSHOT, 90, d );
                        GAME.gameObjects.Add(s);
                    }

                    this.shotTimer = Util.Rnd(1)+1;
                    AUDIO.Play(1);
                }
            }            
        }


        if(this.anim){
            this.motion=this.anim.Next(this.motion);
        }
    }   
    
}

class BossPanel extends GameObject {
    
    constructor(pos, body, func, parent)
    {
        super(pos, C.ASSETS.BOSSPART);
        
        this.srcCol = [];
        this.col = ["#ccc","#aaa","#999","#777","#555","#f00"];
        for (var i = 0; i < this.col.length; i++) {
            this.srcCol.push(new Color(this.col[i]));
        }

        this.cols = [];

        this.width = 32;
        this.height = 32;

        this.enabled = 1;
        this.shotTimer = 1;
        this.func = func;
        this.countDown = 0;   
        this.strength = 5;

        this.body = [
            body
        ];
        
        var dcol = new Color("#000");
        for (let j = 0; j <= this.strength; j++) {
            var c = [];
            for (let i = 0; i < this.srcCol.length; i++) {                
                var cc = this.srcCol[i].Clone().Lerp(dcol, 
                    Util.Remap(this.strength,0, 0,1, j)).RGBA();
                c.push(cc);
            }
            this.cols.push(c);
        }

        this.col = this.cols[this.strength];
        this.parent = parent;
        this.deadly = null;
        this.hit = Util.HitBox(this.body[0][1]);//1st panel must define hitbox also
        this.center = Util.BodyCenter(this.body[0][1]);

    }
    
    Collider (perp){
        this.Die();
    }

    Die(){
        if(--this.strength == 0){
            GAME.ParticleGen(this.pos.Clone().Add(this.center), 3, this.srcCol, 5);
            this.parent.LoseLife();
            super.Die();
        }
        else{
            this.col = this.cols[this.strength];
        }

    }

    Destruct(){
        this.countDown = Util.Rnd(1);
    }
    
    Update(dt){
        if(this.countDown > 0){
            this.countDown -= dt;
            if(this.countDown < 0)
            {
                GAME.ParticleGen(this.pos.Clone().Add(this.center), 3, this.srcCol, 5);
                super.Die();
            }
        }
        if(this.parent){
            this.pos = this.parent.pos;

            if(this.parent.target && this.func != 0)
            {
                this.shotTimer -= dt;
                if(this.shotTimer < 0 ){
                    this.Launch();
                    this.shotTimer = Util.Rnd(1)+1;
                }
            }            
        }  

        super.Update(dt);
    }

    Launch(){
        var s = GAME.gameObjects.Is( this.func == 1 ? C.ASSETS.EMYSHOT : C.ASSETS.ENEMY );

        var d = new Vector2();
        var basePos = this.pos.Clone();
        basePos.Add(this.center);
        d.Copy(this.parent.target.pos).Subtract(basePos);
        d.Normalize(1);

        var p = basePos.Add(d.Multiply(1));
        if(s){
            if(this.func == 1){
                s.Set(p, d );
            }
            else{
                s.Set(p, 0, 0 );
            }
        }
        else{
            if(this.func == 1){
                s = new Bullet(p, C.ASSETS.EMYSHOT, 128, d );
                GAME.gameObjects.Add(s);
            }
            else{
                GAME.AlienGen(0, -1, 0, 1,p);
            }
        }
    }
}

class Boss extends GameObject {
    
    constructor(pos, template)
    {
        super(pos, C.ASSETS.BOSS);
        this.col = ["#3b0", "#190", "#2A0", "#fb0"];
        this.speed = 2;
        this.damping = 0.99;
        this.width = 32;
        this.height = 32;

        this.body = [
            []
        ];

        this.pattern = [];
        this.size = 1;
        this.targetPos;
        this.target;

        this.deadly = null;
        this.enabled = 1;
        this.shotTimer = 1;
        this.lives = this.Init(template);
        this.dieAt = this.lives - 10; //??
        this.countDown = 0;
    }
    
    Init(t){
        var parts=0;
        var x = -(9*32);
        var y = -(10*32);
        for(var i = 0; i < t.length; i++) 
        {
            for(var j = 0; j < t[i].length; j++) 
            {
                var q = parseInt(t[i][j]);
                if(q > 0){
                    var pt = [];
                    for(var b = 0; b < BDATA[q].length; b+=2) {
                        var d = BCELL[ BDATA[q][b] ];
                        var c = BDATA[q][b+1];

                        var dd = [];
                        for(var k = 0; k < d.length; k+=2) {
                            dd.push(d[k]+x, d[k+1]+y);
                        }
                        pt.push(c);
                        pt.push(dd);
                    }

                    var p = GAME.gameObjects.Is( C.ASSETS.BOSSPART);
                    if(p){
                        p = new BossPanel(this.pos, pt, 0, this);
                    }
                    else{
                        p = new BossPanel(this.pos, pt, 0, this);
                        GAME.gameObjects.Add(p);
                    }
                    
                    parts++;
                }
                x+=32;
            }
            y+=32;
            x = -(9*32);
        } 
        return parts;
    }

    Collider (perp){
        this.Die();
    }

    Die(){
        GAME.gameObjects.Remove([C.ASSETS.BOSSPART]);
        super.Die();
    }

    LoseLife(){
        if(this.countDown==0)
        {
            this.lives--;
            if(this.lives < this.dieAt){
                var ps = GAME.gameObjects.Get([C.ASSETS.BOSSPART]);
                for (var i = 0; i < ps.length; i++) {
                    ps[i].Destruct();
                }
                this.countDown = 3;
            }            
        }
    }

    Update(dt){
        if(this.countDown > 0)
        {
            this.countDown -= dt;
            if(this.countDown < 0){
                this.Die();
            }
        }
        if(this.targetPos){

            var accel = new Vector2();
            accel.Copy(this.targetPos).Subtract(this.pos);

            accel.Normalize(dt).Multiply(this.speed);

            this.velocity.Add(accel);
        } 
        super.Update(dt);
    }
}

class Scrollable extends GameObject{

    constructor(pos, type, spd ){

        super(pos, type);

        this.speed = spd;
        this.deadly = null;

        this.dir = new Vector2(-1, 0);
    }
    
    Die(){
        //do nothing;
    }
    Update(dt){
        var b = MAP.ScreenBounds();
        if((this.pos.x + this.width) < b.Min.x)
        {
            this.enabled = 0;
        }

        var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
        this.velocity.Add(acc);

        super.Update(dt);
    }
}

class Block extends Scrollable{

    constructor(pos, type, spd ){
        super(pos, type, spd ); 

        this.cols = [
                ["#555","#666","#777","#888","#000","#fff","#f00"],
                ["#111"]
            ];
        this.col = type == C.ASSETS.SHACK ? this.cols[0] : this.cols[1];
        this.Set(pos);
    }

    Set(p){
        var r = Util.RndI(2,6);
        var c = Util.RndI(2,4);
        var hw = (c * 32)/2;
        var ht = r * 32;
        this.width = c * 32;
        this.height = r * 32;
        this.size = 0.8;
        this.body = [
                [0, [-hw,0, -hw,-ht, hw,-ht, hw,0]]
        ];

        if(this.type==C.ASSETS.SHACK){
            this.body[0][0] = Util.RndI(0,4);
            this.size = 1;
            var y = -16;
            var w = 5;
            for (var i = 0; i < r; i++) {
                var x = -hw+16;
                for (var j = 0; j < c; j++) {
                    var cc = Util.RndI(4,6);
                    if(Util.OneIn(500)){
                        cc = 6;
                    }
                    this.body[0].push(cc,[x-w,y-w, x+w,y-w, x+w,y+w, x-w,y+w]);
                    x+=32;
                }
                y-=32;
            }            
        }

        this.hit = Util.HitBox(this.body[0][1]);

        this.pos = p;
        this.enabled = 1;
    }
}

class Hill extends Scrollable{

    constructor(pos, type, spd, top){
        super(pos, type, spd ); 

        this.cols = [
                ["#555","#666","#777"],
                ["#111"]
            ];
        this.col = type == C.ASSETS.HILL ? this.cols[0] : this.cols[1];
        this.Set(pos, top);
    }

    Set(p, i){
        var rt = Util.RndI(1,4)*32;
        var lt = Util.RndI(1,4)*32;
        var ht = Util.RndI(2,12)*32;
        this.width = rt+lt;
        this.height = ht;
        this.size = 1;
        this.body = [
             [Util.RndI(0,3), i ? [-rt,0, 0,ht, lt,0] : [-rt,0, 0,-ht, lt,0]]
        ];

        this.hit = Util.HitBox(this.body[0][1]);

        this.pos = p;
        this.enabled = 1;
    }
}

class Ground extends Scrollable{

    constructor(pos, type, spd ){
        super(pos, type, spd ); 

        this.width = 256;
        this.height = 32;        
        this.col = ["#444"];
        this.body = [
            [0, [-128,0, -128,-32, 128,-32, 128,0]]
        ];

        this.hit = Util.HitBox(this.body[0][1]);       

        this.Set(pos,0,spd);
    }

    Set(p,n,sp){
        this.pos = p;
        this.enabled = 1;
        this.speed = sp;
    }
}

class Star extends Scrollable{

    constructor(pos, type, d ){
        var spd = [48,32,24];
        super(pos, type, spd[d] ); 
        this.height = 2; 
        this.width = 2;
        this.col = ["#fff","#999","#444"];
        this.dist = d;
        this.Set(pos);
    }

    Set(p){
        this.body = [
                [this.dist, [-1,-1, 1,-1, 1,1, -1,1]]
        ];

        this.hit = Util.HitBox(this.body[0][1]);

        this.pos = p;
        this.enabled = 1;
    }
}

class Shot extends GameObject{
    constructor(pos, type, spd ){
        super(pos, type);

        this.speed = spd;
        this.dir;
    }

    Die(){
        super.Die();
    }

    Update(dt){
        var b = MAP.ScreenBounds();
        if(this.pos.x < b.Min.x || this.pos.x > b.Max.x || 
            this.pos.y < b.Min.y || this.pos.y > b.Max.y)
        {
            this.Die();
        }

        var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
        this.velocity.Add(acc);

        super.Update(dt);
    }
}

class Bullet extends Shot{

    constructor(pos, type, spd, dir ){
        super(pos, type, spd);
        this.col = ["#a61","#e92","#fa3"];

        this.width = 4;
        this.height = 4;

        this.deadly = [C.ASSETS.SHACK, C.ASSETS.PLAYER,C.ASSETS.HILL];

        this.body = [
            [0,[-3,-2,3,-2,3,2,-3,2],0,[-2,-3,2,-3,2,3,-2,3],1,[-2,-2,2,-2,2,2,-2,2],2,[-1,-1,1,-1,1,1,-1,1]]
        ];
        this.hit = Util.HitBox(this.body[0][7]);

        this.Set(pos, dir);
    }

    Collider (perp){
        perp.Die();
        GAME.ParticleGen(this.pos, 2, this.col);        
        super.Die();
    }

    Set(p, dir){
        this.dir = dir;
        this.velocity = new Vector2();
        this.pos = p;
        this.enabled = 1;
    }
}

class Lazer extends Shot{

    constructor(pos, type ){
        super(pos, type, 128);
        this.col = ["#377","#4dc"];

        this.width = 8;
        this.height = 4;

        this.trail = new ObjectPool();
        this.deadly = [C.ASSETS.SHACK, C.ASSETS.ENEMY,C.ASSETS.BOSSPART,C.ASSETS.HILL];

        this.dir = new Vector2(1, 0);
        this.Set(pos);
    }

    Collider (perp){
        perp.Die();
        GAME.ParticleGen(this.pos, 1, this.col);
        super.Die();
    }

    Set(p){
        this.body = [
            [0,[-8,-1, 8,-1, 8,2, -8,2],1,[-8,0, 8,0, 8,1, -8,1]]
        ];
        this.hit = Util.HitBox(this.body[0][1]);
        this.pos = p;
        this.enabled = 1;
        this.trail.Clear();
    }

    Update (dt){
        var trails = this.trail.Get();
        if(trails.length<16){
            this.trail.Add( new Trail(this.pos.Clone(), ["50,113,120","78,215,231"], this.Body()) );
        }
        super.Update(dt);
    }

    Render (x,y){
        var trails = this.trail.Get();
        if(this.enabled && trails.length > 0){
            for (var i = 0; i < trails.length; i++) {
                var t = trails[i];
                GFX.Sprite(t.pos.x-x, t.pos.y-y, 
                    t.body, ["rgba(" + t.col[0] + ", "+t.op+")", "rgba(" + t.col[1] + ", "+t.op+")"], t.size);
                t.op-=0.1;
                if(t.op<=0){
                    t.enabled = 0;
                }
            }
        }
        super.Render(x,y);
    }
}


class Particle extends GameObject{

    constructor(pos){
        super(pos, 0);
        this.dir;
        this.op = 1;
        this.enabled = 1;
    }

    Update(dt){
        var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
        this.velocity.Add(acc);
        if(this.op>0){
            this.op-=0.01;
            this.rgb.a = this.op;
            this.col = [this.rgb.RGBA()];
            if(this.op<=0){
                this.enabled = 0;
            }             
        }
       
        super.Update(dt);
    }
}

class Trail{
    
    constructor(pos, col, body, size){
        this.pos = pos;
        this.col = col;
        this.body = body;
        this.size = 1;
        this.op = 1;
        this.enabled = 1;
    }
}

class Dood{

    constructor(pos){
        this.pos = pos;
        this.col = ["#f00","#0f0","#fff","#000"];
        var bod = [1,[-32,-64,-8,-64,-8,-71,8,-71,8,-64,32,-64,32,0,-32,0]];
        var hed = [0,[12,-16,16,-11,16,4,14,16,-14,16,-16,4,-16,-11,-12,-16]];
        var eye = [2,[-3,-2,3,-2,3,2,-3,2],3,[-1,-1,1,-1,1,1,-1,1]];
        var nos = [1,[-1,0,1,0,2,6,-2,6]];
        var tlip = [1,[-4,-1,4,-1,5,0,-5,0]];
        var blip = [1,[-5,0,5,0,4,2,-4,2]];

        var b = [];
        var xs = 2;
        var ys=2;
        Util.PersonPos(b, bod,
            0*xs,0*ys,
            xs,ys);
        Util.PersonPos(b, hed,
            0*xs,-84*ys,
            xs,ys+2);

        Util.PersonPos(b, eye,
            -6*xs,-86*ys,
            xs+1,ys+1);
        Util.PersonPos(b, eye,
            6*xs,-86*ys,
            xs+1,ys+1);
        Util.PersonPos(b, nos,
            0*xs,-84*ys,
            xs,ys);
        Util.PersonPos(b, tlip,
            0*xs,-74*ys,
            xs,ys);
        Util.PersonPos(b, blip,
            0*xs,-74*ys,
            xs,ys);
        this.body= [b];
    }

    Update(dt){

    }

    Render(){
        SFX.Sprite(this.pos.x, this.pos.y, 
            this.body[0], this.col, 1);
    }
}