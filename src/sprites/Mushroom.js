import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, playerNum, x, y, asset }) {
    super(game, x, y, asset)

  	console.log("spawn to coords: " 
  		+ x + ", " + y
  	);

    // Records original x and y values for respawning player
    this.spawnPosition = {
    	x: x,
    	y: y
    };

    this.anchor.setTo(0.5)
    this.width = 26;
    this.height = 26;

    this.direction = -1;

    // By default, change if needed.
    this.frameNum = 0;
    this.playerNum = playerNum;

    this.playerAlive = true;

    this.lastShotTime = 0;
  }

  update () {
    //this.angle += 1
  }

  setDefaultFrame(frameNum) {
  	this.defaultFrameNum = frameNum;
  }

  getDefaultFrame() {
  	return this.defaultFrameNum;
  }

  respawn() {
  	
	this.body.moves = false;
  	this.x = this.spawnPosition.x;
  	this.y = this.spawnPosition.y;

  	this.rotation = 0;
  	this.immovable = false;
  	this.body.collideWorldBounds = true;
  	this.frame = this.getDefaultFrame();
  	
  	// Mark player as alive (re-enables controls)
  	// We need to wait a bit so Phaser gets to recover physics or smth.
  	setTimeout(() => {
  		this.body.moves = true;
  		this.playerAlive = true;
  	}, 100);




  }

  youWereKilled() {
  	this.playerAlive = false;

  	this.playDeathAnimation();
  }

  playDeathAnimation() {
  	this.rotation = Math.PI;
  	//this.body.moves = false;
  	this.immovable = true;
  	this.body.collideWorldBounds = false;
  	this.body.velocity.x = 0;
	this.animations.stop(null, true);
	this.frame = this.getDefaultFrame();

	setTimeout(this.respawn.bind(this), 3000);

  }


  /// Shooting logic
  allowedToShoot() {
  	var now = Date.now(); // in ms

  	return now - this.lastShotTime > 500;
  }

  shotFired() {
  	this.lastShotTime = Date.now();
  }


}
