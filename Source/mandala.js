/**
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 *
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 * MIT license
 */
(function()
{
	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
	for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x )
	{
		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ]
				|| window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
	}

	if( !window.requestAnimationFrame )
	{
		window.requestAnimationFrame = function( callback, element )
		{
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - (currTime - lastTime) );
			var id = window.setTimeout( function()
					{
						callback( currTime + timeToCall );
					},
					timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if( !window.cancelAnimationFrame )
	{
		window.cancelAnimationFrame = function( id )
		{
			clearTimeout( id );
		};
	}
}());
/**
 * (c) 2013, Vladimir Agafonkin
 * Simplify.js, a high-performance JS polyline simplification library
 * mourner.github.io/simplify-js
 * @constructor
 */
var RamerDouglasPeucker = function()
{
	function getSqDist( p1, p2 )
	{
		var dx = p1.x - p2.x;
		var dy = p1.y - p2.y;

		return dx * dx + dy * dy;
	}

	function getSqSegDist( p, p1, p2 )
	{
		var x = p1.x;
		var y = p1.y;
		var dx = p2.x - x;
		var dy = p2.y - y;

		if( dx !== 0 || dy !== 0 )
		{
			var t = ( (p.x - x) * dx + (p.y - y) * dy ) / ( dx * dx + dy * dy );

			if( t > 1 )
			{
				x = p2.x;
				y = p2.y;

			}
			else if( t > 0 )
			{
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return dx * dx + dy * dy;
	}

	function simplifyRadialDist( points, sqTolerance )
	{
		var prevPoint = points[ 0 ];
		var newPoints = [ prevPoint ];
		var point;

		for( var i = 1, len = points.length; i < len; i++ )
		{
			point = points[ i ];

			if( getSqDist( point, prevPoint ) > sqTolerance )
			{
				newPoints.push( point );
				prevPoint = point;
			}
		}

		if( prevPoint !== point )
		{
			newPoints.push( point );
		}

		return newPoints;
	}

	function simplifyDPStep( points, first, last, sqTolerance, simplified )
	{
		var maxSqDist = sqTolerance;
		var index;

		for( var i = first + 1; i < last; i++ )
		{
			var sqDist = getSqSegDist( points[ i ], points[ first ], points[ last ] );

			if( sqDist > maxSqDist )
			{
				index = i;
				maxSqDist = sqDist;
			}
		}

		if( maxSqDist > sqTolerance )
		{
			if( index - first > 1 )
			{
				simplifyDPStep( points, first, index, sqTolerance, simplified );
			}

			simplified.push( points[ index ] );

			if( last - index > 1 )
			{
				simplifyDPStep( points, index, last, sqTolerance, simplified );
			}
		}
	}

	function simplifyDouglasPeucker( points, sqTolerance )
	{
		var last = points.length - 1;

		var simplified = [ points[ 0 ] ];
		simplifyDPStep( points, 0, last, sqTolerance, simplified );
		simplified.push( points[ last ] );

		return simplified;
	}

	this.process = function( points, tolerance )
	{
		if( points.length <= 2 )
		{
			return points;
		}

		var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

		points = simplifyRadialDist( points, sqTolerance );
		points = simplifyDouglasPeucker( points, sqTolerance );

		return points;
	}
};

/**
 * Alan Ross
 */
Mandala = function( color, slices )
{
	var _slices = slices || 48;
	var _color = color || '#FFFFFF';
	var _lineWidth = 2;

	var _width;
	var _height;
	var _cx;
	var _cy;

	var _window;
	var _container;
	var _mainCanvas;
	var _mainContext;
	var _tempCanvas;
	var _tempContext;

	var _rdp;

	var _stroke = [];
	var _down = false;
	var _strokeEnd = false;

	var _strokeHistory = [];
	var _strokeHistoryIndex = 0;
	var _strokeHistoryActive = false;

	function init()
	{
		_rdp = new RamerDouglasPeucker();

		_mainCanvas = $( '<canvas/>' ).css( { "position": "absolute", "top": 0, "left": 0 } );
		_tempCanvas = $( '<canvas/>' ).css( { "position": "absolute", "top": 0, "left": 0 } );
		_container = $( '<div/>' ).css( { position: "absolute" } ).append( _mainCanvas ).append( _tempCanvas ).appendTo( "body" );

		_mainCanvas = _mainCanvas[ 0 ];
		_tempCanvas = _tempCanvas[ 0 ];

		_container.mousedown( onMouseDown ).mouseup( onMouseUp ).mousemove( onMouseMove );

		_window = $( window );
		_window.resize( onResize ).keydown( onKeyDown ).dblclick( onMouseDoubleClick );

		reset();
	}

	function reset()
	{
		_width = _window.width();
		_height = _window.height();

		_cx = _width >> 1;
		_cy = _height >> 1;

		_stroke = [];
		_strokeHistory = [];

		_container.css( { "top": 0, "left": 0, "width": _width, "height": _height } );

		_mainCanvas.width = _width;
		_mainCanvas.height = _height;

		_tempCanvas.width = _width;
		_tempCanvas.height = _height;

		_mainContext = _mainCanvas.getContext( '2d' );
		_mainContext.clearRect( 0, 0, _width, _height );

		_tempContext = _tempCanvas.getContext( '2d' );
		_tempContext.clearRect( 0, 0, _width, _height );

		_tempContext.lineJoin = 'round';
		_tempContext.lineCap = 'round';

		renderAxis();
	}

	function renderAxis()
	{
		var angle = 0;
		var step = 360 / _slices;
		var rInner = 25;
		var rOuter = Math.max( _width, _height );
		var r;

		for( var i = 0; i < _slices; ++i )
		{
			_mainContext.save();
			_mainContext.beginPath();
			_mainContext.strokeStyle = '#232323';
			_mainContext.lineWidth = 1;

			r = angle * Math.PI / 180;

			_mainContext.moveTo( _cx + rInner * Math.cos( r ), _cy + rInner * Math.sin( r ) );
			_mainContext.lineTo( _cx + rOuter * Math.cos( r ), _cy + rOuter * Math.sin( r ) );

			_mainContext.stroke();
			_mainContext.restore();

			angle += step;
		}
	}

	function render()
	{
		_tempContext.clearRect( 0, 0, _width, _height );

		if( _stroke.length == 0 )
		{
			return;
		}

		var angle = 0;
		var step = 360 / _slices;
		var mirror = -1;

		var rStp = step * Math.PI / 180;

		for( var i = 0; i < _stroke.length; ++i )
		{
			var p = _stroke[ i ];
			var dx = p.x - _cx;
			var dy = p.y - _cy;

			p.dst = Math.sqrt( dx * dx + dy * dy ) >> 0;
			p.ang = Math.atan2( p.y - _cy, p.x - _cx );
		}

		_tempContext.strokeStyle = _color;
		_tempContext.fillStyle = _color;

		if( _stroke.length == 1 )
		{
			var p = _stroke[ 0 ];

			for( var i = 0; i < _slices; ++i )
			{
				_tempContext.save();
				_tempContext.beginPath();
				_tempContext.lineWidth = _lineWidth;
				_tempContext.strokeStyle = _color;

				var r = ( angle * Math.PI / 180 ) + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				var x = _cx + p.dst * Math.cos( r );
				var y = _cy + p.dst * Math.sin( r );

				_tempContext.lineWidth = _lineWidth;
				_tempContext.arc( x, y, _tempContext.lineWidth * 0.5, 0, Math.PI * 2, false );
				_tempContext.fill();
				_tempContext.closePath();

				_tempContext.restore();

				angle += step;
				mirror *= -1;
			}
		}
		else
		{
			for( var i = 0; i < _slices; ++i )
			{
				_tempContext.save();

				_tempContext.strokeStyle = _color;
				_tempContext.lineWidth = _lineWidth;
				_tempContext.beginPath();

				var rAng = angle * Math.PI / 180;

				var p = _stroke[ 0 ];
				var r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				var x1 = _cx + p.dst * Math.cos( r );
				var y1 = _cy + p.dst * Math.sin( r );

				_tempContext.moveTo( x1, y1 );

				var n = _stroke.length - 1;

				for( var j = 1; j < n; ++j )
				{
					p = _stroke[ j ];
					r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
					var x2 = _cx + p.dst * Math.cos( r );
					var y2 = _cy + p.dst * Math.sin( r );

					_tempContext.quadraticCurveTo( x1, y1, ( ( x1 + x2 ) * 0.5 ), ( ( y1 + y2 ) * 0.5 ) );

					x1 = x2;
					y1 = y2;
				}

				p = _stroke[ n ];
				r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				x2 = _cx + p.dst * Math.cos( r );
				y2 = _cy + p.dst * Math.sin( r );

				_tempContext.quadraticCurveTo( x1, y1, x2, y2 );
				_tempContext.stroke();

				angle += step;
				mirror *= -1;

				_tempContext.restore();
			}
		}

		if( _strokeEnd )
		{
			_strokeEnd = false;

			_mainContext.drawImage( _tempCanvas, 0, 0 );

			_tempContext.clearRect( 0, 0, _width, _height );

			if( _strokeHistoryActive == false )
			{
				_strokeHistory = _strokeHistory.concat( _stroke );
				_strokeHistory.push( { end: true } );
			}

			_stroke = [];
		}
	}

	function addPoint( event )
	{
		var rect = event.currentTarget.getBoundingClientRect();

		var pos = { x: event.clientX - rect.left, y: event.clientY - rect.top };

		_stroke.push( pos );
		_stroke = _rdp.process( _stroke, 0.9 );
		_stroke.push( pos );
	}

	function requestRender()
	{
		window.requestAnimationFrame( render );
	}

	function onMouseUp( event )
	{
		_down = false;
		_strokeEnd = true;

		addPoint( event );

		requestRender();
	}

	function onMouseDown( event )
	{
		_down = true;

		addPoint( event );

		requestRender();
	}

	function onMouseMove( event )
	{
		if( _down )
		{
			addPoint( event );

			requestRender();
		}
	}

	function onMouseDoubleClick( event )
	{
		reset();
	}

	function onResize()
	{
		_container.css( { "top": ( _window.height() - _height ) >> 1, "left": ( _window.width() - _width ) >> 1 } );
	}

	function onKeyDown( event )
	{
		if( !event.which )
		{
			return;
		}

		if( event.which == 83 )
		{
			exportCanvas();
		}
		else if( event.which == 65 )
		{
			animate();
		}
		else if( 49 <= event.which && event.which <= 57 )
		{
			var value = ( parseInt( event.which ) - 48 );

			if( value < 1 )
			{
				value = 1;
			}
			else if( value > 5 )
			{
				value = 5;
			}

			_lineWidth = value;

			requestRender();
		}
	}

	function exportCanvas()
	{
		var canvas = document.createElement( 'canvas' );
		canvas.width = _width;
		canvas.height = _height;

		var ctx = canvas.getContext( '2d' );

		ctx.clearRect( 0, 0, _width, _height );

		ctx.beginPath();
		ctx.fillStyle = "#000";
		ctx.rect( 0, 0, _width, _height );
		ctx.fill();

		ctx.drawImage( _mainCanvas, 0, 0 );

		ctx.beginPath();
		ctx.fillStyle = "#000";
		ctx.rect( _width - 123, _height - 25, 118, 15 );
		ctx.fill();

		ctx.beginPath();
		ctx.font = "11px Arial";
		ctx.fillStyle = "#fff";
		ctx.fillText( "http://aross.io/mandala", _width - 120, _height - 15 );

		var img = canvas.toDataURL( "image/png" );
		var w = window.open( 'about:blank', 'image from canvas' );

		w.document.write(
				"<span style='display:block; text-align:center'>Right click on image to save.</span>" +
				"<img src='" + img + "' alt='Exported from Mandala'/>"
		);
	}


	function animate()
	{
		_stroke = [];
		_strokeHistoryIndex = -1;
		_strokeHistoryActive = true;

		_mainContext.clearRect( 0, 0, _width, _height );
		_tempContext.clearRect( 0, 0, _width, _height );

		animateCoords();
	}

	function animateCoords()
	{
		if( _strokeHistory.length > ++_strokeHistoryIndex )
		{
			var s = _strokeHistory[ _strokeHistoryIndex ];

			if( s.end )
			{
				_strokeEnd = true;

				render();
			}
			else
			{
				_stroke.push( s );

				render();
			}

			setTimeout( animateCoords, 60 );
		}
		else
		{
			_strokeHistoryActive = false;
		}
	}

	init();
};

$( function()
{
	new Mandala();
} );





