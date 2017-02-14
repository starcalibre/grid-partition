'use strict';
var Map = require('collections/weak-map');
var isNullOrUndefined = require('./util').isNullOrUndefined;
var mod = require('./util').mod;

/**
 * Creates a new SpatialPartition object.
 *
 * @param {number} width - The width of the world-space.
 * @param {number} height - The height of the world-space.
 * @param numberCellsX - The number of cells to divide the x-dimension to.
 * @param numberCellsY - The number of cells to divide the y-dimension to.
 * @constructor
 */
function SpatialPartition(width, height, numberCellsX, numberCellsY) {
    this.width = isNullOrUndefined(width) ? 100 : width;
    this.height = isNullOrUndefined(height) ? 100 : height;
    this.numberCellsX = isNullOrUndefined(numberCellsX) ? 10 : numberCellsX;
    this.numberCellsY = isNullOrUndefined(numberCellsY) ? 10 : numberCellsY;
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

/**
 * Adds an entity to the grid.
 *
 * @param {Object} entity - The entity to add to the grid.
 */
SpatialPartition.prototype.add = function(entity) {
    var posX = Math.floor(this._x.call(null, entity));
    var posY = Math.floor(this._y.call(null, entity));
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);

    this._cells[cellY][cellX].push(entity);
    this._entityMap.set(entity, [cellX, cellY]);
};

/**
 * Adds multiple entities to the grid.
 *
 * @param {Array} entities - An array of entities to add to the grid.
 */
SpatialPartition.prototype.addAll = function(entities) {
    entities.forEach(function(entity) {
        this.add(entity);
    }.bind(this));
};

/**
 * Gets an array of entities belonging to the [cellX, cellY] cell in
 * the grid.
 *
 * @param {number} cellX - The grid's x-coordinate.
 * @param {number} cellY - The grid's y-coordinate.
 * @returns {Array} An array of entities belonging to this cell.
 */
SpatialPartition.prototype.getCell = function(cellX, cellY) {
    if(!this._isCellValid(cellX, cellY)) return null;
    return this._cells[cellY][cellX];
};

/**
 * Gets an array of entities belonging to the same cell as the
 * x and y position from the world-space. This maps the input
 * world-space co-ordinate to the corresponding grid cell.
 *
 * @param {number} posX - The query x-position.
 * @param {number} posY - The query y-position.
 * @returns {Array} - An array of entities belonging to the same cell.
 */
SpatialPartition.prototype.getCellByWorldCoord = function(posX, posY) {
    var cellX = Math.floor(posX / this.cellWidth);
    var cellY = Math.floor(posY / this.cellHeight);
    return this.getCell(cellX, cellY);
};

/**
 * Return the entities belonging to the cell at [cellX, cellY], and those belonging
 * to the cells that are ``radius`` distance. The wrapping parameter determines whether or
 * not the search should look on the opposite side of the grid space if the search radius
 * falls "outside" the grid.
 *
 * @param {number} cellX - The grid's x-coordinate.
 * @param {number} cellY - The grid's y-coordinate.
 * @param {number} radius - The search radius. Default 1. Negative
 *                          input will just default to 0.
 * @param {boolean} wrap - Whether or not to wrap the search radius around the space.
 * @returns {Array} - An array of entities belonging to the search neighbourhood. Default true.
 */
SpatialPartition.prototype.getNeighbourhood = function(cellX, cellY, radius, wrap) {
    // default parameters
    if(isNullOrUndefined(radius)) { radius = 1; }
    if(radius < 0) { radius = 0; }
    if(isNullOrUndefined(wrap)) { wrap = false; }

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

/**
 * Given a world-space x, y co-ordinate, find all neighbours belonging to neighbouring grids.
 * See getNeighbourhood.
 *
 * @param {number} posX - The grid's x-coordinate.
 * @param {number} posY - The grid's y-coordinate.
 * @param {number} radius - The search radius.
 * @param {boolean} wrap - Whether or not to wrap the search radius around the space.
 * @returns {Array} - An array of entities belonging to the search neighbourhood.
 */
SpatialPartition.prototype.getNeighbourhoodByWorldCoord = function(posX, posY, radius, wrap) {
    var cellX = Math.floor(Math.floor(posX) / this.cellWidth);
    var cellY = Math.floor(Math.floor(posY) / this.cellHeight);
    return this.getNeighbourhood(cellX, cellY, radius, wrap);
};

/**
 * Update the cell an entity belongs to if its world-space co-ordinates have changed.
 *
 * @param {Object} entity - The entity to update.
 * @returns {boolean} - True if an update was successful.
 */
SpatialPartition.prototype.update = function(entity) {
    // remove the entity
    if(!this.remove(entity)) return false;

    // now add it again!
    this.add(entity);
    return true;
};

/**
 * Update the cells for multiple entities.
 *
 * @param {Array} entities - An array of entities to update.
 */
SpatialPartition.prototype.updateAll = function(entities) {
    entities.forEach(function(entity) {
        this.update(entity);
    }.bind(this));
};

/**
 * Remove an entity from the grid.
 *
 * @param entity
 * @returns {boolean}
 */
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

/**
 * Set a custom x coordinate accessor for the entities.
 * This defaults to the x property of the entity.
 *
 * @param {Function} _ - A function returning the x-coordinate for the entity.
 * @returns {SpatialPartition} - Returns this SpatialPartition.
 */
SpatialPartition.prototype.x = function(_) {
    if(!isNullOrUndefined(_)) {
        this._x = _;
        return this;
    }
    return this._x;
};

/**
 * Set a custom y coordinate accessor for the entities.
 * This defaults to the y property of the entity.
 *
 * @param {Function} _ - A function returning the y-coordinate for the entity.
 * @returns {SpatialPartition} - Returns this SpatialPartition.
 */
SpatialPartition.prototype.y = function(_) {
    if(!isNullOrUndefined(_)) {
        this._y = _;
        return this;
    }
    return this._y;
};

/**
 * Check if the given cellX and cellY co-ordinates are valid for this grid.
 *
 * @param {number} cellX - The query x coordinate.
 * @param {number} cellY - The query y coordinate.
 * @returns {boolean} - True if valid, false otherwise.
 * @private
 */
SpatialPartition.prototype._isCellValid = function(cellX, cellY) {
    return (cellX >= 0 && cellY >= 0 && cellX < this.numberCellsX && cellY < this.numberCellsY);
};

module.exports = SpatialPartition;
