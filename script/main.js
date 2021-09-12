
//https://javascript.info/class-inheritance
//https://dev.to/nitdgplug/learn-javascript-through-a-game-1beh
//https://www.minifier.org/
//https://try.terser.org/
//https://lifthrasiir.github.io/roadroller/
//some galactic defender you are
//https://keithclark.github.io/ZzFXM/tracker/

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

var GAME;
var GFX;
var SFX;
var MAP;
var AUDIO;
var high = 13000;
var map={
	size:{
		tile:{width:32, height:32},
		screen:{width:28, height:19},
		world:{width:64, height:48},
	},
	data:[]
};

/*****************************/
function Start(canvasBody)
{
	// Create the canvas
	var canvas = document.createElement("canvas");
	if(canvas.getContext)
	{	
		var ctx = canvas.getContext("2d");
		canvas.width = (map.size.screen.width * map.size.tile.width);
		canvas.height = (map.size.screen.height * map.size.tile.height);

		var b = document.getElementById(canvasBody);
    	b.appendChild(canvas);

		MAP = new MapManger(ctx, map, new Vector2(0,0));
		
		if(map.size.world.height > map.size.world.width){
			MAP.maxScale = map.size.world.width/map.size.screen.width;
		}
		else{
			MAP.maxScale = map.size.world.height/map.size.screen.height;
		}
		//offscreen renderer
		GFX = new Render(MAP.offScreen.ctx);
		SFX = new Render(MAP.screenCtx, map.size.screen.width* map.size.tile.width, 
			map.size.screen.height* map.size.tile.height);	
		AUDIO = new TinySound();

		init();
	}
}

function init()
{  
  var now = timestamp();	
	lastTime = now;

	GAME = new Title(0,high);

	FixedLoop();  
}

function SlowMo(mo){
	sStep = mo * step;
}

function FixedLoop(){
	if(GAME.mode == 2)
	{
		GAME = new Game(high);
	}
	else if(GAME.mode == 4)
	{
		high = GAME.high;
		GAME = new Title(1,high);
	}

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
	GAME.Update(dt);
};

function render() {
	GAME.Render();
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

