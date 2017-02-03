'use strict';

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
    this._entityMap = {};
}

SpatialPartition.prototype.add = function(entity) {
    var posX = Math.round(this._x.call(null, entity));
    var posY = Math.round(this._y.call(null, entity));
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);

    this._cells[cellY][cellX].push(entity);
    this._entityMap[entity] = [cellX, cellY];
};

SpatialPartition.prototype.addAll = function(entities) {
};

SpatialPartition.prototype.getCell = function(cellX, cellY) {
    // assume length-2 array was passed
    if(!cellY) {
        return this._cells[cellX[1]][cellX[0]]
    }
    // otherwise assume individual accessors were passed
    return this._cells[cellY][cellX];
};

SpatialPartition.prototype.move = function(entity, x, y) {
    // move an entity
};

SpatialPartition.prototype.remove = function(entity) {
    // remove an entity
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

module.exports = SpatialPartition;
