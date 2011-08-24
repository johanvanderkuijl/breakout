$(document).ready(function(){
  // our global vars
  var x;
  var y;
  var dx;
  var dy;
  var ctx;
  var WIDTH;
  var HEIGHT;
  var paddlex;
  var paddleh = 10;
  var paddlew = 75;
  var rightDown = false;
  var leftDown = false;
  var canvasMinX = 0;
  var canvasMaxX = 0;
  var intervalId = 0;
  var bricks;
  var NROWS = 5;
  var NCOLS = 5;
  var BRICKWIDTH;
  var BRICKHEIGHT = 15;
  var PADDING = 1;
  var iState = 0; // control state of game
  // 0 - ready: just loaded, waiting for start
  // 1 - playing
  // 2 - succes: level cleared
  // 3 - fail: dead
  //
  // transitions: 0 to 1, 1 to 2, 1 to 3, 2 to 0, 3 to 0
  var ballr = 10;
  var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
  var paddlecolor = "#FFFFFF";
  var ballcolor = "#FFFFFF";
  var backcolor = "#000000";
  var textcolor = "#FFFFFF";
  
  
  // iphone controls
  var touchable = 'createTouch' in document;

  if(touchable) {
    canvas.addEventListener( 'touchstart', onTouchStart, false );
    canvas.addEventListener( 'touchmove', onTouchMove, false );
    canvas.addEventListener( 'touchend', onTouchEnd, false );
    $("#info").html('touch device detected');
    //dx = dx*2; // double speed on iPhone
    dy = dy*3;
  } else {
    $(document).mousemove(onMouseMove);
    $(document).click(onClick);
    $("#info").html('mouse device detected');
  }

  function onTouchStart(e) {
    if(iState==0 || iState==2 || iState==3) {
      $("#info").html("touch");
      levelStart();
    }
    paddlex = e.touches[0].pageX - paddlew ;
  }
   
  function onTouchMove(e) {
     // Prevent the browser from doing its default thing (scroll, zoom)
    if(e.touches.length == 1){ // Only deal with one finger
      var touch = e.touches[0]; // Get the information for finger #1
      paddlex = touch.pageX - paddlew ;
    }
    e.preventDefault(); 
  } 
   
  function onTouchEnd(e) { 
    //do stuff
  }

  /**
   * initialize variables and start the drawing loop
   */
  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    paddlex = WIDTH / 2;
    BRICKWIDTH = (WIDTH/NCOLS) - 1;
    canvasMinX = $("#canvas").offset().left;
    canvasMaxX = canvasMinX + WIDTH;
    

      /*
    if(iState==1) {
      intervalId = setInterval(draw, 10);
      return intervalId;
    } else {
      return 0;
    }*/
  }

  function circle(x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }

  function rect(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
  }

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    rect(0,0,WIDTH,HEIGHT);
  }

  function onKeyDown(evt) {
    if (evt.keyCode == 39) rightDown = true;
    else if (evt.keyCode == 37) leftDown = true;
  }

  function onKeyUp(evt) {
    if (evt.keyCode == 39) rightDown = false;
    else if (evt.keyCode == 37) leftDown = false;
  }

  $(document).keydown(onKeyDown);
  $(document).keyup(onKeyUp);

  function onMouseMove(evt) {
    if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
      paddlex = Math.max(evt.pageX - canvasMinX - (paddlew/2), 0);
      paddlex = Math.min(WIDTH - paddlew, paddlex);
    }
  }

  /* fires on mouseclick */
  function onClick(evt) {
    $("#info").html("click");
    if(iState==0 || iState==2 || iState==3) {
      levelStart();
    }
  }

  /**
   * initialize the bricks array in memory
   */
  function initbricks() {
      bricks = new Array(NROWS);
      for (i=0; i < NROWS; i++) {
          bricks[i] = new Array(NCOLS);
          for (j=0; j < NCOLS; j++) {
              bricks[i][j] = 1;
          }
      }
  }

  function initball() {
    x=25;
    y=250;
    dx = 1.5;
    dy = -4;    
  }
  /**
   * draw bricks on screen
   * @return int iTotal the number of bricks left on the screen
   */
  function drawbricks() {
    iTotal = 0;
    for (i=0; i < NROWS; i++) {
      ctx.fillStyle = rowcolors[i];
      for (j=0; j < NCOLS; j++) {
        if (bricks[i][j] == 1) {
          iTotal++;
          rect((j * (BRICKWIDTH + PADDING)) + PADDING, 
               (i * (BRICKHEIGHT + PADDING)) + PADDING,
               BRICKWIDTH, BRICKHEIGHT);
        }
      }
    }
    return iTotal;
  }


  
  function levelReady() {
    clear();
    
    var my_gradient = ctx.createLinearGradient(0, 0, 0, 150);
    my_gradient.addColorStop(0, "black");
    my_gradient.addColorStop(1, "#272066");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    ctx.fillStyle = ballcolor;
    ctx.font = "bold 30px 'lucida grande'";
    ctx.fillText("Click to play", 70, 100);
  }
  
  /**
   * player starts playing
   */
  function levelStart() {
    iState=1;
    initbricks();
    initball();
    intervalId = setInterval(draw, 10);
    return intervalId;
  }

  /**
   * player has cleared all blocks
   */
  function levelCleared() {
    iState=2;
    clearInterval(intervalId);
    
    //draw();
    /*
    var my_gradient = ctx.createLinearGradient(0, 0, 0, 150);
    my_gradient.addColorStop(0, "black");
    my_gradient.addColorStop(1, "#272066");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, 300, 300);
    */
    
    draw();
    ctx.fillStyle = textcolor;
    ctx.font = "bold 30px 'lucida grande'";
    ctx.fillText("Well done!", 70, 100);

  }
  
  /**
   * player died
   */
  function levelFailed() {
    iState=3;
    clearInterval(intervalId);
    
    ctx.fillStyle = textcolor;
    ctx.font = "bold 30px 'lucida grande'";
    ctx.fillText("Play again?", 70, 100);    
  }
  

  
  function draw() {
    ctx.fillStyle = backcolor;
    clear();
    ctx.fillStyle = ballcolor;
    circle(x, y, ballr);

    if (rightDown) paddlex += 5;
    else if (leftDown) paddlex -= 5;
    ctx.fillStyle = paddlecolor;
    rect(paddlex, HEIGHT-paddleh, paddlew, paddleh);

    iTotal = drawbricks();
    if(iState==1 && iTotal==0) {
      levelCleared();
    }
    
    //want to learn about real collision detection? go read
    // http://www.metanetsoftware.com/technique/tutorialA.html
    rowheight = BRICKHEIGHT + PADDING;
    colwidth = BRICKWIDTH + PADDING;
    row = Math.floor(y/rowheight);
    col = Math.floor(x/colwidth);
    //reverse the ball and mark the brick as broken
    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
      dy = -dy;
      bricks[row][col] = 0;
      $("#info").html(iTotal); // update here
    }

    if (x + dx + ballr > WIDTH || x + dx - ballr < 0)
      dx = -dx;

    if (y + dy - ballr < 0)
      dy = -dy;
    else if (y + dy + ballr > HEIGHT - paddleh) {
      if (x > paddlex && x < paddlex + paddlew) {
        //move the ball differently based on where it hit the paddle
        dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
        dy = -dy;
      }
      else if (y + dy + ballr > HEIGHT) {
        levelFailed();
      }
    }

    x += dx;
    y += dy;
  }

  init();
  initbricks();
  levelReady();
});
