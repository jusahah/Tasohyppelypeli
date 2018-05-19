import Phaser from 'phaser'
import _ from 'lodash'

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
    this.completedLevel = false;

    this.lastShotTime = 0;

    // Keys
    this.keys = [];

    // Start tile
    this.startTile = null;

    // Timeout handler (allows to destroy timeout before its run)
    this.respawnTimeout = null;
  }

  releaseTimeouts() {

    console.log("Release timeouts for " + this.playerNum)

    if (this.respawnTimeout) {
      clearTimeout(this.respawnTimeout);
      this.respawnTimeout = null;
    }

  }

  setSpawnPosition(x, y) {
    this.spawnPosition.x = x;
    this.spawnPosition.y = y;
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

  keyCollected(keyColor) {
    if (this.keys.length > 0) {
      // Remove all keys
      this.keys.length = 0;
    }

    this.keys.push(keyColor);
  }

  checkHasKey(keyColor) {
    return this.keys.indexOf(keyColor) !== -1;
  }

  useKey(keyColor) {
    if (this.checkHasKey(keyColor)) {
      this.keys.length = 0; // Remove ALL keys
      return true;
    }

    return false;
  }

  completeLevel() {
    this.completedLevel = true;
    this.playerAlive = false;
  }

  hasCompletedLevel() {
    return this.completedLevel;
  }

  respawn() {

  	this.respawnTimeout = null;

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

  	this.respawnTimeout = setTimeout(this.respawn.bind(this), 3000);

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
