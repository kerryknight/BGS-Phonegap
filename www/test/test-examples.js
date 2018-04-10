window.jQuery(function () {
// see http://qunitjs.com/cookbook/#efficient-development for more info on using QUnit.js testing

//EXAMPLE TESTS
// **************************************************************************************************
module('Basic Assertions');//use module() function to logically group tests together in the output
test( "ok test", function() {
  ok("1" == 1, "Passes!" );
  ok( true, "true succeeds" );
  ok( "non-empty", "non-empty string succeeds" );
  ok( false, "false fails" );
  ok( 0, "0 fails" );
  ok( NaN, "NaN fails" );
  ok( "", "empty string fails" );
  ok( null, "null fails" );
  ok( undefined, "undefined fails" );
});

test( "equal test", function() {
  equal( 0, 0, "Zero; equal succeeds" );
  equal( "", 0, "Empty, Zero; equal succeeds" );
  equal( "", "", "Empty, Empty; equal succeeds" );
  equal( 0, 0, "Zero, Zero; equal succeeds" );
  equal( "three", 3, "Three, 3; equal fails" );
  equal( null, false, "null, false; equal fails" );
});

test( "deepEqual test", function() {
  var obj = { foo: "bar" };
  deepEqual(obj, {foo: "bar"}, "Two objects can be the same in value");
});

module('Synchronous');
test( "a test to demo expect()", function() {
  //expect is the number of assertions you expect to fire during testing synchronous callbacks
  //this is useful b/c circumstances in code can sometimes prevent callback assertions from being called
  //which would cause the test to fail silently; using expect will cause test to fail if correct number
  //of assertions aren't fired when test completes
  expect(2); 

  function calc(x, operation) {
    return operation(x);
  }

  var result = calc(2, function(x) {
    ok(true, "calc() calls operation function");
    return x * x;
  });

  equal(result, 4, "2 square equals 4");
});

test( "a practical test - header link click simulated", function() {
  expect(1);

  var $header = $("#qunit-header");

  $header.on( "click", function() {
    ok( true, "header link was auto-clicked; click anywhere else in header to see it fail" );
  });

  $header.trigger("click");
});

module('aSync');
asyncTest( "asynchronous test: one second later!", function() {
  expect( 1 );

  setTimeout(function() {
    ok( true, "Passed and ready to resume!" );
    start(); //call start when ready for ok test to be run
  }, 1000);
});

//this test obviously won't work/ever be run without a video DOM element but is useful as a practical example
asyncTest( "asynchronous test: video ready to play", 1, function() {
  var $video = $( "video" );

  $video.on( "canplaythrough", function() {
    ok( true, "video has loaded and is ready to play" );
    start();//call start when ready for ok test to be run
  });
});

module('Event Testing');
function KeyLogger( target ) {
  if ( !(this instanceof KeyLogger) ) {
    return new KeyLogger( target );
  }
  this.target = target;
  this.log = [];
 
  var self = this;
 
  this.target.off( "keydown" ).on( "keydown", function( event ) {
    self.log.push( event.keyCode );
  });
}

test( "keylogger api behavior", function() {
 
  var event,
      $doc = $( document ),
      keys = KeyLogger( $doc );
 
  // trigger event
  event = $.Event( "keydown" );
  event.keyCode = 9;
  $doc.trigger( event );
 
  // verify expected behavior
  equal( keys.log.length, 1, "a key was logged" );
  equal( keys.log[ 0 ], 9, "correct key was logged" );
 
});

module('DOM Manipulation Testing');
test( "Appends a div", function() {
  var $fixture = $( "#qunit-fixture" );
 
  $fixture.append( "<div>hello!</div>" );
  equal( $( "div", $fixture ).length, 1, "div added successfully!" );
});
 
test( "Appends a span", function() {
  var $fixture = $( "#qunit-fixture" );
 
  $fixture.append("<span>hello!</span>" );
  equal( $( "span", $fixture ).length, 1, "span added successfully!" );
});

module( "Calling assertions before and after each test is run", {
  setup: function() {
    ok( true, "one extra assert per test" );
  }, teardown: function() {
    ok( true, "and one extra assert after each test" );
  }
});

test( "test with setup and teardown", function() {
  expect(3);
  equal(3, 1+2, 'three is equal to 3');
});


});
