
//https://javascript.info/class-inheritance
//https://dev.to/nitdgplug/learn-javascript-through-a-game-1beh
//https://www.minifier.org/

var rf = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(cb){
          window.setTimeout(cb, 1000 / 60);
      };
})();

var lastTime;
var now;
var dt = 0;
var fps = 60;
var slowMo = 1;
var step = 1 / fps;
var sStep = slowMo * step;

var gameAsset;
var GFX;
var MAP;
var AUDIO;

var DEBUG;
var TEXT;
var map={
	size:{
		tile:{width:32, height:32},
		screen:{width:25, height:19},
		world:{width:64, height:48},
	},
	data:[]
};

var MM;

var ctx;//
/*****************************/
function Start(canvasBody)
{	
	
	// Create the canvas
	var canvas = document.createElement("canvas");
	if(canvas.getContext)
	{

		map = GenerateMap(32, 25, 19);
		
		ctx = canvas.getContext("2d");
		canvas.width = (map.size.screen.width * map.size.tile.width);
		canvas.height = (map.size.screen.height * map.size.tile.height);

		var b = document.getElementById(canvasBody);
    	b.appendChild(canvas);

		//MAP = new MapManger(ctx, map, new Vector2(-1248, -928));
		MAP = new MapManger(ctx, map, new Vector2(0,0));//new Vector2(-1248, -928));
		
		if(map.size.world.height > map.size.world.width){
			MAP.maxScale = map.size.world.width/map.size.screen.width;
		}
		else{
			MAP.maxScale = map.size.world.height/map.size.screen.height;
		}
		//offscreen renderer
		GFX = new Render(MAP.osCtx);	
		AUDIO = new TinySound();
		// AUDIO = new Music2(
		// 	[
		// 		{
		// 			key:"beep",
		// 			src:"assets/beep.mp3",
		// 			type:"play"
		// 		},
		// 		{
		// 			key:"boing",
		// 			src:"assets/boing.mp3",
		// 			type:"play"
		// 		}				
		// 	]
		// );

		DEBUG = new DebugEdit(MAP.screenCtx, 400, 600 ,'#fff');

		init();
	}
}


function GenerateMap(tile, width, height){
	var maparray = [];
	var roomsize = {x:32,y:24};
	var houseSize = {x:2, y:2};

	var structure = [];
	//0=wall, 1=door
	for (var r = 0; r < houseSize.y; r++) {
		var row = [];
		var s=0;
		for (var c = 0; c < houseSize.x; c++) {
			var t = {s:0,e:0};
			t.e = (c < houseSize.x - 1 && Util.OneIn(2) );
			t.s = (r < houseSize.y - 1 && (Util.OneIn(2) || !t.e) );
			if(r < houseSize.y-1 && c == houseSize.x-1 && !t.e && !s){
				t.s = 1;
			}
			row.push(t);
			s+=t.s;
		}
		structure.push(row);
	}

	var doorv = {t:7,b:13};
	var doorh = {l:10,r:15};
	for (var hr = 0; hr < houseSize.y; hr++) {
		for (var r = 0; r < roomsize.y; r++) {
			var row = [];
			for (var hc = 0; hc < houseSize.x; hc++) {	
				for (var c = 0; c < roomsize.x; c++) {

					if(hr==0 && r==0){
						row.push(1);
					}
					else 
					if(hc==0 && c==0){
						row.push(1);
					}
					else if(c == roomsize.x-1 && (!structure[hr][hc].e || (structure[hr][hc].e && (r < doorv.t || r > doorv.b))) )
					{
						row.push(1);
					}
					else if(r == roomsize.y-1 && (!structure[hr][hc].s || (structure[hr][hc].s && (c < doorh.l || c > doorh.r))) )
					{
						 row.push(1);
					}
					else{
						row.push(0);
					}
				}
			}
			maparray.push(row);
		}
	}
	
	for (var i = 0; i < 16; i++) {
		var bx = Util.RndI(1, (houseSize.x*roomsize.x)-8);
		var by = Util.RndI(1, (houseSize.y*roomsize.y)-8);
		var bw = Util.RndI(1,6);
		var bh = Util.RndI(1,6);

		for (var y = 0; y < bh; y++) {
			for (var x = 0; x < bw; x++) {
				maparray[by+y][bx+x]=1;
			}
		}
	}

	return {
		size:{
			tile:{width:tile, height:tile},
			screen:{width:width, height:height},
			world:{width:roomsize.x * houseSize.x, height:roomsize.y * houseSize.y},
		},
		data:maparray
	};
}

function init()
{  
  var now = timestamp();	
	lastTime = now;

	gameAsset = new Game();

	FixedLoop();  
}

function SlowMo(mo){
	sStep = mo * step;
}

function FixedLoop(){
	 if(Input.IsSingle('KeyP') ) {
	 	AUDIO.Play();
		console.log("play");
	 }

	// if(Input.IsSingle('KeyY') ) {
	// 	slowMo+=1;
	// 	SlowMo(slowMo);		
	// }
	// else if(Input.IsSingle('KeyT') ) {
	// 	if(slowMo-1 > 0){
	// 		slowMo-=1;
	// 		SlowMo(slowMo);
	// 	}
	// }

	// if(Input.IsDown('KeyX') ) {
	// 	MAP.Zoom(0.01);
	// }
	// else if(Input.IsDown('KeyZ') ) {
	// 	MAP.Zoom(-0.01);	
	// }
	now = timestamp();
	dt = dt + Math.min(1, (now - lastTime) / 1000);
	while (dt > sStep) {
	  dt = dt - sStep;
	  update(step);
	}

	render();
				
	lastTime = now;
	rf(FixedLoop);
}

function timestamp() {
	var wp = window.performance;
	return wp && wp.now ? wp.now() : new Date().getTime();
}

// Update game objects
function update(dt) {
	gameAsset.Update(dt);
};

function render() {
	gameAsset.Render();

	DEBUG.Render(true,true);
};

onkeydown = function(e)
{
    Input.Pressed(e, true);
};

onkeyup = function(e)  {
    Input.Pressed(e, false);
    Input.Released(e, true);
};

onblur = function(e)  {
    Input.pressedKeys = {};
};

window.onload = function() {
	Start("canvasBody");
}

