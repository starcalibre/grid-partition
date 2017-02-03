var assert = require('assert');
var SpatialPartition = require('../dist/spatialPartition');

describe('SpatialPartition', function() {
    describe('constructor', function() {
        var grid;

        beforeEach(function() {
            grid = new SpatialPartition();
        });

        it('should have default width 100', function() {
            var actual = grid.width;
            var expected = 100;
            assert.strictEqual(actual, expected);
        });

        it('should have default height 100', function() {
            var actual = grid.height;
            var expected = 100;
            assert.strictEqual(actual, expected);
        });

        it('should have default cell width 10', function() {
            var actual = grid.cellWidth;
            var expected = 10;
            assert.strictEqual(actual, expected);
        });

        it('should have default cell height 10', function() {
            var actual = grid.cellHeight;
            var expected = 10;
            assert.strictEqual(actual, expected);
        });
    });
});
