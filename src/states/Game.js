import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

import levels from '../levels/levels'

export default class extends Phaser.State {
  init () {}

  preload () {

  }

  create () {

    console.log("Game create")

    if (levels.length > 0) {
      var level = levels.shift();
      console.warn("Starting level: " + level.name);
      this.state.start('Level', true, false, level);
    } else {
      console.warn("Game is over - you won");
    }


  }
}
