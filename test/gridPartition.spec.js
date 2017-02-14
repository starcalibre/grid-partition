var assert = require('assert');
var GridPartition = require('../src/gridPartition');
var Util = require('../src/util');
var firstBy = require('thenby');

describe('GridPartition', function() {
    describe('constructor', function() {
        var grid;

        beforeEach(function() {
            grid = new GridPartition();
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
            var testGrid = new GridPartition(90, 80, 3, 4);
            var expected = 30;
            var actual = testGrid.cellWidth;
            assert.strictEqual(actual, expected);
        });

        it('should have expected cell height for custom parameters', function() {
            var testGrid = new GridPartition(90, 80, 3, 4);
            var expected = 20;
            var actual = testGrid.cellHeight;
            assert.strictEqual(actual, expected);
        });
    });
    
    describe('add', function() {
        it('should add the new entity to the expected cell', function() {
            // test entity, on a 100x100 space partitioned unto 10x10 cells,
            // the entity will live at the grid [0, 5]
            var grid = new GridPartition();

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
            var grid = new GridPartition(90, 80, 3, 4);

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
            var grid = new GridPartition()
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
            var grid = new GridPartition()
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
            var grid = new GridPartition();

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
    
    describe('clear', function() {
        it('removes all entities as expected', function() {
            var grid = new GridPartition();

            var testEntity1 = {
                name: 'Bob The Entity',
                x: 11,
                y: 12
            };

            var testEntity2 = {
                name: 'Alice The Entity',
                x: 12,
                y: 13
            };

            grid.addAll([testEntity1, testEntity2]);
            grid.clear();

            var result = grid.getNeighbourhoodByWorldCoord(11, 13, 1);

            var actual = result.length;
            var expected = 0;
            assert.equal(actual, expected);
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
            grid = new GridPartition();
            grid.add(testEntity);
        });

        it('gets expected cell', function() {
            var actual = grid.getCell(0, 5);
            var expected = [testEntity];
            assert.deepEqual(actual, expected);
        });
    });

    describe('getCellByWorldCoord', function() {
        it('returns the expected entity from world co-ordinates', function() {
            var grid = new GridPartition();

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
            var grid = new GridPartition(312, 450, 10, 15);

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
    });
    
    describe('getNeighbourhood', function() {
        it('returns the expected neighbourhood', function() {
            var grid = new GridPartition();

            // expected grid, * star if we expect this entity in
            // our neighbourhood query

            // [0, 0]
            var testEntity01 = { x: 7, y: 5 };
            grid.add(testEntity01);

            // [1, 2]
            var testEntity02 = { x: 17, y: 29 };
            grid.add(testEntity02);

            // [1, 3] *
            var testEntity03 = { x: 11, y: 38 };
            grid.add(testEntity03);

            // [1, 3] *
            var testEntity04 = { x: 17, y: 39 };
            grid.add(testEntity04);

            // [1, 4] *
            var testEntity05 = { x: 17, y: 41 };
            grid.add(testEntity05);

            // [1, 5] *
            var testEntity06 = { x: 18, y: 56 };
            grid.add(testEntity06);

            // [2, 2]
            var testEntity07 = { x: 24, y: 28 };
            grid.add(testEntity07);

            // [2, 3] *
            var testEntity08 = { x: 22, y: 36 };
            grid.add(testEntity08);

            // [2, 4] *
            var testEntity09 = { x: 21, y: 45 };
            grid.add(testEntity09);

            // [2, 5] *
            var testEntity10 = { x: 28, y: 56 };
            grid.add(testEntity10);

            // [3, 2]
            var testEntity11 = { x: 38, y: 21 };
            grid.add(testEntity11);

            // [3, 3] *
            var testEntity12 = { x: 39, y: 39 };
            grid.add(testEntity12);

            // [3, 4] *
            var testEntity13 = { x: 34, y: 45 };
            grid.add(testEntity13);

            // [3, 4] *
            var testEntity14 = { x: 34, y: 48 };
            grid.add(testEntity14);

            var radius = 1;
            var actual = grid.getNeighbourhood(2, 4, radius);

            var expected = [testEntity03, testEntity04, testEntity05, testEntity06,
                testEntity08, testEntity09, testEntity10, testEntity12, testEntity13, testEntity14];

            // sort both results for equality assertion in test
            actual.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                .thenBy(function(a, b) { return a.y - b.y }));

            expected.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                .thenBy(function(a, b) { return a.y - b.y }));

            assert.deepEqual(actual, expected);
        });

        it('returns empty array where no neighbours', function() {
            var grid = new GridPartition();

            var testEntity1 = { x: 6, y: 8 };
            grid.add(testEntity1);

            var testEntity2 = { x: 27, y: 78 };
            grid.add(testEntity2);

            var testEntity3 = { x: 56, y: 39 };
            grid.add(testEntity3);

            var radius = 2;
            var actual = grid.getNeighbourhood(2, 4, radius).length;
            var expected = 0;

            assert.equal(actual, expected);
        });

        it('wrapping parameter works as expected when true', function() {
            var grid = new GridPartition();

            var testEntity1 = {
                x: 2,
                y: 4
            };

            var testEntity2 = {
                x: 95,
                y: 94
            };

            var testEntity3 = {
                x: 2,
                y: 94
            };

            var testEntity4 = {
                x: 94,
                y: 1
            };

            grid.addAll([testEntity1, testEntity2, testEntity3, testEntity4]);
            var actual = grid.getNeighbourhood(0, 0, 1, true);
            var expected = [testEntity1, testEntity2, testEntity3, testEntity4];

            // sort both results for equality assertion in test
            actual.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            expected.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            assert.deepEqual(actual, expected);
        });

        it('wrapping parameters works as expected when false', function() {
            var grid = new GridPartition();

            var testEntity1 = {
                x: 2,
                y: 4
            };

            var testEntity2 = {
                x: 95,
                y: 94
            };

            var testEntity3 = {
                x: 2,
                y: 94
            };

            var testEntity4 = {
                x: 94,
                y: 1
            };

            grid.addAll([testEntity1, testEntity2, testEntity3, testEntity4]);
            var actual = grid.getNeighbourhood(0, 0, 1, false);
            var expected = [testEntity1];

            actual.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            expected.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            assert.deepEqual(actual, expected);
        });
    });

    describe('getNeighbourhoodByWorldCoord', function() {
        it('returns the expected neighbourhood', function() {
            var grid = new GridPartition();

            // expected grid, * star if we expect this entity in
            // our neighbourhood query

            // [0, 0]
            var testEntity01 = { x: 7, y: 5 };
            grid.add(testEntity01);

            // [1, 2]
            var testEntity02 = { x: 17, y: 29 };
            grid.add(testEntity02);

            // [1, 3] *
            var testEntity03 = { x: 11, y: 38 };
            grid.add(testEntity03);

            // [1, 3] *
            var testEntity04 = { x: 17, y: 39 };
            grid.add(testEntity04);

            // [1, 4] *
            var testEntity05 = { x: 17, y: 41 };
            grid.add(testEntity05);

            // [1, 5] *
            var testEntity06 = { x: 18, y: 56 };
            grid.add(testEntity06);

            // [2, 2]
            var testEntity07 = { x: 24, y: 28 };
            grid.add(testEntity07);

            // [2, 3] *
            var testEntity08 = { x: 22, y: 36 };
            grid.add(testEntity08);

            // [2, 4] *
            var testEntity09 = { x: 21, y: 45 };
            grid.add(testEntity09);

            // [2, 5] *
            var testEntity10 = { x: 28, y: 56 };
            grid.add(testEntity10);

            // [3, 2]
            var testEntity11 = { x: 38, y: 21 };
            grid.add(testEntity11);

            // [3, 3] *
            var testEntity12 = { x: 39, y: 39 };
            grid.add(testEntity12);

            // [3, 4] *
            var testEntity13 = { x: 34, y: 45 };
            grid.add(testEntity13);

            // [3, 4] *
            var testEntity14 = { x: 34, y: 48 };
            grid.add(testEntity14);

            var radius = 1;
            var actual = grid.getNeighbourhoodByWorldCoord(25, 49, radius);

            var expected = [testEntity03, testEntity04, testEntity05, testEntity06,
                testEntity08, testEntity09, testEntity10, testEntity12, testEntity13, testEntity14];

            // sort both results for equality assertion in test
            actual.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            expected.sort(
                firstBy(function(a, b) { return a.x - b.x; })
                    .thenBy(function(a, b) { return a.y - b.y }));

            assert.deepEqual(actual, expected);
        });

        it('returns empty array where no neighbours', function() {
            var grid = new GridPartition();

            var testEntity1 = { x: 6, y: 8 };
            grid.add(testEntity1);

            var testEntity2 = { x: 27, y: 78 };
            grid.add(testEntity2);

            var testEntity3 = { x: 56, y: 39 };
            grid.add(testEntity3);

            var radius = 2;
            var actual = grid.getNeighbourhoodByWorldCoord(25, 45, radius).length;
            var expected = 0;

            assert.equal(actual, expected);
        });
    });

    describe('remove', function() {
        it('removes elements as expected', function() {
            var grid = new GridPartition();

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
            grid.remove(testEntity);

            var actual = [testEntity2];
            var expected = grid.getCell(0, 5);
            assert.deepEqual(actual, expected);
        });
        
        it('returns true on successful removal', function() {
            var grid = new GridPartition(200, 200, 5, 5);

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
            var grid = new GridPartition();
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
            var grid = new GridPartition();

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
            var grid = new GridPartition();

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
            var grid = new GridPartition();

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
            var grid = new GridPartition(800, 600, 16, 12);

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

    describe('_isCellValid', function() {
        var grid;

        beforeEach(function() {
            grid = new GridPartition();
        });

        it('returns true when cell valid', function() {
            var actual = grid._isCellValid(2, 3);
            var expected = true;
            assert.equal(actual, expected);
        });

        it('returns false when cell invalid', function() {
            var actual = grid._isCellValid(-1, -1);
            var expected = false;
            assert.equal(actual, expected);
        });
    });
});

describe('Utils', function() {
    describe('isnullOrUndefined', function() {
        it('returns true on null', function() {
            var actual = Util.isNullOrUndefined(null);
            var expected = true;
            assert.equal(actual, expected);
        });

        it('returns true on undefined', function() {
            var actual = Util.isNullOrUndefined(undefined);
            var expected = true;
            assert.equal(actual, expected);
        });

        it('returns false on numeric', function() {
            var actual = Util.isNullOrUndefined(0);
            var expected = false;
            assert.equal(actual, expected);
        });
    });
    
    describe('mod', function() {
        it('finds correct modulo for positive numbers', function() {
            var actual = Util.mod(62, 60);
            var expected = 2;
            assert.equal(actual, expected);
        });

        it('finds correct modulo for negative numbers', function() {
            var actual = Util.mod(-2, 60);
            var expected = 58;
            assert.equal(actual, expected);
        });
    });
});
