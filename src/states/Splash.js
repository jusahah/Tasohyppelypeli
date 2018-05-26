import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    // This were here originally by Phaser
    //this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    //this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    //centerGameObjects([this.loaderBg, this.loaderBar])
    //this.load.setPreloadSprite(this.loaderBar)

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

    this.p1HasPad = false;
    this.p2HasPad = false;

    this.p1ControlSelection = null;
    this.p2ControlSelection = null;

    this.buildMenu();

    // Keyboard listeners
    game.input.keyboard.addCallbacks(this, null, (e) => {
      var wasdLetters = ['w', 'a', 's', 'd'];
      var arrowLetters = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

      var key = e.key;

      if (wasdLetters.indexOf(key) !== -1) {
        if (this.p1ControlSelection === null && this.p2ControlSelection !== 'wasd') {
          this.p1ControlSelection = 'wasd';
        } else if (this.p2ControlSelection === null && this.p1ControlSelection !== 'wasd') {
          this.p2ControlSelection = 'wasd';
        }
      } else if (arrowLetters.indexOf(key) !== -1) {
        if (this.p1ControlSelection === null && this.p2ControlSelection !== 'arrows') {
          this.p1ControlSelection = 'arrows';
        } else if (this.p2ControlSelection === null && this.p1ControlSelection !== 'arrows') {
          this.p2ControlSelection = 'arrows';
        }
      }

      this.updateControlsTexts();

    })  

    game.input.gamepad.start();

    // To listen to buttons from a specific pad listen directly on that pad game.input.gamepad.padX, where X = pad 1-4
    var pad1 = game.input.gamepad.pad1;
    console.log("Pad 1 object");
    console.log(pad1);

    var pad2 = game.input.gamepad.pad2;
    console.log("Pad 2 object");
    console.log(pad2);

    if (!pad1.connected) {
        // Add event listener that reacts to gamepad getting either connected or disconnected      pad1.addCallbacks(this, { onConnect: () => {
      pad1.addCallbacks(this, { onConnect: () => {
        console.log("Gamepad 1 connected")
        this.gamePadConnected(1);
      }, onDisconnect: () => {
        console.log("Gamepad 1 disconnected")
        this.gamePadDisconnected(1);
      }, onUp: () => {
        console.log("Gamepad 1 up")
        this.gamePadChosen(1);
      } }); 
      this.gamePadDisconnected(1);
    } else {
      this.gamePadConnected(1);
    }

    if (!pad2.connected) {
      // Add event listener that reacts to gamepad getting either connected or disconnected
      pad2.addCallbacks(this, { onConnect: () => {
        console.log("Gamepad 2 connected")
        this.gamePadConnected(2);
      }, onDisconnect: () => {
        console.log("Gamepad 2 disconnected")
        this.gamePadDisconnected(2);
      }, onUp: () => {
        console.log("Gamepad 2 up")
        this.gamePadChosen(2);
      } });

      this.gamePadDisconnected(2);
    } else {
      this.gamePadConnected(2);
    }

    


  }

  gamePadChosen(num) {

    if (this.p1ControlSelection === null && this.p2ControlSelection !== ('pad' + num)) {
      this.p1ControlSelection = 'pad' + num;
    } else if (this.p2ControlSelection === null && this.p1ControlSelection !== ('pad' + num)) {
      this.p2ControlSelection = 'pad' + num;
    }

    this.updateControlsTexts();    
    
  }

  gamePadConnected(num) {}

  gamePadDisconnected(num) {

    if (this.p1ControlSelection === ('pad' + num)) {
      this.p1ControlSelection = null;
    }

    if (this.p2ControlSelection === ('pad' + num)) {
      this.p2ControlSelection = null;
    }

    this.updateControlsTexts();


    /*
    if (num === 1) {
      this.p1HasPad = false;
      this.p1ControlsInfoText.setText('P1 Controls: Keyboard');
    } else {
      this.p2HasPad = false;
      this.p2ControlsInfoText.setText('P2 Controls: Keyboard');

    }
    */
  }

  updateControlsTexts() {

    if (this.p1ControlSelection === 'pad1') {
      var p1Text = 'P1 Controls: Gamepad #1 ';
    } else if (this.p1ControlSelection === 'pad2') {
      var p1Text = 'P1 Controls: Gamepad #2 ';
    } else if (this.p1ControlSelection === 'arrows') {
      var p1Text = 'P1 Controls: Keyboard (Arrows) ';
    } else if (this.p1ControlSelection === 'wasd') {
      var p1Text = 'P1 Controls: Keyboard (WASD) ';
    } else {
      var p1Text = 'P1 Controls: --- ';
    }

    if (this.p2ControlSelection === 'pad1') {
      var p2Text = 'P2 Controls: Gamepad #1 ';
    } else if (this.p2ControlSelection === 'pad2') {
      var p2Text = 'P2 Controls: Gamepad #2 ';
    } else if (this.p2ControlSelection === 'arrows') {
      var p2Text = 'P2 Controls: Keyboard (Arrows) ';
    } else if (this.p2ControlSelection === 'wasd') {
      var p2Text = 'P2 Controls: Keyboard (WASD) ';
    } else {
      var p2Text = 'P2 Controls: --- ';
    }

    this.p1ControlsInfoText.setText(p1Text);
    this.p2ControlsInfoText.setText(p2Text);

    console.warn({
      p1: this.p1ControlSelection,
      p2: this.p2ControlSelection
    });

  }

  buildMenu() {

    this.editorButton = this.add.text(this.world.centerX, this.game.height / 2 - 40, 'Editor ', {
      font: '70px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    this.editorButton.anchor.x = 0.5;

    this.editorButton.inputEnabled = true;
    this.editorButton.events.onInputDown.add(() => {
      console.log("Editor button clicked");
      
      if (this.p1ControlSelection === null || this.p2ControlSelection === null) {
        alert('Error: at least one of the players has controls missing');
        return false;
      }

      this.state.start('LevelEditor', true, false, null, {
        p1: this.p1ControlSelection,
        p2: this.p2ControlSelection
      })
    }, this);    


    this.gameButton = this.add.text(this.world.centerX, this.game.height / 2 + 40, 'Start Game ', {
      font: '70px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    this.gameButton.anchor.x = 0.5;

    this.gameButton.inputEnabled = true;
    this.gameButton.events.onInputDown.add(() => {
      console.log("Game button clicked");

      if (this.p1ControlSelection === null || this.p2ControlSelection === null) {
        alert('Error: at least one of the players has controls missing');
        return false;
      }
      this.state.start('Game', true, false, {
        p1: this.p1ControlSelection,
        p2: this.p2ControlSelection
      })
    }, this); 

    // Player 1 controls info
    this.p1ControlsInfoText = this.add.text(this.world.centerX, this.game.height / 2 + 250, 'P1 Controls: --- ', {
      font: '30px Bangers',
      fill: '#77BFCC',
      smoothed: false
    })

    this.p1ControlsInfoText.anchor.x = 0.5;

    // Player 2 controls info
    this.p2ControlsInfoText = this.add.text(this.world.centerX, this.game.height / 2 + 290, 'P2 Controls: --- ', {
      font: '30px Bangers',
      fill: '#77BFCC',
      smoothed: false
    })

    this.p2ControlsInfoText.anchor.x = 0.5;    

    this.updateControlsTexts();         

  }
}
