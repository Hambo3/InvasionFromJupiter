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

class GameObjectBase{

    constructor(pos, type)
    {
        this.type = type;
        this.enabled = true;
        this.pos = pos;	
        this.velocity = new Vector2();
        this.body;

        this.direction = {v:0,h:1};
        this.action = 0;
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
        return this.body[this.action][this.motion];
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

class Movable extends GameObjectBase {
    
    constructor(pos, type)
    {
        super(pos, type);         
    }

    Movement(dt, input){        
        this.direction.v = input.up ? -1 : input.down ? 1 : 0;
        this.direction.h = input.left ? -1 : input.right ? 1 : 0;

        var acceleration = new Vector2(this.direction.h, this.direction.v);

        if (acceleration.x || acceleration.y)
        {
            acceleration.Normalize(dt);
            acceleration.Multiply(this.speed);
            this.velocity.Add(acceleration);
        }
        else
        {
            this.motion = 0;
            this.frame = 0;
        }
    }

    Update(dt){
        super.Update(dt);
    }
}


class Player extends Movable {
    
    constructor(pos)
    {
        super(pos, C.ASSETS.PLAYER);
        this.col = ["#441","#a93"];
        this.speed = 48;
        this.damping = 0.8;
        this.auto = null;
        this.body = [
            [assets.rect]
        ];

        this.deadly = [C.ASSETS.SHACK];
        this.hit = [];

        for (var i = 0; i < this.body[0][0][1].length-1; i+=2) {
            this.hit.push(new Vector2(  this.body[0][0][1][i],
                                        this.body[0][0][1][i+1]));
        }
        this.hit.push(this.hit[0]);
    }
    
    Collider (perp){
        this.enabled = false;
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
                console.log("Fire1");
                
                var sh = gameAsset.gameObjects.Is( C.ASSETS.PLRSHOT);
                if(sh){
                    sh.Reset( new Vector2(this.pos.x+16, this.pos.y) );
                }
                else{
                    gameAsset.gameObjects.Add(
                        new Shot(new Vector2(this.pos.x+16, this.pos.y), C.ASSETS.PLRSHOT, 64 ));
                }
            }

            var b = MAP.ScreenBounds();
            this.pos.x = Util.Clamp(this.pos.x, b.Min.x, b.Max.x);
            this.pos.y = Util.Clamp(this.pos.y, b.Min.y, b.Max.y);   
        }

        super.Movement(dt,d);

        super.Update(dt);
    }
}

class Scrollable extends GameObjectBase{

    constructor(pos, type, spd ){

        super(pos, type);
        this.cols = [
            ["#124","#34a","#67e","#ccf"],
            ["#333","#333","#333","#333"]
        ];
        this.col = type == C.ASSETS.BGSHACK ? this.cols[1] : this.cols[0];

        var hw = Util.RndI(2,4)*16;
        var hgt = Util.RndI(1,6)*32;
        this.width = hw *2;
        this.height = hgt;
        this.bodyData = [-hw,0, -hw,-hgt, hw,-hgt, hw,0];      
          
        this.speed = spd;
        this.size = type == C.ASSETS.BGSHACK ? 0.8 : 1;

        this.deadly = null;
        this.hit = [];

        for (var i = 0; i < this.bodyData.length-1; i+=2) {
            this.hit.push(new Vector2(this.bodyData[i], this.bodyData[i+1]));
        }

        this.acceleration = new Vector2(-1, 0);
    }

    Body(){
        return [0,this.bodyData];
    }

    Reset(p){
        this.pos = p;
        this.enabled = 1;
    }

    Update(dt){
        var b = MAP.ScreenBounds();
        if((this.pos.x + this.width) < b.Min.x)
        {
            this.enabled = 0;
        }

        this.acceleration.Normalize(dt);
        this.acceleration.Multiply(this.speed);
        this.velocity.Add(this.acceleration);

        super.Update(dt);
    }
}

class Star extends Scrollable{

    constructor(pos, d ){
        var cols = ["#fff","#999","#444"];
        var spd = [32,28,24];

        super(pos, C.ASSETS.STAR, spd[d] );
        this.col = [cols[d]];

        var hw = Util.RndI(2,4)*16;
        var hgt = Util.RndI(1,6)*32;
        this.width = hw *2;
        this.height = hgt;
        this.bodyData = [-1,-1, 1,-1, 1,1, -1,1];

        this.deadly = null;
        this.hit = [];
    }
}

class Shot extends GameObjectBase{

    constructor(pos, type, spd ){
        super(pos, type);
        this.col = ["#f00"];
        this.speed = spd;
        this.damping = 0.8;

        this.body = [
            [[0,[-4,-2, 4,-2, 4,2, -4,2]]]
        ];

        this.deadly = [C.ASSETS.SHACK];
        this.hit = [];

        for (var i = 0; i < this.body[0][0][1].length-1; i+=2) {
            this.hit.push(new Vector2(  this.body[0][0][1][i],
                                        this.body[0][0][1][i+1]));
        }
        this.hit.push(this.hit[0]);

        this.acceleration = new Vector2(1, 0);
    }

    Collider (perp){
        this.enabled = false;
    }

    Reset(p){
        this.pos = p;
        this.enabled = 1;
    }

    Update(dt){
        var b = MAP.ScreenBounds();
        if((this.pos.x + this.width) < b.Min.x)
        {
            this.enabled = 0;
        }

        this.acceleration.Normalize(dt);
        this.acceleration.Multiply(this.speed);
        this.velocity.Add(this.acceleration);

        super.Update(dt);
    }
}