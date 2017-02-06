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

        it('should have default number of X cells 10', function() {
            var actual = grid.cellWidth;
            var expected = 10;
            assert.strictEqual(actual, expected);
        });

        it('should have default number of Y cells 10', function() {
            var actual = grid.cellHeight;
            var expected = 10;
            assert.strictEqual(actual, expected);
        });

        it('should have expected cell width for custom parameters', function() {
            var testGrid = new SpatialPartition(90, 80, 3, 4);
            var expected = 30;
            var actual = testGrid.cellWidth;
            assert.strictEqual(actual, expected);
        });

        it('should have expected cell height for custom parameters', function() {
            var testGrid = new SpatialPartition(90, 80, 3, 4);
            var expected = 20;
            var actual = testGrid.cellHeight;
            assert.strictEqual(actual, expected);
        });
    });
    
    describe('add', function() {
        it('should add the new entity to the expected cell', function() {
            // test entity, on a 100x100 space partitioned unto 10x10 cells,
            // the entity will live at the grid [0, 5]
            var grid = new SpatialPartition();

            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };

            grid.add(testEntity);
            var cell = grid.getCell(0, 5);
            var actual = cell[0];
            assert.equal(actual, testEntity);
        });

        it('should add the new entity to expected cell with non-default params', function() {
            // create a 90 * 80 space partitioned 3 * 4 grids
            var grid = new SpatialPartition(90, 80, 3, 4);

            // the entity should live at [1, 3]
            var testEntity = {
                name: 'Charlie The Entity',
                x: 35,
                y: 70
            };

            grid.add(testEntity);
            var cell = grid.getCell(1, 3);

            var actual = cell[0];
            assert.equal(actual, testEntity);
        });

        it('addition works custom x, y accessors', function() {
            var grid = new SpatialPartition()
                .x(function(d) {
                    return d.crazy.nesting.what;
                })
                .y(function(d) {
                    return d.why.would.you.why * 10;
                });

            // expected this to map to
            // [25, 4.5 * 10] == [25, 45] -> [2, 4]
            var testEntity = {
                name: 'Sally The Entity With Crazy Properties',
                crazy: { nesting: { what: 25} },
                why: { would: { you: { why: 4.5 } } }
            };

            grid.add(testEntity);
            var cell = grid.getCell(2, 4);

            var actual = cell[0];
            assert.equal(actual, testEntity);
        });

        it('updates the entity map as expected', function() {
            var grid = new SpatialPartition()
                .x(function(d) {
                    return d.position.x;
                })
                .y(function(d) {
                    return d.position.y;
                });

            // expect the entity to [7, 7]
            var testEntity = {
                name: 'Patel The Entity',
                position: { x: 70, y: 70 }
            };

            grid.add(testEntity);
            var actual = grid._entityMap.get(testEntity);
            var expected = [7, 7];
            assert.deepEqual(actual, expected);
        });
    });
    
    describe('addAll', function() {
        it('adds multiple entities', function() {
            var grid = new SpatialPartition();

            // expect both of these be assigned to grid [1, 6]
            var testEntity1 = {
                name: 'Charlotte The Entity',
                x: 15,
                y: 65
            };
            var testEntity2 = {
                name: 'Harry The Entity',
                x: 15,
                y: 65
            };

            var entities = [testEntity1, testEntity2];
            grid.addAll(entities);
            var actual = grid.getCell(1, 6).length;
            var expected = 2;
            assert.strictEqual(actual, expected);
        });
    });
    
    describe('getCell', function() {
        var grid;
        var testEntity = {
            name: 'Alice The Entity',
            x: 0,
            y: 51
        };
        
        beforeEach(function() {
            grid = new SpatialPartition();
            grid.add(testEntity);
        });

        it('gets expected cell using two parameters', function() {
            var actual = grid.getCell(0, 5);
            var expected = [testEntity];
            assert.deepEqual(actual, expected);
        });

        it('gets expected cell using a single parameter', function() {
            var actual = grid.getCell([0, 5]);
            var expected = [testEntity];
            assert.deepEqual(actual, expected);
        })
    });
    
    describe('getCellByEntity', function() {
        it('returns the expected cell by the given entity', function() {
            var grid = new SpatialPartition();

            // both entities will reside in [0, 5]
            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };
            var testEntity2 = {
                name: 'Bob The Entity',
                x: 2,
                y: 51
            };

            grid.add(testEntity);
            grid.add(testEntity2);

            var expected = [testEntity, testEntity2];
            var actual = grid.getCellByEntity(testEntity2);
            assert.deepEqual(actual, expected);
        });
    });
    
    describe('getCellByWorldCoord', function() {
        it('returns the expected entity from world co-ordinates', function() {
            var grid = new SpatialPartition();

            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };

            var testEntity2 = {
                name: 'John The Entity',
                x: 2,
                y: 50
            };

            var testEntity3 = {
                name: 'Magda The Entity',
                x: 15,
                y: 61
            };

            grid.addAll([testEntity, testEntity2, testEntity3]);
            var actual = grid.getCellByWorldCoord(3, 52);
            var expected = [testEntity, testEntity2];
            assert.deepEqual(actual, expected);
        });

        it('returns expected entities from world co-ordinates (custom params)', function() {
            var grid = new SpatialPartition(312, 450, 10, 15);

            // expect first two to map to 2, 2
            var testEntity1 = {
                name: 'Arif The Entity',
                x: 65,
                y: 60
            };

            var testEntity2 = {
                name: 'Symeon The Entity',
                x: 68,
                y: 61
            };

            var testEntity3 = {
                name: 'Yorick The Entity',
                x: 33,
                y: 29
            };

            grid.addAll([testEntity1, testEntity2, testEntity3]);
            var expected = [testEntity1, testEntity2];
            var actual = grid.getCellByWorldCoord(64, 62);
            assert.deepEqual(actual, expected);
        });

        it('works as expected whe [x, y] array passed', function() {
            var grid = new SpatialPartition();

            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };

            var testEntity2 = {
                name: 'John The Entity',
                x: 2,
                y: 50
            };

            var testEntity3 = {
                name: 'Magda The Entity',
                x: 15,
                y: 61
            };

            grid.addAll([testEntity, testEntity2, testEntity3]);
            var actual = grid.getCellByWorldCoord([1, 52]);
            var expected = [testEntity, testEntity2];
            assert.deepEqual(actual, expected);
        });
    });

    describe('remove', function() {
        it('removes elements as expected', function() {
            var grid = new SpatialPartition();

            // both entities will reside in [0, 5]
            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };
            var testEntity2 = {
                name: 'Bob The Entity',
                x: 2,
                y: 51
            };

            grid.addAll([testEntity, testEntity2]);
            var lol = grid.remove(testEntity);

            var actual = [testEntity2];
            var expected = grid.getCell(0, 5);
            assert.deepEqual(actual, expected);
        });
        
        it('returns true on successful removal', function() {
            var grid = new SpatialPartition(200, 200, 5, 5);

            var testEntity = {
                name: 'Rostislav The Entity',
                x: 37,
                y: 199
            };

            grid.add(testEntity);
            var actual = grid.remove(testEntity);
            assert.equal(actual, true);
        });

        it('returns false on failed removal', function() {
            var grid = new SpatialPartition();
            var testEntity = {
                name: 'Bobby the Entity',
                x: 12,
                y: 67
            };

            var actual = grid.remove(testEntity);
            assert.equal(actual, false);
        });
    });
    
    describe('update', function() {
        it('updates the entity as expected', function() {
            var grid = new SpatialPartition();

            // will be in [0, 5] initially
            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };

            grid.add(testEntity);
            testEntity.x = 13;
            testEntity.y = 65; // should be in [1, 6] with new position
            grid.update(testEntity);

            var actual = grid.getCell(1, 6);
            var expected = [testEntity];
            assert.deepEqual(actual, expected);
        });
        
        it('returns true on successful update', function() {
            var grid = new SpatialPartition();

            // will be in [0, 5] initially
            var testEntity = {
                name: 'Alice The Entity',
                x: 0,
                y: 51
            };

            grid.add(testEntity);
            testEntity.x = 13;
            testEntity.y = 65; // should be in [1, 6] with new position
            var updated = grid.update(testEntity);

            assert.equal(updated, true);
        });
        
        it('returns false on failed update', function() {
            var grid = new SpatialPartition();

            var testEntity = {
                name: 'Cirillo The Entity',
                x: 99,
                y: 56
            };

            var updated = grid.update(testEntity);
            assert.equal(updated, false);
        });
    });
    
    describe('updateAll', function() {
        it('updates multiple entities as expected', function() {
            var grid = new SpatialPartition(800, 600, 16, 12);

            // test will be assigned to [0, 0]
            var testEntity1 = {
                name: 'Ivan The Entity',
                x: 10,
                y: 10
            };

            var testEntity2 = {
                name: 'Vlad The Entity',
                x: 12,
                y: 12
            };

            grid.addAll([testEntity1, testEntity2]);

            // after update these will be assigned to [1, 2]
            testEntity1.x = 55;
            testEntity1.y = 102;
            testEntity2.x = 52;
            testEntity2.y = 110;

            grid.updateAll([testEntity1, testEntity2]);

            var actual = grid.getCell(1, 2);
            var expected = [testEntity1, testEntity2];

            assert.deepEqual(actual, expected);
        });
    });
});

describe('Miscellaneous', function() {

});
