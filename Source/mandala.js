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

Mandala = function( color, slices )
{
	var _slices = slices || 36;
	var _color = color || '#FFFFFF';
	var _lineWidth = 2;

	var _width;
	var _height;
	var _centerX;
	var _centerY;

	var _window;
	var _container;
	var _mainCanvas;
	var _mainContext;
	var _tempCanvas;
	var _tempContext;

	var _coords = [];
	var _down = false;

	function init()
	{
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

		_centerX = _width >> 1;
		_centerY = _height >> 1;

		_coords = [];

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

			_mainContext.moveTo( _centerX + rInner * Math.cos( r ), _centerY + rInner * Math.sin( r ) );
			_mainContext.lineTo( _centerX + rOuter * Math.cos( r ), _centerY + rOuter * Math.sin( r ) );

			_mainContext.stroke();
			_mainContext.restore();

			angle += step;
		}
	}

	function render()
	{
		_tempContext.clearRect( 0, 0, _tempCanvas.width, _tempCanvas.height );

		if( _coords.length == 0 )
		{
			return;
		}

		var m = _coords.length - 1;
		var angle = 0;
		var step = 360 / _slices;
		var mirror = -1;

		_tempContext.strokeStyle = _color;
		_tempContext.fillStyle = _color;

		if( _coords.length == 1 )
		{
			var p = _coords[ 0 ];

			for( var i = 0; i < _slices; ++i )
			{
				_tempContext.save();
				_tempContext.beginPath();
				_tempContext.lineWidth = _lineWidth;
				_tempContext.strokeStyle = _color;

				var rAng = angle * Math.PI / 180;
				var rStp = step * Math.PI / 180;

				var r = rAng + ( ( mirror > 0 ) ? rStp - p.ang : p.ang );
				var x = _centerX + p.dst * Math.cos( r );
				var y = _centerY + p.dst * Math.sin( r );

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
				var rAng = angle * Math.PI / 180;
				var rStp = step * Math.PI / 180;

				_tempContext.save();
				_tempContext.strokeStyle = _color;
				_tempContext.lineWidth = _lineWidth;
				_tempContext.beginPath();

				var p0 = _coords[ 0 ];
				var p1;

				var ra0 = rAng + p0.ang;

				if( mirror > 0 )
				{
					ra0 = rAng + rStp - p0.ang;
				}

				var x0 = _centerX + p0.dst * Math.cos( ra0 );
				var y0 = _centerY + p0.dst * Math.sin( ra0 );

				_tempContext.moveTo( x0, y0 );

				var n = _coords.length - 2;

				for( var j = 1; j < n; ++j )
				{
					p0 = _coords[ j ];
					p1 = _coords[ j + 1 ];

					var ra0 = rAng + p0.ang;
					var ra1 = rAng + p1.ang;

					if( mirror > 0 )
					{
						ra0 = rAng + rStp - p0.ang;
						ra1 = rAng + rStp - p1.ang;
					}

					var x0 = _centerX + p0.dst * Math.cos( ra0 );
					var y0 = _centerY + p0.dst * Math.sin( ra0 );

					var x1 = _centerX + p1.dst * Math.cos( ra1 );
					var y1 = _centerY + p1.dst * Math.sin( ra1 );

					_tempContext.quadraticCurveTo( x0, y0, ( ( x0 + x1 ) * 0.5 ), ( ( y0 + y1 ) * 0.5 ) );
				}

				p0 = _coords[ j ];
				p1 = _coords[ j + 1 ];

				var ra0 = rAng + p0.ang;
				var ra1 = rAng + p1.ang;

				if( mirror > 0 )
				{
					ra0 = rAng + rStp - p0.ang;
					ra1 = rAng + rStp - p1.ang;
				}

				var x0 = _centerX + p0.dst * Math.cos( ra0 );
				var y0 = _centerY + p0.dst * Math.sin( ra0 );

				var x1 = _centerX + p1.dst * Math.cos( ra1 );
				var y1 = _centerY + p1.dst * Math.sin( ra1 );

				_tempContext.quadraticCurveTo( x0, y0, x1, y1 );
				_tempContext.stroke();


				//for( var j = 0; j < m; ++j )
				//{
				//	var p0 = _coords[ j ];
				//	var p1 = _coords[ j + 1 ];
				//
				//	var ra0 = rAng + p0.ang;
				//	var ra1 = rAng + p1.ang;
				//
				//	if( mirror > 0 )
				//	{
				//		ra0 = rAng + rStp - p0.ang;
				//		ra1 = rAng + rStp - p1.ang;
				//	}
				//
				//	var x0 = _centerX + p0.dst * Math.cos( ra0 );
				//	var y0 = _centerY + p0.dst * Math.sin( ra0 );
				//
				//	var x1 = _centerX + p1.dst * Math.cos( ra1 );
				//	var y1 = _centerY + p1.dst * Math.sin( ra1 );
				//
				//
				//	_tempContext.beginPath();
				//	_tempContext.moveTo( x0, y0 );
				//	_tempContext.lineTo( x1, y1 );
				//	//_tempContext.quadraticCurveTo( (x1 - x0) * 0.5, (y1 - y0) * 0.5, x1, y1 );
				//	_tempContext.stroke();
				//}

				_tempContext.restore();

				angle += step;
				mirror *= -1;
			}
		}
	}

	function getMouse( event )
	{
		var rect = event.currentTarget.getBoundingClientRect();

		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function addPoint( pos )
	{
		var dx = pos.x - _centerX;
		var dy = pos.y - _centerY;

		// dist to center
		pos.dst = Math.sqrt( dx * dx + dy * dy ) >> 0;

		// angle on circle
		pos.ang = Math.atan2( pos.y - _centerY, pos.x - _centerX );

		_coords.push( pos );
	}

	function requestRender()
	{
		window.requestAnimationFrame( render );
	}

	function onMouseMove( event )
	{
		if( !_down )
		{
			return;
		}

		addPoint( getMouse( event ) );

		requestRender();
	}

	function onMouseUp( event )
	{
		_down = false;

		addPoint( getMouse( event ) );

		requestRender();

		_mainContext.drawImage( _tempCanvas, 0, 0 );

		_tempContext.clearRect( 0, 0, _width, _height );

		_coords = [];
	}

	function onMouseDown( event )
	{
		_down = true;

		addPoint( getMouse( event ) );

		requestRender();
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

	init();
};

$( function()
{
	new Mandala();
} );