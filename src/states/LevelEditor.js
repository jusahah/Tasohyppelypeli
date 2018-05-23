/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Slime from '../sprites/enemies/Slime'

import _ from 'lodash'

var ticks = 0;

export default class extends Phaser.State {
  init(levelMap) {
    console.log("LevelEditor init");
    console.log(levelMap);
    // Contains sprite objects that are active (in use)
    // under string key 'x,y'
    this.activeSprites = {};

    this.levelDoorTile = null;

    // This is template of the level that will
    // be built upon when editing level
    this.map = levelMap || [
          'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',        
          'X                                      X',
          'X                                      X',
          'X                                      X',
          'X                                      X',
          'X                                      X',       
          'X                                      X',
          'X         1                2           X',
          'X                                      X',
          'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    ]; 


    this.spriteMap = [];

    // Initialize this.spriteMap to contain only NULLs
    for (var i = 0; i < this.map.length; i++) {
        
        var row = [];

        this.spriteMap.push(row);

        for (var j = 0; j < this.map[i].length; j++) {
          row.push(null);
          
        }
    }
  }

  preload() { 


  }

  // this should be called whenever this.map is changed!!!!!
  matchSpritesToData() {

    var levelMap = this.map;
    var spriteMap = this.spriteMap;

    for (var i = 0; i < levelMap.length; i++) {

        for (var j = 0; j < levelMap[i].length; j++) {

            var letter = levelMap[i][j];
            var sprite = spriteMap[i][j];

            if (sprite) {

              if (letter === sprite.th_letter) {
                // Matching sprite found, nothing to do.
              } else {
                // We have sprite, but letter is NOT same as sprite.th_letter!

                if (letter === ' ') {
                  // If this is special sprite that is singular,
                  // we do not want to destroy it.
                  if (sprite.th_letter !== '1' && sprite.th_letter !== '2' && sprite.th_letter !== 'D' && sprite.th_letter !== 'A') {
                    
                    // Not a special sprite, can destroy safely.
                    sprite.kill();
                    
                  }

                  spriteMap[i][j] = null; // Set sprite map tile/position to null
                } else {
                  if (sprite.th_letter !== '1' && sprite.th_letter !== '2' && sprite.th_letter !== 'D') {
                    
                    // Not a special sprite, can destroy safely.
                    sprite.kill();
                    
                  }

                  
                  var newSprite = this.createOrFindSpriteForLetter(letter);
                  if (letter === 'm') {
                    // Lava is not full tile height
                    newSprite.reset(j*30, i*30+10);
                  } else {
                    // If we have a sprite, set it to the starting position
                    newSprite.reset(j*30, i*30);
                    
                  }
                  spriteMap[i][j] = newSprite;
                }
              }
              
            } else {
              if (letter === ' ') {
                // Nothing to do, no sprite nor letter

              } else {

                var newSprite = this.createOrFindSpriteForLetter(letter);
                if (letter === 'm') {
                  // Lava is not full tile height
                  newSprite.reset(j*30, i*30+10);
                } else {
                  // If we have a sprite, set it to the starting position
                  newSprite.reset(j*30, i*30);
                  
                }                
                spriteMap[i][j] = newSprite;

              }
            }

          
        }
    }

  }

  createOrFindSpriteForLetter(letter) {
    if (letter === 'x') {
      console.log("Create block")
      var sprite = this.blocks.getFirstExists(false);

    } else if (letter === 'c') {
      console.log("Create coin")
      var sprite = this.coins.getFirstExists(false);

    } else if (letter === 'm') {
      console.log("Create coin")
      var sprite = this.lavas.getFirstExists(false);

    } else if (letter === 'k') {
      console.log("Create key")
      var sprite = this.keys.getFirstExists(false);

    } else if (letter === 's') {
      console.log("Create slime")
      var sprite = this.slimes.getFirstExists(false);

    } else if (letter === 'b') {
      console.log("Create beacon")
      var sprite = this.beacons.getFirstExists(false);

    } else if (letter === 'D') {
      console.log("Create level door")
      var sprite = this.levelDoor;
      sprite.revive();
    } else if (letter === 'X') {
      console.log("Create wall")
      var sprite = this.outerWalls.getFirstExists(false);
    } else if (letter === '1') {
      console.log("Return (no create) player 1")
      var sprite = this.p1;
    } else if (letter === '2') {
      console.log("Return (no create) player 2")
      var sprite = this.p2;
    } else if (letter === 'A') {
      var sprite = this.antiGravityButton;
      sprite.revive();  
    } else {
      throw new Error('Unknown letter - can not create sprite for ' + letter);
    }

    return sprite;



  }

  renderToolbar() {
    
    var y = 900 + 14;
    var x = 40;

    this.toolbar.forEach((toolbarIcon) => {
      toolbarIcon.y = y; // Same for all
      toolbarIcon.x = x;
      toolbarIcon.inputEnabled = true;

      // Install click listener that allows selecting this icon
      toolbarIcon.events.onInputDown.add(() => {
        console.log("Toolbar icon clicked: " + toolbarIcon.th_letter);
        this.selectedIcon = toolbarIcon.th_letter;
      }, this);


      x += this.iconSize + 6;
    });

    // Test and Finish texts
    this.testButton = this.add.text(1000, 910, 'Test ', {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    this.testButton.inputEnabled = true;
    this.testButton.events.onInputDown.add(() => {
      console.log("Test clicked");
      this.testLevelMap();
    }, this);


    this.finishButton = this.add.text(1080, 910, 'Finish ', {
      font: '40px Bangers',
      fill: '#77BFA3',
      smoothed: false
    })

    this.finishButton.inputEnabled = true;
    this.finishButton.events.onInputDown.add(() => {
      console.log("Finish clicked");
      this.finishLevelCreation();
    }, this);

  }

  finishLevelCreation() {

    var mapString = '[\n';

    _.each(this.map, function(row) {
      mapString += '"' + row + '",\n';
      
    });

    mapString += ']';

    var copypasteElement = document.getElementById('copypastelevel');

    console.log(copypasteElement);
    copypasteElement.style.display = 'block'
    copypasteElement.innerHTML = mapString

    var gameArea = document.getElementById('content');
    console.log(gameArea)
    gameArea.style.display = 'none';
  }

  testLevelMap() {
    // Launch Level state
    this.state.start('Level', true, false, {
      name: 'Test',
      map: _.clone(this.map)
    }, true);
  }

  getTileContent(tile) {
    var row = this.map[tile.yIndex];
    return row.charAt(tile.xIndex);
  }
  /*
  setTileContent(tile, letter) {

    console.log("Set tile content: " + letter);

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    var row = this.map[tile.yIndex];
    var currentLetter = row.charAt(tile.xIndex);

    if (currentLetter === 'X' || currentLetter === 'D') {
      // trying to replace outer wall
      if (letter !== 'D') {
        // This is illegal
        return false;
      } 

      // Legal; creating level door to outer wall

      // Delete old door and replace with outer wall
      this.deleteCurrentLevelDoorIfExists();

      // We have to re-fetch row because it might have been changed above
      row = this.map[tile.yIndex];

      // Create new door and delete current outer wall
      var updatedRow = setCharAt(row, tile.xIndex, 'D');
      this.map[tile.yIndex] = updatedRow;

      // Delete current outer wall sprite from door place
      this.deleteSpriteFromTile(tile);
      // Create door sprite there 
      this.createSpriteToTile(tile, 'D');
      // Set this so we can later find out easily where levelDoor is.
      this.levelDoorTile = Object.assign({}, tile);
      return false;
    }

    if (letter === 'D') {
      // Not possible, can only create to outer wall tile
      return false;
    }

    if (letter === '1' || letter === '2') {

      var playerLetter = letter;
      // We are repositioning player to new location

      var playerCurrentTile = this.findTileFor(letter);

      console.log(playerCurrentTile);

      // Delete players current position from this.map
      var playerOldRow = this.map[playerCurrentTile.yIndex];
      var updatedPlayerOldRow = setCharAt(
        playerOldRow, 
        playerCurrentTile.xIndex, 
        ' '
      );
      this.map[playerCurrentTile.yIndex] = updatedPlayerOldRow;

      // Set players new position to this.map
      row = this.map[tile.yIndex];
      var updatedRow = setCharAt(row, tile.xIndex, playerLetter);
      this.map[tile.yIndex] = updatedRow; 

      // Delete current contents of the tile player is being positioned into
      this.deleteSpriteFromTile(tile);

      // Place player to that tile
      this.placePlayerToTile(
        letter === '1' ? this.p1 : this.p2,
        tile.xIndex,
        tile.yIndex
      );

      console.log(this.map);

      return;
    }
    
    if (letter === currentLetter) {
      var newLetter = ' ';
    } else {
      var newLetter = letter;
    }

    // Update this.map
    var updatedRow = setCharAt(row, tile.xIndex, newLetter);
    this.map[tile.yIndex] = updatedRow; 

    // Update sprites to match this.map
    if (newLetter === ' ') {
      // Destruct the tile contents, but not create new sprite to tile
      this.deleteSpriteFromTile(tile);
    } else {
      if (currentLetter !== ' ') {
        // Tile is not empty, must delete old sprite first.
        this.deleteSpriteFromTile(tile);
      }
      // Create new sprite to tile
      this.createSpriteToTile(tile, newLetter);
    }

  }
  */
  /*
  deleteCurrentLevelDoorIfExists() {

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    if (this.levelDoorTile) {
      console.log("Clearing old levelDoorTile")
      // Update this.map from 'D' to 'X' on our old level door place.
      var row = this.map[this.levelDoorTile.yIndex];
      var updatedRow = setCharAt(row, this.levelDoorTile.xIndex, 'X');
      this.map[this.levelDoorTile.yIndex] = updatedRow; 

      // Delete door sprite
      this.deleteSpriteFromTile(this.levelDoorTile);

      // Create wall sprite to place where door sprite was deleted
      this.createSpriteToTile(this.levelDoorTile, 'X');

      this.levelDoorTile = null;  


    }

  }
  */

  /*
  deleteSpriteFromTile(tile) {
    // Fetch from active sprites object

    var sprite = this.activeSprites[tile.xIndex + ',' + tile.yIndex];

    if (sprite) {
      sprite.kill();
      this.activeSprites[tile.xIndex + ',' + tile.yIndex] = null;
    }
  }
  */

  /*
  createSpriteToTile(tile, letter) {

    if (letter === 'x') {
      console.log("Create block")
      var sprite = this.blocks.getFirstExists(false);

    } else if (letter === 'c') {
      console.log("Create coin")
      var sprite = this.coins.getFirstExists(false);

    } else if (letter === 'm') {
      console.log("Create coin")
      var sprite = this.lavas.getFirstExists(false);

    } else if (letter === 'k') {
      console.log("Create key")
      var sprite = this.keys.getFirstExists(false);

    } else if (letter === 's') {
      console.log("Create slime")
      var sprite = this.slimes.getFirstExists(false);

    } else if (letter === 'D') {
      console.log("Create level door")
      var sprite = this.levelDoors.getFirstExists(false);

    } else if (letter === 'X') {
      console.log("Create wall")
      var sprite = this.outerWalls.getFirstExists(false);
    } 

    if (sprite) {
      if (letter === 'm') {
        // Lava is not full tile height
        sprite.reset(tile.xIndex*30, tile.yIndex*30+10);
      } else {
        // If we have a sprite, set it to the starting position
        sprite.reset(tile.xIndex*30, tile.yIndex*30);
        
      }
      // Save to active sprites object
      this.activeSprites[tile.xIndex + ',' + tile.yIndex] = sprite;

    }    
  }
  */

  findTileFor(letter) {
    
    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] === letter) {

              return {
                xIndex: j,
                yIndex: i
              }
                              
            }            
        }
    }       
  }

  playerInTile(tile) {

    var p1Tile = this.findTileFor('1');
    var p2Tile = this.findTileFor('2');

    if (p1Tile.yIndex === tile.yIndex && p1Tile.xIndex === tile.xIndex) {
      console.log("Player 1 tile");
      return true;
    }

    if (p2Tile.yIndex === tile.yIndex && p2Tile.xIndex === tile.xIndex) {
      console.log("Player 2 tile");
      return true;
    }

    return false;
  }

  clickOccurred(x, y) {

    var tile = {
      xIndex: Math.floor(x / 30),
      yIndex: Math.floor(y / 30)
    };

    if (tile.yIndex > 29) {
      // Click occurred on toolbar
      return;
    }

    if (this.playerInTile(tile)) {
      // We do not want to do anything
      console.warn("Player clicked - clickOccurred aborts")
      return false;
    }

    // Click occurred on level area

    // Get current content of the clicked tile
    var content = this.getTileContent(tile);
    console.log(content);

    // OLD ALGORITHM
    //this.setTileContent(tile, this.selectedIcon);

    // NEW ALGORITHM
    this.editLevelMap(tile, this.selectedIcon);
  }

  deleteCurrentLevelDoorFromLevelMap() {

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] === 'D') {
              var letterRow = level[i];
              // Found level door, delete it by placing 'X' there.
              var updatedRow = setCharAt(letterRow, j, 'X');
              level[i] = updatedRow;
              return;
                              
            }            
        }
    }       
  }

  deleteCurrentAntiGravityButtonFromLevelMap() {

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] === 'A') {
              var letterRow = level[i];
              var updatedRow = setCharAt(letterRow, j, ' ');
              level[i] = updatedRow;
              return;
                              
            }            
        }
    }       
  }

  deleteCurrentPlayerFromLevelMap(letter) {

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] === letter) {
              var letterRow = level[i];
              // Found level door, delete it by placing 'X' there.
              var updatedRow = setCharAt(letterRow, j, ' ');
              level[i] = updatedRow;
              return;
                              
            }            
        }
    }       
  }

  editLevelMap(tile, letter) {

    // NOTE! We only need to edit level map (= letters)
    // System then automatically matches sprite map to match level map

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    // Edit level map (= map made of letters)
    var letterRow = this.map[tile.yIndex];

    var currentLetter = this.map[tile.yIndex][tile.xIndex];

    if (currentLetter === 'X' || currentLetter === 'D') {
      // trying to replace outer wall
      if (letter !== 'D') {
        // This is illegal
        return false;

      }
    } 

    if (letter === 'D') {

      if (currentLetter !== 'X') {
        // Not okay
        // Not possible, can only create to outer wall tile
        return false;


      } else {
        console.warn("Can place level door");
        // This is outer wall tile, all okay.

        this.deleteCurrentLevelDoorFromLevelMap();
        letterRow = this.map[tile.yIndex];
        var updatedRow = setCharAt(letterRow, tile.xIndex, 'D');
        this.map[tile.yIndex] = updatedRow;
        console.log(this.map);

      }
      
    } else if (letter === 'A') {
        console.warn("Can place anti gravity button");
        // This is outer wall tile, all okay.

        this.deleteCurrentAntiGravityButtonFromLevelMap();
        letterRow = this.map[tile.yIndex];
        var updatedRow = setCharAt(letterRow, tile.xIndex, 'A');
        this.map[tile.yIndex] = updatedRow;
        console.log(this.map);

      
    
    } else {
      // Letter is NOT level door

      if (letter === '1' || letter === '2') {
        this.deleteCurrentPlayerFromLevelMap(letter);
        letterRow = this.map[tile.yIndex];
        var updatedRow = setCharAt(letterRow, tile.xIndex, letter);
        this.map[tile.yIndex] = updatedRow;
        console.log(this.map);

        // We are repositioning player
      } else {

        // Letter is NOT D, 1 or 2.
        // Simply add new sprite.
        if (currentLetter === letter) {
          // We are deleting letter from this.map ( = insert space)
          var updatedRow = setCharAt(letterRow, tile.xIndex, ' ');
          
        } else {
          var updatedRow = setCharAt(letterRow, tile.xIndex, letter);
        }

        this.map[tile.yIndex] = updatedRow;
        
      }

    }   




    // Automatically match sprites map to level map
    this.matchSpritesToData();
  }
  /*
  placePlayerToTile(player, tileX, tileY) {
    console.log("Place player to " + tileX + ", " + tileY)
    player.x = 2+30*tileX; 
    player.y = 2+30*tileY; 
  }
  */
  /*
  preparePlayers() {

    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] == '1') {
                //this.placePlayerToTile(this.p1, j, i);
                this.p1.inputEnabled = true;
                this.p1.events.onInputDown.add(() => {
                  console.log("Player clicked: 1");
                  this.selectedIcon = '1';
                }, this);                
            } else if (level[i][j] == '2') {
                //this.placePlayerToTile(this.p2, j, i);
                this.p2.inputEnabled = true;
                this.p2.events.onInputDown.add(() => {
                  console.log("Player clicked: 2");
                  this.selectedIcon = '2';

                }, this);
            }            
        }
    }    
  }
  */

  create() {
    console.log("LevelEditor created");

    this.selectedIcon = 'x';
    
    ////////////////////////////////////////////////
    ////////// TOOLBAR CREATION ////////////////////
    ////////////////////////////////////////////////

    this.toolbar = []; // Contains all the toolbar icons

    this.iconSize = 50;


    var block = game.add.sprite(0, 0, 'misc', 14);
    block.width = this.iconSize;
    block.height = this.iconSize;
    block.th_letter = 'x';
    this.toolbar.push(block);

    var lava = game.add.sprite(0, 0, 'misc', 64);
    lava.width = this.iconSize;
    lava.height = this.iconSize;
    lava.th_letter = 'm';
    this.toolbar.push(lava); 

    var coin = game.add.sprite(0, 0, 'misc', 18);
    coin.width = this.iconSize;
    coin.height = this.iconSize;
    coin.th_letter = 'c';
    this.toolbar.push(coin); 

    var key = game.add.sprite(0, 0, 'objects', 73);
    key.width = this.iconSize;
    key.height = this.iconSize;
    key.th_letter = 'k';
    key.th_door = 'golden';
    this.toolbar.push(key); 

    var slime = game.add.sprite(0, 0, 'slimes', 60);
    slime.width = this.iconSize;
    slime.height = this.iconSize;
    slime.th_letter = 's';
    this.toolbar.push(slime); 

    var beacon = game.add.sprite(0, 0, 'objects', 6);
    beacon.width = this.iconSize;
    beacon.height = this.iconSize;
    beacon.th_letter = 'b';
    this.toolbar.push(beacon); 

    var levelDoor = game.add.sprite(0, 0, 'misc', 25);
    levelDoor.width = this.iconSize;
    levelDoor.height = this.iconSize;
    levelDoor.th_letter = 'D';
    levelDoor.th_door = 'golden';
    levelDoor.th_passlevel = true;
    this.toolbar.push(levelDoor);     

    var antiGravityButton = game.add.sprite(0, 0, 'misc', 135);
    antiGravityButton.width = this.iconSize;
    antiGravityButton.height = this.iconSize;
    antiGravityButton.th_letter = 'A';
    this.toolbar.push(antiGravityButton); 
    // More icons here

    this.renderToolbar();

    ////////////////////////////////////////////////
    ///////// CREATE PLAYERS TO USE IN LEVEL ///////
    ////////////////////////////////////////////////
    this.p1 = game.add.sprite(0, 0, 'players', 1);
    this.p1.width = 26;
    this.p1.height = 26;   
    this.p1.th_letter = '1';
    this.p1.inputEnabled = true;
    this.p1.events.onInputDown.add(() => {
      console.log("Player clicked: 1");
      this.selectedIcon = '1';
    }, this);

    

    this.p2 = game.add.sprite(0, 0, 'players', 8*12+7);
    this.p2.width = 26;
    this.p2.height = 26;  
    this.p2.th_letter = '2';
    this.p2.inputEnabled = true;
    this.p2.events.onInputDown.add(() => {
      console.log("Player clicked: 2");
      this.selectedIcon = '2';
    }, this);    

    //this.preparePlayers();  
    
    ////////////////////////////////////////////////
    ///////// CREATE SPRITES TO USE IN LEVEL ///////
    ////////////////////////////////////////////////

    // Blocks
    this.blocks = game.add.group();
    this.blocks.createMultiple(200, 'misc');
    this.blocks.setAll('frame', 14);
    this.blocks.setAll('width', 30);
    this.blocks.setAll('height', 30);
    this.blocks.setAll('th_letter', 'x');

    // Lavas
    this.lavas = game.add.group();
    this.lavas.createMultiple(100, 'misc');
    this.lavas.setAll('frame', 64);
    this.lavas.setAll('width', 30);
    this.lavas.setAll('height', 30-10); 
    this.lavas.setAll('th_letter', 'm');

    // Coins
    this.coins = game.add.group();
    this.coins.createMultiple(100, 'misc');
    this.coins.setAll('frame', 18);
    this.coins.setAll('width', 30);
    this.coins.setAll('height', 30);
    this.coins.setAll('th_letter', 'c'); 

    // Keys
    this.keys = game.add.group();
    this.keys.createMultiple(100, 'objects');
    this.keys.setAll('frame', 73);
    this.keys.setAll('width', 30);
    this.keys.setAll('height', 30);
    this.keys.setAll('th_letter', 'k');    

    // Slimes
    this.slimes = game.add.group();
    this.slimes.createMultiple(100, 'slimes');
    this.slimes.setAll('frame', 60);
    this.slimes.setAll('width', 30);
    this.slimes.setAll('height', 30); 
    this.slimes.setAll('th_letter', 's');

    // Slimes
    this.beacons = game.add.group();
    this.beacons.createMultiple(100, 'objects');
    this.beacons.setAll('frame', 6);
    this.beacons.setAll('width', 30);
    this.beacons.setAll('height', 30); 
    this.beacons.setAll('th_letter', 'b');

    // Normal doors
    this.doors = game.add.group();
    this.doors.createMultiple(1, 'misc');
    this.doors.setAll('frame', 26);
    this.doors.setAll('width', 30);
    this.doors.setAll('height', 30);
    this.doors.setAll('th_letter', 'd');  

    // Level door
    this.levelDoor = game.add.sprite(0, 0, 'misc', 25);
    this.levelDoor.width = 30
    this.levelDoor.height = 30
    this.levelDoor.th_letter = 'D';
    this.levelDoor.th_door = 'golden';
    this.levelDoor.th_passlevel = true;

    // Anti-gravity button
    this.antiGravityButton = game.add.sprite(0, 0, 'misc', 135);
    this.antiGravityButton.width = 30
    this.antiGravityButton.height = 30
    this.antiGravityButton.th_letter = 'A';

    ////////////////////////////////////////////////
    ////////// LEVEL TEMPLATE CREATION /////////////
    ////////////////////////////////////////////////

    this.outerWalls = game.add.group();
    this.outerWalls.createMultiple(140, 'misc');
    this.outerWalls.setAll('frame', 14);
    this.outerWalls.setAll('width', 30);
    this.outerWalls.setAll('height', 30); 
    this.outerWalls.setAll('th_letter', 'X');

    this.matchSpritesToData();

    /*

    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            // Create a wall and add it to the 'walls' group
            if (level[i][j] == 'X') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'X');
            } else if (level[i][j] === 'c') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'c');
            } else if (level[i][j] === 'm') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'm');
            } else if (level[i][j] === 's') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 's');
            } else if (level[i][j] === 'x') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'x');
            } else if (level[i][j] === 'k') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'k');
            } else if (level[i][j] === 'D') {
              this.createSpriteToTile({
                xIndex: j,
                yIndex: i
              }, 'D');

              this.levelDoorTile = {
                xIndex: j,
                yIndex: i
              };
            }
            
        }
    }
    */

    ////////////////////////////////
    ///// WORLD CLICK LISTENER /////
    ////////////////////////////////

    game.input.onDown.add((pointer) => {
      console.log("Tapped");
      var clickX = game.input.worldX;
      var clickY = game.input.worldY;

      this.clickOccurred(clickX, clickY);
      // Can also use pointer to fetch world x/y values
      //console.log("x: " + pointer.worldX + ", y: " + pointer.worldY);
    }, this);

    /*

    var key = game.add.sprite(0+30*j, 0+30*i, 'objects', 73);
    key.width = 30;
    key.height = 30;
    key.th_door = 'golden';
    this.keys.add(key);
    key.body.immovable = true;

                 



    var levelDoor = game.add.sprite(0+30*j, 0+30*i, 'misc', 25);
    levelDoor.width = 30;
    levelDoor.height = 30;
    levelDoor.th_door = 'golden';
    levelDoor.th_passlevel = true;
    this.walls.add(levelDoor);
    levelDoor.body.immovable = true;

                 



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



    var p = level[i][j] === '1' ? this.p1 : this.p2;

    p.setSpawnPosition(0+30*j, 0+30*i);
    
    p.x = 0+30*j;
    p.y = 0+30*i;
    */

                             

            
  }

  render() {
    if (__DEV__) {
      //this.game.debug.spriteInfo(this.p1, 32, 32)
    }
  }

    

  update() {

  }

}


