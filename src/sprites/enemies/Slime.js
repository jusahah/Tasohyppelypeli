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

  }

  update () {
    //this.angle += 1

    if (!this.alive) {
      return false;
    }

    ++this.ticks;

    if (this.ticks % this.tickCheck === 0 && this.aboutToDropOrHitWall()) {
      this.changeDirection();
      
    }
    
    this.body.velocity.x = 50 * this.direction;
    
    // Shooting logic

    if (this.ticks % this.tickCheck === 1 && this.canShoot() && this.seesPlayer()) {
      this.shootBullet();
    }

  }

  canShoot() {
    return Date.now() - this.lastShotTime > 250;
  }

  seesPlayer() {

    // TODO: Optimize later.

    var rayCastLen = 29; // in pixels
    var y = this.body.y;

    for (var i = 0; i < 50; i++) {
      
      var currXToCheck = this.body.x + rayCastLen * i * this.direction;

      // Step 1: check if laser ray hits a wall
      var wallTiles = this.game.physics.arcade.getObjectsAtLocation(
        currXToCheck,
        y+2,
        this.wallsGroup
      );

      if (wallTiles && wallTiles.length > 0) {
        // Laser ray hit a wall.
       
        return false; // Can not see player.
      }

      // Step 2: if no wall, check if laser ray hits a player
      for (var j = 0; j < this.players.length; j++) {

        var player = this.players[j];

        // Check if laser ray endpoint is close enough to player

        if (j === 0) {
          //console.log(y + " vs. player y: " + player.body.y);
          
        }

        if (y > player.body.y-2 && y < (player.body.y + 28)) {
          // Laser ray is in players body height
          if (this.direction === 1 && player.body.x > this.body.x && Math.abs(currXToCheck - player.body.x) < 28) {
            //console.warn("Sees player " + player.playerNum + " in right");
            return true;
          } else if (this.direction === -1 && player.body.x < this.body.x && Math.abs(currXToCheck - player.body.x) < 28) {
            //console.warn("Sees player " + player.playerNum + " in left");
            return true;
          }

        }
      }

    }

    return false;


  }

  shootBullet() {
    // Firing logic
    var bullet = this.bulletsGroup.getFirstExists(false);
    if (bullet) {
      // If we have a bullet, set it to the starting position
      bullet.reset(this.x + (18*this.direction), this.y+2);
      // Give it a velocity of -500 so it starts shooting
      bullet.body.velocity.x = this.direction * 900;
    }


  }

  aboutToDropOrHitWall() {

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

    var dropTiles = this.game.physics.arcade.getObjectsAtLocation(
      xCheck,
      this.body.y + 26,
      this.wallsGroup
    );

    if (!dropTiles || dropTiles.length === 0) {
      // There is no tile, Slime is about to drop
      this.changeDirection();

    } else {
      // There is tile, do nothing
    }

  }

  changeDirection() {
    this.scale.x *= -1;
    this.direction *= -1;
  }

  setDefaultFrame(frameNum) {
  	this.defaultFrameNum = frameNum;
  }

  getDefaultFrame() {
  	return this.defaultFrameNum;
  }
}
