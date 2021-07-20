
var Util = {
    Collisions: function(bodies, offset)
    {
        for (var i = 0; i < bodies.length; i++) {
            for (var j = 0; j < bodies.length; j++) {
                if(Util.Collider(bodies[i], bodies[j], offset))
                {
                    bodies[i].Collider(bodies[j]);
                }           
            }
        }        
    },
    Collider: function(prot, perp, offset)
    {
        if(prot != perp && prot.deadly && prot.deadly.indexOf(perp.type) != -1 )
        {
            for (var i = 0; i < prot.hit.length-1; i++) {
                for (var j = 0; j < perp.hit.length-1; j++) {
                    var x = Util.Intersect(
                    {
                        x:(prot.hit[i].x + prot.pos.x)-offset.x,
                        y:(prot.hit[i].y + prot.pos.y)-offset.y
                    },
                    {
                        x:(prot.hit[i+1].x + prot.pos.x)-offset.x,
                        y:(prot.hit[i+1].y + prot.pos.y)-offset.y
                    },
                    {
                        x:(perp.hit[j].x + perp.pos.x)-offset.x,
                        y:(perp.hit[j].y + perp.pos.y)-offset.y
                    },
                    {
                        x:(perp.hit[j+1].x + perp.pos.x)-offset.x,
                        y:(perp.hit[j+1].y + perp.pos.y)-offset.y
                    });

                    if(x)
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    Intersect: function( a,  b,  c,  d)
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

