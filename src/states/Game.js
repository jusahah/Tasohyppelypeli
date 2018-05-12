/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'

export default class extends Phaser.State {
  init() { }
  preload() { }

  create() {
    // Cursors & movement control
    this.cursor = game.input.keyboard.createCursorKeys();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add the physics engine to all game objects (body is added)
    game.world.enableBody = true;

    const bannerText = 'Tasohyppelypeli'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText, {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    banner.padding.set(10, 16)
    banner.anchor.setTo(0.5)
    
    this.mushroom = new Mushroom({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'mushroom'
    })

    console.log(this.mushroom);


    this.game.add.existing(this.mushroom)
    
    this.mushroom.body.gravity.y = 200;
    game.world.setBounds(0, 0, 1920, 700);
    game.camera.follow(this.mushroom);

    this.walls = game.add.group();

    // Design the level. x = wall, o = coin, ! = lava.
    var level = [
        'xxxxxxxxxxxxxxxxxxxxxx',
        'x         !          x',        
        'x         !          x',
        'x                 o  x',
        'x         o          x',
        'x            x       x',
        'x     x     x  x     x',       
        'x         x          x',
        'x        x           x',
        'x     o   !    x     x',
        'xxxxxxxxxxxxxxxxxxxxxx',
    ]; 

    for (var i = 0; i < level.length; i++) {
        for (var j = 0; j < level[i].length; j++) {

            // Create a wall and add it to the 'walls' group
            if (level[i][j] == 'x') {
                var wall = game.add.sprite(0+60*j, 0+60*i, 'wall');
                //console.log(wall);
                this.walls.add(wall);
                wall.body.immovable = true; 
            }
        }
    }

  }

  render() {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.mushroom, 32, 32)
    }
  }

  update() {

    // Ensure player does not fall through walls/ground.
    game.physics.arcade.collide(this.mushroom, this.walls);

    // Whole game here
    // Move the player when an arrow key is pressed
    if (this.cursor.left.isDown) 
        this.mushroom.body.velocity.x = -200;
    else if (this.cursor.right.isDown) 
        this.mushroom.body.velocity.x = 200;
    else 
        this.mushroom.body.velocity.x = 0;

    // Make the mushroom jump if he is touching the ground
    if (this.cursor.up.isDown && this.mushroom.body.touching.down) 
        this.mushroom.body.velocity.y = -250;


  }
}
