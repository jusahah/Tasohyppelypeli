import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, playerNum, x, y, asset }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.width = 26;
    this.height = 26;

    // By default, change if needed.
    this.frameNum = 0;
    this.playerNum = playerNum;
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
}
