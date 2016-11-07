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
 * https://gist.github.com/revolunet/843889
 */
function lzwEncode( s )
{
	var dict = {};
	var data = (s + "").split( "" );
	var out = [];
	var currChar;
	var phrase = data[ 0 ];
	var code = 256;
	for( var i = 1; i < data.length; i++ )
	{
		currChar = data[ i ];
		if( dict[ phrase + currChar ] != null )
		{
			phrase += currChar;
		}
		else
		{
			out.push( phrase.length > 1 ? dict[ phrase ] : phrase.charCodeAt( 0 ) );
			dict[ phrase + currChar ] = code;
			code++;
			phrase = currChar;
		}
	}
	out.push( phrase.length > 1 ? dict[ phrase ] : phrase.charCodeAt( 0 ) );
	for( var i = 0; i < out.length; i++ )
	{
		out[ i ] = String.fromCharCode( out[ i ] );
	}
	return out.join( "" );
}

function lzwDecode( s )
{
	var dict = {};
	var data = (s + "").split( "" );
	var currChar = data[ 0 ];
	var oldPhrase = currChar;
	var out = [ currChar ];
	var code = 256;
	var phrase;
	for( var i = 1; i < data.length; i++ )
	{
		var currCode = data[ i ].charCodeAt( 0 );
		if( currCode < 256 )
		{
			phrase = data[ i ];
		}
		else
		{
			phrase = dict[ currCode ] ? dict[ currCode ] : (oldPhrase + currChar);
		}
		out.push( phrase );
		currChar = phrase.charAt( 0 );
		dict[ code ] = oldPhrase + currChar;
		code++;
		oldPhrase = phrase;
	}
	return out.join( "" );
}

/**
 * Alan Ross
 */
Mandala = function( containerId, buttonsId, color, slices )
{
	var QUANT = 1000;
	var _slices = slices || 48;
	var _color = color || '#FFFFFF';
	var _lineWidth = 2;

	var _width;
	var _height;
	var _cx;
	var _cy;
	var _radius;

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
		_container = $( containerId ).css( { position: "absolute" } ).append( _mainCanvas ).append( _tempCanvas );

		_mainCanvas = _mainCanvas[ 0 ];
		_tempCanvas = _tempCanvas[ 0 ];

		_container.on( 'mousedown touchstart', onStrokeStart );
		_container.on( 'mousemove touchmove', onStrokeMove );
		_container.on( 'mouseup touchend', onStrokeEnd );

		_window = $( window );
		_window.resize( onResize ).keydown( onKeyDown );

		$( buttonsId ).find( 'i' ).click( onButtonClick );
		reset();

		importPath();
	}

	function reset()
	{
		_width = _window.width();
		_height = _window.height();

		_cx = _width >> 1;
		_cy = _height >> 1;
		_radius = Math.max( _width, _height );

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

		for( var i = 0; i < _slices; ++i )
		{
			_mainContext.save();
			_mainContext.beginPath();
			_mainContext.strokeStyle = '#232323';
			_mainContext.lineWidth = 1;

			var r = angle * Math.PI / 180;

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

		_tempContext.strokeStyle = _color;
		_tempContext.fillStyle = _color;

		if( _stroke.length == 1 )
		{
			var p = _stroke[ 0 ];

			for( var i = 0; i < _slices; ++i )
			{
				_tempContext.save();
				_tempContext.beginPath();
				_tempContext.lineWidth = p.wid;
				_tempContext.strokeStyle = _color;

				var r = ( angle * Math.PI / 180 ) + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				var x = _cx + p.dst * _radius * Math.cos( r );
				var y = _cy + p.dst * _radius * Math.sin( r );

				_tempContext.lineWidth = p.wid;
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
				_tempContext.beginPath();

				var rAng = angle * Math.PI / 180;

				var p = _stroke[ 0 ];
				var r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				var x1 = _cx + p.dst * _radius * Math.cos( r );
				var y1 = _cy + p.dst * _radius * Math.sin( r );

				_tempContext.lineWidth = p.wid;
				_tempContext.moveTo( x1, y1 );

				var n = _stroke.length - 1;

				for( var j = 1; j < n; ++j )
				{
					p = _stroke[ j ];
					r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
					var x2 = _cx + p.dst * _radius * Math.cos( r );
					var y2 = _cy + p.dst * _radius * Math.sin( r );

					_tempContext.quadraticCurveTo( x1, y1, ( ( x1 + x2 ) * 0.5 ), ( ( y1 + y2 ) * 0.5 ) );

					x1 = x2;
					y1 = y2;
				}

				p = _stroke[ n ];
				r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				x2 = _cx + p.dst * _radius * Math.cos( r );
				y2 = _cy + p.dst * _radius * Math.sin( r );

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

	function addPoint( e )
	{
		if( e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[ 0 ] )
		{
			var t = e.originalEvent.touches[ 0 ];

			e.clientX = t.pageX;
			e.clientY = t.pageY;
		}

		var rect = e.currentTarget.getBoundingClientRect();

		var pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

		_stroke.push( pos );
		_stroke = _rdp.process( _stroke, 0.9 );
		_stroke.push( pos );

		for( var i = 0; i < _stroke.length; ++i )
		{
			var p = _stroke[ i ];
			var dx = p.x - _cx;
			var dy = p.y - _cy;

			p.dst = ( Math.sqrt( dx * dx + dy * dy ) >> 0 ) / _radius;
			p.dst = Math.floor( p.dst * QUANT ) / QUANT;
			p.ang = Math.atan2( p.y - _cy, p.x - _cx );
			p.ang = Math.floor( p.ang * QUANT ) / QUANT;
			p.wid = _lineWidth;
		}
	}

	function requestRender()
	{
		window.requestAnimationFrame( render );
	}

	function onStrokeStart( e )
	{
		e.preventDefault();

		_down = true;

		addPoint( e );

		requestRender();
	}

	function onStrokeEnd( event )
	{
		_down = false;

		_strokeEnd = true;

		addPoint( event );

		requestRender();
	}

	function onStrokeMove( e )
	{
		e.preventDefault();

		if( _down )
		{
			addPoint( e );

			requestRender();
		}
	}

	function onButtonClick( event )
	{
		var action = $( event.currentTarget ).attr( 'data-action' );

		switch( action )
		{
			case "share":
				exportPath();
				break;
			case "image":
				exportImage();
				break;
			case "trash":
				reset();
				break;
			case "play":
				animate();
				break;
		}
	}

	function onResize()
	{
		_container.css( { "top": ( _window.height() - _height ) >> 1, "left": ( _window.width() - _width ) >> 1 } );
	}

	function onKeyDown( event )
	{
		event.preventDefault();

		if( !event.which )
		{
			return false;
		}

		if( 49 <= event.which && event.which <= 57 )
		{
			var v = ( parseInt( event.which ) - 48 );

			_lineWidth = ( v < 1 ) ? 1 : ( ( v > 5 ) ? 5 : v );

			requestRender();
		}

		return false;
	}

	function exportPath()
	{
		var path = "";

		for( var i = 0, n = _strokeHistory.length; i < n; ++i )
		{
			var s = _strokeHistory[ i ];

			if( s.end )
			{
				path += "|";
			}
			else
			{
				path += ( s.dst * QUANT ) + "." + ( s.ang * QUANT ) + "." + ( s.wid ) + ".";
			}
		}

		path = path.replace( /\|$/, '' ).replace( /\.$/, '' );

		//path = lzwEncode( path );

		window.prompt( "Copy to clipboard: Ctrl+C, Enter", window.location.href + "?p=" + path );

		//window.open( window.location.href + "?p=" + path );
	}

	function importPath()
	{
		var path = getURLParameter( "p" );

		if( path )
		{
			//path = lzwDecode( path );

			_strokeHistory = [];

			var strokes = path.split( "|" );

			for( var i = 0; i < strokes.length; ++i )
			{
				var units = strokes[ i ].split( "." );

				for( var j = 0; j < units.length; j += 3 )
				{
					var dst = parseInt( units[ j ] );
					var ang = parseInt( units[ j + 1 ] );
					var wid = parseInt( units[ j + 2 ] );

					if( !isNaN( dst ) && !isNaN( ang ) && !isNaN( wid ) )
					{
						_strokeHistory.push( { dst: ( dst / QUANT ), ang: ( ang / QUANT ), wid: wid } );
					}
				}

				_strokeHistory.push( { end: true } );
			}

			animate();
		}
	}

	function getURLParameter( key )
	{
		var vars = window.location.search.substring( 1 ).split( '&' );

		for( var i = 0; i < vars.length; i++ )
		{
			var params = vars[ i ].split( '=' );

			if( params[ 0 ] == key )
			{
				return params[ 1 ];
			}
		}
	}

	function exportImage()
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

		animateStroke();
	}

	function animateStroke()
	{
		_strokeHistoryActive = false;

		if( _strokeHistory.length > ++_strokeHistoryIndex )
		{
			_strokeHistoryActive = true;

			var s = _strokeHistory[ _strokeHistoryIndex ];

			if( s.end )
			{
				_strokeEnd = true;

				render();
				setTimeout( animateStroke, 120 );
			}
			else
			{
				_stroke.push( s );

				render();
				setTimeout( animateStroke, 60 );
			}
		}
	}

	init();
};

$( function()
{
	new Mandala( '#container', '#buttons' );
} );





