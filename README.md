JavaScript 2D Grid Partition
============================

This is a fairly minimal implementation of a 2D grid partition in JavaScript.

Grid partitioning is used for answering the question "If I have a collection of objects in
a 2D space, which ones are close together?". For example, I could be trying to calculate which objects
are colliding, or which objects are close to my mouse cursor. A naive approach to this problem
might involve checking every pairwise combination of objects to see if they collside, or checking
every objects against the mouse cursor to see which objects are close to it. This is a sensible and 
easy approach for smaller problems, but it quickly becomes wasteful and slow once we have a large number
 of entities in the world.

A solution to the problem is spatial partitioning. This divides up the world space into smaller
grid cells and assigns each of the entities to each one of the cells in the grid. This way, our 
search for close objects is much easier because we only need to check the entities that belong
to the same, or neighbouring cells. This way we eliminate large chunks of the search space.

Another more extensive and detailed write-up on why such as partitioning is useful is given 
[here](http://gameprogrammingpatterns.com/spatial-partition.html).

Demo
----

TBA

Usage
-----

Add `gridPartition.js` or `gridPartition.min.js` to your script headers. I'll add support
for Browserify and NPM if somebody needs it, or one of my projects needs it. 

Examples
--------

Here's a very basic example. Here were divide a 100 x 100 space into 10 x 10 cells
of size 10 x 10 each.

    var width = 100, height = 100;
    var cellSizeX = 10, cellSizeY = 10;
    var grid = new GridPartition(width, height, cellSizeX, cellSizeY);
    
    var entities = [
        { name: 'One', x: 1, y: 10 },
        { name: 'Two', x: 15, y: 12 },
        { name: 'Three', x: 85, y: 91 }
    ];
    
    grid.addAll(entities);
    
    var result = grid.getNeighbourhoodByWorldCoord(5, 16, 2);
    console.log(result);
    
Custom accessors can be specified for the x and y co-ordinates.

    var width = 100, height = 100;
    var cellSizeX = 10, cellSizeY = 10;
    var grid = new GridPartition(width, height, cellSizeX, cellSizeY);
    
    grid.x(function(d) { return d.position.x; });
    grid.y(function(d) { return d.position.y; });
    
    var entities = [
        { name: 'One', position: { x: 1, y: 10 } },
        { name: 'Two', position: { x: 15, y: 12 } },
        { name: 'Three', position: { x: 85, y: 91 } }
    ];
    
    grid.addAll(entities);
    
    // this will return entity 'Three'
    var result = grid.getNeighbourhoodByWorldCoord(90, 85, 1);
    
The `update` and `updateAll` methods can be used to recalculate the cell
assignment when the entities x and y coordinates change. updateAll clears
the entire grid and is more efficient when many of the entities have changed.

    var width = 100, height = 100;
    var cellSizeX = 10, cellSizeY = 10;
    var grid = new GridPartition(width, height, cellSizeX, cellSizeY);

    var entities = [
        { name: 'One', x: 1, y: 10 },
        { name: 'Two', x: 15, y: 12 },
        { name: 'Three', x: 85, y: 91 }
    ];

    grid.addAll(entities);

    entities[2].x = 65;
    entities[2].y = 61;

    grid.update(entities[2]);

    // this will return entity 'Three' per its updated coordinates
    var result = grid.getNeighbourhoodByWorldCoord(61, 62, 1);
    
Documentation
-------------

Documentation is generated using JSDoc and stored in the wiki [here](https://github.com/starcalibre/grid-partition/wiki/Documentation).
