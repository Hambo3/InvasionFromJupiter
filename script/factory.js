var C = {
    ASSETS:{
        STAR:0,
        GRNDCITY:1,
        BGSHACK:2,
        BGHILL:3,
        SHACK:4,  
        HILL:5,  
        BOSS:6,  
        BOSSPART:7,                                 
        PLAYER:8,
        ENEMY:9,
        PLRSHOT:10,
        EMYSHOT:11,        
     },
     FORMATION:{
         VERTICAL:0,
         HORIZONTAL:1,
         DDOWN:2,
         DUP:3
     }
}

var TRANS = [
    {t:200, d:3000, z:0,title:"EARTH",info:["RESCUE HUMANOIDS", "BEAM [N]"]},
    {t:500, d:1000, z:0, title:"SPACE",info:["SAVED"]},
    {t:500, d:99900, z:0.001, title:"BOSS",info:["KILL THE BOSS"]},
    {t:500, d:1000, z:-0.002, title:"JUPITER",info:["PROCEDE TO JUPITER"]},
    {t:500, d:500, z:0, title:"SPACE",info:[]},
    {t:500, d:99900, z:0.003, title:"BOSS",info:["KILL THE BOSS"]},
    {t:800, d:3000, z:-0.003, title:"JUPITER IS DESTROYED",info:["YOUR A REAL HERO NOW"]},
];

var SOUNDS = [
    [,,1223,.06,.24,.06,2,.25,-0.5,11.3,134,-0.01,.06,,4,,.01,.34,.06,.03],
    [2.01,,469,.01,.04,.01,2,1.49,-4.3,-0.7,,,,.2,,,.13,.94,.05],
    [1.72,,973,,.11,.81,3,2.1,,.5,,,,.8,,.2,.34,.83,.07,.08]
];
var LIVES = [0,[-6,-4,-3,-2,2,-2,6,-1,6,1,-1,1,-6,1]];

var BOSS1 = [
    '0011111112244444',
    '0111111122233300',
    '1111111122233344',
    '1111222222222200',
    '0012233333222200',
    '1112233333222200',
    '2222233333000443',
    '1111133333444443',
    '4111122222222443',
    '1111122222222000',
    '4111122222222000',
    '1112144222222244',
    '0111144000444443',
    '0112144333333443',
    '0111144333333000',
];

var BOSS2 = [
    '00000000000004444000',
    '00000000000044444000',
    '00000000000444400000',
    '00111111122444444000',
    '01111111222333000000',
    '11111111222333444444',
    '11112222222222000000',
    '00122333332222000000',
    '11122333332222000000',
    '22222333330004430000',
    '11111333334444430000',
    '41111222222224430000',
    '11111222222220000000',
    '41111222222220000000',
    '11121442222222443000',
    '01111440004444430000',
    '01121443333334430000',
    '01111443333330000000',
    '00444444444440000000',
    '00000404004000000000',
    '00000404000000000000'
];

var BDATA = [
    [],
    [1,0],
    [2,0],
    [3,0],
    [4,0]
];

var BCELL = [
    [-16,-16,16,-16,16,16,-16,16]
];

var FONT = {    
    'A': [
        [,1,0],
        [1,,1],
        [1,1,1],
        [1,,1],
        [1,,1]
    ],
    'B': [
        [1,1,0],
        [1,,1],
        [1,1,1],
        [1,,1],
        [1,1,0]
    ],
    'C': [
        [1,1,1],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,1,1]
    ],
    'D': [
        [1,1,0],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,0]
    ],
    'E': [
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    'F': [
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,0],
        [1,0,0]
    ],
    'G': [
        [,1,1,0],
        [1,0,0,0],
        [1,,1,1],
        [1,,,1],
        [,1,1,0]
    ],
    'H': [
        [1,,1],
        [1,,1],
        [1,1,1],
        [1,,1],
        [1,,1]
    ],
    'I': [
        [1,1,1],
        [,1,0],
        [,1,0],
        [,1,0],
        [1,1,1]
    ],
    'J': [
        [1,1,1],
        [,,1],
        [,,1],
        [1,,1],
        [1,1,1]
    ],
    'K': [
        [1,,,1],
        [1,,1,0],
        [1,1,0,0],
        [1,,1,0],
        [1,,,1]
    ],
    'L': [
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,1,1]
    ],
    'M': [
        [1,1,1,1],
        [1,0,1,1],
        [1,0,1,1],
        [1,0,0,1],
        [1,0,0,1]
    ],
    'N': [
        [1,,,1],
        [1,1,,1],
        [1,,1,1],
        [1,,,1],
        [1,,,1]
    ],
    'O': [
        [1,1,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    'P': [
        [1,1,1],
        [1,,1],
        [1,1,1],
        [1,0,0],
        [1,0,0]
    ],
    'Q': [
        [0,1,1,0],
        [1,,,1],
        [1,,,1],
        [1,,1,1],
        [1,1,1,1]
    ],
    'R': [
        [1,1,0],
        [1,,1],
        [1,,1],
        [1,1,0],
        [1,,1]
    ],
    'S': [
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [,,1],
        [1,1,1]
    ],
    'T': [
        [1,1,1],
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    'U': [
        [1,,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    'V': [
        [1,,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [0,1,0]
    ],
    'W': [
        [1,,,1],
        [1,,,1],
        [1,,,1],
        [1,,1,1],
        [1,1,1,1]
    ],
    'X': [
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'Y': [
        [1,,1],
        [1,,1],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    'Z': [
        [1,1,1],
        [,,1],
        [,1,0],
        [1,0,0],
        [1,1,1]
    ],
    '0': [
        [1,1,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    '1': [
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    '2': [
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    '3':[
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '4':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]
    ],
    '5':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '6':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '7':[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [0,0,1]
    ],
    '8':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '9':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '[': [
        [,1,1],
        [,1,],
        [,1,],
        [,1,],
        [,1,1]
    ],
    ']': [
        [1,1,],
        [,1,],
        [,1,],
        [,1,],
        [1,1,]
    ],
    ' ': [
        [,,],
        [,,],
        [,,],
        [,,],
        [,,]
    ],
    '?': [
        [1,1,1],
        [1,0,1],
        [0,1,1],
        [0,1,0],
        [0,1,0]
    ],
    '.': [
        [,,],
        [,,],
        [,,],
        [,,],
        [,1,]
    ],
    ':': [
        [,,],
        [,1,],
        [,,],
        [,1,],
        [,,]
    ],
    '£':
    [
        [0,1,1],
        [0,1,],
        [1,1,1],
        [0,1,0],
        [1,1,1]
    ],
    '+':[]
};