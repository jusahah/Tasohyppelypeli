import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset, wallsGroup }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.width = 26;
    this.height = 26;

    this.wallsGroup = wallsGroup;

    // By default, change if needed.
    this.frameNum = 0;

    // Movement state variables
    // 1 = right, -1 = left
    this.direction = 1;

    this.ticks = Math.floor(Math.random() * 100);
    this.tickCheck = 10;

  }

  update () {
    //this.angle += 1
    //console.log("Slime update")
    ++this.ticks;

    if (this.ticks % this.tickCheck === 0 && this.aboutToDropOrHitWall()) {
      this.changeDirection();
    }
    
    this.body.velocity.x = 50 * this.direction;



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
