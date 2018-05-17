/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Slime from '../sprites/enemies/Slime'

var ticks = 0;

export default class extends Phaser.State {
  init(level) {

    this.completedLevel = false;
    this.levelMap = level.map;


  }
  preload() { 


  }

  create() {


    console.log("Level created");


    // To listen to buttons from a specific pad listen directly on that pad game.input.gamepad.padX, where X = pad 1-4
    this.pad1 = game.input.gamepad.pad1;


    console.log(this.pad1);
    console.log("UP BUTTON")
    console.log(this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_UP));

    this.p2Controls = {
      /*
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D),
      */
      up: this.pad1.getButton(Phaser.Gamepad.XBOX360_A),
      down: this.pad1.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER),
      left: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
      right: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
    };

    /*
    this.pad1.addCallbacks(this, { onConnect: () => {
      
      console.warn("PAD CONNECTED");
      console.log("Up button")
      console.log(this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_UP));

      // p2 keys
      this.p2Controls = {
        
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        
        up: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_UP),
        down: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN),
        left: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
        right: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
      };
      
    } });
    */

    // Cursors & movement control

    // p1 keys
    this.p1Controls = game.input.keyboard.createCursorKeys();
    this.p1Controls.down = game.input.keyboard.addKey(Phaser.Keyboard.P);




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
    this.keys = game.add.group();
    this.doors = game.add.group();
    this.walls = game.add.group();
    this.coins = game.add.group();
    this.enemies = game.add.group();

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

    ////////////////////////////////////////
    // Bullets group
    // Create the group using the group factory
    this.bullets = game.add.group();
    // To move the sprites later on, we have to enable the body
    this.bullets.enableBody = true;
    // We're going to set the body type to the ARCADE physics, since we don't need any advanced physics
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    /*
   
      This will create 20 sprites and add it to the stage. They're inactive and invisible, but they're there for later use.
      We only have 20 laser this.bullets available, and will 'clean' and reset they're off the screen.
      This way we save on precious resources by not constantly adding & removing new sprites to the stage
   
    */
    this.bullets.createMultiple(30, 'objects');
    this.bullets.setAll('frame', 20);
   
    /*
   
      Behind the scenes, this will call the following function on all this.bullets:
        - events.onOutOfBounds.add(resetLaser)
      Every sprite has an 'events' property, where you can add callbacks to specific events.
      Instead of looping over every sprite in the group manually, this function will do it for us.
   
    */
    // Same as above, set the anchor of every sprite to 0.5, 1.0
    this.bullets.callAll('anchor.setTo', 'anchor', 0.5, 1.0);

    this.bullets.setAll('width', 8);
    this.bullets.setAll('height', 8);

    // COMMENTED OUT AS OPTIMIZATION (Bullets should never leave world)
    //this.bullets.setAll('outOfBoundsKill', true);
    // This will set 'checkWorldBounds' to true on all sprites in the group
    //this.bullets.setAll('checkWorldBounds', true);

    ////////////////////////////////////////

    banner.padding.set(10, 16)
    banner.anchor.setTo(0.5)

    var level = this.levelMap;

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

            } else if (level[i][j] === 'k') {

                var key = game.add.sprite(0+30*j, 0+30*i, 'objects', 73);
                key.width = 30;
                key.height = 30;
                key.th_door = 'golden';
                this.keys.add(key);
                key.body.immovable = true;

                             

            } else if (level[i][j] === 'D') {

                var levelDoor = game.add.sprite(0+30*j, 0+30*i, 'misc', 25);
                levelDoor.width = 30;
                levelDoor.height = 30;
                levelDoor.th_door = 'golden';
                levelDoor.th_passlevel = true;
                this.walls.add(levelDoor);
                levelDoor.body.immovable = true;

                             

            } else if (level[i][j] === 's') {

                var slime = new Slime({
                  game: this.game,
                  playerNum: 2,
                  x: 0+30*j,
                  y: 0+30*i,
                  asset: 'slimes',
                  wallsGroup: this.walls,
                  players: [this.p1, this.p2],
                  bulletsGroup: this.bullets
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

            } else if (level[i][j] === '1' || level[i][j] === '2') {

                var p = level[i][j] === '1' ? this.p1 : this.p2;

                p.setSpawnPosition(0+30*j, 0+30*i);
                
                p.x = 0+30*j;
                p.y = 0+30*i;

                             

            } 
        }
    }

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

  completeLevel() {
    console.log("Level completed!");
    if (!this.completedLevel) {
      this.completedLevel = true;
      this.state.start('Game', true, false);
    }

  }

  updatePlayer(player, playerControls) {
    // Check if player arrived to level completion area
    if (player.body.x > 1168) {
      player.completeLevel();
      player.kill();

      if (this.p1.hasCompletedLevel() && this.p2.hasCompletedLevel()) {
        this.completeLevel();
      }

      // TODO: Do animation that walks player out of screen
      return;
    }

    // Ensure player does not fall through walls/ground.
    if (player.playerAlive) {
      game.physics.arcade.collide(player, this.walls, wallCollisionOccurred);
    } 

    //////////////////////
    ///// player movement ////
    //////////////////////

    if (player.playerAlive) {

      // Move the player 1 when an arrow key is pressed
      if (playerControls.left.isDown) {
          player.direction = -1;
          player.animations.play('walk_left', 15, true);
          player.body.velocity.x = -130;
      } else if (playerControls.right.isDown) {
          player.direction = 1;
          player.animations.play('walk_right', 15, true);
          player.body.velocity.x = 130;
      } else {
          player.animations.stop(null, true);
          //player.frame = player.getDefaultFrame();
          player.body.velocity.x = 0;
      } 

      // Detect shooting
      if (playerControls.down.isDown && player.allowedToShoot()) {

        // Firing logic
        var bullet = this.bullets.getFirstExists(false);
        if (bullet) {
          // If we have a bullet, set it to the starting position
          bullet.reset(player.x + (18*player.direction), player.y+2);
          // Give it a velocity of -500 so it starts shooting
          bullet.body.velocity.x = player.direction * 500;

          player.shotFired();
        }


      }

      // Make the mushroom jump if he is touching the ground
      if (playerControls.up.isDown && player.body.touching.down) {
          player.body.velocity.y = -360;
      }

      
    }

  }    

  update() {

    ++ticks;

    // Collision between bullet and wall
    game.physics.arcade.overlap(
      this.bullets, 
      this.walls, 
      (bullet, _wall) => {
        bullet.kill();
      }, 
      null, 
      this
    );

    // Collision between bullet and enemy
    game.physics.arcade.overlap(
      this.bullets, 
      this.enemies, 
      (bullet, enemy) => {
        bullet.kill();
        enemy.kill();
      }, 
      null, 
      this
    );


    // Collision between bullet and player
    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.bullets, 
      (player, bullet) => {

        bullet.kill();
        if (player.playerAlive) {
          player.youWereKilled();
        }
        
      }, 
      null, 
      this
    );

    // Collision between players
    game.physics.arcade.collide(this.p1, this.p2);
    // Enemies <-> walls
    game.physics.arcade.collide(this.enemies, this.walls);

    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.coins, 
      coinWasCollected, 
      null, 
      this
    );

    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.keys, 
      keyWasCollected, 
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

    this.updatePlayer(this.p1, this.p1Controls);
    this.updatePlayer(this.p2, this.p2Controls);  

  }


}

function wallCollisionOccurred(player, wall) {
  // NOTE: Wall can also be door!

  if (ticks % 10 === 0 && wall.hasOwnProperty('th_door')) {
    console.log("Check key against door with player " + player.playerNum);
    var door = wall;
    var keyNeeded = door.th_door;

    if (player.useKey(keyNeeded)) {
      door.kill();
    }
  }
}

function coinWasCollected(player, coin) {

  if (player.playerAlive) {
    coin.kill();
  }

}

function keyWasCollected(player, key) {

  if (player.playerAlive) {
    var keyColor = key.th_door;

    player.keyCollected(keyColor);

    key.kill();
  }

}

function playerTouchedEnemy(player, enemy) {
  console.log("Player " + player.playerNum);

  if (player.playerAlive) {
    player.youWereKilled();
  }
  //enemy.kill();
}
