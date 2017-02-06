'use strict';
var Map = require('collections/map');

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
    // assume length-2 array was passed
    if(cellY == null || cellY == undefined) {
        return this._cells[cellX[1]][cellX[0]]
    }
    // otherwise assume individual accessors were passed
    return this._cells[cellY][cellX];
};

SpatialPartition.prototype.getCellByEntity = function(entity) {
    var query = this._entityMap.get(entity);
    if(nullOrUndefined(query)) return null;
    return this.getCell(query);
};

SpatialPartition.prototype.getCellByWorldCoord = function(posX, posY) {
    var cellX, cellY;

    // assume length 2 array passed
    if(posY === null || posY === undefined) {
        cellX = Math.floor(posX[0] / this.cellWidth);
        cellY = Math.floor(posX[1] / this.cellHeight);
    }
    else {
        cellX = Math.floor(posX / this.cellWidth);
        cellY = Math.floor(posY / this.cellHeight);
    }
    return this.getCell(cellX, cellY);
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
    if(nullOrUndefined(cellCoord)) return false;

    // remove entity from cell
    var cell = this.getCell(cellCoord);
    var index = cell.indexOf(entity);
    cell.splice(index, 1);

    // remove entity from hash-map
    delete this._entityMap[entity];

    return true;
};

SpatialPartition.prototype.x = function(_) {
    if(_ != null) {
        this._x = _;
        return this;
    }
    return this._x;
};

SpatialPartition.prototype.y = function(_) {
    if(_ != null) {
        this._y = _;
        return this;
    }
    return this._y;
};

function nullOrUndefined(value) {
    return value == null || value == undefined;
}

module.exports = SpatialPartition;
