var screen = document.getElementById("screen");
//screen.width = window.innerWidth;
//screen.height = window.innerHeight;
screen.width = 360;
screen.height = 640;
var ctx = screen.getContext("2d");
var score = 0;
var jumpVar = 0;
var gravity = 3;
var falling = 0;
var gamePaused = true;


var Shape = function(x,y,width,height,color,img,frames,delay){//An object used for walls and other shapes.
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;
  this.img = img;
  this.frames = frames;
  this.delay = delay;
  this.index = 0;
  this.draw = function(){
    if(this.frames !== null){
      if(this.delay < 0){
        ctx.drawImage(this.img,0,this.frames[this.index++%this.frames.length],this.width,this.height,this.x,this.y,this.width,this.height);
        this.delay = delay;
      }else{
        ctx.drawImage(this.img,0,this.frames[this.index%this.frames.length],this.width,this.height,this.x,this.y,this.width,this.height);
        this.delay--;
      }
    }else if(this.img !== null){
      ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
    }else{
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x,this.y,this.width,this.height);
    }
  };
};

/*Create all the different canvas elements*/
var skyImg = new Image();
skyImg.src = "img/sky.png";
var sky = new Shape(0,0,screen.width,screen.height,"#041024",null,null,0);

var treesImg = new Image();
treesImg.src = "img/trees.png";
var trees = new Shape(0,screen.height-160,screen.width,80,"#041024",treesImg,null,0);

var birdImg = new Image();
birdImg.src = "img/bird.png";
var bird = new Shape(screen.width/4,screen.height/2,57,51,"#e4cc26",birdImg,[0,51,102,51],5);

var groundImg = new Image();
groundImg.src = "img/ground2.png";
var ground = new Shape(0,screen.height-80,screen.width,80,"#e4cc26",groundImg,[0,80,160],5);

var walls = [];//the array that contains all the walls

function createWall(){
  var wallTop = new Image();
  wallTop.src = "img/wallTop.png";
  var topWall = new Shape(screen.width,Math.random()*((screen.height-ground.height)/2)-screen.height,80,screen.height,"#74bf2e",wallTop,null,0);
  var wallBtn = new Image();
  wallBtn.src = "img/wallBottom.png";
  var bottomWall = new Shape(screen.width,topWall.y+topWall.height+180,80,screen.height,"#74bf2e",wallBtn,null,0);
  walls.push(topWall);
  walls.push(bottomWall);
}

createWall();//Create the first wall

document.addEventListener("keydown", function(event) {
  jump();
});

document.addEventListener("click", function(event) {
  jump();
});

function jump(){
  jumpVar = 22;
  falling = 0;
  if(gamePaused){//unpause game
    restart();
  }
}

function restart(){
  gamePaused = false;
  score = 0;
  bird.img.src = "img/bird.png";
  bird.frames = [0,51,102,51];
  bird.y = screen.height/2;
  walls = [];
  createWall();
}

/*What happens when ground or wall is hit*/
function hit(){
    gamePaused = true;
    bird.img.src = "img/birdDamaged.png";
    bird.frames = null;
}

function update(){//The function that renders everything
  ctx.clearRect(0,0,screen.width,screen.height);

  sky.draw();
  trees.draw();

  for(var i = 0; i<walls.length; i++){
    walls[i].draw();
  }

  ctx.translate(bird.x+bird.width/2,bird.y+bird.height/2);
  if(jumpVar > 0){
    ctx.rotate((-jumpVar)*Math.PI/180);
  }else{
    ctx.rotate(falling*Math.PI/180);
  }
  ctx.translate(-(bird.x+bird.width/2),-(bird.y+bird.height/2));
  bird.draw();
  ctx.resetTransform(1,0,0,1,0,0);

  if(walls.length > 6){//Remove the walls that aren't viewed on screen from array
     walls.shift();
     walls.shift();
  }

  ground.draw();

  //Draw the score
  ctx.font = "400 42px Ubuntu Mono";
	ctx.fillStyle = "#FFFFFF";
  ctx.fillText(score,screen.width-50,50);

  if(gamePaused){
    //Draw the score
    ctx.font = "400 22px Montserrat";
  	ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center";
    ctx.fillText("Press any key to start",screen.width/2,screen.height/2.2);
  }

  if(!gamePaused){//Only do calculations if game isn't paused

    for(var i = 0; i<walls.length; i++){
      walls[i].x-=2;//move the wall forward
      if(walls[i].x == bird.x && i%2 === 0){//Create a new wall if one hits the middle
         createWall();
      }
      if(walls[i].x == bird.x && i%2 === 0){//Increase score if bird goes through the wall
        score++;
      }
    }

    if(bird.y + bird.height >= ground.y){//Check if ground hit
      hit();
    }

    var hitRadius = 5;
    for(var i = 0; i<walls.length; i++){//Check if wall hit
      if(bird.x+bird.width-hitRadius >= walls[i].x && bird.x+hitRadius <= walls[i].x+walls[i].width && (bird.y + hitRadius >= walls[i].y || bird.y+bird.height-hitRadius >= walls[i].y) && bird.y+hitRadius <= walls[i].y + walls[i].height){
         hit();
      }
    }

    if(bird.y < 0){
      bird.y = 0;
    }

    bird.y = bird.y + gravity - jumpVar;//Bird gravity towards ground

    jumpVar = jumpVar > 0 ? jumpVar - gravity : 0;//Decrease the jump variable until its zero each update so that jumping looks smoother
    if(falling !== 85){
      falling+=0.5;
    }

  }

  window.requestAnimationFrame(update);
}

update();
