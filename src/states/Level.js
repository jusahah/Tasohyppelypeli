/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Slime from '../sprites/enemies/Slime'
import Beacon from '../sprites/enemies/Beacon'

import _ from 'lodash'

var ticks = 0;

var respawnTimeouts = {};

var oldPlayerControlSelections = null;

export default class extends Phaser.State {
  init(level, returnToLevelEditor, playerControlSelections) {

    if (!playerControlSelections && !oldPlayerControlSelections) {
      throw new Error('Level has no stashed control selections nor provided one');
    }

    this.playerControlSelections = playerControlSelections || oldPlayerControlSelections;

    if (playerControlSelections) {
      // Stash this to module scope so that its not reset when state ends.

      // This should only be set once (when Game is launched)
      oldPlayerControlSelections = playerControlSelections;
      
    }

    this.returnToLevelEditor = !!returnToLevelEditor;

    this.completedLevel = false;
    this.levelMap = level.map;

    // State vars while playing
    this.lastGravityChange = 0; // Tick number

    this.infoBars = {}; // Contains all sprites that live in info bar

  }
  preload() { 


  }

  createPlayerInfoBars() {

    function createInfoBar(player, xStart, direction) {

      // Health stuff 
      var healthSprites = [];

      var healthAmount = player.getHealth();

      _.times(healthAmount, (n) => {
        var healthSprite = game.add.sprite(n*24*direction+xStart, game.height - 50, 'misc', 66);
        healthSprite.width = 20;
        healthSprite.height = 20;
        healthSprite.anchor.setTo(0.5)

        healthSprites.push(healthSprite);
      });

      // Coin & points stuff

      var coinSprite = game.add.sprite(120*direction+xStart, game.height - 40, 'misc', 18);
      coinSprite.width = 40;
      coinSprite.height = 40;   
      coinSprite.anchor.setTo(0.5); 

      if (direction === 1) {
        var pointsText = ' x 0 ';
        // THIS IS GREAT! Remember to use anchoring elsewhere too!
        var xAnchor = 0;
      } else {
        var pointsText = ' 0 x ';
        var xAnchor = 1;
      }

      var pointSprite = game.add.text(146*direction+xStart, game.height - 70, pointsText, {
        font: '40px Bangers',
        fill: '#77BFA3',
        smoothed: false
      })

      pointSprite.anchor.x = xAnchor;

      return {
        health: healthSprites,
        points: {
          coin: coinSprite,
          text: pointSprite
        }
      };
 
    }



    this.infoBars[1] = createInfoBar(this.p1, 30, 1);
    this.infoBars[2] = createInfoBar(this.p2, game.width - 30, -1);

  }

  updatePlayerPointsInfo(player) {
    var pointsText = this.infoBars[player.playerNum].points.text;

    var points = player.getPoints();

    if (player.playerNum === 1) {
      pointsText.setText(' x ' + points + ' ');
      
    } else {
      pointsText.setText(' ' + points + ' x ');
    }
  }

  updatePlayerHealth(player) {

    // playerCode is 'p1' or 'p2'

    var healthSprites = this.infoBars[player.playerNum].health;
    var currentHealth = player.getHealth();

    _.each(healthSprites, (sprite) => {
      currentHealth--;

      if (currentHealth >= 0) {
        sprite.visible = true;
      } else {
        sprite.visible = false;
      }
    });


  }

  initPlayerControlsForTheLevel() {

    // To listen to buttons from a specific pad listen directly on that pad game.input.gamepad.padX, where X = pad 1-4
    this.pad1 = game.input.gamepad.pad1;
    this.pad2 = game.input.gamepad.pad2;
    console.warn("Initing player controls based on knowledge:")
    console.warn(this.playerControlSelections);

    //// PLAYER 1 Controls ///////

    if (this.playerControlSelections.p1 === 'pad1') {
      this.p1Controls = {
        up: this.pad1.getButton(Phaser.Gamepad.XBOX360_A),
        down: this.pad1.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER),
        left: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
        right: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
      };      
    } else if (this.playerControlSelections.p1 === 'pad2') {
      this.p1Controls = {
        up: this.pad2.getButton(Phaser.Gamepad.XBOX360_A),
        down: this.pad2.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER),
        left: this.pad2.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
        right: this.pad2.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
      };      
    } else if (this.playerControlSelections.p1 === 'arrows') {
      // p1 keys
      this.p1Controls = game.input.keyboard.createCursorKeys();
      this.p1Controls.down = game.input.keyboard.addKey(Phaser.Keyboard.P);        
    } else if (this.playerControlSelections.p1 === 'wasd') {
      // p1 keys
      this.p1Controls = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.T),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
      };        
    }

    //// PLAYER 2 Controls ///////

    if (this.playerControlSelections.p2 === 'pad1') {
      this.p2Controls = {
        up: this.pad1.getButton(Phaser.Gamepad.XBOX360_A),
        down: this.pad1.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER),
        left: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
        right: this.pad1.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
      };      
    } else if (this.playerControlSelections.p2 === 'pad2') {
      this.p2Controls = {
        up: this.pad2.getButton(Phaser.Gamepad.XBOX360_A),
        down: this.pad2.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER),
        left: this.pad2.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT),
        right: this.pad2.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT),
      };      
    } else if (this.playerControlSelections.p2 === 'arrows') {
      // p1 keys
      this.p2Controls = game.input.keyboard.createCursorKeys();
      this.p2Controls.down = game.input.keyboard.addKey(Phaser.Keyboard.P);        
    } else if (this.playerControlSelections.p2 === 'wasd') {
      // p1 keys
      this.p2Controls = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.T),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
      };        
    }

  
  }

  create() {

    if (this.returnToLevelEditor) {
      // Add button that exits testing the level and goes back to editor.
      this.backToEditorButton = this.add.text(460, 910, 'Back to editor ', {
        font: '40px Bangers',
        fill: '#77BFA3',
        smoothed: false
      })

      this.backToEditorButton.inputEnabled = true;
      this.backToEditorButton.events.onInputDown.add(() => {
        console.log("Back to editor clicked");
        this.state.start('LevelEditor', true, false, _.clone(this.levelMap));
      }, this);
    }

    console.log("Level created");

    this.initPlayerControlsForTheLevel();




    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add the physics engine to all game objects (body is added)
    game.world.enableBody = true;

    if (!this.returnToLevelEditor) {
      const bannerText = 'Tasohyppelypeli '
      let banner = this.add.text(this.world.centerX, this.game.height - 60, bannerText, {
        font: '40px Bangers',
        fill: '#77BFA3',
        smoothed: false
      })

      banner.padding.set(10, 16)
      banner.anchor.setTo(0.5)
      
    }


    //this.bg = game.add.group();
    this.keys = game.add.group();
    this.doors = game.add.group();
    this.walls = game.add.group();
    this.coins = game.add.group();
    this.enemies = game.add.group();
    this.lavas = game.add.group();

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

    // Create info bars for players (must be done after player creation!)
    this.createPlayerInfoBars();

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

    var level = this.levelMap;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            // Create a wall and add it to the 'walls' group
            if (level[i][j] == 'X' || level[i][j] == 'x') {
                var wall = game.add.sprite(0+30*j, 0+30*i, 'misc', 14);
                wall.width = 30;
                wall.height = 30;
                //console.log(wall);
                this.walls.add(wall);
                wall.body.immovable = true; 
            } else if (level[i][j] === 'm') {

                var lava = game.add.sprite(0+30*j, 0+30*i+10, 'misc', 64);
                lava.width = 30;
                lava.height = 20;
                this.lavas.add(lava);
                lava.body.immovable = true;               

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


            } else if (level[i][j] === 'A') {

                var antiGravityButton = game.add.sprite(0+30*j, 0+30*i, 'misc', 135);
                antiGravityButton.width = 30;
                antiGravityButton.height = 30;
                antiGravityButton.th_letter = 'A';
                this.walls.add(antiGravityButton);
                antiGravityButton.body.immovable = true;
                             

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

            } else if (level[i][j] === 'b') {

                var beacon = new Beacon({
                  game: this.game,
                  x: 0+30*j,
                  y: 0+30*i,
                  asset: 'objects',
                  wallsGroup: this.walls,
                  players: [this.p1, this.p2],
                  bulletsGroup: this.bullets
                })

                this.game.add.existing(beacon);

                //////////////////////////
                // beacon walk animation //
                //////////////////////////
                beacon.setDefaultFrame(6);
                
                /*
                beacon.animations.add(
                  'slime_walk_right', 
                  [60,61,62,63],
                  10,
                  false
                );

                beacon.animations.play('slime_walk_right', true, true);
                */

                beacon.body.gravity.y = -100;
                beacon.body.collideWorldBounds = true;

                this.enemies.add(beacon);            

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

    

    this.p1.body.collideWorldBounds = true;
    this.p2.body.collideWorldBounds = true;

    this.p1.setGravity();
    this.p2.setGravity();

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

      if (this.returnToLevelEditor) {
        // We switch to level editor, not to next level!!
        this.state.start('LevelEditor', true, false, _.clone(this.levelMap));
      } else {
        this.state.start('Game', true, false);
      }
    }

  }

  tileBelow(player) {

    var tileX = Math.floor((player.x+1) / 30);
    var tileY = Math.floor(player.y / 30);


    var map = this.levelMap;

    if (player.isInverted()) {
      var letter = map[tileY-1][tileX];
    } else {
      var letter = map[tileY+1][tileX];
    }

    return letter !== ' ';
  }

  updatePlayer(player, playerControls) {

    if (!player.playerAlive) {
      return;
    }

    // Check if player arrived to level completion area
    if (player.body.x < 10 || player.body.x > 1168 || player.body.y < 10 || player.body.y > 865) {
      player.completeLevel();
      player.kill();

      if (this.p1.hasCompletedLevel() && this.p2.hasCompletedLevel()) {
        this.completeLevel();
      }

      // TODO: Do animation that walks player out of screen
      return;
    }



    //////////////////////
    ///// player movement ////
    //////////////////////

    if (player.playerAlive) {
      // Ensure player does not fall through walls/ground.
      game.physics.arcade.collide(player, this.walls, wallCollisionOccurred.bind(this));

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
      if (playerControls.up.isDown) {

          if (player.isInverted() && player.body.touching.up) {
            if (player.x < 48 || player.x > (1200-47)) {
              if (this.tileBelow(player)) {
                player.jumpIfPossible(ticks);
                
              }
            } else {
              player.jumpIfPossible(ticks);
            }
          } else if (player.body.touching.down) {            
            if (player.x < 48 || player.x > (1200-47)) {
              if (this.tileBelow(player)) {
                player.jumpIfPossible(ticks);
                
              }
            } else {
              player.jumpIfPossible(ticks);
            }
          }
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
      playerWasShot.bind(this), 
      null, 
      this
    );

    // Collision between players
    game.physics.arcade.collide(this.p1, this.p2);
    // Enemies <-> walls
    game.physics.arcade.collide(this.enemies, this.walls);
    game.physics.arcade.collide(this.enemies, this.lavas, (enemy, lava) => {
      enemy.kill();
    });

    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.lavas, 
      playerFellToLava.bind(this), 
      null, 
      this
    );

    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.coins, 
      coinWasCollected.bind(this), 
      null, 
      this
    );

    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.keys, 
      keyWasCollected.bind(this), 
      null, 
      this
    );

    // Check collision between slimes and players
    game.physics.arcade.overlap(
      [this.p1, this.p2], 
      this.enemies, 
      playerTouchedEnemy.bind(this), 
      null, 
      this
    );

    this.updatePlayer(this.p1, this.p1Controls);
    this.updatePlayer(this.p2, this.p2Controls);  

  }

  shutdown() {
    // Called just before this state dies.

    // Release timeout handlers that are still waiting their turn!
    this.p1.releaseTimeouts();
    this.p2.releaseTimeouts();

    // Release local timeouts regarding players 
    if (respawnTimeouts[1]) {
      clearTimeout(respawnTimeouts[1]);
    }

    if (respawnTimeouts[2]) {
      clearTimeout(respawnTimeouts[2]);
    }

    respawnTimeouts = {};
  }


}

function playerWasShot(player, bullet) {

  bullet.kill();
  if (player.playerAlive) {

    // Substract one health from player
    player.loseHealth();
    this.updatePlayerHealth(player);

    if (player.getHealth() <= 0) {
      player.youWereKilled();
      scheduleRespawnForPlayer.call(this, player);
    }
  }
  
}

function playerFellToLava(player, lava) {
  if (player.playerAlive) {
    console.log("Player killed by lava");
    player.youWereKilled();
    this.updatePlayerHealth(player);
    scheduleRespawnForPlayer.call(this, player);
  }  
}

function wallCollisionOccurred(player, wall) {
  // NOTE: Wall can also be door!
  if (ticks % 2 !== 0) {
    return false;
  }
  // TODO: How to do this properly when door is on ceiling
  if (wall.hasOwnProperty('th_door')) {
    var door = wall;
    var keyNeeded = door.th_door;

    if (player.useKey(keyNeeded)) {
      door.kill();
    } 
  } else if (wall.th_letter === 'A') {
      if (ticks - this.lastGravityChange > 60) {
        this.lastGravityChange = ticks;
        this.p1.invertGravity();
        this.p2.invertGravity();
        
      }
      
  }
}

function coinWasCollected(player, coin) {

  if (player.playerAlive) {
    player.addPoint();
    this.updatePlayerPointsInfo(player);
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

  if (player.playerAlive) {
    player.youWereKilled();
    this.updatePlayerHealth(player);
    scheduleRespawnForPlayer.call(this, player);
  }
  //enemy.kill();
}

function scheduleRespawnForPlayer(player) {
  respawnTimeouts[player.playerNum] = setTimeout(() => {
    player.respawn();
    this.updatePlayerHealth(player);
  }, 3000);
}
