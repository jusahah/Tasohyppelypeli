import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png')
    this.load.image('wall', 'assets/images/mushroom2.png')

    this.load.spritesheet(
      'players', 
      'assets/images/player_sprites.png', 
      8, 8, 12*12
    );

    this.load.spritesheet(
      'misc', 
      'assets/images/misc_sprites.png', 
      8, 8, 12*12
    );

    this.load.spritesheet(
      'slimes', 
      'assets/images/slime_sprites.png', 
      8, 8, 12*12
    );

  }

  create () {
    this.state.start('Game')
  }
}
