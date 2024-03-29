/**
 * jquery.dlmenu.js v1.0.1
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var Modernizr = window.Modernizr, $body = $( 'body' );

	$.DLMenu = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.DLMenu.defaults = {
		// classes for the animation effects
		animationClasses : { classin : 'dl-animate-in-1', classout : 'dl-animate-out-1' },
		// callback: click a link that has a sub menu
		// el is the link element (li); name is the level name
		onLevelClick : function( el, name ) { return false; },
		// callback: click a link that does not have a sub menu
		// el is the link element (li); ev is the event obj
		onLinkClick : function( el, ev ) { return false; },
		// Change to "true" to use the active item as back link label.
		useActiveItemAsBackLabel: false,
		// Change to "true" to add a navigable link to the active item to its child
		// menu.
		useActiveItemAsLink: false
	};

	$.DLMenu.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.DLMenu.defaults, options );
			// cache some elements and initialize some variables
			this._config();

			var animEndEventNames = {
					'WebkitAnimation' : 'webkitAnimationEnd',
					'OAnimation' : 'oAnimationEnd',
					'msAnimation' : 'MSAnimationEnd',
					'animation' : 'animationend'
				},
				transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition' : 'transitionend',
					'OTransition' : 'oTransitionEnd',
					'msTransition' : 'MSTransitionEnd',
					'transition' : 'transitionend'
				};
			// animation end event name
			this.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ] + '.dlmenu';
			// transition end event name
			this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.dlmenu';
			// support for css animations and css transitions
			this.supportAnimations = Modernizr.cssanimations;
			this.supportTransitions = Modernizr.csstransitions;

			this._initEvents();

		},
		_config : function() {
			this.open = false;
			this.$trigger = this.$el.children( '.dl-trigger' );
			this.$menu = this.$el.children( 'ul.dl-menu' );
			this.$menuitems = this.$menu.find( 'li:not(.dl-back)' );
			
            if (shouldAdaptMenu()) {
                this.$el.find('ul.dl-submenu:not(ul.dl-menu > li > ul.dl-submenu)').prepend( '<li class="dl-back"><a href="#" i18n=\'back\'></a></li>' );
            } else {
                this.$el.find( 'ul.dl-submenu' ).prepend( '<li class="dl-back"><a href="#" i18n=\'back\'></a></li>' );
            }
            
			this.$back = this.$menu.find( 'li.dl-back' );

			// Set the label text for the back link.
			if (this.options.useActiveItemAsBackLabel) {
				this.$back.each(function() {
					var $this = $(this),
						parentLabel = $this.parents('li:first').find('a:first').text();

					$this.find('a').html(parentLabel);
				});
			}
			// If the active item should also be a clickable link, create one and put
			// it at the top of our menu.
			if (this.options.useActiveItemAsLink) {
				this.$el.find( 'ul.dl-submenu' ).prepend(function() {
					var parentli = $(this).parents('li:not(.dl-back):first').find('a:first');
					return '<li class="dl-parent"><a href="' + parentli.attr('href') + '">' + parentli.text() + '</a></li>';
				});
			}

		},
		_initEvents : function() {
			var self = this;
            
            if (shouldAdaptMenu()) {
                $body.children().on( 'click.dlmenu', function() {
                    self._resetMenu();
                });
            }

			this.$trigger.on( 'click.dlmenu', function() {
				if( self.open ) {
					self._closeMenu();
				}
				else {
					self._openMenu();
					// clicking somewhere else makes the menu close
					$body.off( 'click' ).children().on( 'click.dlmenu', function() {
						self._closeMenu() ;
					});
					
				}
				return false;
			} );

			this.$menuitems.on( 'click.dlmenu', function( event ) {

				event.stopPropagation();

				var $item = $(this),
					$submenu = $item.children( 'ul.dl-submenu' );

				// Only go to the next menu level if one exists AND the link isn't the
				// one we added specifically for navigating to parent item pages.
				if( ($submenu.length > 0) && !($(event.currentTarget).hasClass('dl-subviewopen'))) {
                    
                    if(shouldAdaptMenu()) {
                        var submenuStyle = { position : 'absolute', top: '50px', left: '0px' };
                        if ($submenu.parents('.dl-subviewopen').length > 0) {
                            submenuStyle.top = '0px';
                        }

                        $submenu.css(submenuStyle);                        
                        self._closeOpenedMenus($item);
                    }
                    
					var $flyin = $submenu.clone().css( 'opacity', 0 ).insertAfter( self.$menu ),
						onAnimationEndFn = function() {
							self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classout ).addClass( 'dl-subview' );
							$item.addClass( 'dl-subviewopen' ).parents( '.dl-subviewopen:first' ).removeClass( 'dl-subviewopen' ).addClass( 'dl-subview' );
							$flyin.remove();
						};

					setTimeout( function() {
                        if (shouldAdaptMenu()) {
                            onAnimationEndFn.call();
                        } else {
                            $flyin.addClass( self.options.animationClasses.classin );
                            self.$menu.addClass( self.options.animationClasses.classout );
                            if( self.supportAnimations ) {
                            	self.$menu.on( self.animEndEventName, onAnimationEndFn );
                            }
                            else {
                                onAnimationEndFn.call();
                            }
                        }
						self.options.onLevelClick( $item, $item.children( 'a:first' ).text() );
					} );

					return false;

				}
				else {
                    if (shouldAdaptMenu()) {
                        self._closeOpenedMenus();
                    } else {
                        self.closeMenu();
                    }
					self.options.onLinkClick( $item, event );
				}

			} );

			this.$back.on( 'click.dlmenu', function( event ) {

				var $this = $( this ),
					$submenu = $this.parents( 'ul.dl-submenu:first' ),
					$item = $submenu.parent(),
                    $flyin = undefined;

                if (shouldAdaptMenu()) {
                    $flyin = $submenu.clone();
                } else {
                    $flyin = $submenu.clone().insertAfter( self.$menu );
                }

				var onAnimationEndFn = function() {
					self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classin );
					$flyin.remove();
				};

				setTimeout( function() {
                        if (shouldAdaptMenu()) {
                            onAnimationEndFn.call();
                        } else {
                            $flyin.addClass( self.options.animationClasses.classout );
                        self.$menu.addClass( self.options.animationClasses.classin );
                        if( self.supportAnimations ) {
                            self.$menu.on( self.animEndEventName, onAnimationEndFn );
                        }
                        else {
                            onAnimationEndFn.call();
                        }
                    }

					$item.removeClass( 'dl-subviewopen' );

					var $subview = $this.parents( '.dl-subview:first' );
					if( $subview.is( 'li' ) ) {
						$subview.addClass( 'dl-subviewopen' );
					}
					$subview.removeClass( 'dl-subview' );
				} );

				return false;

			} );

		},
		closeMenu : function() {
			if( this.open ) {
				this._closeMenu();
			}
		},
		_closeMenu : function() {
			var self = this,
				onTransitionEndFn = function() {
					self.$menu.off( self.transEndEventName );
					self._resetMenu();
				};

			this.$menu.removeClass( 'dl-menuopen' );
			this.$menu.addClass( 'dl-menu-toggle' );
			this.$trigger.removeClass( 'dl-active' );

			if( this.supportTransitions ) {
				this.$menu.on( this.transEndEventName, onTransitionEndFn );
			}
			else {
				onTransitionEndFn.call();
			}

			this.open = false;
		},
		openMenu : function() {
			if( !this.open ) {
				this._openMenu();
			}
		},
		_openMenu : function() {
			var self = this;
			// clicking somewhere else makes the menu close
			$body.off( 'click' ).on( 'click.dlmenu', function() {
				self._closeMenu() ;
			} );
			this.$menu.addClass( 'dl-menuopen dl-menu-toggle' ).on( this.transEndEventName, function() {
				$( this ).removeClass( 'dl-menu-toggle' );
			} );
			this.$trigger.addClass( 'dl-active' );
			this.open = true;
		},
		// resets the menu to its original state (first level of options)
		_resetMenu : function() {
			this.$menu.removeClass( 'dl-subview' );
			this.$menuitems.removeClass( 'dl-subview dl-subviewopen' );
		},
        _closeOpenedMenus: function($item) {
            var opened = this.$menu.find('li.dl-subviewopen');
            if (opened.find($item).length == 0 ) {
                opened.removeClass('dl-subviewopen');
                opened.parents('.dl-subview').removeClass('dl-subview');
            }
        }
	};

    var shouldAdaptMenu = function() {
        return $(window).width() > 800;
    };
    
	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.dlmenu = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'dlmenu' );
				if ( !instance ) {
					logError( "cannot call methods on dlmenu prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for dlmenu instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		}
		else {
			this.each(function() {
				var instance = $.data( this, 'dlmenu' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'dlmenu', new $.DLMenu( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );