import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, wallsGroup, players, bulletsGroup }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.width = 26;
    this.height = 26;

    this.wallsGroup = wallsGroup;
    this.bulletsGroup = bulletsGroup;
    this.players = players; // array of players (p1, p2)

    // By default, change if needed.
    this.frameNum = 0;

    // Movement state variables
    // 1 = right, -1 = left
    this.direction = 1;

    this.ticks = Math.floor(Math.random() * 100);
    this.tickCheck = 10;

    // Timestamp when this creature last shot
    this.lastShotTime = 0;

    this.shooting = false;
    this.toShoot = 0;

  }

  update () {
    //this.angle += 1

    if (!this.alive) {
      return false;
    }

    ++this.ticks;

    if (this.ticks % this.tickCheck === 0 && this.aboutHitWall()) {
      this.changeDirection();
      
    }
    
    this.body.velocity.x = 30 * this.direction;
    
    // Shooting logic

    if (this.shooting) {
      // Currently shooting
      if (this.toShoot > 0) {
        --this.toShoot;
        this.shootBullet();

      } else {
        // Stop shooting
        this.shooting = false;
        this.toShoot = 0;
      }
    } else {
      if (this.ticks % 2 === 0 && this.seesPlayer()) {
        this.shootBulletBurst();
      }
      
    }


  }

  canShoot() {
    return Date.now() - this.lastShotTime > 50;
  }

  seesPlayer() {

    // TODO: Optimize so that does not check every frame etc.

    var x = this.body.x;
    var y = this.body.y;

    // Step 2: if no wall, check if laser ray hits a player
    for (var j = 0; j < this.players.length; j++) {

      var player = this.players[j];

      // Check if laser ray endpoint is close enough to player

      if (x > player.body.x-20 && x < (player.body.x + 20)) {
        console.log("Possible to see p")
        // Laser ray is in players body height
        
        // Calc distance to player
        var pixelDist = player.body.y - y;

        var rayCastLen = 29; // in pixels
        var x = this.body.x+2;

        for (var i = 0; i < 32; i++) {

          var shootDist = rayCastLen * i;

          if (shootDist > pixelDist) {
            return true; // Must see player
          }

          // Step 1: check if laser ray hits a wall
          var wallTiles = this.game.physics.arcade.getObjectsAtLocation(
            x,
            y + shootDist,
            this.wallsGroup
          );

          if (wallTiles && wallTiles.length > 0) {
            // Laser ray hit a wall.
           
            return false; // Can not see player.
          }

        }


      }
    }

    // TODO: Optimize later.

    var rayCastLen = 29; // in pixels
    var x = this.body.x+2;

    for (var i = 0; i < 32; i++) {
      
      var currYToCheck = this.body.y + rayCastLen * i;

      // Step 1: check if laser ray hits a wall
      var wallTiles = this.game.physics.arcade.getObjectsAtLocation(
        x,
        currYToCheck+2,
        this.wallsGroup
      );

      if (wallTiles && wallTiles.length > 0) {
        // Laser ray hit a wall.
       
        return false; // Can not see player.
      }

    }

    // Step 2: if no wall, check if laser ray hits a player
    for (var j = 0; j < this.players.length; j++) {

      var player = this.players[j];

      // Check if laser ray endpoint is close enough to player

      if (j === 0) {
        //console.log(y + " vs. player y: " + player.body.y);
        
      }

      if (x > player.body.x-18 && x < (player.body.x + 18)) {
        // Laser ray is in players body height
        return true;

      }
    }    

    return false;


  }

  shootBulletBurst() {
    if (!this.shooting) {
      this.shooting = true;
      // Burst size
      this.toShoot = 10;
    }
  }

  shootBullet() {
    // Firing logic
    var bullet = this.bulletsGroup.getFirstExists(false);
    if (bullet) {
      // If we have a bullet, set it to the starting position
      bullet.reset(this.x, this.y+26);
      // Give it a velocity of -500 so it starts shooting
      bullet.body.velocity.y = 1900;
    }


  }

  aboutHitWall() {

    if (this.direction === 1) {
      var xCheck = this.body.x + 26 * this.direction + 2;
    } else {
      var xCheck = this.body.x - 2;
    }

    var blockTiles = this.game.physics.arcade.getObjectsAtLocation(
      xCheck,
      this.body.y,
      this.wallsGroup
    );

    if (blockTiles && blockTiles.length > 0) {
      // There is no tile, Slime is about to drop
      this.changeDirection();
      return;

    } 

  }

  changeDirection() {
    this.direction *= -1;
  }

  setDefaultFrame(frameNum) {
  	this.defaultFrameNum = frameNum;
    this.frame = frameNum;
  }

  getDefaultFrame() {
  	return this.defaultFrameNum;
  }
}
