class Vector2 
{
    constructor(x=0, y=0) { this.x = x; this.y = y; }
    Copy(v)               { this.x = v.x; this.y = v.y; return this; }
    Clone(s=1)            { return (new Vector2(this.x, this.y)).Multiply(s); }
	Add(v)                { (v instanceof Vector2)? (this.x += v.x, this.y += v.y) : (this.x += v, this.y += v); return this;  }
	Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
	Set(x, y)             { this.x = x; this.y = y; return this;  }
    AddXY(x, y)           { this.x += x; this.y += y; return this;  }
    Normalize(scale=1)    { let l = this.Length();  return l > 0 ? this.Multiply(scale/l) : this.Set(scale,y=0);  }
    ClampLength(length)   { let l = this.Length(); return l > length ? this.Multiply(length/l) : this; }
    Rotate(a)             { let c=Math.cos(a);let s=Math.sin(a);return this.Set(this.x*c - this.y*s,this.x*s - this.y*c); }
    Round()               { this.x = Math.round(this.x); this.y = Math.round(this.y); return this; }
    Length()              { return Math.hypot(this.x, this.y ); }
    Distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y ); }
    Angle()               { return Math.atan2(this.y, this.x); };
    Rotation()            { return (Math.abs(this.x)>Math.abs(this.y))?(this.x>0?2:0):(this.y>0?1:3); }   
    Lerp(v,p)             { return this.Add(v.Clone().Subtract(this).Multiply(p)); }
    DotProduct(v)         { return this.x*v.x+this.y*v.y; }
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
        this.hits = [];
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
        this.deadly = [C.ASSETS.SHACK];
        this.hit = Util.HitBox([-15,-7,15,-2,12,1,-16,2]);
        this.enabled = 1;      
    }
    
    Die(){
        GAME.ParticleGen(this.pos, 12, "#fff");
        GAME.PlayerDie(this);
    }
    Collider (perp){
        this.Die();
        super.Collider(perp);
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

                    AUDIO.Play();
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

class Alien1 extends GameObject {
    
    constructor(pos)
    {
        super(pos, C.ASSETS.ENEMY);
        this.col = ["#888","#777","#AAA"];
        this.speed = 4;
        this.damping = 0.99;
        this.width = 32;
        this.height = 32;
        this.body = [
            [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-10,-2,-7,-2,-7,1,-10,1],2,[-4,-2,-1,-2,-1,1,-4,1],2,[2,-2,5,-2,5,1,2,1],2,[8,-2,10,-2,10,1,8,1]],
            [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-8,-2,-5,-2,-5,1,-8,1],2,[-2,-2,1,-2,1,1,-2,1],2,[4,-2,7,-2,7,1,4,1]],
            [0,[-10,3,10,3,20,11,-20,11],1,[-10,-4,10,-4,10,3,-10,3],0,[-10,-4,-8,-6,-5,-8,-2,-9,2,-9,5,-8,8,-6,10,-4],2,[-6,-2,-3,-2,-3,1,-6,1],2,[0,-2,3,-2,3,1,0,1],2,[6,-2,9,-2,9,1,6,1],2,[-10,-2,-9,-2,-9,1,-10,1]]
        ];
        this.anim = new Anim(8,3);
        this.targetPos;

        this.deadly = [C.ASSETS.PLAYERasas];
        this.hit = Util.HitBox([-17,10,-10,4,-10,-4,-3,-8,3,-8,10,-4,10,4,17,10]);
        this.enabled = 1;
    }
    
    Collider (perp){
        this.enabled = 0;
    }

    Die(){
        this.enabled = 0;
        GAME.ParticleGen(this.pos, 24, "#5f5");
    }
    Update(dt){
        if(this.targetPos){           

            var accel = new Vector2();
            accel.Copy(this.targetPos).Subtract(this.pos);

            accel.Normalize(dt).Multiply(this.speed);

            this.velocity.Add(accel);
        }  

        this.motion=this.anim.Next(this.motion);

        super.Update(dt);
    }
}
class Alien2 extends GameObject {
    
    constructor(pos)
    {
        super(pos, C.ASSETS.ENEMY);
        this.col = ["#3b0", "#190", "#2A0", "#fb0"];
        this.speed = 4;
        this.damping = 0.99;
        this.width = 32;
        this.height = 32;
        this.body = [
            [0,[-18,0,-9,-6,9,-6,18,0],1,[-18,2,18,2,14,5,-14,5],2,[-18,0,18,0,18,2,-18,2],3,[-11,-2,-6,-2,-6,0,-11,0],3,[-3,-2,2,-2,2,0,-3,0],3,[5,-2,10,-2,10,0,5,0]]
        ];
        this.size = 0.8;
        this.targetPos;

        this.deadly = [C.ASSETS.PLAYER];
        this.hit = Util.HitBox([-9,-5,9,-5,18,1,13,4,-13,4,-18,1]);
        this.enabled = 1;
        this.shotTimer = 1;
    }
    
    Collider (perp){
        this.enabled = 0;
    }

    Die(){
        this.enabled = 0;
        GAME.ParticleGen(this.pos, 24, "#3b0");
    }
    Update(dt){
        //track the player
        if(this.targetPos){           

            var b = MAP.ScreenBounds();
            if((this.pos.x + this.width) < b.Min.x)
            {
                this.enabled = 0;
            }

            this.shotTimer -= dt;
            if(this.shotTimer < 0 ){
                var s = GAME.gameObjects.Is( C.ASSETS.EMYSHOT);
                if(s){
                    s.Set(new Vector2(this.pos.x, this.pos.y), new Vector2(Util.OneIn(2) ? 1 :-1, Util.OneIn(2) ? 1 :-1) );
                }
                else{
                    s = new Bullet(new Vector2(this.pos.x, this.pos.y), C.ASSETS.EMYSHOT, 
                                            64, new Vector2(Util.OneIn(2) ? 1 :-1, Util.OneIn(2) ? 1 :-1));
                    GAME.gameObjects.Add(s);
                }

                this.shotTimer = Util.Rnd(1)+1;
            }

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
                ["#555","#666","#777","#888","#000","#fff"],
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
                    this.body[0].push(Util.RndI(4,6),[x-w,y-w, x+w,y-w, x+w,y+w, x-w,y+w]);
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

class Ground extends Scrollable{

    constructor(pos, type, spd ){
        super(pos, type, spd ); 

        this.width = 256;
        this.height = 32;        
        this.col = ["#444"];
        this.Set(pos);
    }

    Set(p){
        this.body = [
            [0, [-128,0, -128,-32, 128,-32, 128,0]]
        ];

        this.hit = Util.HitBox(this.body[0][1]);

        this.pos = p;
        this.enabled = 1;
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

    Update(dt){
        var b = MAP.ScreenBounds();
        if(this.pos.x < b.Min.x || this.pos.x > b.Max.x || 
            this.pos.y < b.Min.y || this.pos.y > b.Max.y)
        {
            this.enabled = 0;
        }

        var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
        this.velocity.Add(acc);

        super.Update(dt);
    }
}

class Bullet extends Shot{

    constructor(pos, type, spd, dir ){
        super(pos, type, spd);
        this.col = ["#F00"];

        this.width = 4;
        this.height = 4;

        this.deadly = [C.ASSETS.SHACK, C.ASSETS.PLAYER];

        this.body = [
            [0,[-2,2, -2,-2, 2,-2, 2,2]]
        ];
        this.hit = Util.HitBox(this.body[0][1]);

        this.Set(pos, dir);
    }

    Collider (perp){
        if(perp.type == C.ASSETS.PLAYER)
        {
            perp.Die();
        }
        else{
            GAME.ParticleGen(this.pos, 5, "#28f");
        }
        
        this.enabled = false;
    }

    Set(p, dir){
        this.dir = dir;
        this.pos = p;
        this.enabled = 1;
    }
}

class Lazer extends Shot{

    constructor(pos, type ){
        super(pos, type, 128);
        this.col = ["#317179","#4ed7e7"];

        this.width = 8;
        this.height = 4;

        this.trail = new ObjectPool();
        this.deadly = [C.ASSETS.SHACK, C.ASSETS.ENEMY];

        this.dir = new Vector2(1, 0);
        this.Set(pos);
    }

    Collider (perp){
        if(perp.type == C.ASSETS.ENEMY)
        {
            perp.Die();
        }
        else{
            GAME.ParticleGen(this.pos, 5, "#28f");
        }

        this.enabled = false;
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

    constructor(pos, gravity){
        super(pos, 0);
        this.dir;
        this.gravity = gravity;
        //this.col = [col];
        //this.rgb = Util.ToRGB(col);
        this.op = 1;
        this.enabled = 1;
    }

    Update(dt){
        var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
        this.velocity.Add(acc);
        this.op-=0.01;
        this.col = [Util.ToCOL(this.rgb, this.op)];
        super.Update(dt);
        if(this.op<0){
            this.enabled = 0;
        }
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
