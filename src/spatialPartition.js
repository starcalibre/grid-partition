'use strict';
var Map = require('collections/map');
var isNullOrUndefined = require('./util').isNullOrUndefined;
var mod = require('./util').mod;

function SpatialPartition(width, height, numberCellsX, numberCellsY) {
    this.width = width || 100;
    this.height = height || 100;
    this.numberCellsX = numberCellsX || 10;
    this.numberCellsY = numberCellsY || 10;
    this.cellWidth = this.width / this.numberCellsX;
    this.cellHeight = this.height / this.numberCellsY;

    // default x-y accessors
    this._x = function(d) {
        return d.x;
    };
    
    this._y = function(d) {
      return d.y;
    };

    // initialise the cells
    this._cells = new Array(this.numberCellsX);
    for(var i = 0; i < this.numberCellsY; i++) {
        this._cells[i] = new Array(this.numberCellsX);
        for(var j = 0; j < this.numberCellsX; j++) {
            this._cells[i][j] = [];
        }
    }

    // map of entity references to cell co-ordinates
    // we use this to keep track of entities after their co-ordinates
    // have changed
    this._entityMap = new Map();
}

SpatialPartition.prototype.add = function(entity) {
    var posX = Math.round(this._x.call(null, entity));
    var posY = Math.round(this._y.call(null, entity));
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);

    this._cells[cellY][cellX].push(entity);
    this._entityMap.set(entity, [cellX, cellY]);
};

SpatialPartition.prototype.addAll = function(entities) {
    entities.forEach(function(entity) {
        this.add(entity);
    }.bind(this));
};

SpatialPartition.prototype.getCell = function(cellX, cellY) {
    if(cellX < 0 || cellY < 0 || cellX > this.numberCellsX || cellY > this.numberCellsY) {
        return null;
    }
    // otherwise assume individual accessors were passed
    return this._cells[cellY][cellX];
};

SpatialPartition.prototype.getCellByWorldCoord = function(posX, posY) {
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);
    if(cellX < 0 || cellY < 0 || cellX > this.numberCellsX || cellY > this.numberCellsY) {
        return null;
    }
    return this.getCell(cellX, cellY);
};

SpatialPartition.prototype.getNeighbourhood = function(cellX, cellY, radius, wrap) {
    // default parameters
    if(isNullOrUndefined(radius)) { radius = 1; }
    if(radius < 0) { radius = 0; }
    if(!wrap) { wrap = false; }

    // array for all output entities
    var result = [];

    var i, j, iMod, jMod, currentCell;
    for(i = (cellX - radius); i <= (cellX + radius); i++) {
        for(j = (cellY - radius); j <= (cellY + radius); j++) {
            iMod = mod(i, this.numberCellsX);
            jMod = mod(j, this.numberCellsY);
            if(!wrap && (iMod !== i || jMod !== j)) {
                continue;
            }
            currentCell = this.getCell(iMod, jMod);
            result = result.concat(currentCell);
        }
    }

    return result;
};

SpatialPartition.prototype.getNeighbourhoodByWorldCoord = function(posX, posY, radius) {
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);
    return this.getNeighbourhood(cellX, cellY, radius);
};

SpatialPartition.prototype.update = function(entity) {
    // remove the entity
    if(!this.remove(entity)) return false;

    // now add it again!
    this.add(entity);
    return true;
};

SpatialPartition.prototype.updateAll = function(entities) {
    entities.forEach(function(entity) {
        this.update(entity);
    }.bind(this));
};

SpatialPartition.prototype.remove = function(entity) {
    var cellCoord = this._entityMap.get(entity);
    if(isNullOrUndefined(cellCoord)) return false;

    // remove entity from cell
    var cell = this.getCell(cellCoord[0], cellCoord[1]);
    var index = cell.indexOf(entity);
    cell.splice(index, 1);

    // remove entity from hash-map
    delete this._entityMap[entity];

    return true;
};

SpatialPartition.prototype.x = function(_) {
    if(!isNullOrUndefined(_)) {
        this._x = _;
        return this;
    }
    return this._x;
};

SpatialPartition.prototype.y = function(_) {
    if(!isNullOrUndefined(_)) {
        this._y = _;
        return this;
    }
    return this._y;
};

module.exports = SpatialPartition;
