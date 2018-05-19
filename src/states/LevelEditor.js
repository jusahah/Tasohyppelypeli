/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Slime from '../sprites/enemies/Slime'

var ticks = 0;

export default class extends Phaser.State {
  init() {
    // Contains sprite objects that are active (in use)
    // under string key 'x,y'
    this.activeSprites = {};

    this.levelDoorTile = null;

    // This is template of the level that will
    // be built upon when editing level
    this.map = [
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

  }
  preload() { 


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
    })
  }

  getTileContent(tile) {
    var row = this.map[tile.yIndex];
    return row.charAt(tile.xIndex);
  }

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

  deleteCurrentLevelDoorIfExists() {

    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    if (this.levelDoorTile) {
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

  deleteSpriteFromTile(tile) {
    // Fetch from active sprites object

    var sprite = this.activeSprites[tile.xIndex + ',' + tile.yIndex];

    if (sprite) {
      sprite.kill();
      this.activeSprites[tile.xIndex + ',' + tile.yIndex] = null;
    }
  }

  createSpriteToTile(tile, letter) {

    if (letter === 'x') {
      console.log("Create block")
      var sprite = this.blocks.getFirstExists(false);

    } else if (letter === 'c') {
      console.log("Create coin")
      var sprite = this.coins.getFirstExists(false);

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
      // If we have a sprite, set it to the starting position
      sprite.reset(tile.xIndex*30, tile.yIndex*30);
      // Save to active sprites object
      this.activeSprites[tile.xIndex + ',' + tile.yIndex] = sprite;

    }    
  }

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

    this.setTileContent(tile, this.selectedIcon);

  }

  placePlayerToTile(player, tileX, tileY) {
    console.log("Place player to " + tileX + ", " + tileY)
    player.x = 2+30*tileX; 
    player.y = 2+30*tileY; 
  }

  preparePlayers() {
    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            if (level[i][j] == '1') {
                this.placePlayerToTile(this.p1, j, i);
                this.p1.inputEnabled = true;
                this.p1.events.onInputDown.add(() => {
                  console.log("Player clicked: 1");
                  this.selectedIcon = '1';
                }, this);                
            } else if (level[i][j] == '2') {
                this.placePlayerToTile(this.p2, j, i);
                this.p2.inputEnabled = true;
                this.p2.events.onInputDown.add(() => {
                  console.log("Player clicked: 2");
                  this.selectedIcon = '2';

                }, this);
            }            
        }
    }    
  }

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

    var levelDoor = game.add.sprite(0, 0, 'misc', 25);
    levelDoor.width = this.iconSize;
    levelDoor.height = this.iconSize;
    levelDoor.th_letter = 'D';
    levelDoor.th_door = 'golden';
    levelDoor.th_passlevel = true;
    this.toolbar.push(levelDoor);     
    // More icons here

    this.renderToolbar();

    ////////////////////////////////////////////////
    ///////// CREATE PLAYERS TO USE IN LEVEL ///////
    ////////////////////////////////////////////////
    this.p1 = game.add.sprite(0, 0, 'players', 1);
    this.p1.width = 26;
    this.p1.height = 26;   
    

    this.p2 = game.add.sprite(0, 0, 'players', 8*12+7);
    this.p2.width = 26;
    this.p2.height = 26;  

    this.preparePlayers();  
    ////////////////////////////////////////////////
    ///////// CREATE SPRITES TO USE IN LEVEL ///////
    ////////////////////////////////////////////////

    // Blocks
    this.blocks = game.add.group();
    this.blocks.createMultiple(200, 'misc');
    this.blocks.setAll('frame', 14);
    this.blocks.setAll('width', 30);
    this.blocks.setAll('height', 30);

    // Coins
    this.coins = game.add.group();
    this.coins.createMultiple(100, 'misc');
    this.coins.setAll('frame', 18);
    this.coins.setAll('width', 30);
    this.coins.setAll('height', 30); 

    // Keys
    this.keys = game.add.group();
    this.keys.createMultiple(100, 'objects');
    this.keys.setAll('frame', 73);
    this.keys.setAll('width', 30);
    this.keys.setAll('height', 30);    

    // Slimes
    this.slimes = game.add.group();
    this.slimes.createMultiple(100, 'slimes');
    this.slimes.setAll('frame', 60);
    this.slimes.setAll('width', 30);
    this.slimes.setAll('height', 30); 

    // Level door
    this.levelDoors = game.add.group();
    this.levelDoors.createMultiple(1, 'misc');
    this.levelDoors.setAll('frame', 25);
    this.levelDoors.setAll('width', 30);
    this.levelDoors.setAll('height', 30);  

    ////////////////////////////////////////////////
    ////////// LEVEL TEMPLATE CREATION /////////////
    ////////////////////////////////////////////////

    this.outerWalls = game.add.group();


    var level = this.map;

    for (var i = 0; i < level.length; i++) {

        for (var j = 0; j < level[i].length; j++) {

            // Create a wall and add it to the 'walls' group
            if (level[i][j] == 'X') {
                var wall = game.add.sprite(0+30*j, 0+30*i, 'misc', 14);
                wall.width = 30;
                wall.height = 30;
                //console.log(wall);
                this.outerWalls.add(wall);

                this.activeSprites[j + ',' + i] = wall;
            }
        }
    }

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


