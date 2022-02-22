
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

context.width = 600;
context.height = 600;

var aster = [];
var timer = 0;
var ship = { x: 270, y: 500 };
var fire = [];
var expl = [];
var shooting = false;
var coordy = 0;
var move = 0;
var complex = 30;
var score = 0;// parseInt (score);
var lifescore = 3;
var over = document.querySelector('.over');
var loop;
var stopped = false;

document.getElementById('resultscore').innerHTML = score;
document.querySelector('.lifescore').innerHTML = lifescore;
var reset = document.querySelector('.reset');
var start = document.querySelector('.start');

var shipimg = new Image();
shipimg.src = 'img/spaceship.png';

var asterimg = new Image();
asterimg.src = 'img/asteroids.png';

var fonimg = new Image(600, 600);
fonimg.src = 'img/space.jpg';

fireimg = new Image();
fireimg.src = 'img/fireball.png';

var explimg = new Image();
explimg.src = 'img/expl.png';

var aud = new Audio();
aud.src = 'sound/shooting2.ogg';

var audiofon = new Audio('sound/audiofon.mp3');
audiofon.loop = true;
audiofon.volume = 0.5;

var lostlife =  new Audio('sound/lostlife.mp3')
var audioover = new Audio('sound/over.mp3');

reset.addEventListener('click', function () {
   location.reload();
});

isMobile = {
   Android: function() {
       return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function() {
       return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function() {
       return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function() {
       return navigator.userAgent.match(/Opera Mini/i);
   },
   Windows: function() {
       return navigator.userAgent.match(/IEMobile/i);
   },
   any: function() {
       return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
   }
};

if (isMobile.any()) {
   canvas.addEventListener('mousedown', function(event){ 
      ship.x = event.offsetX - 25;
      ship.y = event.offsetY - 13;
      if (!stopped) {
         audiofon.play(); // агрессивный фон обработанный в событии
         shooting = true;
      }
   });
} else {
   canvas.addEventListener("mousemove", function (event) {
      ship.x = event.offsetX - 25;
      ship.y = event.offsetY - 13;
   });
   canvas.addEventListener('mousedown', function () {
      if (!stopped) {
         audiofon.play(); // агрессивный фон обработанный в событии
      }
      shooting = true;
   });
   canvas.addEventListener('mouseup', function(){
      shooting = false;
      aud.pause();
   });
}

// запуск основного цикла

fonimg.onload = function () {   
   game();
}

function game() {
   update();
   render();
   if (!stopped) {
      loop = requestAnimationFrame(game);
   }
}

function drawBg() {   
   context.drawImage(fonimg, 0, (fonimg.height - coordy) * -1);
   context.drawImage(fonimg, 0, coordy);
   if (Math.abs(coordy) > fonimg.height) {
      coordy = 0;
   }
   coordy += 1;
}

// физика

function update() { 
   timer++;
   if (score == 100) {
      complex = 5;
   }
   // спавн астероидов
   if (timer % complex == 0) {
      aster.push({
         x: Math.random() * 550,
         y: -50,
         dx: Math.random() * 4 - 1, //! 2
         dy: Math.random() * 5 + 1,
         asteranx:0,
         asterany:0,
         del:0
      });
   }
   // спавн выстрелов
   if (timer % 20 == 0 && shooting) {
      var aud = new Audio('sound/shoot.ogg');
      aud.volume=1;
      aud.play();
      fire.push({ x: ship.x + 25, y: ship.y, dx:0, dy: -5 });
      fire.push({ x: ship.x + 10, y: ship.y + 20, dx:-0.5, dy: -5 });
      fire.push({ x: ship.x + 40, y: ship.y + 20, dx: +0.5, dy: -5 });    
      
   }
   // прорисовка анимации взрыва
   for (i in expl){
      expl[i].animx = expl[i].animx + 0.8; // скорость анимации
      if (expl[i].animx > 7) { expl[i].animy++; expl[i].animx = 0 }
      if (expl[i].animy > 7) {
         expl.splice(i, 1);
      }
   }

   for (i in aster) {    // анимация астероида
      aster[i].asteranx = aster[i].asteranx + 0.4; // скорость анимации
      if (aster[i].asteranx > 7) { aster[i].asterany++; aster[i].asteranx = 0 }
      if (aster[i].asterany > 7) { aster[i].asterany = 0}   //aster.splice(i, 1);
   }

   for (i in aster) {       // движение и скорость
      aster[i].x = aster[i].x + aster[i].dx;
      aster[i].y = aster[i].y + aster[i].dy;
   
      if (aster[i].x >= 550 || aster[i].x < 0) { aster[i].dx = - aster[i].dx; }
      if (aster[i].y >= 600) { aster.splice(i, 1); }


      // остаток жизней
      try {
         if (Math.abs(aster[i].x + 10 - ship.x) < 50 && Math.abs(aster[i].y - ship.y) < 30) {
            expl.push({ x: ship.x - 20, y: ship.y - 20, animx: 0, animy: 0 }); // взрыв корябля
            lostlife.play();
            aster[i].del = 1;
            lifescore--;
            document.querySelector('.lifescore').innerHTML = lifescore;
         }
      } catch {
         console.log('Exception handling');
         update();
      }
      
      // game over
      if (lifescore == 0) {
         over.style.display = 'block';
         
         audiofon.pause();
         audioover.play();
         cancelAnimationFrame(loop);
         stopped = true;
      }
      
      // проверка астероида на столкновение со снарядом
     
      for (j in fire) {
         try {
            if (Math.abs(aster[i].x + 40 - fire[j].x) < 30 && Math.abs(aster[i].y - fire[j].y) < 15) {
               score++;
               document.getElementById('resultscore').innerHTML = score;
               // столкновение и соответственно взрыв
               var audio = new Audio('sound/explosion.wav');
               audio.volume = 0.5; // громкость звука взрыва
               audio.play();
               expl.push({ x: aster[i].x - 15, y: aster[i].y - 15, animx: 0, animy: 0 });     // спавн взрывов
               aster[i].del = 1;
               fire.splice(j, 1); break;
            }
         } catch {
            update(); 
         }
      }
      try {
         if (aster[i].del == 1) aster.splice(i, 1);
      } catch {
         update()
      };
   }
   // движение выстрелов
   for (i in fire) {
      fire[i].y = fire[i].y + fire[i].dy;
      fire[i].x = fire[i].x + fire[i].dx;
      if (fire[i].y <= -50) {
         fire.splice(i, 1);
      }
   }
}

 // отрисовка

function render() {
   context.clearRect(0, 0, canvas.width, canvas.height); 
   drawBg();
   context.drawImage(shipimg, ship.x, ship.y, 60, 60);
  
   for (i in fire) {
      context.drawImage(fireimg, fire[i].x, fire[i].y, 10, 20);
   }

   for (i in aster) {
      context.drawImage(asterimg, 128 * Math.floor(aster[i].asteranx), 128 * Math.floor(aster[i].asterany), 128, 128, aster[i].x, aster[i].y, 70, 70);    // анимация астероида
   }

   for (i in expl) {
      context.drawImage(explimg, 240 * Math.floor(expl[i].animx), 240 * Math.floor(expl[i].animy), 240, 240, expl[i].x, expl[i].y, 100, 100); // анимация взрыва
   }
}

var requestAnimFrame = (function () {
   return window.requestAnimFrame ||
      window.webkitRequestAnimFrame ||
      window.mozRequestAnimFrame ||
      window.oRequestAnimFrame ||
      window.msRequestAnimFrame ||
      function (callback) {
         window.setTimeout(callback, 1000 / 20);
      };
})();