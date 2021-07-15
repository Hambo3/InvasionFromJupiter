
var Util = {
    Collider: function(prot, perp)
    {
        var x = Util.line_intersects(
            {
                x:(bodies[0].body[0][0][1][i] + bodies[0].pos.x)-this.p.x,
                y:(bodies[0].body[0][0][1][i+1] + bodies[0].pos.y)-this.p.y
            },
            {
                x:(bodies[0].body[0][0][1][i+2] + bodies[0].pos.x)-this.p.x,
                y:(bodies[0].body[0][0][1][i+3] + bodies[0].pos.y)-this.p.y
            },
            {
                x:(bodies[1].body[0][0][1][j] + bodies[1].pos.x)-this.p.x,
                y:(bodies[1].body[0][0][1][j+1] + bodies[1].pos.y)-this.p.y
            },
            {
                x:(bodies[1].body[0][0][1][j+2] + bodies[1].pos.x)-this.p.x,
                y:(bodies[1].body[0][0][1][j+3] + bodies[1].pos.y)-this.p.y
            });

    },
    line_intersectsx: function( a,  b,  c,  d)
    {
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = b.x - a.x;
        s1_y = b.y - a.y;
        s2_x = d.x - c.x;
        s2_y = d.y - c.y;

        var s, t;
        s = (-s1_y * (a.x - c.x) + s1_x * (a.y - c.y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (a.y - c.y) - s2_y * (a.x - c.x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)    
        {    
            // Collision detected
            return 1;
        }

        return 0; // No collision  
    },
    RectHit: function (prot, perp){ //if 2 rects overlap
        var p1x = prot.pos.x - (prot.width/2);
        var p1y = prot.pos.y - (prot.length/2);
        var p2x = perp.pos.x - (perp.width/2);
        var p2y = perp.pos.y - (perp.length/2);

        if (p1x < p2x + perp.width && p1x + prot.width > p2x &&
            p1y < p2y + perp.length && prot.length + p1y > p2y)
            {
                return new Vector2(p1x-p2x, p1y-p2y);
            }
            else{
                return 0;
            }
    }, 
    Colliderx: function(bodies, solid){
        var l=bodies.length;

        for(var i=0; i<l; i++){
            var body1 = bodies[i];            
            for(var j=i+1; j<l; j++){
                var body2 = bodies[j];

                var b1rects = body1.hits;

                for(var r=0; r<b1rects.length; r++){
                    var b2rects = body2.hits;
                    for(var t=0; t<b2rects.length; t++){

                        var p = body1.pos.Clone();
                        p.Add(b1rects[r].pos);

                        p.Subtract(body2.pos.Add(b2rects[t].pos));
                        var length = p.Length();
                        var target = (b1rects[r].r*body1.size) + (b2rects[t].r*body2.size);
        
                        // if the spheres are closer
                        // then their radii combined
                        if(length < target){
                            var factor = (length-target)/length;
                            p.Multiply(factor*0.5);                            
                            
                            if(body1.Width() == 0 || Util.CanMove(body1.pos, body1.Width(), body1.Length(), -p.x, 0, solid) )
                            {
                                 body1.pos.x -= p.x;
                                 body1.Collider(body2);
                            }
                            if(body1.Length() == 0 || Util.CanMove(body1.pos, body1.Width(), body1.Length(), 0, -p.y, solid) )
                            {
                                body1.pos.y -= p.y;
                                body1.Collider(body2);
                            }

                            if(body2.Width() == 0 || Util.CanMove(body2.pos, body2.Width(), body2.Length(), p.x, 0, solid) )
                            {
                                body2.pos.x += p.x;
                                body2.Collider(body1);
                            }
                            if(body2.Length() == 0 || Util.CanMove(body2.pos, body2.Width(), body2.Length(), 0, p.y, solid) )
                            {
                                body2.pos.y += p.y;
                                body2.Collider(body1);
                            }        
                        }                        
                    }
                }
            }
        }
    },
    CanMove: function(p, w, l, vx, vy, t){
        var hw = w/2;
        var hl = l/2;

        if(MAP.Content( new Vector2(p.x-hw+vx, p.y-hl+vy))  == t) {
            return false;
        }
        if(MAP.Content( new Vector2(p.x+hw+vx, p.y-hl+vy))  == t) {
            return false;
        }
        if(MAP.Content( new Vector2(p.x+hw+vx, p.y+hl+vy))  == t) {
            return false;
        }
        if(MAP.Content( new Vector2(p.x-hw+vx, p.y+hl+vy))  == t) {
            return false;
        }
        return true;
    },
    OneIn: function(c){
        return Util.RndI(0,c)==0;
    },
    OneOf: function(arr){
        return arr[Util.RndI(0,arr.length)];
    },
    IntNormalise: function(n,r){
        return (r+1)-n;
    },
    //int min to max-1
    RndI: function (min, max){
        return parseInt(Math.random() * (max-min)) + min;
    },
    Rnd: function (max){
        return Math.random() * max;
    },  
    Min: function(a, b)
    {
        return (a<b)? a : b;
    },
    Max: function(a, b){
        return (a>b)? a : b;
    },
    Clamp: function(v, min, max){        
        return Util.Min(Util.Max(v, min), max);
    },
    Lerp: function(start, end, amt)
    {
        return (end-start) * amt+start;
    },
    AbsDist: function(p1, p2){
        return Math.abs( p1 - p2);
    }
}

// a v simple object pooler
var ObjectPool = function () {
    var list = [];

    return {
        Is: function(type){
            for (var i = 0; i < list.length; i++) {
                if (list[i].enabled == false && list[i].type == type)
                {
                    return list[i];
                }
            }
            return null;
        },
        Add: function(obj){
            list.push(obj);         
        },
        Get: function(type, not){
            if(type){
                if(not){
                    return list.filter(l => l.enabled && type.indexOf(l.type) == -1);
                }else{
                    return list.filter(l => l.enabled && type.indexOf(l.type) != -1);
                }
            }else{
                return list.filter(l => l.enabled);
            }

        },
        Count: function(all, type){
            if(type){
                return (all) ? list.filter(l => type.indexOf(l.type) != -1).length : list.filter(l => l.enabled && type.indexOf(l.type) != -1).length;
            }
            else{
                return (all) ? list.length : list.filter(l => l.enabled).length;
            }
        }      
    }
};

