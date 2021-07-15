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

class Sound{
    constructor(samp){
        this.playing = 0;
        this.sound = new Audio(samp.src);
        this.type = samp.type;
        var m = this;
        this.sound.addEventListener('ended', function(){
            m.playing = 0;
        }, false);
    }

    Play(){
        if(!this.playing){
            this.sound.play();
            this.playing = 1;
        }
    }

    End(){
        this.playing = 0;
    }
}

var Music2 = function (files) {

    var sounds = [];

    for (var i = 0; i < files.length; i++) {
        sounds[files[i].key] = new Sound(files[i]);
    }

    function playSong(s)
    {
        sounds[s].Play();
    }

    function end(s)
    {
        sounds[s].End();
    }
    return{
        Play: function()
        {
            playSong("beep");
        }
    }
}
