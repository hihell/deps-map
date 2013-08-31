
var Deps = Deps || (function(){
  var _args = {}; // private

  // max_width of merge
  var max_width = 0;

  // merge is the matrix for drawing
  // if the height index of merge i, i % 4 == 0, then current level contains elements and vertical connection lines
  // if i % 4 == 1, it contains lines for elements' connection
  // if i % 4 == 2, it contains horizonal lines for elements' connection
  var merge = new Array();

  function generate(j) {

    // generate reverse(requirement) relationship
    var c = new Array();

    var enter = j.enter_lesson;

    for(i in j.lessons){
      if(j.lessons[i].requirements) {
        for(var k = 0; k < j.lessons[i].requirements.length; k++) {
          if(!c[j.lessons[i].requirements[k]])
            c[j.lessons[i].requirements[k]] = [];
          c[j.lessons[i].requirements[k]].push(i);
        }
      }
    }
    console.log('c the children:');
    console.log(c);

    // ~~~~~~~~~~~~~~~~~~
    // depth first search, fill vmap, hmap, max_width
    var hmap = new Array();
    var vmap = new Array(); //vertical
    dfs(enter, c, hmap, vmap);

    // r_vmap is using the value of vmap as its key
    var r_vmap = new Array();
    for(k in vmap) {
      if(!r_vmap[vmap[k]]) {
        r_vmap[vmap[k]] = [];
      }
      r_vmap[vmap[k]].push(k);
    }
    
    // fill the matrix with located lessons and emptys(0)
    // i represent a level
    for(var i = 0; i < r_vmap.length * 4; i++) {
      merge[i] = [];
      if(i%4 == 0) {
        // max_width start from 0
        // 0 in merge represent empty 
        for(var j = 0; j <= max_width; j++) {
          merge[i].push(0);
        }
        // k represent a lesson in this level
        for(var k = 0; k < r_vmap[i/4].length; k++) {
          merge[i][hmap[r_vmap[i/4][k]]] = r_vmap[i/4][k];
        }
      } else {
        for(var j = 0; j <= max_width; j++) {
          merge[i].push(0);
        }
      }
    }

    console.log('merge:');
    console.log(merge);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // connect the dots backwards
    for(i in c) {
      for(var j = 0; j < c[i].length; j++) {
        // i connect to j
        connect(i, c[i][j]);
      }
    }

    // ~~~~~~~~~~~~~~~~~~~~
    // compress if possible
    compress();

    // ~~~~~~~~~~~~~~~~~~~~
    // clear old relation and rebuild relation
    for(var j = 0; j < merge.length; j++) {
      for(var i = 0; i < merge.length; i++) {
        if(j%4 != 0) {
          merge[j][i] = 0;
        }
      }
    }
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // connect the dots backwards
    for(i in c) {
      
      for(var j = 0; j < c[i].length; j++) {
        connect(i, c[i][j]);
      }
      
    }
    // draw the necessary dots
    for(var j = 0; j < merge.length; j++) {
      for(var i = 0; i < merge[j].length; i++) {
        if(j % 4 == 2 && merge[j][i] == 0) {
          if(merge[j-1][i] == 'I' && merge[j+1][i] == 'I') {
            merge[j][i] = '*';
          }
        }
      }
    }
  } // the end of genmap

    function dfs(enter, conn, hmap, vmap) {

      var q = new Array();
      var m = new Array();

      q.push(enter);
      m[enter] = true;
      hmap[enter] = 0;
      vmap[enter] = 0;  
      
      while(q.length > 0) {
        var current = q.shift();
        var children = conn[current];

        if(children) {
          var enqueue = 0
          for(var i = 0; i < children.length; i++) { 
            if(vmap[children[i]] == null) 
              vmap[children[i]] = 0;
            if(vmap[current] + 1 > vmap[children[i]]){
              vmap[children[i]] = vmap[current] + 1;
            }
            if(!m[children[i]]) {
              m[children[i]] = true;
              q.unshift(children[i]);
              enqueue++;
            }
          }

          for(var k = 0; k < q.length; k++) {
            if(k < enqueue) {
              hmap[q[k]] = hmap[current] + k;
            } else if(enqueue - 1 > 0){
              hmap[q[k]] += (enqueue - 1);
            }
            max_width = hmap[q[k]] > max_width ? hmap[q[k]] : max_width;
          }
        }
      }// end dps while loop
      
    }

    function sortFunction(a, b){
      return (hmap[a] - hmap[b]);
    }

    function findCoor(lesson) {
      for(var i = 0; i <= max_width; i++) {
        for(var j = 0; j < merge.length; j++) {
          var res = new Array();

          if(merge[j][i] == lesson) {
            res[0] = i;
            res[1] = j;
            return res;
          }
        }
      }
      return null;
    }

    function connect(lesson_a, lesson_b) {

      var coor_a = findCoor(lesson_a);
      var coor_b = findCoor(lesson_b);

      if(coor_a[1] >= coor_b[1]) {
        console.error('a is lower than b');
        console.error('lesson_a:' + lesson_a + " lesson_b" + lesson_b);
        return;
      }

      // height of horizonal line
      var hoh = coor_b[1] - 2;
      // draw vertical
      // I: I
      merge[coor_b[1] - 1][coor_b[0]] = 'I';
      for(var i = coor_a[1] + 1; i < hoh; i++) {
        if(i % 4 != 2) {
          merge[i][coor_a[0]] = 'I';
        }
      }
      
      // draw horizonal
      // 0:  , 1: -, 2:- , 3:--
      var start = Math.min(coor_a[0], coor_b[0]);
      var end = Math.max(coor_a[0], coor_b[0]);
      for(var i = start; i <= end; i++) {
        var cur = 0;
        if(start == end) 
          break;
        
        if(i == start) {
          cur = 1;
        } else if(i == end) {
          cur = 2;
        } else {
          cur = 3;
        }
        merge[hoh][i] = (merge[hoh][i] | cur);
      }

    }

    function moveLeft(cluster) {
      console.log('moveLeft:' + cluster);
      var x = cluster[0];
      var y1 = cluster[1];
      var y2 = cluster[2];
      var m1 = y1 + 1;
      var m2 = y2;
      if(typeof merge[y2][x] != 'string') {
        m2 = y2 - 1;
      }

      for(var i = x-1; i >= 0; i--) {
        for(var j = m1; j <= m2; j++) {
          if(merge[j][i] != 0) {
            return;
          }
        }

        // console.log('can move!');
        // console.log(cluster);

        for(var j = m1; j <= m2; j++) {
          merge[j][i] = merge[j][i+1];
          merge[j][i+1] = 0;
        }
      }

    }

    function compress() {
      // find possible compress clusters
      // [x, y1, y2] y1 < y2
      for(var x = 1; x <= max_width; x++) {
        var y1 = 0;
        var y2 = 0;
        for(var y = 0; y < merge.length; y++) {
          
          if(y1 == 0 && typeof merge[y][x] == 'string') {
            
            if(merge[y][x].indexOf('lesson') != -1)
              y1 = y - 2;
            
          }
          if(y1 != 0 && y%4 != 2 && merge[y][x] == 0) {
            y2 = y - 1;

            var cluster = [x, y1, y2];
            // console.log('cluster:');
            // console.log(cluster);
            moveLeft(cluster);
            y1 = 0;
            y2 = 0;
          }
        }
      }
    }

    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
        genmap : function() {
          // ~~~~~~~~~~~~~~~~
          // call genmap here

        
          generate(_args[0]);

          document.write('<center><table border="0">');

          //loop for rows 
          for (i = 0; i < merge.length; i++)
          {

            document.write('<tr>'); 
            for (j = 0; j < merge[i].length; j++) 
            {
              document.write('<td>'); 
                if(typeof merge[i][j] == 'string') {
                  if(merge[i][j] == 'I') {
                    document.write('<img class="ve" src="ve.png">')
                  } else if(merge[i][j] == '*') {
                    document.write('<img class="ho-dot" src="ho-dot.png">')
                  } else {
                    document.write('<span>'+ merge[i][j] +' </span>')
                  }
                } else if(merge[i][j] == 1) {
                  document.write('<img class="ho-xo" src="ho-xo.png">')
                } else if(merge[i][j] == 2) {
                  document.write('<img class="ho-ox" src="ho-ox.png">')
                } else if(merge[i][j] == 3){
                  document.write('<img class="ho" src="ho.png">')
                }
              document.write('</td>');
            }
            document.write('</tr>');  

          }

          document.write('</table></center>');

        }
    };
}());
