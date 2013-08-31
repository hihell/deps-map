deps-map
========

draw dependency map with html, this is inspired by Duolingo lessons dependency map

basically, it is reading the dependency json and draw the map into a html table
following are important functions:

function dfs(enter, conn, hmap, vmap)
    this function is the depth first search, enter is the enter node, conn is the node connections 
    (var c in generate, reversed dependencies)
    hmap and vmap are the outputs of this function, hmap (horizonal) define the node left-right order of each level
    vamp (vertical) define the height order of each node.
    example of hmap vmap:
    hmap: {box1: 1, box2: 2, box3: 3}, vmap: {box1: 3, box2: 1, box3: 1}
    this means box 2 and 3 are in the same level, box 2 is on the left side of 3, 
    while box 1 is in the lower level of box 2 and 3
    
function connect(lesson_a, lesson_b)
    this function draw connection line between a and b (inpired by Duolingo, so the node is lesson ;)
    in it you can find magic number 1 2 3, they are representing the horizonal lines in table slots. 1 and 2 are the half
    lines, 3 is the full lines (it will help to understand if you consider them as binery number).
    'I' represent the vertical lines. (there are only full vertical lines)
    
function compress() & function moveLeft(cluster)
    and finally the compress
    this function will compress the width of the map drew by above functions
    basically it will find a moveable cluster and pass it to moveLeft function to check if it can be moved and move it
    the cluster will be test collition with columns at the left side of it, untill a collision happened,
    it will keep move left
    Once the compress procedure finished, the program will remove the previouse connections lines and rebuild them
    (this is done in function generate)
    


    
