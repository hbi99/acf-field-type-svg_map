(function($){
	
	var svg_map = {
		init: function() {
			this.base = $('.field_type-svg_map:visible()');
			this.pane = this.base.find('.svgp-container:visible()');
			this.cont = this.base.find('.svgp-content:visible()');

			if (!this.base.length) return;

			this.pane.bind('mousedown', this.doEvent);
			this.base.on('click', '.nolink', this.doEvent);
			// mark active and slide into view
			this.doEvent('/highlight-marked/');
			this.doEvent('/make-active/');
			this.doEvent('/map-focus-point/');
			this.doEvent('/check-focus-cross/');
		},
		doEvent: function(event, el) {
			var root = svg_map,
				type = (typeof(event) === 'string')? event : event.type,
				pdim,
				dim,
				top,
				left;

			switch (type) {
				// native events
				case 'click':
					var cmd = this.getAttribute('href') || this.getAttribute('data-cmd');
					el = $(this);
					event.preventDefault();
					if (!el.hasClass('disabled')) {
						root.doEvent(cmd, el, event);
					}
					break;
				case 'mousedown':
					event.preventDefault();

					root.drag = {
						target: event.target,
						isMulti: root.pane.find('.button').hasClass('checked'),
						pdim: root.getDim(root.pane[0]),
						dim: root.getDim(root.cont[0]),
						clickX: event.clientX,
						clickY: event.clientY
					};
					root.isDraged = false;

					$(window).bind('mousemove mouseup', root.doEvent);
					break;
				case 'mousemove':
					if (!root.drag) return;

					root.isDraged = true;

					top = root.drag.top = root.drag.dim.t - root.drag.pdim.t + (event.clientY - root.drag.clickY);
					left = root.drag.left = root.drag.dim.l - root.drag.pdim.l + (event.clientX - root.drag.clickX);
					root.cont.css({
						'top': top +'px',
						'left': left +'px'
					});
					break;
				case 'mouseup':
					// update focus point
					root.doEvent('/update-focus-point/');
					if (root.isDraged) {
						// elastic behaviour
						top = Math.max(Math.min(root.drag.top, 0), root.drag.pdim.h - root.drag.dim.h + 5);
						left = Math.max(Math.min(root.drag.left, 0), root.drag.pdim.w - root.drag.dim.w);
						if (top !== root.drag.top || left !== root.drag.left) {
							root.cont.animate({
								'top': top +'px',
								'left': left +'px'
							});
						}
					} else if (root.drag.target.nodeName.toLowerCase() === 'polygon') {
						// if clicked el = polygon, make active
						var new_poly = $(root.drag.target),
							val_poly = [],
							polys;
						if (new_poly.attr('class') !== 'svgp_marked') {
							if (root.drag.isMulti) {

								if (new_poly.attr('class')) new_poly.removeAttr('class');
								else new_poly.attr({'class': 'svgp_active'})

								polys = root.cont.find('.svgp_active');
								for (var i=0, il=polys.length; i<il; i++) {
									val_poly.push(polys[i].getAttribute('points'));
								}

							} else {
								root.pane.find('.svgp_active').removeAttr('class');
								new_poly.attr({'class': 'svgp_active'})
								val_poly.push(new_poly.attr('points'));
							}
							root.pane.find('input[type=hidden]').val( JSON.stringify(val_poly) );
						}
					}
					// reset values
					root.isDraged =
					root.drag = false;
					$(window).unbind('mousemove mouseup', root.doEvent);
					break;
				// custom events
				case '/mark-multiple/':
					if (el.hasClass('checked')) {
						el.removeClass('checked');
					} else {
						el.addClass('checked');
					}
					break;
				case '/update-focus-point/':
					var focus_field = root.pane.find('input[type=hidden]');
					
					pdim = root.getDim(root.pane[0]);
					
					if (focus_field.attr('data-focus')) {
						top = root.cont[0].offsetTop - (pdim.h / 2);
						left = root.cont[0].offsetLeft - (pdim.w / 2);
						focus_field.val( top +','+ left );
						//console.log( focus_field.val() );
					}
					break;
				case '/map-focus-point/':
					var field = root.pane.find('input[type=hidden]'),
						fVal = field.val().split(',');
					if (field.attr('data-focus') === '0') return;

					pdim = root.getDim(root.pane[0]);

					root.cont.animate({
						'top': (+fVal[0] + (pdim.h/2) - 2) +'px',
						'left': (+fVal[1] + (pdim.w/2) - 2) +'px'
					}, 500);
					break;
				case '/highlight-marked/':
					if (!svp_marked) return;
					var svgmap = root.pane,
						marked = svp_marked,
						il = marked.length,
						i = 0,
						mArr,
						j, jl,
						polygon;
					for (; i<il; i++) {
						mArr = JSON.parse(marked[i].value);
						j = 0;
						jl = mArr.length;
						for (; j<jl; j++) {
							polygon = svgmap.find('[points="'+ mArr[j] +'"]');
							if (polygon.attr('class') === 'svgp_active') continue;
							polygon.attr({'class': 'svgp_marked'});
						}
					}
					break;
				case '/make-active/':
					var field = root.pane.find('input[type=hidden]'),
						paneDim = root.getDim(root.pane[0]),
						svgDim = root.getDim(root.pane.find('.svgp-content')[0]),
						top = (paneDim.h/2) - (svgDim.h/2),
						left = (paneDim.w/2) - (svgDim.w/2),
						points,
						first,
						svgEl;

					if (field.attr('data-focus') === '1') return;

					if (!field.val() || field.val() === '[]') {
						root.cont.animate({
							'top': top +'px',
							'left': left +'px'
						}, 500);
						return;
					}
					points = JSON.parse(field.val());
					first = points[0].split(' ')[0].split(',');
					top = (paneDim.h/2) - first[1];
					left = (paneDim.w/2) - first[0];
					//console.log(points);
					top = Math.max(Math.min((paneDim.h/2) - first[1], 0), paneDim.h - svgDim.h);
					left = Math.max(Math.min((paneDim.w/2) - first[0], 0), paneDim.w - svgDim.w);

					for (var i=0, il=points.length; i<il; i++) {
						svgEl = root.pane.find('*[points="'+ points[i] +'"]');
						svgEl.attr({'class': 'svgp_active'});
					}

					if (il > 1) {
						root.pane.find('.button').addClass('checked');
					}

					// slide into view
					root.cont.animate({
						'top': top +'px',
						'left': left +'px'
					}, 500);
					break;
				case '/check-focus-cross/':
					if (root.pane.find('.svgm-cross').length) {
						root.pane.addClass('focus-mode');
					}
					break;
			}
		},
		getDim: function(el, a, v) {
			a = a || 'nodeName';
			v = v || 'BODY';
			var p = {w:el.offsetWidth, h:el.offsetHeight, t:0, l:0, obj:el};
			while (el && el[a] != v && (el.getAttribute && el.getAttribute(a) != v)) {
				if (el == document.firstChild) return null;
				p.t += el.offsetTop - el.scrollTop;
				p.l += el.offsetLeft - el.scrollLeft;
				if (el.scrollWidth > el.offsetWidth && el.style.overflow == 'hidden') {
					p.w = Math.min(p.w, p.w-(p.w + p.l - el.offsetWidth - el.scrollLeft));
				}
				el = el.offsetParent;
			}
			return p;
		}
	};

	
	/*
	*  acf/setup_fields (ACF4)
	*
	*  This event is triggered when ACF adds any new elements to the DOM. 
	*
	*  @type	function
	*  @since	1.0.0
	*  @date	01/01/12
	*
	*  @param	event		e: an event object. This can be ignored
	*  @param	Element		postbox: An element which contains the new HTML
	*
	*  @return	n/a
	*/
	
	$(document).live('acf/setup_fields', function(e, postbox){
		
		$(postbox).find('.field[data-field_type="svg_map"]').each(function(){
			
			if ($(this).is(':visible')) {
				// initialize SVG_map
				svg_map.init();
			}
			
		});
	
	});


})(jQuery);
