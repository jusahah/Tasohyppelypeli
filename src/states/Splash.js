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
      'objects', 
      'assets/images/object_sprites.png', 
      8, 8, 12*12
    );

    this.load.spritesheet(
      'slimes', 
      'assets/images/slime_sprites.png', 
      8, 8, 12*12
    );

  }

  create () {

    console.log("Splash create")

    game.input.gamepad.start();

    // To listen to buttons from a specific pad listen directly on that pad game.input.gamepad.padX, where X = pad 1-4
    var pad1 = game.input.gamepad.pad1;

    pad1.addCallbacks(this, { onConnect: () => {
      console.log("Gamepad connected")
      // Gamepad is connected, can start the game.  
      
      // Test level editor
      //this.state.start('LevelEditor');
      this.state.start('Game')

    } });

  }
}
