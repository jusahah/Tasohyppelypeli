/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Slime from '../sprites/enemies/Slime'

export default class extends Phaser.State {
  init() { }
  preload() { }

  create() {
    // Cursors & movement control

    // p1 keys
    this.p1Controls = game.input.keyboard.createCursorKeys();

    // p2 keys
    this.p2Controls = {
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    };

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add the physics engine to all game objects (body is added)
    game.world.enableBody = true;

    const bannerText = 'Tasohyppelypeli'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText, {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    //this.bg = game.add.group();
    this.walls = game.add.group();
    this.coins = game.add.group();
    this.enemies = game.add.group();

    banner.padding.set(10, 16)
    banner.anchor.setTo(0.5)

    // Design the level. x = wall, o = coin, ! = lava.
    var level = [
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'x                                  x',        
        'x   c                c   s       c x',        
        'x                                c x',        
        'x                 x      x       c x',        
        'x s   x                           cx',        
        'x         s                        x',        
        'x        xxx     x                 x',        
        'x  x             x           x x   x',        
        'x                                  x',        
        'xxxxxxxxx      c     x    c        x',        
        'x          x xxx               x   x',        
        'x                        x    x    x',        
        'x              xxx           x     x',        
        'x    c                             x',        
        'x                    x             x',        
        'x   x  x         x                 x',        
        'x   x  s   x xx       xx x x       x',        
        'x   xx                   c   c     x',        
        'x                                  x',        
        'x     xxxxx  x x                   x',        
        'x                  x               x',
        'x                               c  x',
        'x                       x          x',
        'x                          x       x',
        'x       x        x  x  c  x  x     x',       
        'x   c                              x',
        'x       x    x   s                 x',
        'x                            x     x',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    ]; 

    for (var i = 0; i < level.length; i++) {
        for (var j = 0; j < level[i].length; j++) {

            // Create a wall and add it to the 'walls' group
            if (level[i][j] == 'x') {
                var wall = game.add.sprite(0+30*j, 0+30*i, 'misc', 14);
                wall.width = 30;
                wall.height = 30;
                //console.log(wall);
                this.walls.add(wall);
                wall.body.immovable = true; 
            } else if (level[i][j] === 'c') {

                var coin = game.add.sprite(0+30*j, 0+30*i, 'misc', 18);
                coin.width = 30;
                coin.height = 30;
                this.coins.add(coin);
                coin.body.immovable = true;

                // TODO: Is it ok to really create own anim to EACH sprite??
                coin.animations.add(
                  'spin',
                  [18,19,20,21,22,23]
                );

                coin.play('spin', 8, true);                

            } else if (level[i][j] === 's') {

                var slime = new Slime({
                  game: this.game,
                  playerNum: 2,
                  x: 0+30*j,
                  y: 0+30*i,
                  asset: 'slimes',
                  wallsGroup: this.walls
                })

                this.game.add.existing(slime);

                //////////////////////////
                // slime walk animation //
                //////////////////////////
                slime.setDefaultFrame(60);
                slime.animations.add(
                  'slime_walk_right', 
                  [60,61,62,63],
                  10,
                  false
                );

                slime.animations.play('slime_walk_right', true, true);

                slime.body.gravity.y = 500;
                slime.body.collideWorldBounds = true;

                this.enemies.add(slime);            

            }
        }
    }
    
    this.p1 = new Mushroom({
      game: this.game,
      playerNum: 1,
      x: 1000 - 50,
      y: 900 - 50,
      asset: 'players'
    })

    this.p2 = new Mushroom({
      game: this.game,
      playerNum: 2,
      x: 50,
      y: 850,
      asset: 'players'
    })

    this.enemy1 = new Slime({
      game: this.game,
      playerNum: 2,
      x: 250,
      y: 550,
      asset: 'slimes',
      wallsGroup: this.walls
    })

    console.log(this.p1);


    this.game.add.existing(this.p1)
    this.game.add.existing(this.p2)

    ////////////////////////
    // p1 walk animations //
    ////////////////////////
    this.p1.setDefaultFrame(1);
    this.p1.animations.add(
      'walk_right', 
      [24,25,26],
      15,
      false
    );


    //this.p1.animations.play('walk_left', 15, true);    

    this.p1.animations.add(
      'walk_left', 
      [36,37,38],
      15,
      false
    );

    ////////////////////////
    // p2 walk animations //
    ////////////////////////
    var walkRightFirstFrame = 10*12+6;
    this.p2.setDefaultFrame(8*12+7);

    this.p2.animations.add(
      'walk_right', 
      [walkRightFirstFrame,walkRightFirstFrame+1,walkRightFirstFrame+2],
      15,
      false
    );

    //this.p1.animations.play('walk_left', 15, true);    

    var walkLeftFirstFrame = 11*12+6;
    this.p2.animations.add(
      'walk_left', 
      [walkLeftFirstFrame,walkLeftFirstFrame+1,walkLeftFirstFrame+2],
      15,
      false
    );

    //this.p1.animations.play('walk_right', 15, true); 

    this.p1.body.gravity.y = 500;
    this.p2.body.gravity.y = 500;

    this.p1.body.collideWorldBounds = true;
    this.p2.body.collideWorldBounds = true;

    // Remember to change here when changing screen dimensions
    // in config.js
    game.world.setBounds(0, 0, 1200, 1200 * (3/4));
    //game.camera.follow(this.p1);


  }

  render() {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.p1, 32, 32)
    }
  }

  update() {

    // Ensure player does not fall through walls/ground.
    if (this.p1.playerAlive) {
      game.physics.arcade.collide(this.p1, this.walls);
    } 

    if (this.p2.playerAlive) {
      game.physics.arcade.collide(this.p2, this.walls);
      
    }

    game.physics.arcade.collide(this.p2, this.p1);
    
    game.physics.arcade.collide(this.enemies, this.walls);


    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.coins, 
      coinWasCollected, 
      null, 
      this
    );
    // Check collision between slimes and players
    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.enemies, 
      playerTouchedEnemy, 
      null, 
      this
    );

    // Whole game here

    //////////////////////
    ///// P1 movement ////
    //////////////////////

    if (this.p1.playerAlive) {

      // Move the player 1 when an arrow key is pressed
      if (this.p1Controls.left.isDown) {
          this.p1.animations.play('walk_left', 15, true);
          this.p1.body.velocity.x = -130;
      } else if (this.p1Controls.right.isDown) {
          this.p1.animations.play('walk_right', 15, true);
          this.p1.body.velocity.x = 130;
      } else {
          this.p1.animations.stop(null, true);
          this.p1.frame = this.p1.getDefaultFrame();
          this.p1.body.velocity.x = 0;
      } 

      // Make the mushroom jump if he is touching the ground
      if (this.p1Controls.up.isDown && this.p1.body.touching.down) {
          this.p1.body.velocity.y = -360;
      }

      
    }

    //////////////////////
    ///// P2 movement ////
    //////////////////////
    if (this.p2.playerAlive) {

      // Move the player 1 when an arrow key is pressed
      if (this.p2Controls.left.isDown) {
          this.p2.animations.play('walk_left', 15, true);
          this.p2.body.velocity.x = -130;
      } else if (this.p2Controls.right.isDown) {
          this.p2.animations.play('walk_right', 15, true);
          this.p2.body.velocity.x = 130;
      } else {
          this.p2.animations.stop(null, true);
          this.p2.frame = this.p2.getDefaultFrame();
          this.p2.body.velocity.x = 0;
      } 

      // Make the mushroom jump if he is touching the ground
      if (this.p2Controls.up.isDown && this.p2.body.touching.down) {
          this.p2.body.velocity.y = -360;
      }

    }

  }



}

function coinWasCollected(player, coin) {

  if (player.playerAlive) {
    coin.kill();
  }

}

function playerTouchedEnemy(player, enemy) {
  console.log("Player " + player.playerNum);

  if (player.playerAlive) {
    player.youWereKilled();
  }
  //enemy.kill();
}
