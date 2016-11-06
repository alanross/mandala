// PLUGIN BELOW


(function( $ )
{
	$.fn.ribbon = function( options )
	{
		var opts = $.extend( {}, $.fn.ribbon.defaults, options );
		var cache = {}, canvas, context, container, brush, painters, unpainters, timers, mouseX, mouseY;
		return this.each( function()
		{
			//start functionality
			container = $( this ).parent();
			canvas = this;
			context = this.getContext( '2d' );
			canvas.style.cursor = 'crosshair';
			$( this ).attr( "width", opts.screenWidth ).attr( "height", opts.screenHeight )
			painters = [];
			unpainters = [];
			timers = [];
			brush = init( this.context );
			canvas.addEventListener( 'mousemove', onWindowMouseMove, false );
			window.addEventListener( 'resize', onWindowResize, false );
			document.addEventListener( 'mouseout', onDocumentMouseOut, false );
			canvas.addEventListener( 'mouseover', onCanvasMouseOver, false );
			onWindowResize( null );
		} );
		function init()
		{
			mouseX = opts.screenWidth / 2;
			mouseY = opts.screenHeight / 2;
			for( var i = 0; i < opts.strokes; i++ )
			{
				var ease = Math.random() * 0.05 + opts.easing;
				painters.push( {
					dx: opts.screenWidth / 2,
					dy: opts.screenHeight / 2,
					ax: 0,
					ay: 0,
					div: 0.1,
					ease: ease
				} );
			}
			this.interval = setInterval( update, opts.refreshRate );
			function update()
			{
				var i;
				context.lineWidth = opts.brushSize;
				context.strokeStyle = "rgba(" + opts.color[ 0 ] + ", " + opts.color[ 1 ] + ", " + opts.color[ 2 ] + ", " + opts.brushPressure + ")";
				for( i = 0; i < painters.length; i++ )
				{
					context.beginPath();
					var dx = painters[ i ].dx;
					var dy = painters[ i ].dy;
					context.moveTo( dx, dy );
					var dx1 = painters[ i ].ax = (painters[ i ].ax + (painters[ i ].dx - mouseX) * painters[ i ].div) * painters[ i ].ease;
					painters[ i ].dx -= dx1;
					var dx2 = painters[ i ].dx;
					var dy1 = painters[ i ].ay = (painters[ i ].ay + (painters[ i ].dy - mouseY) * painters[ i ].div) * painters[ i ].ease;
					painters[ i ].dy -= dy1;
					var dy2 = painters[ i ].dy;
					context.lineTo( dx2, dy2 );
					context.stroke();
				}
			}

		}

		function destroy()
		{
			clearInterval( this.interval );
		}

		function strokestart( mouseX, mouseY )
		{
			mouseX = mouseX;
			mouseY = mouseY
			for( var i = 0; i < painters.length; i++ )
			{
				painters[ i ].dx = mouseX;
				painters[ i ].dy = mouseY;
			}
		}

		function stroke( mouseX, mouseY )
		{
			mouseX = mouseX;
			mouseY = mouseY;
		}
		function strokeEnd()
		{
			//this.destroy()
		}

		function onWindowMouseMove( event )
		{
			mouseX = event.clientX;
			mouseY = event.clientY;
		}

		function onWindowResize()
		{
			opts.screenWidth = window.innerWidth;
			opts.screenHeight = window.innerHeight;
		}

		function onDocumentMouseOut( event )
		{
			onCanvasMouseUp();
		}

		function onCanvasMouseOver( event )
		{
			strokestart( event.clientX, event.clientY );
			window.addEventListener( 'mousemove', onCanvasMouseMove, false );
			window.addEventListener( 'mouseup', onCanvasMouseUp, false );
		}

		function onCanvasMouseMove( event )
		{
			stroke( event.clientX, event.clientY );
		}

		function onCanvasMouseUp()
		{
			strokeEnd();
		}
	}
	$.fn.ribbon.defaults = {
		canvas: null,
		context: null,
		container: null,
		userAgent: $.browser,
		screenWidth: $( window ).width(),
		screenHeight: $( window ).height(),
		duration: 6000, // how long to keep the line there
		fadesteps: 10, // how many steps to fade the lines out by, reduce to optimize
		strokes: 20, // how many strokes to draw
		refreshRate: 30, // set this higher if performace is an issue directly affects easing
		easing: .7, // kind of "how loopy" higher= bigger loops
		brushSize: 2, // pixel width
		brushPressure: 1, // 1 by default but originally variable setting from wacom and touch device sensitivity
		color: [ 0, 0, 0 ], // color val RGB 0-255, 0-255, 0-255
		backgroundColor: [ 255, 255, 255 ], // color val RGB 0-255, 0-255, 0-25
		brush: null,
		mouseX: 0,
		mouseY: 0,
		i: 0
	}
})( jQuery );

