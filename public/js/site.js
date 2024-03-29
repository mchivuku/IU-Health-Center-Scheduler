/*! jQuery UI - v1.11.2 - 2015-01-28
 * http://jqueryui.com
 * Includes: core.js, widget.js, mouse.js, position.js, draggable.js, droppable.js, resizable.js, selectable.js, sortable.js, datepicker.js
 * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define([ "jquery" ], factory );
    } else {

        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {
    /*!
     * jQuery UI Core 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/category/ui-core/
     */


// $.ui might exist from components with no dependencies, e.g., $.ui.position
    $.ui = $.ui || {};

    $.extend( $.ui, {
        version: "1.11.2",

        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        }
    });

// plugins
    $.fn.extend({
        scrollParent: function( includeHidden ) {
            var position = this.css( "position" ),
                excludeStaticParent = position === "absolute",
                overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
                scrollParent = this.parents().filter( function() {
                    var parent = $( this );
                    if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                        return false;
                    }
                    return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
                }).eq( 0 );

            return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
        },

        uniqueId: (function() {
            var uuid = 0;

            return function() {
                return this.each(function() {
                    if ( !this.id ) {
                        this.id = "ui-id-" + ( ++uuid );
                    }
                });
            };
        })(),

        removeUniqueId: function() {
            return this.each(function() {
                if ( /^ui-id-\d+$/.test( this.id ) ) {
                    $( this ).removeAttr( "id" );
                }
            });
        }
    });

// selectors
    function focusable( element, isTabIndexNotNaN ) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ( "area" === nodeName ) {
            map = element.parentNode;
            mapName = map.name;
            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
            return !!img && visible( img );
        }
        return ( /input|select|textarea|button|object/.test( nodeName ) ?
            !element.disabled :
            "a" === nodeName ?
            element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
            // the element and all of its ancestors must be visible
        visible( element );
    }

    function visible( element ) {
        return $.expr.filters.visible( element ) &&
        !$( element ).parents().addBack().filter(function() {
            return $.css( this, "visibility" ) === "hidden";
        }).length;
    }

    $.extend( $.expr[ ":" ], {
        data: $.expr.createPseudo ?
            $.expr.createPseudo(function( dataName ) {
                return function( elem ) {
                    return !!$.data( elem, dataName );
                };
            }) :
            // support: jQuery <1.8
            function( elem, i, match ) {
                return !!$.data( elem, match[ 3 ] );
            },

        focusable: function( element ) {
            return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        },

        tabbable: function( element ) {
            var tabIndex = $.attr( element, "tabindex" ),
                isTabIndexNaN = isNaN( tabIndex );
            return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        }
    });

// support: jQuery <1.8
    if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
        $.each( [ "Width", "Height" ], function( i, name ) {
            var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
                type = name.toLowerCase(),
                orig = {
                    innerWidth: $.fn.innerWidth,
                    innerHeight: $.fn.innerHeight,
                    outerWidth: $.fn.outerWidth,
                    outerHeight: $.fn.outerHeight
                };

            function reduce( elem, size, border, margin ) {
                $.each( side, function() {
                    size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
                    if ( border ) {
                        size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
                    }
                    if ( margin ) {
                        size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
                    }
                });
                return size;
            }

            $.fn[ "inner" + name ] = function( size ) {
                if ( size === undefined ) {
                    return orig[ "inner" + name ].call( this );
                }

                return this.each(function() {
                    $( this ).css( type, reduce( this, size ) + "px" );
                });
            };

            $.fn[ "outer" + name] = function( size, margin ) {
                if ( typeof size !== "number" ) {
                    return orig[ "outer" + name ].call( this, size );
                }

                return this.each(function() {
                    $( this).css( type, reduce( this, size, true, margin ) + "px" );
                });
            };
        });
    }

// support: jQuery <1.8
    if ( !$.fn.addBack ) {
        $.fn.addBack = function( selector ) {
            return this.add( selector == null ?
                    this.prevObject : this.prevObject.filter( selector )
            );
        };
    }

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
    if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
        $.fn.removeData = (function( removeData ) {
            return function( key ) {
                if ( arguments.length ) {
                    return removeData.call( this, $.camelCase( key ) );
                } else {
                    return removeData.call( this );
                }
            };
        })( $.fn.removeData );
    }

// deprecated
    $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

    $.fn.extend({
        focus: (function( orig ) {
            return function( delay, fn ) {
                return typeof delay === "number" ?
                    this.each(function() {
                        var elem = this;
                        setTimeout(function() {
                            $( elem ).focus();
                            if ( fn ) {
                                fn.call( elem );
                            }
                        }, delay );
                    }) :
                    orig.apply( this, arguments );
            };
        })( $.fn.focus ),

        disableSelection: (function() {
            var eventType = "onselectstart" in document.createElement( "div" ) ?
                "selectstart" :
                "mousedown";

            return function() {
                return this.bind( eventType + ".ui-disableSelection", function( event ) {
                    event.preventDefault();
                });
            };
        })(),

        enableSelection: function() {
            return this.unbind( ".ui-disableSelection" );
        },

        zIndex: function( zIndex ) {
            if ( zIndex !== undefined ) {
                return this.css( "zIndex", zIndex );
            }

            if ( this.length ) {
                var elem = $( this[ 0 ] ), position, value;
                while ( elem.length && elem[ 0 ] !== document ) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css( "position" );
                    if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt( elem.css( "zIndex" ), 10 );
                        if ( !isNaN( value ) && value !== 0 ) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }

            return 0;
        }
    });

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
    $.ui.plugin = {
        add: function( module, option, set ) {
            var i,
                proto = $.ui[ module ].prototype;
            for ( i in set ) {
                proto.plugins[ i ] = proto.plugins[ i ] || [];
                proto.plugins[ i ].push( [ option, set[ i ] ] );
            }
        },
        call: function( instance, name, args, allowDisconnected ) {
            var i,
                set = instance.plugins[ name ];

            if ( !set ) {
                return;
            }

            if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
                return;
            }

            for ( i = 0; i < set.length; i++ ) {
                if ( instance.options[ set[ i ][ 0 ] ] ) {
                    set[ i ][ 1 ].apply( instance.element, args );
                }
            }
        }
    };


    /*!
     * jQuery UI Widget 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/jQuery.widget/
     */


    var widget_uuid = 0,
        widget_slice = Array.prototype.slice;

    $.cleanData = (function( orig ) {
        return function( elems ) {
            var events, elem, i;
            for ( i = 0; (elem = elems[i]) != null; i++ ) {
                try {

                    // Only trigger remove when necessary to save time
                    events = $._data( elem, "events" );
                    if ( events && events.remove ) {
                        $( elem ).triggerHandler( "remove" );
                    }

                    // http://bugs.jquery.com/ticket/8235
                } catch ( e ) {}
            }
            orig( elems );
        };
    })( $.cleanData );

    $.widget = function( name, base, prototype ) {
        var fullName, existingConstructor, constructor, basePrototype,
        // proxiedPrototype allows the provided prototype to remain unmodified
        // so that it can be used as a mixin for multiple widgets (#8876)
            proxiedPrototype = {},
            namespace = name.split( "." )[ 0 ];

        name = name.split( "." )[ 1 ];
        fullName = namespace + "-" + name;

        if ( !prototype ) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
            return !!$.data( elem, fullName );
        };

        $[ namespace ] = $[ namespace ] || {};
        existingConstructor = $[ namespace ][ name ];
        constructor = $[ namespace ][ name ] = function( options, element ) {
            // allow instantiation without "new" keyword
            if ( !this._createWidget ) {
                return new constructor( options, element );
            }

            // allow instantiation without initializing for simple inheritance
            // must use "new" keyword (the code above always passes args)
            if ( arguments.length ) {
                this._createWidget( options, element );
            }
        };
        // extend with the existing constructor to carry over any static properties
        $.extend( constructor, existingConstructor, {
            version: prototype.version,
            // copy the object used to create the prototype in case we need to
            // redefine the widget later
            _proto: $.extend( {}, prototype ),
            // track widgets that inherit from this widget in case this widget is
            // redefined after a widget inherits from it
            _childConstructors: []
        });

        basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        basePrototype.options = $.widget.extend( {}, basePrototype.options );
        $.each( prototype, function( prop, value ) {
            if ( !$.isFunction( value ) ) {
                proxiedPrototype[ prop ] = value;
                return;
            }
            proxiedPrototype[ prop ] = (function() {
                var _super = function() {
                        return base.prototype[ prop ].apply( this, arguments );
                    },
                    _superApply = function( args ) {
                        return base.prototype[ prop ].apply( this, args );
                    };
                return function() {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply( this, arguments );

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                };
            })();
        });
        constructor.prototype = $.widget.extend( basePrototype, {
            // TODO: remove support for widgetEventPrefix
            // always use the name + a colon as the prefix, e.g., draggable:start
            // don't prefix for widgets that aren't DOM-based
            widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
        }, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        // If this widget is being redefined then we need to find all widgets that
        // are inheriting from it and redefine all of them so that they inherit from
        // the new version of this widget. We're essentially trying to replace one
        // level in the prototype chain.
        if ( existingConstructor ) {
            $.each( existingConstructor._childConstructors, function( i, child ) {
                var childPrototype = child.prototype;

                // redefine the child widget using the same prototype that was
                // originally used, but inherit from the new version of the base
                $.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
            });
            // remove the list of existing child constructors from the old constructor
            // so the old child constructors can be garbage collected
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push( constructor );
        }

        $.widget.bridge( name, constructor );

        return constructor;
    };

    $.widget.extend = function( target ) {
        var input = widget_slice.call( arguments, 1 ),
            inputIndex = 0,
            inputLength = input.length,
            key,
            value;
        for ( ; inputIndex < inputLength; inputIndex++ ) {
            for ( key in input[ inputIndex ] ) {
                value = input[ inputIndex ][ key ];
                if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
                    // Clone objects
                    if ( $.isPlainObject( value ) ) {
                        target[ key ] = $.isPlainObject( target[ key ] ) ?
                            $.widget.extend( {}, target[ key ], value ) :
                            // Don't extend strings, arrays, etc. with objects
                            $.widget.extend( {}, value );
                        // Copy everything else by reference
                    } else {
                        target[ key ] = value;
                    }
                }
            }
        }
        return target;
    };

    $.widget.bridge = function( name, object ) {
        var fullName = object.prototype.widgetFullName || name;
        $.fn[ name ] = function( options ) {
            var isMethodCall = typeof options === "string",
                args = widget_slice.call( arguments, 1 ),
                returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ?
                $.widget.extend.apply( null, [ options ].concat(args) ) :
                options;

            if ( isMethodCall ) {
                this.each(function() {
                    var methodValue,
                        instance = $.data( this, fullName );
                    if ( options === "instance" ) {
                        returnValue = instance;
                        return false;
                    }
                    if ( !instance ) {
                        return $.error( "cannot call methods on " + name + " prior to initialization; " +
                        "attempted to call method '" + options + "'" );
                    }
                    if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
                        return $.error( "no such method '" + options + "' for " + name + " widget instance" );
                    }
                    methodValue = instance[ options ].apply( instance, args );
                    if ( methodValue !== instance && methodValue !== undefined ) {
                        returnValue = methodValue && methodValue.jquery ?
                            returnValue.pushStack( methodValue.get() ) :
                            methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function() {
                    var instance = $.data( this, fullName );
                    if ( instance ) {
                        instance.option( options || {} );
                        if ( instance._init ) {
                            instance._init();
                        }
                    } else {
                        $.data( this, fullName, new object( options, this ) );
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function( /* options, element */ ) {};
    $.Widget._childConstructors = [];

    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            disabled: false,

            // callbacks
            create: null
        },
        _createWidget: function( options, element ) {
            element = $( element || this.defaultElement || this )[ 0 ];
            this.element = $( element );
            this.uuid = widget_uuid++;
            this.eventNamespace = "." + this.widgetName + this.uuid;

            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();

            if ( element !== this ) {
                $.data( element, this.widgetFullName, this );
                this._on( true, this.element, {
                    remove: function( event ) {
                        if ( event.target === element ) {
                            this.destroy();
                        }
                    }
                });
                this.document = $( element.style ?
                    // element within the document
                    element.ownerDocument :
                    // element is window or document
                element.document || element );
                this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
            }

            this.options = $.widget.extend( {},
                this.options,
                this._getCreateOptions(),
                options );

            this._create();
            this._trigger( "create", null, this._getCreateEventData() );
            this._init();
        },
        _getCreateOptions: $.noop,
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop,

        destroy: function() {
            this._destroy();
            // we can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            this.element
                .unbind( this.eventNamespace )
                .removeData( this.widgetFullName )
                // support: jquery <1.6.3
                // http://bugs.jquery.com/ticket/9413
                .removeData( $.camelCase( this.widgetFullName ) );
            this.widget()
                .unbind( this.eventNamespace )
                .removeAttr( "aria-disabled" )
                .removeClass(
                this.widgetFullName + "-disabled " +
                "ui-state-disabled" );

            // clean up events and states
            this.bindings.unbind( this.eventNamespace );
            this.hoverable.removeClass( "ui-state-hover" );
            this.focusable.removeClass( "ui-state-focus" );
        },
        _destroy: $.noop,

        widget: function() {
            return this.element;
        },

        option: function( key, value ) {
            var options = key,
                parts,
                curOption,
                i;

            if ( arguments.length === 0 ) {
                // don't return a reference to the internal hash
                return $.widget.extend( {}, this.options );
            }

            if ( typeof key === "string" ) {
                // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                options = {};
                parts = key.split( "." );
                key = parts.shift();
                if ( parts.length ) {
                    curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
                    for ( i = 0; i < parts.length - 1; i++ ) {
                        curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                        curOption = curOption[ parts[ i ] ];
                    }
                    key = parts.pop();
                    if ( arguments.length === 1 ) {
                        return curOption[ key ] === undefined ? null : curOption[ key ];
                    }
                    curOption[ key ] = value;
                } else {
                    if ( arguments.length === 1 ) {
                        return this.options[ key ] === undefined ? null : this.options[ key ];
                    }
                    options[ key ] = value;
                }
            }

            this._setOptions( options );

            return this;
        },
        _setOptions: function( options ) {
            var key;

            for ( key in options ) {
                this._setOption( key, options[ key ] );
            }

            return this;
        },
        _setOption: function( key, value ) {
            this.options[ key ] = value;

            if ( key === "disabled" ) {
                this.widget()
                    .toggleClass( this.widgetFullName + "-disabled", !!value );

                // If the widget is becoming disabled, then nothing is interactive
                if ( value ) {
                    this.hoverable.removeClass( "ui-state-hover" );
                    this.focusable.removeClass( "ui-state-focus" );
                }
            }

            return this;
        },

        enable: function() {
            return this._setOptions({ disabled: false });
        },
        disable: function() {
            return this._setOptions({ disabled: true });
        },

        _on: function( suppressDisabledCheck, element, handlers ) {
            var delegateElement,
                instance = this;

            // no suppressDisabledCheck flag, shuffle arguments
            if ( typeof suppressDisabledCheck !== "boolean" ) {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }

            // no element argument, shuffle and use this.element
            if ( !handlers ) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                element = delegateElement = $( element );
                this.bindings = this.bindings.add( element );
            }

            $.each( handlers, function( event, handler ) {
                function handlerProxy() {
                    // allow widgets to customize the disabled handling
                    // - disabled as an array instead of boolean
                    // - disabled class as method for disabling individual parts
                    if ( !suppressDisabledCheck &&
                        ( instance.options.disabled === true ||
                        $( this ).hasClass( "ui-state-disabled" ) ) ) {
                        return;
                    }
                    return ( typeof handler === "string" ? instance[ handler ] : handler )
                        .apply( instance, arguments );
                }

                // copy the guid so direct unbinding works
                if ( typeof handler !== "string" ) {
                    handlerProxy.guid = handler.guid =
                        handler.guid || handlerProxy.guid || $.guid++;
                }

                var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
                    eventName = match[1] + instance.eventNamespace,
                    selector = match[2];
                if ( selector ) {
                    delegateElement.delegate( selector, eventName, handlerProxy );
                } else {
                    element.bind( eventName, handlerProxy );
                }
            });
        },

        _off: function( element, eventName ) {
            eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
            this.eventNamespace;
            element.unbind( eventName ).undelegate( eventName );

            // Clear the stack to avoid memory leaks (#10056)
            this.bindings = $( this.bindings.not( element ).get() );
            this.focusable = $( this.focusable.not( element ).get() );
            this.hoverable = $( this.hoverable.not( element ).get() );
        },

        _delay: function( handler, delay ) {
            function handlerProxy() {
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }
            var instance = this;
            return setTimeout( handlerProxy, delay || 0 );
        },

        _hoverable: function( element ) {
            this.hoverable = this.hoverable.add( element );
            this._on( element, {
                mouseenter: function( event ) {
                    $( event.currentTarget ).addClass( "ui-state-hover" );
                },
                mouseleave: function( event ) {
                    $( event.currentTarget ).removeClass( "ui-state-hover" );
                }
            });
        },

        _focusable: function( element ) {
            this.focusable = this.focusable.add( element );
            this._on( element, {
                focusin: function( event ) {
                    $( event.currentTarget ).addClass( "ui-state-focus" );
                },
                focusout: function( event ) {
                    $( event.currentTarget ).removeClass( "ui-state-focus" );
                }
            });
        },

        _trigger: function( type, event, data ) {
            var prop, orig,
                callback = this.options[ type ];

            data = data || {};
            event = $.Event( event );
            event.type = ( type === this.widgetEventPrefix ?
                type :
            this.widgetEventPrefix + type ).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.element[ 0 ];

            // copy original event properties over to the new event
            orig = event.originalEvent;
            if ( orig ) {
                for ( prop in orig ) {
                    if ( !( prop in event ) ) {
                        event[ prop ] = orig[ prop ];
                    }
                }
            }

            this.element.trigger( event, data );
            return !( $.isFunction( callback ) &&
            callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
            event.isDefaultPrevented() );
        }
    };

    $.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
        $.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
            if ( typeof options === "string" ) {
                options = { effect: options };
            }
            var hasOptions,
                effectName = !options ?
                    method :
                    options === true || typeof options === "number" ?
                        defaultEffect :
                    options.effect || defaultEffect;
            options = options || {};
            if ( typeof options === "number" ) {
                options = { duration: options };
            }
            hasOptions = !$.isEmptyObject( options );
            options.complete = callback;
            if ( options.delay ) {
                element.delay( options.delay );
            }
            if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
                element[ method ]( options );
            } else if ( effectName !== method && element[ effectName ] ) {
                element[ effectName ]( options.duration, options.easing, callback );
            } else {
                element.queue(function( next ) {
                    $( this )[ method ]();
                    if ( callback ) {
                        callback.call( element[ 0 ] );
                    }
                    next();
                });
            }
        };
    });

    var widget = $.widget;


    /*!
     * jQuery UI Mouse 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/mouse/
     */


    var mouseHandled = false;
    $( document ).mouseup( function() {
        mouseHandled = false;
    });

    var mouse = $.widget("ui.mouse", {
        version: "1.11.2",
        options: {
            cancel: "input,textarea,button,select,option",
            distance: 1,
            delay: 0
        },
        _mouseInit: function() {
            var that = this;

            this.element
                .bind("mousedown." + this.widgetName, function(event) {
                    return that._mouseDown(event);
                })
                .bind("click." + this.widgetName, function(event) {
                    if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
                        $.removeData(event.target, that.widgetName + ".preventClickEvent");
                        event.stopImmediatePropagation();
                        return false;
                    }
                });

            this.started = false;
        },

        // TODO: make sure destroying one instance of mouse doesn't mess with
        // other instances of mouse
        _mouseDestroy: function() {
            this.element.unbind("." + this.widgetName);
            if ( this._mouseMoveDelegate ) {
                this.document
                    .unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
                    .unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
            }
        },

        _mouseDown: function(event) {
            // don't let more than one widget handle mouseStart
            if ( mouseHandled ) {
                return;
            }

            this._mouseMoved = false;

            // we may have missed mouseup (out of window)
            (this._mouseStarted && this._mouseUp(event));

            this._mouseDownEvent = event;

            var that = this,
                btnIsLeft = (event.which === 1),
            // event.target.nodeName works around a bug in IE 8 with
            // disabled inputs (#7620)
                elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }

            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function() {
                    that.mouseDelayMet = true;
                }, this.options.delay);
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }

            // Click event may never have fired (Gecko & Opera)
            if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
                $.removeData(event.target, this.widgetName + ".preventClickEvent");
            }

            // these delegates are required to keep context
            this._mouseMoveDelegate = function(event) {
                return that._mouseMove(event);
            };
            this._mouseUpDelegate = function(event) {
                return that._mouseUp(event);
            };

            this.document
                .bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
                .bind( "mouseup." + this.widgetName, this._mouseUpDelegate );

            event.preventDefault();

            mouseHandled = true;
            return true;
        },

        _mouseMove: function(event) {
            // Only check for mouseups outside the document if you've moved inside the document
            // at least once. This prevents the firing of mouseup in the case of IE<9, which will
            // fire a mousemove event if content is placed under the cursor. See #7778
            // Support: IE <9
            if ( this._mouseMoved ) {
                // IE mouseup check - mouseup happened when mouse was out of window
                if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
                    return this._mouseUp(event);

                    // Iframe mouseup check - mouseup occurred in another document
                } else if ( !event.which ) {
                    return this._mouseUp( event );
                }
            }

            if ( event.which || event.button ) {
                this._mouseMoved = true;
            }

            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault();
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted =
                    (this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
            }

            return !this._mouseStarted;
        },

        _mouseUp: function(event) {
            this.document
                .unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
                .unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );

            if (this._mouseStarted) {
                this._mouseStarted = false;

                if (event.target === this._mouseDownEvent.target) {
                    $.data(event.target, this.widgetName + ".preventClickEvent", true);
                }

                this._mouseStop(event);
            }

            mouseHandled = false;
            return false;
        },

        _mouseDistanceMet: function(event) {
            return (Math.max(
                Math.abs(this._mouseDownEvent.pageX - event.pageX),
                Math.abs(this._mouseDownEvent.pageY - event.pageY)
            ) >= this.options.distance
            );
        },

        _mouseDelayMet: function(/* event */) {
            return this.mouseDelayMet;
        },

        // These are placeholder methods, to be overriden by extending plugin
        _mouseStart: function(/* event */) {},
        _mouseDrag: function(/* event */) {},
        _mouseStop: function(/* event */) {},
        _mouseCapture: function(/* event */) { return true; }
    });


    /*!
     * jQuery UI Position 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/position/
     */

    (function() {

        $.ui = $.ui || {};

        var cachedScrollbarWidth, supportsOffsetFractions,
            max = Math.max,
            abs = Math.abs,
            round = Math.round,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/,
            _position = $.fn.position;

        function getOffsets( offsets, width, height ) {
            return [
                parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
                parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
            ];
        }

        function parseCss( element, property ) {
            return parseInt( $.css( element, property ), 10 ) || 0;
        }

        function getDimensions( elem ) {
            var raw = elem[0];
            if ( raw.nodeType === 9 ) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: { top: 0, left: 0 }
                };
            }
            if ( $.isWindow( raw ) ) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
                };
            }
            if ( raw.preventDefault ) {
                return {
                    width: 0,
                    height: 0,
                    offset: { top: raw.pageY, left: raw.pageX }
                };
            }
            return {
                width: elem.outerWidth(),
                height: elem.outerHeight(),
                offset: elem.offset()
            };
        }

        $.position = {
            scrollbarWidth: function() {
                if ( cachedScrollbarWidth !== undefined ) {
                    return cachedScrollbarWidth;
                }
                var w1, w2,
                    div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
                    innerDiv = div.children()[0];

                $( "body" ).append( div );
                w1 = innerDiv.offsetWidth;
                div.css( "overflow", "scroll" );

                w2 = innerDiv.offsetWidth;

                if ( w1 === w2 ) {
                    w2 = div[0].clientWidth;
                }

                div.remove();

                return (cachedScrollbarWidth = w1 - w2);
            },
            getScrollInfo: function( within ) {
                var overflowX = within.isWindow || within.isDocument ? "" :
                        within.element.css( "overflow-x" ),
                    overflowY = within.isWindow || within.isDocument ? "" :
                        within.element.css( "overflow-y" ),
                    hasOverflowX = overflowX === "scroll" ||
                        ( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
                    hasOverflowY = overflowY === "scroll" ||
                        ( overflowY === "auto" && within.height < within.element[0].scrollHeight );
                return {
                    width: hasOverflowY ? $.position.scrollbarWidth() : 0,
                    height: hasOverflowX ? $.position.scrollbarWidth() : 0
                };
            },
            getWithinInfo: function( element ) {
                var withinElement = $( element || window ),
                    isWindow = $.isWindow( withinElement[0] ),
                    isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
                return {
                    element: withinElement,
                    isWindow: isWindow,
                    isDocument: isDocument,
                    offset: withinElement.offset() || { left: 0, top: 0 },
                    scrollLeft: withinElement.scrollLeft(),
                    scrollTop: withinElement.scrollTop(),

                    // support: jQuery 1.6.x
                    // jQuery 1.6 doesn't support .outerWidth/Height() on documents or windows
                    width: isWindow || isDocument ? withinElement.width() : withinElement.outerWidth(),
                    height: isWindow || isDocument ? withinElement.height() : withinElement.outerHeight()
                };
            }
        };

        $.fn.position = function( options ) {
            if ( !options || !options.of ) {
                return _position.apply( this, arguments );
            }

            // make a copy, we don't want to modify arguments
            options = $.extend( {}, options );

            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
                target = $( options.of ),
                within = $.position.getWithinInfo( options.within ),
                scrollInfo = $.position.getScrollInfo( within ),
                collision = ( options.collision || "flip" ).split( " " ),
                offsets = {};

            dimensions = getDimensions( target );
            if ( target[0].preventDefault ) {
                // force left top to allow flipping
                options.at = "left top";
            }
            targetWidth = dimensions.width;
            targetHeight = dimensions.height;
            targetOffset = dimensions.offset;
            // clone to reuse original targetOffset later
            basePosition = $.extend( {}, targetOffset );

            // force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            $.each( [ "my", "at" ], function() {
                var pos = ( options[ this ] || "" ).split( " " ),
                    horizontalOffset,
                    verticalOffset;

                if ( pos.length === 1) {
                    pos = rhorizontal.test( pos[ 0 ] ) ?
                        pos.concat( [ "center" ] ) :
                        rvertical.test( pos[ 0 ] ) ?
                            [ "center" ].concat( pos ) :
                            [ "center", "center" ];
                }
                pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
                pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

                // calculate offsets
                horizontalOffset = roffset.exec( pos[ 0 ] );
                verticalOffset = roffset.exec( pos[ 1 ] );
                offsets[ this ] = [
                    horizontalOffset ? horizontalOffset[ 0 ] : 0,
                    verticalOffset ? verticalOffset[ 0 ] : 0
                ];

                // reduce to just the positions without the offsets
                options[ this ] = [
                    rposition.exec( pos[ 0 ] )[ 0 ],
                    rposition.exec( pos[ 1 ] )[ 0 ]
                ];
            });

            // normalize collision option
            if ( collision.length === 1 ) {
                collision[ 1 ] = collision[ 0 ];
            }

            if ( options.at[ 0 ] === "right" ) {
                basePosition.left += targetWidth;
            } else if ( options.at[ 0 ] === "center" ) {
                basePosition.left += targetWidth / 2;
            }

            if ( options.at[ 1 ] === "bottom" ) {
                basePosition.top += targetHeight;
            } else if ( options.at[ 1 ] === "center" ) {
                basePosition.top += targetHeight / 2;
            }

            atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
            basePosition.left += atOffset[ 0 ];
            basePosition.top += atOffset[ 1 ];

            return this.each(function() {
                var collisionPosition, using,
                    elem = $( this ),
                    elemWidth = elem.outerWidth(),
                    elemHeight = elem.outerHeight(),
                    marginLeft = parseCss( this, "marginLeft" ),
                    marginTop = parseCss( this, "marginTop" ),
                    collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
                    collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
                    position = $.extend( {}, basePosition ),
                    myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

                if ( options.my[ 0 ] === "right" ) {
                    position.left -= elemWidth;
                } else if ( options.my[ 0 ] === "center" ) {
                    position.left -= elemWidth / 2;
                }

                if ( options.my[ 1 ] === "bottom" ) {
                    position.top -= elemHeight;
                } else if ( options.my[ 1 ] === "center" ) {
                    position.top -= elemHeight / 2;
                }

                position.left += myOffset[ 0 ];
                position.top += myOffset[ 1 ];

                // if the browser doesn't support fractions, then round for consistent results
                if ( !supportsOffsetFractions ) {
                    position.left = round( position.left );
                    position.top = round( position.top );
                }

                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };

                $.each( [ "left", "top" ], function( i, dir ) {
                    if ( $.ui.position[ collision[ i ] ] ) {
                        $.ui.position[ collision[ i ] ][ dir ]( position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        });
                    }
                });

                if ( options.using ) {
                    // adds feedback as second argument to using callback, if present
                    using = function( props ) {
                        var left = targetOffset.left - position.left,
                            right = left + targetWidth - elemWidth,
                            top = targetOffset.top - position.top,
                            bottom = top + targetHeight - elemHeight,
                            feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                            };
                        if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
                            feedback.horizontal = "center";
                        }
                        if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
                            feedback.vertical = "middle";
                        }
                        if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
                            feedback.important = "horizontal";
                        } else {
                            feedback.important = "vertical";
                        }
                        options.using.call( this, props, feedback );
                    };
                }

                elem.offset( $.extend( position, { using: using } ) );
            });
        };

        $.ui.position = {
            fit: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                        outerWidth = within.width,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = withinOffset - collisionPosLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                        newOverRight;

                    // element is wider than within
                    if ( data.collisionWidth > outerWidth ) {
                        // element is initially over the left side of within
                        if ( overLeft > 0 && overRight <= 0 ) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                            position.left += overLeft - newOverRight;
                            // element is initially over right side of within
                        } else if ( overRight > 0 && overLeft <= 0 ) {
                            position.left = withinOffset;
                            // element is initially over both left and right sides of within
                        } else {
                            if ( overLeft > overRight ) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }
                        // too far left -> align with left edge
                    } else if ( overLeft > 0 ) {
                        position.left += overLeft;
                        // too far right -> align with right edge
                    } else if ( overRight > 0 ) {
                        position.left -= overRight;
                        // adjust based on position and margin
                    } else {
                        position.left = max( position.left - collisionPosLeft, position.left );
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                        outerHeight = data.within.height,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = withinOffset - collisionPosTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                        newOverBottom;

                    // element is taller than within
                    if ( data.collisionHeight > outerHeight ) {
                        // element is initially over the top of within
                        if ( overTop > 0 && overBottom <= 0 ) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                            position.top += overTop - newOverBottom;
                            // element is initially over bottom of within
                        } else if ( overBottom > 0 && overTop <= 0 ) {
                            position.top = withinOffset;
                            // element is initially over both top and bottom of within
                        } else {
                            if ( overTop > overBottom ) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }
                        // too far up -> align with top
                    } else if ( overTop > 0 ) {
                        position.top += overTop;
                        // too far down -> align with bottom edge
                    } else if ( overBottom > 0 ) {
                        position.top -= overBottom;
                        // adjust based on position and margin
                    } else {
                        position.top = max( position.top - collisionPosTop, position.top );
                    }
                }
            },
            flip: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.left + within.scrollLeft,
                        outerWidth = within.width,
                        offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = collisionPosLeft - offsetLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                        myOffset = data.my[ 0 ] === "left" ?
                            -data.elemWidth :
                            data.my[ 0 ] === "right" ?
                                data.elemWidth :
                                0,
                        atOffset = data.at[ 0 ] === "left" ?
                            data.targetWidth :
                            data.at[ 0 ] === "right" ?
                                -data.targetWidth :
                                0,
                        offset = -2 * data.offset[ 0 ],
                        newOverRight,
                        newOverLeft;

                    if ( overLeft < 0 ) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                        if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if ( overRight > 0 ) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                        if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.top + within.scrollTop,
                        outerHeight = within.height,
                        offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = collisionPosTop - offsetTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                        top = data.my[ 1 ] === "top",
                        myOffset = top ?
                            -data.elemHeight :
                            data.my[ 1 ] === "bottom" ?
                                data.elemHeight :
                                0,
                        atOffset = data.at[ 1 ] === "top" ?
                            data.targetHeight :
                            data.at[ 1 ] === "bottom" ?
                                -data.targetHeight :
                                0,
                        offset = -2 * data.offset[ 1 ],
                        newOverTop,
                        newOverBottom;
                    if ( overTop < 0 ) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                        if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if ( overBottom > 0 ) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                        if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function() {
                    $.ui.position.flip.left.apply( this, arguments );
                    $.ui.position.fit.left.apply( this, arguments );
                },
                top: function() {
                    $.ui.position.flip.top.apply( this, arguments );
                    $.ui.position.fit.top.apply( this, arguments );
                }
            }
        };

// fraction support test
        (function() {
            var testElement, testElementParent, testElementStyle, offsetLeft, i,
                body = document.getElementsByTagName( "body" )[ 0 ],
                div = document.createElement( "div" );

            //Create a "fake body" for testing based on method used in jQuery.support
            testElement = document.createElement( body ? "div" : "body" );
            testElementStyle = {
                visibility: "hidden",
                width: 0,
                height: 0,
                border: 0,
                margin: 0,
                background: "none"
            };
            if ( body ) {
                $.extend( testElementStyle, {
                    position: "absolute",
                    left: "-1000px",
                    top: "-1000px"
                });
            }
            for ( i in testElementStyle ) {
                testElement.style[ i ] = testElementStyle[ i ];
            }
            testElement.appendChild( div );
            testElementParent = body || document.documentElement;
            testElementParent.insertBefore( testElement, testElementParent.firstChild );

            div.style.cssText = "position: absolute; left: 10.7432222px;";

            offsetLeft = $( div ).offset().left;
            supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

            testElement.innerHTML = "";
            testElementParent.removeChild( testElement );
        })();

    })();

    var position = $.ui.position;


    /*!
     * jQuery UI Draggable 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/draggable/
     */


    $.widget("ui.draggable", $.ui.mouse, {
        version: "1.11.2",
        widgetEventPrefix: "drag",
        options: {
            addClasses: true,
            appendTo: "parent",
            axis: false,
            connectToSortable: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            grid: false,
            handle: false,
            helper: "original",
            iframeFix: false,
            opacity: false,
            refreshPositions: false,
            revert: false,
            revertDuration: 500,
            scope: "default",
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            snap: false,
            snapMode: "both",
            snapTolerance: 20,
            stack: false,
            zIndex: false,

            // callbacks
            drag: null,
            start: null,
            stop: null
        },
        _create: function() {

            if ( this.options.helper === "original" ) {
                this._setPositionRelative();
            }
            if (this.options.addClasses){
                this.element.addClass("ui-draggable");
            }
            if (this.options.disabled){
                this.element.addClass("ui-draggable-disabled");
            }
            this._setHandleClassName();

            this._mouseInit();
        },

        _setOption: function( key, value ) {
            this._super( key, value );
            if ( key === "handle" ) {
                this._removeHandleClassName();
                this._setHandleClassName();
            }
        },

        _destroy: function() {
            if ( ( this.helper || this.element ).is( ".ui-draggable-dragging" ) ) {
                this.destroyOnClear = true;
                return;
            }
            this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
            this._removeHandleClassName();
            this._mouseDestroy();
        },

        _mouseCapture: function(event) {
            var o = this.options;

            this._blurActiveElement( event );

            // among others, prevent a drag on a resizable-handle
            if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
                return false;
            }

            //Quit if we're not on a valid handle
            this.handle = this._getHandle(event);
            if (!this.handle) {
                return false;
            }

            this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );

            return true;

        },

        _blockFrames: function( selector ) {
            this.iframeBlocks = this.document.find( selector ).map(function() {
                var iframe = $( this );

                return $( "<div>" )
                    .css( "position", "absolute" )
                    .appendTo( iframe.parent() )
                    .outerWidth( iframe.outerWidth() )
                    .outerHeight( iframe.outerHeight() )
                    .offset( iframe.offset() )[ 0 ];
            });
        },

        _unblockFrames: function() {
            if ( this.iframeBlocks ) {
                this.iframeBlocks.remove();
                delete this.iframeBlocks;
            }
        },

        _blurActiveElement: function( event ) {
            var document = this.document[ 0 ];

            // Only need to blur if the event occurred on the draggable itself, see #10527
            if ( !this.handleElement.is( event.target ) ) {
                return;
            }

            // support: IE9
            // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
            try {

                // Support: IE9, IE10
                // If the <body> is blurred, IE will switch windows, see #9520
                if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== "body" ) {

                    // Blur any element that currently has focus, see #4261
                    $( document.activeElement ).blur();
                }
            } catch ( error ) {}
        },

        _mouseStart: function(event) {

            var o = this.options;

            //Create and append the visible helper
            this.helper = this._createHelper(event);

            this.helper.addClass("ui-draggable-dragging");

            //Cache the helper size
            this._cacheHelperProportions();

            //If ddmanager is used for droppables, set the global draggable
            if ($.ui.ddmanager) {
                $.ui.ddmanager.current = this;
            }

            /*
             * - Position generation -
             * This block generates everything position related - it's the core of draggables.
             */

            //Cache the margins of the original element
            this._cacheMargins();

            //Store the helper's css position
            this.cssPosition = this.helper.css( "position" );
            this.scrollParent = this.helper.scrollParent( true );
            this.offsetParent = this.helper.offsetParent();
            this.hasFixedAncestor = this.helper.parents().filter(function() {
                return $( this ).css( "position" ) === "fixed";
            }).length > 0;

            //The element's absolute position on the page minus margins
            this.positionAbs = this.element.offset();
            this._refreshOffsets( event );

            //Generate the original position
            this.originalPosition = this.position = this._generatePosition( event, false );
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;

            //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

            //Set a containment if given in the options
            this._setContainment();

            //Trigger event + callbacks
            if (this._trigger("start", event) === false) {
                this._clear();
                return false;
            }

            //Recache the helper size
            this._cacheHelperProportions();

            //Prepare the droppable offsets
            if ($.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(this, event);
            }

            // Reset helper's right/bottom css if they're set and set explicit width/height instead
            // as this prevents resizing of elements with right/bottom set (see #7772)
            this._normalizeRightBottom();

            this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

            //If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
            if ( $.ui.ddmanager ) {
                $.ui.ddmanager.dragStart(this, event);
            }

            return true;
        },

        _refreshOffsets: function( event ) {
            this.offset = {
                top: this.positionAbs.top - this.margins.top,
                left: this.positionAbs.left - this.margins.left,
                scroll: false,
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            };

            this.offset.click = {
                left: event.pageX - this.offset.left,
                top: event.pageY - this.offset.top
            };
        },

        _mouseDrag: function(event, noPropagation) {
            // reset any necessary cached properties (see #5009)
            if ( this.hasFixedAncestor ) {
                this.offset.parent = this._getParentOffset();
            }

            //Compute the helpers position
            this.position = this._generatePosition( event, true );
            this.positionAbs = this._convertPositionTo("absolute");

            //Call plugins and callbacks and use the resulting position if something is returned
            if (!noPropagation) {
                var ui = this._uiHash();
                if (this._trigger("drag", event, ui) === false) {
                    this._mouseUp({});
                    return false;
                }
                this.position = ui.position;
            }

            this.helper[ 0 ].style.left = this.position.left + "px";
            this.helper[ 0 ].style.top = this.position.top + "px";

            if ($.ui.ddmanager) {
                $.ui.ddmanager.drag(this, event);
            }

            return false;
        },

        _mouseStop: function(event) {

            //If we are using droppables, inform the manager about the drop
            var that = this,
                dropped = false;
            if ($.ui.ddmanager && !this.options.dropBehaviour) {
                dropped = $.ui.ddmanager.drop(this, event);
            }

            //if a drop comes from outside (a sortable)
            if (this.dropped) {
                dropped = this.dropped;
                this.dropped = false;
            }

            if ((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
                $(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
                    if (that._trigger("stop", event) !== false) {
                        that._clear();
                    }
                });
            } else {
                if (this._trigger("stop", event) !== false) {
                    this._clear();
                }
            }

            return false;
        },

        _mouseUp: function( event ) {
            this._unblockFrames();

            //If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
            if ( $.ui.ddmanager ) {
                $.ui.ddmanager.dragStop(this, event);
            }

            // Only need to focus if the event occurred on the draggable itself, see #10527
            if ( this.handleElement.is( event.target ) ) {
                // The interaction is over; whether or not the click resulted in a drag, focus the element
                this.element.focus();
            }

            return $.ui.mouse.prototype._mouseUp.call(this, event);
        },

        cancel: function() {

            if (this.helper.is(".ui-draggable-dragging")) {
                this._mouseUp({});
            } else {
                this._clear();
            }

            return this;

        },

        _getHandle: function(event) {
            return this.options.handle ?
                !!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
                true;
        },

        _setHandleClassName: function() {
            this.handleElement = this.options.handle ?
                this.element.find( this.options.handle ) : this.element;
            this.handleElement.addClass( "ui-draggable-handle" );
        },

        _removeHandleClassName: function() {
            this.handleElement.removeClass( "ui-draggable-handle" );
        },

        _createHelper: function(event) {

            var o = this.options,
                helperIsFunction = $.isFunction( o.helper ),
                helper = helperIsFunction ?
                    $( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
                    ( o.helper === "clone" ?
                        this.element.clone().removeAttr( "id" ) :
                        this.element );

            if (!helper.parents("body").length) {
                helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
            }

            // http://bugs.jqueryui.com/ticket/9446
            // a helper function can return the original element
            // which wouldn't have been set to relative in _create
            if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
                this._setPositionRelative();
            }

            if (helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
                helper.css("position", "absolute");
            }

            return helper;

        },

        _setPositionRelative: function() {
            if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
                this.element[ 0 ].style.position = "relative";
            }
        },

        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj === "string") {
                obj = obj.split(" ");
            }
            if ($.isArray(obj)) {
                obj = { left: +obj[0], top: +obj[1] || 0 };
            }
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _isRootNode: function( element ) {
            return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
        },

        _getParentOffset: function() {

            //Get the offsetParent and cache its position
            var po = this.offsetParent.offset(),
                document = this.document[ 0 ];

            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
                po = { top: 0, left: 0 };
            }

            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            };

        },

        _getRelativeOffset: function() {
            if ( this.cssPosition !== "relative" ) {
                return { top: 0, left: 0 };
            }

            var p = this.element.position(),
                scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

            return {
                top: p.top - ( parseInt(this.helper.css( "top" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
                left: p.left - ( parseInt(this.helper.css( "left" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
            };

        },

        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.element.css("marginLeft"), 10) || 0),
                top: (parseInt(this.element.css("marginTop"), 10) || 0),
                right: (parseInt(this.element.css("marginRight"), 10) || 0),
                bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
            };
        },

        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment: function() {

            var isUserScrollable, c, ce,
                o = this.options,
                document = this.document[ 0 ];

            this.relativeContainer = null;

            if ( !o.containment ) {
                this.containment = null;
                return;
            }

            if ( o.containment === "window" ) {
                this.containment = [
                    $( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
                    $( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
                    $( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
                    $( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
                ];
                return;
            }

            if ( o.containment === "document") {
                this.containment = [
                    0,
                    0,
                    $( document ).width() - this.helperProportions.width - this.margins.left,
                    ( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
                ];
                return;
            }

            if ( o.containment.constructor === Array ) {
                this.containment = o.containment;
                return;
            }

            if ( o.containment === "parent" ) {
                o.containment = this.helper[ 0 ].parentNode;
            }

            c = $( o.containment );
            ce = c[ 0 ];

            if ( !ce ) {
                return;
            }

            isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );

            this.containment = [
                ( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
                ( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
                ( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
                ( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
                ( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
                this.helperProportions.width -
                this.margins.left -
                this.margins.right,
                ( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
                ( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
                ( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
                this.helperProportions.height -
                this.margins.top -
                this.margins.bottom
            ];
            this.relativeContainer = c;
        },

        _convertPositionTo: function(d, pos) {

            if (!pos) {
                pos = this.position;
            }

            var mod = d === "absolute" ? 1 : -1,
                scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

            return {
                top: (
                pos.top	+																// The absolute mouse position
                this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod)
                ),
                left: (
                pos.left +																// The absolute mouse position
                this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod)
                )
            };

        },

        _generatePosition: function( event, constrainPosition ) {

            var containment, co, top, left,
                o = this.options,
                scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
                pageX = event.pageX,
                pageY = event.pageY;

            // Cache the scroll
            if ( !scrollIsRootNode || !this.offset.scroll ) {
                this.offset.scroll = {
                    top: this.scrollParent.scrollTop(),
                    left: this.scrollParent.scrollLeft()
                };
            }

            /*
             * - Position constraining -
             * Constrain the position to a mix of grid, containment.
             */

            // If we are not dragging yet, we won't check for options
            if ( constrainPosition ) {
                if ( this.containment ) {
                    if ( this.relativeContainer ){
                        co = this.relativeContainer.offset();
                        containment = [
                            this.containment[ 0 ] + co.left,
                            this.containment[ 1 ] + co.top,
                            this.containment[ 2 ] + co.left,
                            this.containment[ 3 ] + co.top
                        ];
                    } else {
                        containment = this.containment;
                    }

                    if (event.pageX - this.offset.click.left < containment[0]) {
                        pageX = containment[0] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top < containment[1]) {
                        pageY = containment[1] + this.offset.click.top;
                    }
                    if (event.pageX - this.offset.click.left > containment[2]) {
                        pageX = containment[2] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top > containment[3]) {
                        pageY = containment[3] + this.offset.click.top;
                    }
                }

                if (o.grid) {
                    //Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
                    top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
                    pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

                    left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
                    pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }

                if ( o.axis === "y" ) {
                    pageX = this.originalPageX;
                }

                if ( o.axis === "x" ) {
                    pageY = this.originalPageY;
                }
            }

            return {
                top: (
                pageY -																	// The absolute mouse position
                this.offset.click.top	-												// Click offset (relative to the element)
                this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
                ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
                ),
                left: (
                pageX -																	// The absolute mouse position
                this.offset.click.left -												// Click offset (relative to the element)
                this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
                ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
                )
            };

        },

        _clear: function() {
            this.helper.removeClass("ui-draggable-dragging");
            if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
                this.helper.remove();
            }
            this.helper = null;
            this.cancelHelperRemoval = false;
            if ( this.destroyOnClear ) {
                this.destroy();
            }
        },

        _normalizeRightBottom: function() {
            if ( this.options.axis !== "y" && this.helper.css( "right" ) !== "auto" ) {
                this.helper.width( this.helper.width() );
                this.helper.css( "right", "auto" );
            }
            if ( this.options.axis !== "x" && this.helper.css( "bottom" ) !== "auto" ) {
                this.helper.height( this.helper.height() );
                this.helper.css( "bottom", "auto" );
            }
        },

        // From now on bulk stuff - mainly helpers

        _trigger: function( type, event, ui ) {
            ui = ui || this._uiHash();
            $.ui.plugin.call( this, type, [ event, ui, this ], true );

            // Absolute position and offset (see #6884 ) have to be recalculated after plugins
            if ( /^(drag|start|stop)/.test( type ) ) {
                this.positionAbs = this._convertPositionTo( "absolute" );
                ui.offset = this.positionAbs;
            }
            return $.Widget.prototype._trigger.call( this, type, event, ui );
        },

        plugins: {},

        _uiHash: function() {
            return {
                helper: this.helper,
                position: this.position,
                originalPosition: this.originalPosition,
                offset: this.positionAbs
            };
        }

    });

    $.ui.plugin.add( "draggable", "connectToSortable", {
        start: function( event, ui, draggable ) {
            var uiSortable = $.extend( {}, ui, {
                item: draggable.element
            });

            draggable.sortables = [];
            $( draggable.options.connectToSortable ).each(function() {
                var sortable = $( this ).sortable( "instance" );

                if ( sortable && !sortable.options.disabled ) {
                    draggable.sortables.push( sortable );

                    // refreshPositions is called at drag start to refresh the containerCache
                    // which is used in drag. This ensures it's initialized and synchronized
                    // with any changes that might have happened on the page since initialization.
                    sortable.refreshPositions();
                    sortable._trigger("activate", event, uiSortable);
                }
            });
        },
        stop: function( event, ui, draggable ) {
            var uiSortable = $.extend( {}, ui, {
                item: draggable.element
            });

            draggable.cancelHelperRemoval = false;

            $.each( draggable.sortables, function() {
                var sortable = this;

                if ( sortable.isOver ) {
                    sortable.isOver = 0;

                    // Allow this sortable to handle removing the helper
                    draggable.cancelHelperRemoval = true;
                    sortable.cancelHelperRemoval = false;

                    // Use _storedCSS To restore properties in the sortable,
                    // as this also handles revert (#9675) since the draggable
                    // may have modified them in unexpected ways (#8809)
                    sortable._storedCSS = {
                        position: sortable.placeholder.css( "position" ),
                        top: sortable.placeholder.css( "top" ),
                        left: sortable.placeholder.css( "left" )
                    };

                    sortable._mouseStop(event);

                    // Once drag has ended, the sortable should return to using
                    // its original helper, not the shared helper from draggable
                    sortable.options.helper = sortable.options._helper;
                } else {
                    // Prevent this Sortable from removing the helper.
                    // However, don't set the draggable to remove the helper
                    // either as another connected Sortable may yet handle the removal.
                    sortable.cancelHelperRemoval = true;

                    sortable._trigger( "deactivate", event, uiSortable );
                }
            });
        },
        drag: function( event, ui, draggable ) {
            $.each( draggable.sortables, function() {
                var innermostIntersecting = false,
                    sortable = this;

                // Copy over variables that sortable's _intersectsWith uses
                sortable.positionAbs = draggable.positionAbs;
                sortable.helperProportions = draggable.helperProportions;
                sortable.offset.click = draggable.offset.click;

                if ( sortable._intersectsWith( sortable.containerCache ) ) {
                    innermostIntersecting = true;

                    $.each( draggable.sortables, function() {
                        // Copy over variables that sortable's _intersectsWith uses
                        this.positionAbs = draggable.positionAbs;
                        this.helperProportions = draggable.helperProportions;
                        this.offset.click = draggable.offset.click;

                        if ( this !== sortable &&
                            this._intersectsWith( this.containerCache ) &&
                            $.contains( sortable.element[ 0 ], this.element[ 0 ] ) ) {
                            innermostIntersecting = false;
                        }

                        return innermostIntersecting;
                    });
                }

                if ( innermostIntersecting ) {
                    // If it intersects, we use a little isOver variable and set it once,
                    // so that the move-in stuff gets fired only once.
                    if ( !sortable.isOver ) {
                        sortable.isOver = 1;

                        sortable.currentItem = ui.helper
                            .appendTo( sortable.element )
                            .data( "ui-sortable-item", true );

                        // Store helper option to later restore it
                        sortable.options._helper = sortable.options.helper;

                        sortable.options.helper = function() {
                            return ui.helper[ 0 ];
                        };

                        // Fire the start events of the sortable with our passed browser event,
                        // and our own helper (so it doesn't create a new one)
                        event.target = sortable.currentItem[ 0 ];
                        sortable._mouseCapture( event, true );
                        sortable._mouseStart( event, true, true );

                        // Because the browser event is way off the new appended portlet,
                        // modify necessary variables to reflect the changes
                        sortable.offset.click.top = draggable.offset.click.top;
                        sortable.offset.click.left = draggable.offset.click.left;
                        sortable.offset.parent.left -= draggable.offset.parent.left -
                        sortable.offset.parent.left;
                        sortable.offset.parent.top -= draggable.offset.parent.top -
                        sortable.offset.parent.top;

                        draggable._trigger( "toSortable", event );

                        // Inform draggable that the helper is in a valid drop zone,
                        // used solely in the revert option to handle "valid/invalid".
                        draggable.dropped = sortable.element;

                        // Need to refreshPositions of all sortables in the case that
                        // adding to one sortable changes the location of the other sortables (#9675)
                        $.each( draggable.sortables, function() {
                            this.refreshPositions();
                        });

                        // hack so receive/update callbacks work (mostly)
                        draggable.currentItem = draggable.element;
                        sortable.fromOutside = draggable;
                    }

                    if ( sortable.currentItem ) {
                        sortable._mouseDrag( event );
                        // Copy the sortable's position because the draggable's can potentially reflect
                        // a relative position, while sortable is always absolute, which the dragged
                        // element has now become. (#8809)
                        ui.position = sortable.position;
                    }
                } else {
                    // If it doesn't intersect with the sortable, and it intersected before,
                    // we fake the drag stop of the sortable, but make sure it doesn't remove
                    // the helper by using cancelHelperRemoval.
                    if ( sortable.isOver ) {

                        sortable.isOver = 0;
                        sortable.cancelHelperRemoval = true;

                        // Calling sortable's mouseStop would trigger a revert,
                        // so revert must be temporarily false until after mouseStop is called.
                        sortable.options._revert = sortable.options.revert;
                        sortable.options.revert = false;

                        sortable._trigger( "out", event, sortable._uiHash( sortable ) );
                        sortable._mouseStop( event, true );

                        // restore sortable behaviors that were modfied
                        // when the draggable entered the sortable area (#9481)
                        sortable.options.revert = sortable.options._revert;
                        sortable.options.helper = sortable.options._helper;

                        if ( sortable.placeholder ) {
                            sortable.placeholder.remove();
                        }

                        // Recalculate the draggable's offset considering the sortable
                        // may have modified them in unexpected ways (#8809)
                        draggable._refreshOffsets( event );
                        ui.position = draggable._generatePosition( event, true );

                        draggable._trigger( "fromSortable", event );

                        // Inform draggable that the helper is no longer in a valid drop zone
                        draggable.dropped = false;

                        // Need to refreshPositions of all sortables just in case removing
                        // from one sortable changes the location of other sortables (#9675)
                        $.each( draggable.sortables, function() {
                            this.refreshPositions();
                        });
                    }
                }
            });
        }
    });

    $.ui.plugin.add("draggable", "cursor", {
        start: function( event, ui, instance ) {
            var t = $( "body" ),
                o = instance.options;

            if (t.css("cursor")) {
                o._cursor = t.css("cursor");
            }
            t.css("cursor", o.cursor);
        },
        stop: function( event, ui, instance ) {
            var o = instance.options;
            if (o._cursor) {
                $("body").css("cursor", o._cursor);
            }
        }
    });

    $.ui.plugin.add("draggable", "opacity", {
        start: function( event, ui, instance ) {
            var t = $( ui.helper ),
                o = instance.options;
            if (t.css("opacity")) {
                o._opacity = t.css("opacity");
            }
            t.css("opacity", o.opacity);
        },
        stop: function( event, ui, instance ) {
            var o = instance.options;
            if (o._opacity) {
                $(ui.helper).css("opacity", o._opacity);
            }
        }
    });

    $.ui.plugin.add("draggable", "scroll", {
        start: function( event, ui, i ) {
            if ( !i.scrollParentNotHidden ) {
                i.scrollParentNotHidden = i.helper.scrollParent( false );
            }

            if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] && i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
                i.overflowOffset = i.scrollParentNotHidden.offset();
            }
        },
        drag: function( event, ui, i  ) {

            var o = i.options,
                scrolled = false,
                scrollParent = i.scrollParentNotHidden[ 0 ],
                document = i.document[ 0 ];

            if ( scrollParent !== document && scrollParent.tagName !== "HTML" ) {
                if ( !o.axis || o.axis !== "x" ) {
                    if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY < o.scrollSensitivity ) {
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
                    } else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
                    }
                }

                if ( !o.axis || o.axis !== "y" ) {
                    if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX < o.scrollSensitivity ) {
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
                    } else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
                    }
                }

            } else {

                if (!o.axis || o.axis !== "x") {
                    if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    } else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                    }
                }

                if (!o.axis || o.axis !== "y") {
                    if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    } else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                    }
                }

            }

            if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(i, event);
            }

        }
    });

    $.ui.plugin.add("draggable", "snap", {
        start: function( event, ui, i ) {

            var o = i.options;

            i.snapElements = [];

            $(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
                var $t = $(this),
                    $o = $t.offset();
                if (this !== i.element[0]) {
                    i.snapElements.push({
                        item: this,
                        width: $t.outerWidth(), height: $t.outerHeight(),
                        top: $o.top, left: $o.left
                    });
                }
            });

        },
        drag: function( event, ui, inst ) {

            var ts, bs, ls, rs, l, r, t, b, i, first,
                o = inst.options,
                d = o.snapTolerance,
                x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
                y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

            for (i = inst.snapElements.length - 1; i >= 0; i--){

                l = inst.snapElements[i].left - inst.margins.left;
                r = l + inst.snapElements[i].width;
                t = inst.snapElements[i].top - inst.margins.top;
                b = t + inst.snapElements[i].height;

                if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
                    if (inst.snapElements[i].snapping) {
                        (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
                    }
                    inst.snapElements[i].snapping = false;
                    continue;
                }

                if (o.snapMode !== "inner") {
                    ts = Math.abs(t - y2) <= d;
                    bs = Math.abs(b - y1) <= d;
                    ls = Math.abs(l - x2) <= d;
                    rs = Math.abs(r - x1) <= d;
                    if (ts) {
                        ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top;
                    }
                    if (bs) {
                        ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top;
                    }
                    if (ls) {
                        ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left;
                    }
                    if (rs) {
                        ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left;
                    }
                }

                first = (ts || bs || ls || rs);

                if (o.snapMode !== "outer") {
                    ts = Math.abs(t - y1) <= d;
                    bs = Math.abs(b - y2) <= d;
                    ls = Math.abs(l - x1) <= d;
                    rs = Math.abs(r - x2) <= d;
                    if (ts) {
                        ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top;
                    }
                    if (bs) {
                        ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top;
                    }
                    if (ls) {
                        ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left;
                    }
                    if (rs) {
                        ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left;
                    }
                }

                if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
                    (inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
                }
                inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

            }

        }
    });

    $.ui.plugin.add("draggable", "stack", {
        start: function( event, ui, instance ) {
            var min,
                o = instance.options,
                group = $.makeArray($(o.stack)).sort(function(a, b) {
                    return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
                });

            if (!group.length) { return; }

            min = parseInt($(group[0]).css("zIndex"), 10) || 0;
            $(group).each(function(i) {
                $(this).css("zIndex", min + i);
            });
            this.css("zIndex", (min + group.length));
        }
    });

    $.ui.plugin.add("draggable", "zIndex", {
        start: function( event, ui, instance ) {
            var t = $( ui.helper ),
                o = instance.options;

            if (t.css("zIndex")) {
                o._zIndex = t.css("zIndex");
            }
            t.css("zIndex", o.zIndex);
        },
        stop: function( event, ui, instance ) {
            var o = instance.options;

            if (o._zIndex) {
                $(ui.helper).css("zIndex", o._zIndex);
            }
        }
    });

    var draggable = $.ui.draggable;


    /*!
     * jQuery UI Droppable 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/droppable/
     */


    $.widget( "ui.droppable", {
        version: "1.11.2",
        widgetEventPrefix: "drop",
        options: {
            accept: "*",
            activeClass: false,
            addClasses: true,
            greedy: false,
            hoverClass: false,
            scope: "default",
            tolerance: "intersect",

            // callbacks
            activate: null,
            deactivate: null,
            drop: null,
            out: null,
            over: null
        },
        _create: function() {

            var proportions,
                o = this.options,
                accept = o.accept;

            this.isover = false;
            this.isout = true;

            this.accept = $.isFunction( accept ) ? accept : function( d ) {
                return d.is( accept );
            };

            this.proportions = function( /* valueToWrite */ ) {
                if ( arguments.length ) {
                    // Store the droppable's proportions
                    proportions = arguments[ 0 ];
                } else {
                    // Retrieve or derive the droppable's proportions
                    return proportions ?
                        proportions :
                        proportions = {
                            width: this.element[ 0 ].offsetWidth,
                            height: this.element[ 0 ].offsetHeight
                        };
                }
            };

            this._addToManager( o.scope );

            o.addClasses && this.element.addClass( "ui-droppable" );

        },

        _addToManager: function( scope ) {
            // Add the reference and positions to the manager
            $.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
            $.ui.ddmanager.droppables[ scope ].push( this );
        },

        _splice: function( drop ) {
            var i = 0;
            for ( ; i < drop.length; i++ ) {
                if ( drop[ i ] === this ) {
                    drop.splice( i, 1 );
                }
            }
        },

        _destroy: function() {
            var drop = $.ui.ddmanager.droppables[ this.options.scope ];

            this._splice( drop );

            this.element.removeClass( "ui-droppable ui-droppable-disabled" );
        },

        _setOption: function( key, value ) {

            if ( key === "accept" ) {
                this.accept = $.isFunction( value ) ? value : function( d ) {
                    return d.is( value );
                };
            } else if ( key === "scope" ) {
                var drop = $.ui.ddmanager.droppables[ this.options.scope ];

                this._splice( drop );
                this._addToManager( value );
            }

            this._super( key, value );
        },

        _activate: function( event ) {
            var draggable = $.ui.ddmanager.current;
            if ( this.options.activeClass ) {
                this.element.addClass( this.options.activeClass );
            }
            if ( draggable ){
                this._trigger( "activate", event, this.ui( draggable ) );
            }
        },

        _deactivate: function( event ) {
            var draggable = $.ui.ddmanager.current;
            if ( this.options.activeClass ) {
                this.element.removeClass( this.options.activeClass );
            }
            if ( draggable ){
                this._trigger( "deactivate", event, this.ui( draggable ) );
            }
        },

        _over: function( event ) {

            var draggable = $.ui.ddmanager.current;

            // Bail if draggable and droppable are same element
            if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
                return;
            }

            if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
                if ( this.options.hoverClass ) {
                    this.element.addClass( this.options.hoverClass );
                }
                this._trigger( "over", event, this.ui( draggable ) );
            }

        },

        _out: function( event ) {

            var draggable = $.ui.ddmanager.current;

            // Bail if draggable and droppable are same element
            if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
                return;
            }

            if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
                if ( this.options.hoverClass ) {
                    this.element.removeClass( this.options.hoverClass );
                }
                this._trigger( "out", event, this.ui( draggable ) );
            }

        },

        _drop: function( event, custom ) {

            var draggable = custom || $.ui.ddmanager.current,
                childrenIntersection = false;

            // Bail if draggable and droppable are same element
            if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
                return false;
            }

            this.element.find( ":data(ui-droppable)" ).not( ".ui-draggable-dragging" ).each(function() {
                var inst = $( this ).droppable( "instance" );
                if (
                    inst.options.greedy &&
                    !inst.options.disabled &&
                    inst.options.scope === draggable.options.scope &&
                    inst.accept.call( inst.element[ 0 ], ( draggable.currentItem || draggable.element ) ) &&
                    $.ui.intersect( draggable, $.extend( inst, { offset: inst.element.offset() } ), inst.options.tolerance, event )
                ) { childrenIntersection = true; return false; }
            });
            if ( childrenIntersection ) {
                return false;
            }

            if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
                if ( this.options.activeClass ) {
                    this.element.removeClass( this.options.activeClass );
                }
                if ( this.options.hoverClass ) {
                    this.element.removeClass( this.options.hoverClass );
                }
                this._trigger( "drop", event, this.ui( draggable ) );
                return this.element;
            }

            return false;

        },

        ui: function( c ) {
            return {
                draggable: ( c.currentItem || c.element ),
                helper: c.helper,
                position: c.position,
                offset: c.positionAbs
            };
        }

    });

    $.ui.intersect = (function() {
        function isOverAxis( x, reference, size ) {
            return ( x >= reference ) && ( x < ( reference + size ) );
        }

        return function( draggable, droppable, toleranceMode, event ) {

            if ( !droppable.offset ) {
                return false;
            }

            var x1 = ( draggable.positionAbs || draggable.position.absolute ).left + draggable.margins.left,
                y1 = ( draggable.positionAbs || draggable.position.absolute ).top + draggable.margins.top,
                x2 = x1 + draggable.helperProportions.width,
                y2 = y1 + draggable.helperProportions.height,
                l = droppable.offset.left,
                t = droppable.offset.top,
                r = l + droppable.proportions().width,
                b = t + droppable.proportions().height;

            switch ( toleranceMode ) {
                case "fit":
                    return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
                case "intersect":
                    return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
                    x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
                    t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
                    y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
                case "pointer":
                    return isOverAxis( event.pageY, t, droppable.proportions().height ) && isOverAxis( event.pageX, l, droppable.proportions().width );
                case "touch":
                    return (
                    ( y1 >= t && y1 <= b ) || // Top edge touching
                    ( y2 >= t && y2 <= b ) || // Bottom edge touching
                    ( y1 < t && y2 > b ) // Surrounded vertically
                    ) && (
                    ( x1 >= l && x1 <= r ) || // Left edge touching
                    ( x2 >= l && x2 <= r ) || // Right edge touching
                    ( x1 < l && x2 > r ) // Surrounded horizontally
                    );
                default:
                    return false;
            }
        };
    })();

    /*
     This manager tracks offsets of draggables and droppables
     */
    $.ui.ddmanager = {
        current: null,
        droppables: { "default": [] },
        prepareOffsets: function( t, event ) {

            var i, j,
                m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
                type = event ? event.type : null, // workaround for #2317
                list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

            droppablesLoop: for ( i = 0; i < m.length; i++ ) {

                // No disabled and non-accepted
                if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
                    continue;
                }

                // Filter out elements in the current dragged item
                for ( j = 0; j < list.length; j++ ) {
                    if ( list[ j ] === m[ i ].element[ 0 ] ) {
                        m[ i ].proportions().height = 0;
                        continue droppablesLoop;
                    }
                }

                m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
                if ( !m[ i ].visible ) {
                    continue;
                }

                // Activate the droppable if used directly from draggables
                if ( type === "mousedown" ) {
                    m[ i ]._activate.call( m[ i ], event );
                }

                m[ i ].offset = m[ i ].element.offset();
                m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

            }

        },
        drop: function( draggable, event ) {

            var dropped = false;
            // Create a copy of the droppables in case the list changes during the drop (#9116)
            $.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {

                if ( !this.options ) {
                    return;
                }
                if ( !this.options.disabled && this.visible && $.ui.intersect( draggable, this, this.options.tolerance, event ) ) {
                    dropped = this._drop.call( this, event ) || dropped;
                }

                if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
                    this.isout = true;
                    this.isover = false;
                    this._deactivate.call( this, event );
                }

            });
            return dropped;

        },
        dragStart: function( draggable, event ) {
            // Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
            draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
                if ( !draggable.options.refreshPositions ) {
                    $.ui.ddmanager.prepareOffsets( draggable, event );
                }
            });
        },
        drag: function( draggable, event ) {

            // If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
            if ( draggable.options.refreshPositions ) {
                $.ui.ddmanager.prepareOffsets( draggable, event );
            }

            // Run through all droppables and check their positions based on specific tolerance options
            $.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {

                if ( this.options.disabled || this.greedyChild || !this.visible ) {
                    return;
                }

                var parentInstance, scope, parent,
                    intersects = $.ui.intersect( draggable, this, this.options.tolerance, event ),
                    c = !intersects && this.isover ? "isout" : ( intersects && !this.isover ? "isover" : null );
                if ( !c ) {
                    return;
                }

                if ( this.options.greedy ) {
                    // find droppable parents with same scope
                    scope = this.options.scope;
                    parent = this.element.parents( ":data(ui-droppable)" ).filter(function() {
                        return $( this ).droppable( "instance" ).options.scope === scope;
                    });

                    if ( parent.length ) {
                        parentInstance = $( parent[ 0 ] ).droppable( "instance" );
                        parentInstance.greedyChild = ( c === "isover" );
                    }
                }

                // we just moved into a greedy child
                if ( parentInstance && c === "isover" ) {
                    parentInstance.isover = false;
                    parentInstance.isout = true;
                    parentInstance._out.call( parentInstance, event );
                }

                this[ c ] = true;
                this[c === "isout" ? "isover" : "isout"] = false;
                this[c === "isover" ? "_over" : "_out"].call( this, event );

                // we just moved out of a greedy child
                if ( parentInstance && c === "isout" ) {
                    parentInstance.isout = false;
                    parentInstance.isover = true;
                    parentInstance._over.call( parentInstance, event );
                }
            });

        },
        dragStop: function( draggable, event ) {
            draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
            // Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
            if ( !draggable.options.refreshPositions ) {
                $.ui.ddmanager.prepareOffsets( draggable, event );
            }
        }
    };

    var droppable = $.ui.droppable;


    /*!
     * jQuery UI Resizable 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/resizable/
     */


    $.widget("ui.resizable", $.ui.mouse, {
        version: "1.11.2",
        widgetEventPrefix: "resize",
        options: {
            alsoResize: false,
            animate: false,
            animateDuration: "slow",
            animateEasing: "swing",
            aspectRatio: false,
            autoHide: false,
            containment: false,
            ghost: false,
            grid: false,
            handles: "e,s,se",
            helper: false,
            maxHeight: null,
            maxWidth: null,
            minHeight: 10,
            minWidth: 10,
            // See #7960
            zIndex: 90,

            // callbacks
            resize: null,
            start: null,
            stop: null
        },

        _num: function( value ) {
            return parseInt( value, 10 ) || 0;
        },

        _isNumber: function( value ) {
            return !isNaN( parseInt( value, 10 ) );
        },

        _hasScroll: function( el, a ) {

            if ( $( el ).css( "overflow" ) === "hidden") {
                return false;
            }

            var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
                has = false;

            if ( el[ scroll ] > 0 ) {
                return true;
            }

            // TODO: determine which cases actually cause this to happen
            // if the element doesn't have the scroll set, see if it's possible to
            // set the scroll
            el[ scroll ] = 1;
            has = ( el[ scroll ] > 0 );
            el[ scroll ] = 0;
            return has;
        },

        _create: function() {

            var n, i, handle, axis, hname,
                that = this,
                o = this.options;
            this.element.addClass("ui-resizable");

            $.extend(this, {
                _aspectRatio: !!(o.aspectRatio),
                aspectRatio: o.aspectRatio,
                originalElement: this.element,
                _proportionallyResizeElements: [],
                _helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
            });

            // Wrap the element if it cannot hold child nodes
            if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

                this.element.wrap(
                    $("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
                        position: this.element.css("position"),
                        width: this.element.outerWidth(),
                        height: this.element.outerHeight(),
                        top: this.element.css("top"),
                        left: this.element.css("left")
                    })
                );

                this.element = this.element.parent().data(
                    "ui-resizable", this.element.resizable( "instance" )
                );

                this.elementIsWrapper = true;

                this.element.css({
                    marginLeft: this.originalElement.css("marginLeft"),
                    marginTop: this.originalElement.css("marginTop"),
                    marginRight: this.originalElement.css("marginRight"),
                    marginBottom: this.originalElement.css("marginBottom")
                });
                this.originalElement.css({
                    marginLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0
                });
                // support: Safari
                // Prevent Safari textarea resize
                this.originalResizeStyle = this.originalElement.css("resize");
                this.originalElement.css("resize", "none");

                this._proportionallyResizeElements.push( this.originalElement.css({
                    position: "static",
                    zoom: 1,
                    display: "block"
                }) );

                // support: IE9
                // avoid IE jump (hard set the margin)
                this.originalElement.css({ margin: this.originalElement.css("margin") });

                this._proportionallyResize();
            }

            this.handles = o.handles ||
            ( !$(".ui-resizable-handle", this.element).length ?
                "e,s,se" : {
                n: ".ui-resizable-n",
                e: ".ui-resizable-e",
                s: ".ui-resizable-s",
                w: ".ui-resizable-w",
                se: ".ui-resizable-se",
                sw: ".ui-resizable-sw",
                ne: ".ui-resizable-ne",
                nw: ".ui-resizable-nw"
            } );

            if (this.handles.constructor === String) {

                if ( this.handles === "all") {
                    this.handles = "n,e,s,w,se,sw,ne,nw";
                }

                n = this.handles.split(",");
                this.handles = {};

                for (i = 0; i < n.length; i++) {

                    handle = $.trim(n[i]);
                    hname = "ui-resizable-" + handle;
                    axis = $("<div class='ui-resizable-handle " + hname + "'></div>");

                    axis.css({ zIndex: o.zIndex });

                    // TODO : What's going on here?
                    if ("se" === handle) {
                        axis.addClass("ui-icon ui-icon-gripsmall-diagonal-se");
                    }

                    this.handles[handle] = ".ui-resizable-" + handle;
                    this.element.append(axis);
                }

            }

            this._renderAxis = function(target) {

                var i, axis, padPos, padWrapper;

                target = target || this.element;

                for (i in this.handles) {

                    if (this.handles[i].constructor === String) {
                        this.handles[i] = this.element.children( this.handles[ i ] ).first().show();
                    }

                    if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

                        axis = $(this.handles[i], this.element);

                        padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

                        padPos = [ "padding",
                            /ne|nw|n/.test(i) ? "Top" :
                                /se|sw|s/.test(i) ? "Bottom" :
                                    /^e$/.test(i) ? "Right" : "Left" ].join("");

                        target.css(padPos, padWrapper);

                        this._proportionallyResize();

                    }

                    // TODO: What's that good for? There's not anything to be executed left
                    if (!$(this.handles[i]).length) {
                        continue;
                    }
                }
            };

            // TODO: make renderAxis a prototype function
            this._renderAxis(this.element);

            this._handles = $(".ui-resizable-handle", this.element)
                .disableSelection();

            this._handles.mouseover(function() {
                if (!that.resizing) {
                    if (this.className) {
                        axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                    }
                    that.axis = axis && axis[1] ? axis[1] : "se";
                }
            });

            if (o.autoHide) {
                this._handles.hide();
                $(this.element)
                    .addClass("ui-resizable-autohide")
                    .mouseenter(function() {
                        if (o.disabled) {
                            return;
                        }
                        $(this).removeClass("ui-resizable-autohide");
                        that._handles.show();
                    })
                    .mouseleave(function() {
                        if (o.disabled) {
                            return;
                        }
                        if (!that.resizing) {
                            $(this).addClass("ui-resizable-autohide");
                            that._handles.hide();
                        }
                    });
            }

            this._mouseInit();

        },

        _destroy: function() {

            this._mouseDestroy();

            var wrapper,
                _destroy = function(exp) {
                    $(exp)
                        .removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
                        .removeData("resizable")
                        .removeData("ui-resizable")
                        .unbind(".resizable")
                        .find(".ui-resizable-handle")
                        .remove();
                };

            // TODO: Unwrap at same DOM position
            if (this.elementIsWrapper) {
                _destroy(this.element);
                wrapper = this.element;
                this.originalElement.css({
                    position: wrapper.css("position"),
                    width: wrapper.outerWidth(),
                    height: wrapper.outerHeight(),
                    top: wrapper.css("top"),
                    left: wrapper.css("left")
                }).insertAfter( wrapper );
                wrapper.remove();
            }

            this.originalElement.css("resize", this.originalResizeStyle);
            _destroy(this.originalElement);

            return this;
        },

        _mouseCapture: function(event) {
            var i, handle,
                capture = false;

            for (i in this.handles) {
                handle = $(this.handles[i])[0];
                if (handle === event.target || $.contains(handle, event.target)) {
                    capture = true;
                }
            }

            return !this.options.disabled && capture;
        },

        _mouseStart: function(event) {

            var curleft, curtop, cursor,
                o = this.options,
                el = this.element;

            this.resizing = true;

            this._renderProxy();

            curleft = this._num(this.helper.css("left"));
            curtop = this._num(this.helper.css("top"));

            if (o.containment) {
                curleft += $(o.containment).scrollLeft() || 0;
                curtop += $(o.containment).scrollTop() || 0;
            }

            this.offset = this.helper.offset();
            this.position = { left: curleft, top: curtop };

            this.size = this._helper ? {
                width: this.helper.width(),
                height: this.helper.height()
            } : {
                width: el.width(),
                height: el.height()
            };

            this.originalSize = this._helper ? {
                width: el.outerWidth(),
                height: el.outerHeight()
            } : {
                width: el.width(),
                height: el.height()
            };

            this.sizeDiff = {
                width: el.outerWidth() - el.width(),
                height: el.outerHeight() - el.height()
            };

            this.originalPosition = { left: curleft, top: curtop };
            this.originalMousePosition = { left: event.pageX, top: event.pageY };

            this.aspectRatio = (typeof o.aspectRatio === "number") ?
                o.aspectRatio :
                ((this.originalSize.width / this.originalSize.height) || 1);

            cursor = $(".ui-resizable-" + this.axis).css("cursor");
            $("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

            el.addClass("ui-resizable-resizing");
            this._propagate("start", event);
            return true;
        },

        _mouseDrag: function(event) {

            var data, props,
                smp = this.originalMousePosition,
                a = this.axis,
                dx = (event.pageX - smp.left) || 0,
                dy = (event.pageY - smp.top) || 0,
                trigger = this._change[a];

            this._updatePrevProperties();

            if (!trigger) {
                return false;
            }

            data = trigger.apply(this, [ event, dx, dy ]);

            this._updateVirtualBoundaries(event.shiftKey);
            if (this._aspectRatio || event.shiftKey) {
                data = this._updateRatio(data, event);
            }

            data = this._respectSize(data, event);

            this._updateCache(data);

            this._propagate("resize", event);

            props = this._applyChanges();

            if ( !this._helper && this._proportionallyResizeElements.length ) {
                this._proportionallyResize();
            }

            if ( !$.isEmptyObject( props ) ) {
                this._updatePrevProperties();
                this._trigger( "resize", event, this.ui() );
                this._applyChanges();
            }

            return false;
        },

        _mouseStop: function(event) {

            this.resizing = false;
            var pr, ista, soffseth, soffsetw, s, left, top,
                o = this.options, that = this;

            if (this._helper) {

                pr = this._proportionallyResizeElements;
                ista = pr.length && (/textarea/i).test(pr[0].nodeName);
                soffseth = ista && this._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height;
                soffsetw = ista ? 0 : that.sizeDiff.width;

                s = {
                    width: (that.helper.width()  - soffsetw),
                    height: (that.helper.height() - soffseth)
                };
                left = (parseInt(that.element.css("left"), 10) +
                (that.position.left - that.originalPosition.left)) || null;
                top = (parseInt(that.element.css("top"), 10) +
                (that.position.top - that.originalPosition.top)) || null;

                if (!o.animate) {
                    this.element.css($.extend(s, { top: top, left: left }));
                }

                that.helper.height(that.size.height);
                that.helper.width(that.size.width);

                if (this._helper && !o.animate) {
                    this._proportionallyResize();
                }
            }

            $("body").css("cursor", "auto");

            this.element.removeClass("ui-resizable-resizing");

            this._propagate("stop", event);

            if (this._helper) {
                this.helper.remove();
            }

            return false;

        },

        _updatePrevProperties: function() {
            this.prevPosition = {
                top: this.position.top,
                left: this.position.left
            };
            this.prevSize = {
                width: this.size.width,
                height: this.size.height
            };
        },

        _applyChanges: function() {
            var props = {};

            if ( this.position.top !== this.prevPosition.top ) {
                props.top = this.position.top + "px";
            }
            if ( this.position.left !== this.prevPosition.left ) {
                props.left = this.position.left + "px";
            }
            if ( this.size.width !== this.prevSize.width ) {
                props.width = this.size.width + "px";
            }
            if ( this.size.height !== this.prevSize.height ) {
                props.height = this.size.height + "px";
            }

            this.helper.css( props );

            return props;
        },

        _updateVirtualBoundaries: function(forceAspectRatio) {
            var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
                o = this.options;

            b = {
                minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0,
                maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : Infinity,
                minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0,
                maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : Infinity
            };

            if (this._aspectRatio || forceAspectRatio) {
                pMinWidth = b.minHeight * this.aspectRatio;
                pMinHeight = b.minWidth / this.aspectRatio;
                pMaxWidth = b.maxHeight * this.aspectRatio;
                pMaxHeight = b.maxWidth / this.aspectRatio;

                if (pMinWidth > b.minWidth) {
                    b.minWidth = pMinWidth;
                }
                if (pMinHeight > b.minHeight) {
                    b.minHeight = pMinHeight;
                }
                if (pMaxWidth < b.maxWidth) {
                    b.maxWidth = pMaxWidth;
                }
                if (pMaxHeight < b.maxHeight) {
                    b.maxHeight = pMaxHeight;
                }
            }
            this._vBoundaries = b;
        },

        _updateCache: function(data) {
            this.offset = this.helper.offset();
            if (this._isNumber(data.left)) {
                this.position.left = data.left;
            }
            if (this._isNumber(data.top)) {
                this.position.top = data.top;
            }
            if (this._isNumber(data.height)) {
                this.size.height = data.height;
            }
            if (this._isNumber(data.width)) {
                this.size.width = data.width;
            }
        },

        _updateRatio: function( data ) {

            var cpos = this.position,
                csize = this.size,
                a = this.axis;

            if (this._isNumber(data.height)) {
                data.width = (data.height * this.aspectRatio);
            } else if (this._isNumber(data.width)) {
                data.height = (data.width / this.aspectRatio);
            }

            if (a === "sw") {
                data.left = cpos.left + (csize.width - data.width);
                data.top = null;
            }
            if (a === "nw") {
                data.top = cpos.top + (csize.height - data.height);
                data.left = cpos.left + (csize.width - data.width);
            }

            return data;
        },

        _respectSize: function( data ) {

            var o = this._vBoundaries,
                a = this.axis,
                ismaxw = this._isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
                ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
                isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
                isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
                dw = this.originalPosition.left + this.originalSize.width,
                dh = this.position.top + this.size.height,
                cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
            if (isminw) {
                data.width = o.minWidth;
            }
            if (isminh) {
                data.height = o.minHeight;
            }
            if (ismaxw) {
                data.width = o.maxWidth;
            }
            if (ismaxh) {
                data.height = o.maxHeight;
            }

            if (isminw && cw) {
                data.left = dw - o.minWidth;
            }
            if (ismaxw && cw) {
                data.left = dw - o.maxWidth;
            }
            if (isminh && ch) {
                data.top = dh - o.minHeight;
            }
            if (ismaxh && ch) {
                data.top = dh - o.maxHeight;
            }

            // Fixing jump error on top/left - bug #2330
            if (!data.width && !data.height && !data.left && data.top) {
                data.top = null;
            } else if (!data.width && !data.height && !data.top && data.left) {
                data.left = null;
            }

            return data;
        },

        _getPaddingPlusBorderDimensions: function( element ) {
            var i = 0,
                widths = [],
                borders = [
                    element.css( "borderTopWidth" ),
                    element.css( "borderRightWidth" ),
                    element.css( "borderBottomWidth" ),
                    element.css( "borderLeftWidth" )
                ],
                paddings = [
                    element.css( "paddingTop" ),
                    element.css( "paddingRight" ),
                    element.css( "paddingBottom" ),
                    element.css( "paddingLeft" )
                ];

            for ( ; i < 4; i++ ) {
                widths[ i ] = ( parseInt( borders[ i ], 10 ) || 0 );
                widths[ i ] += ( parseInt( paddings[ i ], 10 ) || 0 );
            }

            return {
                height: widths[ 0 ] + widths[ 2 ],
                width: widths[ 1 ] + widths[ 3 ]
            };
        },

        _proportionallyResize: function() {

            if (!this._proportionallyResizeElements.length) {
                return;
            }

            var prel,
                i = 0,
                element = this.helper || this.element;

            for ( ; i < this._proportionallyResizeElements.length; i++) {

                prel = this._proportionallyResizeElements[i];

                // TODO: Seems like a bug to cache this.outerDimensions
                // considering that we are in a loop.
                if (!this.outerDimensions) {
                    this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
                }

                prel.css({
                    height: (element.height() - this.outerDimensions.height) || 0,
                    width: (element.width() - this.outerDimensions.width) || 0
                });

            }

        },

        _renderProxy: function() {

            var el = this.element, o = this.options;
            this.elementOffset = el.offset();

            if (this._helper) {

                this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

                this.helper.addClass(this._helper).css({
                    width: this.element.outerWidth() - 1,
                    height: this.element.outerHeight() - 1,
                    position: "absolute",
                    left: this.elementOffset.left + "px",
                    top: this.elementOffset.top + "px",
                    zIndex: ++o.zIndex //TODO: Don't modify option
                });

                this.helper
                    .appendTo("body")
                    .disableSelection();

            } else {
                this.helper = this.element;
            }

        },

        _change: {
            e: function(event, dx) {
                return { width: this.originalSize.width + dx };
            },
            w: function(event, dx) {
                var cs = this.originalSize, sp = this.originalPosition;
                return { left: sp.left + dx, width: cs.width - dx };
            },
            n: function(event, dx, dy) {
                var cs = this.originalSize, sp = this.originalPosition;
                return { top: sp.top + dy, height: cs.height - dy };
            },
            s: function(event, dx, dy) {
                return { height: this.originalSize.height + dy };
            },
            se: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments),
                    this._change.e.apply(this, [ event, dx, dy ]));
            },
            sw: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments),
                    this._change.w.apply(this, [ event, dx, dy ]));
            },
            ne: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments),
                    this._change.e.apply(this, [ event, dx, dy ]));
            },
            nw: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments),
                    this._change.w.apply(this, [ event, dx, dy ]));
            }
        },

        _propagate: function(n, event) {
            $.ui.plugin.call(this, n, [ event, this.ui() ]);
            (n !== "resize" && this._trigger(n, event, this.ui()));
        },

        plugins: {},

        ui: function() {
            return {
                originalElement: this.originalElement,
                element: this.element,
                helper: this.helper,
                position: this.position,
                size: this.size,
                originalSize: this.originalSize,
                originalPosition: this.originalPosition
            };
        }

    });

    /*
     * Resizable Extensions
     */

    $.ui.plugin.add("resizable", "animate", {

        stop: function( event ) {
            var that = $(this).resizable( "instance" ),
                o = that.options,
                pr = that._proportionallyResizeElements,
                ista = pr.length && (/textarea/i).test(pr[0].nodeName),
                soffseth = ista && that._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height,
                soffsetw = ista ? 0 : that.sizeDiff.width,
                style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
                left = (parseInt(that.element.css("left"), 10) +
                    (that.position.left - that.originalPosition.left)) || null,
                top = (parseInt(that.element.css("top"), 10) +
                    (that.position.top - that.originalPosition.top)) || null;

            that.element.animate(
                $.extend(style, top && left ? { top: top, left: left } : {}), {
                    duration: o.animateDuration,
                    easing: o.animateEasing,
                    step: function() {

                        var data = {
                            width: parseInt(that.element.css("width"), 10),
                            height: parseInt(that.element.css("height"), 10),
                            top: parseInt(that.element.css("top"), 10),
                            left: parseInt(that.element.css("left"), 10)
                        };

                        if (pr && pr.length) {
                            $(pr[0]).css({ width: data.width, height: data.height });
                        }

                        // propagating resize, and updating values for each animation step
                        that._updateCache(data);
                        that._propagate("resize", event);

                    }
                }
            );
        }

    });

    $.ui.plugin.add( "resizable", "containment", {

        start: function() {
            var element, p, co, ch, cw, width, height,
                that = $( this ).resizable( "instance" ),
                o = that.options,
                el = that.element,
                oc = o.containment,
                ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

            if ( !ce ) {
                return;
            }

            that.containerElement = $( ce );

            if ( /document/.test( oc ) || oc === document ) {
                that.containerOffset = {
                    left: 0,
                    top: 0
                };
                that.containerPosition = {
                    left: 0,
                    top: 0
                };

                that.parentData = {
                    element: $( document ),
                    left: 0,
                    top: 0,
                    width: $( document ).width(),
                    height: $( document ).height() || document.body.parentNode.scrollHeight
                };
            } else {
                element = $( ce );
                p = [];
                $([ "Top", "Right", "Left", "Bottom" ]).each(function( i, name ) {
                    p[ i ] = that._num( element.css( "padding" + name ) );
                });

                that.containerOffset = element.offset();
                that.containerPosition = element.position();
                that.containerSize = {
                    height: ( element.innerHeight() - p[ 3 ] ),
                    width: ( element.innerWidth() - p[ 1 ] )
                };

                co = that.containerOffset;
                ch = that.containerSize.height;
                cw = that.containerSize.width;
                width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
                height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

                that.parentData = {
                    element: ce,
                    left: co.left,
                    top: co.top,
                    width: width,
                    height: height
                };
            }
        },

        resize: function( event ) {
            var woset, hoset, isParent, isOffsetRelative,
                that = $( this ).resizable( "instance" ),
                o = that.options,
                co = that.containerOffset,
                cp = that.position,
                pRatio = that._aspectRatio || event.shiftKey,
                cop = {
                    top: 0,
                    left: 0
                },
                ce = that.containerElement,
                continueResize = true;

            if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
                cop = co;
            }

            if ( cp.left < ( that._helper ? co.left : 0 ) ) {
                that.size.width = that.size.width +
                ( that._helper ?
                    ( that.position.left - co.left ) :
                    ( that.position.left - cop.left ) );

                if ( pRatio ) {
                    that.size.height = that.size.width / that.aspectRatio;
                    continueResize = false;
                }
                that.position.left = o.helper ? co.left : 0;
            }

            if ( cp.top < ( that._helper ? co.top : 0 ) ) {
                that.size.height = that.size.height +
                ( that._helper ?
                    ( that.position.top - co.top ) :
                    that.position.top );

                if ( pRatio ) {
                    that.size.width = that.size.height * that.aspectRatio;
                    continueResize = false;
                }
                that.position.top = that._helper ? co.top : 0;
            }

            isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
            isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

            if ( isParent && isOffsetRelative ) {
                that.offset.left = that.parentData.left + that.position.left;
                that.offset.top = that.parentData.top + that.position.top;
            } else {
                that.offset.left = that.element.offset().left;
                that.offset.top = that.element.offset().top;
            }

            woset = Math.abs( that.sizeDiff.width +
            (that._helper ?
            that.offset.left - cop.left :
                (that.offset.left - co.left)) );

            hoset = Math.abs( that.sizeDiff.height +
            (that._helper ?
            that.offset.top - cop.top :
                (that.offset.top - co.top)) );

            if ( woset + that.size.width >= that.parentData.width ) {
                that.size.width = that.parentData.width - woset;
                if ( pRatio ) {
                    that.size.height = that.size.width / that.aspectRatio;
                    continueResize = false;
                }
            }

            if ( hoset + that.size.height >= that.parentData.height ) {
                that.size.height = that.parentData.height - hoset;
                if ( pRatio ) {
                    that.size.width = that.size.height * that.aspectRatio;
                    continueResize = false;
                }
            }

            if ( !continueResize ){
                that.position.left = that.prevPosition.left;
                that.position.top = that.prevPosition.top;
                that.size.width = that.prevSize.width;
                that.size.height = that.prevSize.height;
            }
        },

        stop: function() {
            var that = $( this ).resizable( "instance" ),
                o = that.options,
                co = that.containerOffset,
                cop = that.containerPosition,
                ce = that.containerElement,
                helper = $( that.helper ),
                ho = helper.offset(),
                w = helper.outerWidth() - that.sizeDiff.width,
                h = helper.outerHeight() - that.sizeDiff.height;

            if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
                $( this ).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
            }

            if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
                $( this ).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
            }
        }
    });

    $.ui.plugin.add("resizable", "alsoResize", {

        start: function() {
            var that = $(this).resizable( "instance" ),
                o = that.options,
                _store = function(exp) {
                    $(exp).each(function() {
                        var el = $(this);
                        el.data("ui-resizable-alsoresize", {
                            width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
                            left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
                        });
                    });
                };

            if (typeof(o.alsoResize) === "object" && !o.alsoResize.parentNode) {
                if (o.alsoResize.length) {
                    o.alsoResize = o.alsoResize[0];
                    _store(o.alsoResize);
                } else {
                    $.each(o.alsoResize, function(exp) {
                        _store(exp);
                    });
                }
            } else {
                _store(o.alsoResize);
            }
        },

        resize: function(event, ui) {
            var that = $(this).resizable( "instance" ),
                o = that.options,
                os = that.originalSize,
                op = that.originalPosition,
                delta = {
                    height: (that.size.height - os.height) || 0,
                    width: (that.size.width - os.width) || 0,
                    top: (that.position.top - op.top) || 0,
                    left: (that.position.left - op.left) || 0
                },

                _alsoResize = function(exp, c) {
                    $(exp).each(function() {
                        var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
                            css = c && c.length ?
                                c :
                                el.parents(ui.originalElement[0]).length ?
                                    [ "width", "height" ] :
                                    [ "width", "height", "top", "left" ];

                        $.each(css, function(i, prop) {
                            var sum = (start[prop] || 0) + (delta[prop] || 0);
                            if (sum && sum >= 0) {
                                style[prop] = sum || null;
                            }
                        });

                        el.css(style);
                    });
                };

            if (typeof(o.alsoResize) === "object" && !o.alsoResize.nodeType) {
                $.each(o.alsoResize, function(exp, c) {
                    _alsoResize(exp, c);
                });
            } else {
                _alsoResize(o.alsoResize);
            }
        },

        stop: function() {
            $(this).removeData("resizable-alsoresize");
        }
    });

    $.ui.plugin.add("resizable", "ghost", {

        start: function() {

            var that = $(this).resizable( "instance" ), o = that.options, cs = that.size;

            that.ghost = that.originalElement.clone();
            that.ghost
                .css({
                    opacity: 0.25,
                    display: "block",
                    position: "relative",
                    height: cs.height,
                    width: cs.width,
                    margin: 0,
                    left: 0,
                    top: 0
                })
                .addClass("ui-resizable-ghost")
                .addClass(typeof o.ghost === "string" ? o.ghost : "");

            that.ghost.appendTo(that.helper);

        },

        resize: function() {
            var that = $(this).resizable( "instance" );
            if (that.ghost) {
                that.ghost.css({
                    position: "relative",
                    height: that.size.height,
                    width: that.size.width
                });
            }
        },

        stop: function() {
            var that = $(this).resizable( "instance" );
            if (that.ghost && that.helper) {
                that.helper.get(0).removeChild(that.ghost.get(0));
            }
        }

    });

    $.ui.plugin.add("resizable", "grid", {

        resize: function() {
            var outerDimensions,
                that = $(this).resizable( "instance" ),
                o = that.options,
                cs = that.size,
                os = that.originalSize,
                op = that.originalPosition,
                a = that.axis,
                grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
                gridX = (grid[0] || 1),
                gridY = (grid[1] || 1),
                ox = Math.round((cs.width - os.width) / gridX) * gridX,
                oy = Math.round((cs.height - os.height) / gridY) * gridY,
                newWidth = os.width + ox,
                newHeight = os.height + oy,
                isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
                isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
                isMinWidth = o.minWidth && (o.minWidth > newWidth),
                isMinHeight = o.minHeight && (o.minHeight > newHeight);

            o.grid = grid;

            if (isMinWidth) {
                newWidth += gridX;
            }
            if (isMinHeight) {
                newHeight += gridY;
            }
            if (isMaxWidth) {
                newWidth -= gridX;
            }
            if (isMaxHeight) {
                newHeight -= gridY;
            }

            if (/^(se|s|e)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
            } else if (/^(ne)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
                that.position.top = op.top - oy;
            } else if (/^(sw)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
                that.position.left = op.left - ox;
            } else {
                if ( newHeight - gridY <= 0 || newWidth - gridX <= 0) {
                    outerDimensions = that._getPaddingPlusBorderDimensions( this );
                }

                if ( newHeight - gridY > 0 ) {
                    that.size.height = newHeight;
                    that.position.top = op.top - oy;
                } else {
                    newHeight = gridY - outerDimensions.height;
                    that.size.height = newHeight;
                    that.position.top = op.top + os.height - newHeight;
                }
                if ( newWidth - gridX > 0 ) {
                    that.size.width = newWidth;
                    that.position.left = op.left - ox;
                } else {
                    newWidth = gridY - outerDimensions.height;
                    that.size.width = newWidth;
                    that.position.left = op.left + os.width - newWidth;
                }
            }
        }

    });

    var resizable = $.ui.resizable;


    /*!
     * jQuery UI Selectable 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/selectable/
     */


    var selectable = $.widget("ui.selectable", $.ui.mouse, {
        version: "1.11.2",
        options: {
            appendTo: "body",
            autoRefresh: true,
            distance: 0,
            filter: "*",
            tolerance: "touch",

            // callbacks
            selected: null,
            selecting: null,
            start: null,
            stop: null,
            unselected: null,
            unselecting: null
        },
        _create: function() {
            var selectees,
                that = this;

            this.element.addClass("ui-selectable");

            this.dragged = false;

            // cache selectee children based on filter
            this.refresh = function() {
                selectees = $(that.options.filter, that.element[0]);
                selectees.addClass("ui-selectee");
                selectees.each(function() {
                    var $this = $(this),
                        pos = $this.offset();
                    $.data(this, "selectable-item", {
                        element: this,
                        $element: $this,
                        left: pos.left,
                        top: pos.top,
                        right: pos.left + $this.outerWidth(),
                        bottom: pos.top + $this.outerHeight(),
                        startselected: false,
                        selected: $this.hasClass("ui-selected"),
                        selecting: $this.hasClass("ui-selecting"),
                        unselecting: $this.hasClass("ui-unselecting")
                    });
                });
            };
            this.refresh();

            this.selectees = selectees.addClass("ui-selectee");

            this._mouseInit();

            this.helper = $("<div class='ui-selectable-helper'></div>");
        },

        _destroy: function() {
            this.selectees
                .removeClass("ui-selectee")
                .removeData("selectable-item");
            this.element
                .removeClass("ui-selectable ui-selectable-disabled");
            this._mouseDestroy();
        },

        _mouseStart: function(event) {
            var that = this,
                options = this.options;

            this.opos = [ event.pageX, event.pageY ];

            if (this.options.disabled) {
                return;
            }

            this.selectees = $(options.filter, this.element[0]);

            this._trigger("start", event);

            $(options.appendTo).append(this.helper);
            // position helper (lasso)
            this.helper.css({
                "left": event.pageX,
                "top": event.pageY,
                "width": 0,
                "height": 0
            });

            if (options.autoRefresh) {
                this.refresh();
            }

            this.selectees.filter(".ui-selected").each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.startselected = true;
                if (!event.metaKey && !event.ctrlKey) {
                    selectee.$element.removeClass("ui-selected");
                    selectee.selected = false;
                    selectee.$element.addClass("ui-unselecting");
                    selectee.unselecting = true;
                    // selectable UNSELECTING callback
                    that._trigger("unselecting", event, {
                        unselecting: selectee.element
                    });
                }
            });

            $(event.target).parents().addBack().each(function() {
                var doSelect,
                    selectee = $.data(this, "selectable-item");
                if (selectee) {
                    doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("ui-selected");
                    selectee.$element
                        .removeClass(doSelect ? "ui-unselecting" : "ui-selected")
                        .addClass(doSelect ? "ui-selecting" : "ui-unselecting");
                    selectee.unselecting = !doSelect;
                    selectee.selecting = doSelect;
                    selectee.selected = doSelect;
                    // selectable (UN)SELECTING callback
                    if (doSelect) {
                        that._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    } else {
                        that._trigger("unselecting", event, {
                            unselecting: selectee.element
                        });
                    }
                    return false;
                }
            });

        },

        _mouseDrag: function(event) {

            this.dragged = true;

            if (this.options.disabled) {
                return;
            }

            var tmp,
                that = this,
                options = this.options,
                x1 = this.opos[0],
                y1 = this.opos[1],
                x2 = event.pageX,
                y2 = event.pageY;

            if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
            if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
            this.helper.css({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 });

            this.selectees.each(function() {
                var selectee = $.data(this, "selectable-item"),
                    hit = false;

                //prevent helper from being selected if appendTo: selectable
                if (!selectee || selectee.element === that.element[0]) {
                    return;
                }

                if (options.tolerance === "touch") {
                    hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
                } else if (options.tolerance === "fit") {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }

                if (hit) {
                    // SELECT
                    if (selectee.selected) {
                        selectee.$element.removeClass("ui-selected");
                        selectee.selected = false;
                    }
                    if (selectee.unselecting) {
                        selectee.$element.removeClass("ui-unselecting");
                        selectee.unselecting = false;
                    }
                    if (!selectee.selecting) {
                        selectee.$element.addClass("ui-selecting");
                        selectee.selecting = true;
                        // selectable SELECTING callback
                        that._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    }
                } else {
                    // UNSELECT
                    if (selectee.selecting) {
                        if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
                            selectee.$element.removeClass("ui-selecting");
                            selectee.selecting = false;
                            selectee.$element.addClass("ui-selected");
                            selectee.selected = true;
                        } else {
                            selectee.$element.removeClass("ui-selecting");
                            selectee.selecting = false;
                            if (selectee.startselected) {
                                selectee.$element.addClass("ui-unselecting");
                                selectee.unselecting = true;
                            }
                            // selectable UNSELECTING callback
                            that._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                    if (selectee.selected) {
                        if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
                            selectee.$element.removeClass("ui-selected");
                            selectee.selected = false;

                            selectee.$element.addClass("ui-unselecting");
                            selectee.unselecting = true;
                            // selectable UNSELECTING callback
                            that._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                }
            });

            return false;
        },

        _mouseStop: function(event) {
            var that = this;

            this.dragged = false;

            $(".ui-unselecting", this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.$element.removeClass("ui-unselecting");
                selectee.unselecting = false;
                selectee.startselected = false;
                that._trigger("unselected", event, {
                    unselected: selectee.element
                });
            });
            $(".ui-selecting", this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.$element.removeClass("ui-selecting").addClass("ui-selected");
                selectee.selecting = false;
                selectee.selected = true;
                selectee.startselected = true;
                that._trigger("selected", event, {
                    selected: selectee.element
                });
            });
            this._trigger("stop", event);

            this.helper.remove();

            return false;
        }

    });


    /*!
     * jQuery UI Sortable 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/sortable/
     */


    var sortable = $.widget("ui.sortable", $.ui.mouse, {
        version: "1.11.2",
        widgetEventPrefix: "sort",
        ready: false,
        options: {
            appendTo: "parent",
            axis: false,
            connectWith: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            dropOnEmpty: true,
            forcePlaceholderSize: false,
            forceHelperSize: false,
            grid: false,
            handle: false,
            helper: "original",
            items: "> *",
            opacity: false,
            placeholder: false,
            revert: false,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1000,

            // callbacks
            activate: null,
            beforeStop: null,
            change: null,
            deactivate: null,
            out: null,
            over: null,
            receive: null,
            remove: null,
            sort: null,
            start: null,
            stop: null,
            update: null
        },

        _isOverAxis: function( x, reference, size ) {
            return ( x >= reference ) && ( x < ( reference + size ) );
        },

        _isFloating: function( item ) {
            return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
        },

        _create: function() {

            var o = this.options;
            this.containerCache = {};
            this.element.addClass("ui-sortable");

            //Get the items
            this.refresh();

            //Let's determine if the items are being displayed horizontally
            this.floating = this.items.length ? o.axis === "x" || this._isFloating(this.items[0].item) : false;

            //Let's determine the parent's offset
            this.offset = this.element.offset();

            //Initialize mouse events for interaction
            this._mouseInit();

            this._setHandleClassName();

            //We're ready to go
            this.ready = true;

        },

        _setOption: function( key, value ) {
            this._super( key, value );

            if ( key === "handle" ) {
                this._setHandleClassName();
            }
        },

        _setHandleClassName: function() {
            this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
            $.each( this.items, function() {
                ( this.instance.options.handle ?
                    this.item.find( this.instance.options.handle ) : this.item )
                    .addClass( "ui-sortable-handle" );
            });
        },

        _destroy: function() {
            this.element
                .removeClass( "ui-sortable ui-sortable-disabled" )
                .find( ".ui-sortable-handle" )
                .removeClass( "ui-sortable-handle" );
            this._mouseDestroy();

            for ( var i = this.items.length - 1; i >= 0; i-- ) {
                this.items[i].item.removeData(this.widgetName + "-item");
            }

            return this;
        },

        _mouseCapture: function(event, overrideHandle) {
            var currentItem = null,
                validHandle = false,
                that = this;

            if (this.reverting) {
                return false;
            }

            if(this.options.disabled || this.options.type === "static") {
                return false;
            }

            //We have to refresh the items data once first
            this._refreshItems(event);

            //Find out if the clicked node (or one of its parents) is a actual item in this.items
            $(event.target).parents().each(function() {
                if($.data(this, that.widgetName + "-item") === that) {
                    currentItem = $(this);
                    return false;
                }
            });
            if($.data(event.target, that.widgetName + "-item") === that) {
                currentItem = $(event.target);
            }

            if(!currentItem) {
                return false;
            }
            if(this.options.handle && !overrideHandle) {
                $(this.options.handle, currentItem).find("*").addBack().each(function() {
                    if(this === event.target) {
                        validHandle = true;
                    }
                });
                if(!validHandle) {
                    return false;
                }
            }

            this.currentItem = currentItem;
            this._removeCurrentsFromItems();
            return true;

        },

        _mouseStart: function(event, overrideHandle, noActivation) {

            var i, body,
                o = this.options;

            this.currentContainer = this;

            //We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
            this.refreshPositions();

            //Create and append the visible helper
            this.helper = this._createHelper(event);

            //Cache the helper size
            this._cacheHelperProportions();

            /*
             * - Position generation -
             * This block generates everything position related - it's the core of draggables.
             */

            //Cache the margins of the original element
            this._cacheMargins();

            //Get the next scrolling parent
            this.scrollParent = this.helper.scrollParent();

            //The element's absolute position on the page minus margins
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend(this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
            });

            // Only after we got the offset, we can change the helper's position to absolute
            // TODO: Still need to figure out a way to make relative sorting possible
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");

            //Generate the original position
            this.originalPosition = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;

            //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

            //Cache the former DOM position
            this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

            //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
            if(this.helper[0] !== this.currentItem[0]) {
                this.currentItem.hide();
            }

            //Create the placeholder
            this._createPlaceholder();

            //Set a containment if given in the options
            if(o.containment) {
                this._setContainment();
            }

            if( o.cursor && o.cursor !== "auto" ) { // cursor option
                body = this.document.find( "body" );

                // support: IE
                this.storedCursor = body.css( "cursor" );
                body.css( "cursor", o.cursor );

                this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
            }

            if(o.opacity) { // opacity option
                if (this.helper.css("opacity")) {
                    this._storedOpacity = this.helper.css("opacity");
                }
                this.helper.css("opacity", o.opacity);
            }

            if(o.zIndex) { // zIndex option
                if (this.helper.css("zIndex")) {
                    this._storedZIndex = this.helper.css("zIndex");
                }
                this.helper.css("zIndex", o.zIndex);
            }

            //Prepare scrolling
            if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
                this.overflowOffset = this.scrollParent.offset();
            }

            //Call callbacks
            this._trigger("start", event, this._uiHash());

            //Recache the helper size
            if(!this._preserveHelperProportions) {
                this._cacheHelperProportions();
            }


            //Post "activate" events to possible containers
            if( !noActivation ) {
                for ( i = this.containers.length - 1; i >= 0; i-- ) {
                    this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
                }
            }

            //Prepare possible droppables
            if($.ui.ddmanager) {
                $.ui.ddmanager.current = this;
            }

            if ($.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(this, event);
            }

            this.dragging = true;

            this.helper.addClass("ui-sortable-helper");
            this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
            return true;

        },

        _mouseDrag: function(event) {
            var i, item, itemElement, intersection,
                o = this.options,
                scrolled = false;

            //Compute the helpers position
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo("absolute");

            if (!this.lastPositionAbs) {
                this.lastPositionAbs = this.positionAbs;
            }

            //Do scrolling
            if(this.options.scroll) {
                if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {

                    if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
                    } else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
                    }

                    if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
                    } else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
                    }

                } else {

                    if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    } else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                    }

                    if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    } else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                    }

                }

                if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
                    $.ui.ddmanager.prepareOffsets(this, event);
                }
            }

            //Regenerate the absolute position used for position checks
            this.positionAbs = this._convertPositionTo("absolute");

            //Set the helper position
            if(!this.options.axis || this.options.axis !== "y") {
                this.helper[0].style.left = this.position.left+"px";
            }
            if(!this.options.axis || this.options.axis !== "x") {
                this.helper[0].style.top = this.position.top+"px";
            }

            //Rearrange
            for (i = this.items.length - 1; i >= 0; i--) {

                //Cache variables and intersection, continue if no intersection
                item = this.items[i];
                itemElement = item.item[0];
                intersection = this._intersectsWithPointer(item);
                if (!intersection) {
                    continue;
                }

                // Only put the placeholder inside the current Container, skip all
                // items from other containers. This works because when moving
                // an item from one container to another the
                // currentContainer is switched before the placeholder is moved.
                //
                // Without this, moving items in "sub-sortables" can cause
                // the placeholder to jitter between the outer and inner container.
                if (item.instance !== this.currentContainer) {
                    continue;
                }

                // cannot intersect with itself
                // no useless actions that have been done before
                // no action if the item moved is the parent of the item checked
                if (itemElement !== this.currentItem[0] &&
                    this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
                    !$.contains(this.placeholder[0], itemElement) &&
                    (this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
                ) {

                    this.direction = intersection === 1 ? "down" : "up";

                    if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
                        this._rearrange(event, item);
                    } else {
                        break;
                    }

                    this._trigger("change", event, this._uiHash());
                    break;
                }
            }

            //Post events to containers
            this._contactContainers(event);

            //Interconnect with droppables
            if($.ui.ddmanager) {
                $.ui.ddmanager.drag(this, event);
            }

            //Call callbacks
            this._trigger("sort", event, this._uiHash());

            this.lastPositionAbs = this.positionAbs;
            return false;

        },

        _mouseStop: function(event, noPropagation) {

            if(!event) {
                return;
            }

            //If we are using droppables, inform the manager about the drop
            if ($.ui.ddmanager && !this.options.dropBehaviour) {
                $.ui.ddmanager.drop(this, event);
            }

            if(this.options.revert) {
                var that = this,
                    cur = this.placeholder.offset(),
                    axis = this.options.axis,
                    animation = {};

                if ( !axis || axis === "x" ) {
                    animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft);
                }
                if ( !axis || axis === "y" ) {
                    animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop);
                }
                this.reverting = true;
                $(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
                    that._clear(event);
                });
            } else {
                this._clear(event, noPropagation);
            }

            return false;

        },

        cancel: function() {

            if(this.dragging) {

                this._mouseUp({ target: null });

                if(this.options.helper === "original") {
                    this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
                } else {
                    this.currentItem.show();
                }

                //Post deactivating events to containers
                for (var i = this.containers.length - 1; i >= 0; i--){
                    this.containers[i]._trigger("deactivate", null, this._uiHash(this));
                    if(this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", null, this._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }

            }

            if (this.placeholder) {
                //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
                if(this.placeholder[0].parentNode) {
                    this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
                }
                if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
                    this.helper.remove();
                }

                $.extend(this, {
                    helper: null,
                    dragging: false,
                    reverting: false,
                    _noFinalSort: null
                });

                if(this.domPosition.prev) {
                    $(this.domPosition.prev).after(this.currentItem);
                } else {
                    $(this.domPosition.parent).prepend(this.currentItem);
                }
            }

            return this;

        },

        serialize: function(o) {

            var items = this._getItemsAsjQuery(o && o.connected),
                str = [];
            o = o || {};

            $(items).each(function() {
                var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
                if (res) {
                    str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
                }
            });

            if(!str.length && o.key) {
                str.push(o.key + "=");
            }

            return str.join("&");

        },

        toArray: function(o) {

            var items = this._getItemsAsjQuery(o && o.connected),
                ret = [];

            o = o || {};

            items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
            return ret;

        },

        /* Be careful with the following core functions */
        _intersectsWith: function(item) {

            var x1 = this.positionAbs.left,
                x2 = x1 + this.helperProportions.width,
                y1 = this.positionAbs.top,
                y2 = y1 + this.helperProportions.height,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
                isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
                isOverElement = isOverElementHeight && isOverElementWidth;

            if ( this.options.tolerance === "pointer" ||
                this.options.forcePointerForContainers ||
                (this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
            ) {
                return isOverElement;
            } else {

                return (l < x1 + (this.helperProportions.width / 2) && // Right Half
                x2 - (this.helperProportions.width / 2) < r && // Left Half
                t < y1 + (this.helperProportions.height / 2) && // Bottom Half
                y2 - (this.helperProportions.height / 2) < b ); // Top Half

            }
        },

        _intersectsWithPointer: function(item) {

            var isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
                isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
                isOverElement = isOverElementHeight && isOverElementWidth,
                verticalDirection = this._getDragVerticalDirection(),
                horizontalDirection = this._getDragHorizontalDirection();

            if (!isOverElement) {
                return false;
            }

            return this.floating ?
                ( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
                : ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

        },

        _intersectsWithSides: function(item) {

            var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
                isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
                verticalDirection = this._getDragVerticalDirection(),
                horizontalDirection = this._getDragHorizontalDirection();

            if (this.floating && horizontalDirection) {
                return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
            } else {
                return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
            }

        },

        _getDragVerticalDirection: function() {
            var delta = this.positionAbs.top - this.lastPositionAbs.top;
            return delta !== 0 && (delta > 0 ? "down" : "up");
        },

        _getDragHorizontalDirection: function() {
            var delta = this.positionAbs.left - this.lastPositionAbs.left;
            return delta !== 0 && (delta > 0 ? "right" : "left");
        },

        refresh: function(event) {
            this._refreshItems(event);
            this._setHandleClassName();
            this.refreshPositions();
            return this;
        },

        _connectWith: function() {
            var options = this.options;
            return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
        },

        _getItemsAsjQuery: function(connected) {

            var i, j, cur, inst,
                items = [],
                queries = [],
                connectWith = this._connectWith();

            if(connectWith && connected) {
                for (i = connectWith.length - 1; i >= 0; i--){
                    cur = $(connectWith[i]);
                    for ( j = cur.length - 1; j >= 0; j--){
                        inst = $.data(cur[j], this.widgetFullName);
                        if(inst && inst !== this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
                        }
                    }
                }
            }

            queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

            function addItems() {
                items.push( this );
            }
            for (i = queries.length - 1; i >= 0; i--){
                queries[i][0].each( addItems );
            }

            return $(items);

        },

        _removeCurrentsFromItems: function() {

            var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

            this.items = $.grep(this.items, function (item) {
                for (var j=0; j < list.length; j++) {
                    if(list[j] === item.item[0]) {
                        return false;
                    }
                }
                return true;
            });

        },

        _refreshItems: function(event) {

            this.items = [];
            this.containers = [this];

            var i, j, cur, inst, targetData, _queries, item, queriesLength,
                items = this.items,
                queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
                connectWith = this._connectWith();

            if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
                for (i = connectWith.length - 1; i >= 0; i--){
                    cur = $(connectWith[i]);
                    for (j = cur.length - 1; j >= 0; j--){
                        inst = $.data(cur[j], this.widgetFullName);
                        if(inst && inst !== this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
                            this.containers.push(inst);
                        }
                    }
                }
            }

            for (i = queries.length - 1; i >= 0; i--) {
                targetData = queries[i][1];
                _queries = queries[i][0];

                for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
                    item = $(_queries[j]);

                    item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

                    items.push({
                        item: item,
                        instance: targetData,
                        width: 0, height: 0,
                        left: 0, top: 0
                    });
                }
            }

        },

        refreshPositions: function(fast) {

            //This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
            if(this.offsetParent && this.helper) {
                this.offset.parent = this._getParentOffset();
            }

            var i, item, t, p;

            for (i = this.items.length - 1; i >= 0; i--){
                item = this.items[i];

                //We ignore calculating positions of all connected containers when we're not over them
                if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
                    continue;
                }

                t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

                if (!fast) {
                    item.width = t.outerWidth();
                    item.height = t.outerHeight();
                }

                p = t.offset();
                item.left = p.left;
                item.top = p.top;
            }

            if(this.options.custom && this.options.custom.refreshContainers) {
                this.options.custom.refreshContainers.call(this);
            } else {
                for (i = this.containers.length - 1; i >= 0; i--){
                    p = this.containers[i].element.offset();
                    this.containers[i].containerCache.left = p.left;
                    this.containers[i].containerCache.top = p.top;
                    this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
                    this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
                }
            }

            return this;
        },

        _createPlaceholder: function(that) {
            that = that || this;
            var className,
                o = that.options;

            if(!o.placeholder || o.placeholder.constructor === String) {
                className = o.placeholder;
                o.placeholder = {
                    element: function() {

                        var nodeName = that.currentItem[0].nodeName.toLowerCase(),
                            element = $( "<" + nodeName + ">", that.document[0] )
                                .addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
                                .removeClass("ui-sortable-helper");

                        if ( nodeName === "tr" ) {
                            that.currentItem.children().each(function() {
                                $( "<td>&#160;</td>", that.document[0] )
                                    .attr( "colspan", $( this ).attr( "colspan" ) || 1 )
                                    .appendTo( element );
                            });
                        } else if ( nodeName === "img" ) {
                            element.attr( "src", that.currentItem.attr( "src" ) );
                        }

                        if ( !className ) {
                            element.css( "visibility", "hidden" );
                        }

                        return element;
                    },
                    update: function(container, p) {

                        // 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
                        // 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
                        if(className && !o.forcePlaceholderSize) {
                            return;
                        }

                        //If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
                        if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
                        if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
                    }
                };
            }

            //Create the placeholder
            that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

            //Append it after the actual current item
            that.currentItem.after(that.placeholder);

            //Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
            o.placeholder.update(that, that.placeholder);

        },

        _contactContainers: function(event) {
            var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis,
                innermostContainer = null,
                innermostIndex = null;

            // get innermost container that intersects with item
            for (i = this.containers.length - 1; i >= 0; i--) {

                // never consider a container that's located within the item itself
                if($.contains(this.currentItem[0], this.containers[i].element[0])) {
                    continue;
                }

                if(this._intersectsWith(this.containers[i].containerCache)) {

                    // if we've already found a container and it's more "inner" than this, then continue
                    if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
                        continue;
                    }

                    innermostContainer = this.containers[i];
                    innermostIndex = i;

                } else {
                    // container doesn't intersect. trigger "out" event if necessary
                    if(this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", event, this._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }

            }

            // if no intersecting containers found, return
            if(!innermostContainer) {
                return;
            }

            // move the item into the container if it's not there already
            if(this.containers.length === 1) {
                if (!this.containers[innermostIndex].containerCache.over) {
                    this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                    this.containers[innermostIndex].containerCache.over = 1;
                }
            } else {

                //When entering a new container, we will find the item with the least distance and append our item near it
                dist = 10000;
                itemWithLeastDistance = null;
                floating = innermostContainer.floating || this._isFloating(this.currentItem);
                posProperty = floating ? "left" : "top";
                sizeProperty = floating ? "width" : "height";
                axis = floating ? "clientX" : "clientY";

                for (j = this.items.length - 1; j >= 0; j--) {
                    if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
                        continue;
                    }
                    if(this.items[j].item[0] === this.currentItem[0]) {
                        continue;
                    }

                    cur = this.items[j].item.offset()[posProperty];
                    nearBottom = false;
                    if ( event[ axis ] - cur > this.items[ j ][ sizeProperty ] / 2 ) {
                        nearBottom = true;
                    }

                    if ( Math.abs( event[ axis ] - cur ) < dist ) {
                        dist = Math.abs( event[ axis ] - cur );
                        itemWithLeastDistance = this.items[ j ];
                        this.direction = nearBottom ? "up": "down";
                    }
                }

                //Check if dropOnEmpty is enabled
                if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
                    return;
                }

                if(this.currentContainer === this.containers[innermostIndex]) {
                    if ( !this.currentContainer.containerCache.over ) {
                        this.containers[ innermostIndex ]._trigger( "over", event, this._uiHash() );
                        this.currentContainer.containerCache.over = 1;
                    }
                    return;
                }

                itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
                this._trigger("change", event, this._uiHash());
                this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
                this.currentContainer = this.containers[innermostIndex];

                //Update the placeholder
                this.options.placeholder.update(this.currentContainer, this.placeholder);

                this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                this.containers[innermostIndex].containerCache.over = 1;
            }


        },

        _createHelper: function(event) {

            var o = this.options,
                helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

            //Add the helper to the DOM if that didn't happen already
            if(!helper.parents("body").length) {
                $(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
            }

            if(helper[0] === this.currentItem[0]) {
                this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
            }

            if(!helper[0].style.width || o.forceHelperSize) {
                helper.width(this.currentItem.width());
            }
            if(!helper[0].style.height || o.forceHelperSize) {
                helper.height(this.currentItem.height());
            }

            return helper;

        },

        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj === "string") {
                obj = obj.split(" ");
            }
            if ($.isArray(obj)) {
                obj = {left: +obj[0], top: +obj[1] || 0};
            }
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _getParentOffset: function() {


            //Get the offsetParent and cache its position
            this.offsetParent = this.helper.offsetParent();
            var po = this.offsetParent.offset();

            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            // This needs to be actually done for all browsers, since pageX/pageY includes this information
            // with an ugly IE fix
            if( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
                po = { top: 0, left: 0 };
            }

            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
            };

        },

        _getRelativeOffset: function() {

            if(this.cssPosition === "relative") {
                var p = this.currentItem.position();
                return {
                    top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
                    left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
                };
            } else {
                return { top: 0, left: 0 };
            }

        },

        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
                top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
            };
        },

        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment: function() {

            var ce, co, over,
                o = this.options;
            if(o.containment === "parent") {
                o.containment = this.helper[0].parentNode;
            }
            if(o.containment === "document" || o.containment === "window") {
                this.containment = [
                    0 - this.offset.relative.left - this.offset.parent.left,
                    0 - this.offset.relative.top - this.offset.parent.top,
                    $(o.containment === "document" ? document : window).width() - this.helperProportions.width - this.margins.left,
                    ($(o.containment === "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                ];
            }

            if(!(/^(document|window|parent)$/).test(o.containment)) {
                ce = $(o.containment)[0];
                co = $(o.containment).offset();
                over = ($(ce).css("overflow") !== "hidden");

                this.containment = [
                    co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
                    co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
                    co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
                    co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
                ];
            }

        },

        _convertPositionTo: function(d, pos) {

            if(!pos) {
                pos = this.position;
            }
            var mod = d === "absolute" ? 1 : -1,
                scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

            return {
                top: (
                pos.top	+																// The absolute mouse position
                this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
                ),
                left: (
                pos.left +																// The absolute mouse position
                this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
                )
            };

        },

        _generatePosition: function(event) {

            var top, left,
                o = this.options,
                pageX = event.pageX,
                pageY = event.pageY,
                scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

            // This is another very weird special case that only happens for relative elements:
            // 1. If the css position is relative
            // 2. and the scroll parent is the document or similar to the offset parent
            // we have to refresh the relative offset during the scroll so there are no jumps
            if(this.cssPosition === "relative" && !(this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0])) {
                this.offset.relative = this._getRelativeOffset();
            }

            /*
             * - Position constraining -
             * Constrain the position to a mix of grid, containment.
             */

            if(this.originalPosition) { //If we are not dragging yet, we won't check for options

                if(this.containment) {
                    if(event.pageX - this.offset.click.left < this.containment[0]) {
                        pageX = this.containment[0] + this.offset.click.left;
                    }
                    if(event.pageY - this.offset.click.top < this.containment[1]) {
                        pageY = this.containment[1] + this.offset.click.top;
                    }
                    if(event.pageX - this.offset.click.left > this.containment[2]) {
                        pageX = this.containment[2] + this.offset.click.left;
                    }
                    if(event.pageY - this.offset.click.top > this.containment[3]) {
                        pageY = this.containment[3] + this.offset.click.top;
                    }
                }

                if(o.grid) {
                    top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
                    pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

                    left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
                    pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }

            }

            return {
                top: (
                pageY -																// The absolute mouse position
                this.offset.click.top -													// Click offset (relative to the element)
                this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
                ),
                left: (
                pageX -																// The absolute mouse position
                this.offset.click.left -												// Click offset (relative to the element)
                this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
                ( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
                )
            };

        },

        _rearrange: function(event, i, a, hardRefresh) {

            a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

            //Various things done here to improve the performance:
            // 1. we create a setTimeout, that calls refreshPositions
            // 2. on the instance, we have a counter variable, that get's higher after every append
            // 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
            // 4. this lets only the last addition to the timeout stack through
            this.counter = this.counter ? ++this.counter : 1;
            var counter = this.counter;

            this._delay(function() {
                if(counter === this.counter) {
                    this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
                }
            });

        },

        _clear: function(event, noPropagation) {

            this.reverting = false;
            // We delay all events that have to be triggered to after the point where the placeholder has been removed and
            // everything else normalized again
            var i,
                delayedTriggers = [];

            // We first have to update the dom position of the actual currentItem
            // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
            if(!this._noFinalSort && this.currentItem.parent().length) {
                this.placeholder.before(this.currentItem);
            }
            this._noFinalSort = null;

            if(this.helper[0] === this.currentItem[0]) {
                for(i in this._storedCSS) {
                    if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
                        this._storedCSS[i] = "";
                    }
                }
                this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
            } else {
                this.currentItem.show();
            }

            if(this.fromOutside && !noPropagation) {
                delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
            }
            if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
                delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
            }

            // Check if the items Container has Changed and trigger appropriate
            // events.
            if (this !== this.currentContainer) {
                if(!noPropagation) {
                    delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
                    delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
                }
            }


            //Post events to containers
            function delayEvent( type, instance, container ) {
                return function( event ) {
                    container._trigger( type, event, instance._uiHash( instance ) );
                };
            }
            for (i = this.containers.length - 1; i >= 0; i--){
                if (!noPropagation) {
                    delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
                }
                if(this.containers[i].containerCache.over) {
                    delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
                    this.containers[i].containerCache.over = 0;
                }
            }

            //Do what was originally in plugins
            if ( this.storedCursor ) {
                this.document.find( "body" ).css( "cursor", this.storedCursor );
                this.storedStylesheet.remove();
            }
            if(this._storedOpacity) {
                this.helper.css("opacity", this._storedOpacity);
            }
            if(this._storedZIndex) {
                this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
            }

            this.dragging = false;

            if(!noPropagation) {
                this._trigger("beforeStop", event, this._uiHash());
            }

            //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
            this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

            if ( !this.cancelHelperRemoval ) {
                if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
                    this.helper.remove();
                }
                this.helper = null;
            }

            if(!noPropagation) {
                for (i=0; i < delayedTriggers.length; i++) {
                    delayedTriggers[i].call(this, event);
                } //Trigger all delayed events
                this._trigger("stop", event, this._uiHash());
            }

            this.fromOutside = false;
            return !this.cancelHelperRemoval;

        },

        _trigger: function() {
            if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
                this.cancel();
            }
        },

        _uiHash: function(_inst) {
            var inst = _inst || this;
            return {
                helper: inst.helper,
                placeholder: inst.placeholder || $([]),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                item: inst.currentItem,
                sender: _inst ? _inst.element : null
            };
        }

    });


    /*!
     * jQuery UI Datepicker 1.11.2
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/datepicker/
     */


    $.extend($.ui, { datepicker: { version: "1.11.2" } });

    var datepicker_instActive;

    function datepicker_getZindex( elem ) {
        var position, value;
        while ( elem.length && elem[ 0 ] !== document ) {
            // Ignore z-index if position is set to a value where z-index is ignored by the browser
            // This makes behavior of this function consistent across browsers
            // WebKit always returns auto if the element is positioned
            position = elem.css( "position" );
            if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                // IE returns 0 when zIndex is not specified
                // other browsers return a string
                // we ignore the case of nested elements with an explicit value of 0
                // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                value = parseInt( elem.css( "zIndex" ), 10 );
                if ( !isNaN( value ) && value !== 0 ) {
                    return value;
                }
            }
            elem = elem.parent();
        }

        return 0;
    }
    /* Date picker manager.
     Use the singleton instance of this class, $.datepicker, to interact with the date picker.
     Settings for (groups of) date pickers are maintained in an instance object,
     allowing multiple different settings on the same page. */

    function Datepicker() {
        this._curInst = null; // The current instance in use
        this._keyEvent = false; // If the last event was a key event
        this._disabledInputs = []; // List of date picker inputs that have been disabled
        this._datepickerShowing = false; // True if the popup picker is showing , false if not
        this._inDialog = false; // True if showing within a "dialog", false if not
        this._mainDivId = "ui-datepicker-div"; // The ID of the main datepicker division
        this._inlineClass = "ui-datepicker-inline"; // The name of the inline marker class
        this._appendClass = "ui-datepicker-append"; // The name of the append marker class
        this._triggerClass = "ui-datepicker-trigger"; // The name of the trigger marker class
        this._dialogClass = "ui-datepicker-dialog"; // The name of the dialog marker class
        this._disableClass = "ui-datepicker-disabled"; // The name of the disabled covering marker class
        this._unselectableClass = "ui-datepicker-unselectable"; // The name of the unselectable cell marker class
        this._currentClass = "ui-datepicker-current-day"; // The name of the current day marker class
        this._dayOverClass = "ui-datepicker-days-cell-over"; // The name of the day hover marker class
        this.regional = []; // Available regional settings, indexed by language code
        this.regional[""] = { // Default regional settings
            closeText: "Done", // Display text for close link
            prevText: "Prev", // Display text for previous month link
            nextText: "Next", // Display text for next month link
            currentText: "Today", // Display text for current month link
            monthNames: ["January","February","March","April","May","June",
                "July","August","September","October","November","December"], // Names of months for drop-down and formatting
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // For formatting
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // For formatting
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // For formatting
            dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"], // Column headings for days starting at Sunday
            weekHeader: "Wk", // Column header for week of the year
            dateFormat: "mm/dd/yy", // See format options on parseDate
            firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
            isRTL: false, // True if right-to-left language, false if left-to-right
            showMonthAfterYear: false, // True if the year select precedes month, false for month then year
            yearSuffix: "" // Additional text to append to the year in the month headers
        };
        this._defaults = { // Global defaults for all the date picker instances
            showOn: "focus", // "focus" for popup on focus,
            // "button" for trigger button, or "both" for either
            showAnim: "fadeIn", // Name of jQuery animation for popup
            showOptions: {}, // Options for enhanced animations
            defaultDate: null, // Used when field is blank: actual date,
            // +/-number for offset from today, null for today
            appendText: "", // Display text following the input box, e.g. showing the format
            buttonText: "...", // Text for trigger button
            buttonImage: "", // URL for trigger button image
            buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
            hideIfNoPrevNext: false, // True to hide next/previous month links
            // if not applicable, false to just disable them
            navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
            gotoCurrent: false, // True if today link goes back to current selection instead
            changeMonth: false, // True if month can be selected directly, false if only prev/next
            changeYear: false, // True if year can be selected directly, false if only prev/next
            yearRange: "c-10:c+10", // Range of years to display in drop-down,
            // either relative to today's year (-nn:+nn), relative to currently displayed year
            // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
            showOtherMonths: false, // True to show dates in other months, false to leave blank
            selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
            showWeek: false, // True to show week of the year, false to not show it
            calculateWeek: this.iso8601Week, // How to calculate the week of the year,
            // takes a Date and returns the number of the week for it
            shortYearCutoff: "+10", // Short year values < this are in the current century,
            // > this are in the previous century,
            // string value starting with "+" for current year + value
            minDate: null, // The earliest selectable date, or null for no limit
            maxDate: null, // The latest selectable date, or null for no limit
            duration: "fast", // Duration of display/closure
            beforeShowDay: null, // Function that takes a date and returns an array with
            // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
            // [2] = cell title (optional), e.g. $.datepicker.noWeekends
            beforeShow: null, // Function that takes an input field and
            // returns a set of custom settings for the date picker
            onSelect: null, // Define a callback function when a date is selected
            onChangeMonthYear: null, // Define a callback function when the month or year is changed
            onClose: null, // Define a callback function when the datepicker is closed
            numberOfMonths: 1, // Number of months to show at a time
            showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
            stepMonths: 1, // Number of months to step back/forward
            stepBigMonths: 12, // Number of months to step back/forward for the big links
            altField: "", // Selector for an alternate field to store selected dates into
            altFormat: "", // The date format to use for the alternate field
            constrainInput: true, // The input is constrained by the current date format
            showButtonPanel: false, // True to show button panel, false to not show it
            autoSize: false, // True to size the input for the date format, false to leave as is
            disabled: false // The initial disabled state
        };
        $.extend(this._defaults, this.regional[""]);
        this.regional.en = $.extend( true, {}, this.regional[ "" ]);
        this.regional[ "en-US" ] = $.extend( true, {}, this.regional.en );
        this.dpDiv = datepicker_bindHover($("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"));
    }

    $.extend(Datepicker.prototype, {
        /* Class name added to elements to indicate already configured with a date picker. */
        markerClassName: "hasDatepicker",

        //Keep track of the maximum number of rows displayed (see #7043)
        maxRows: 4,

        // TODO rename to "widget" when switching to widget factory
        _widgetDatepicker: function() {
            return this.dpDiv;
        },

        /* Override the default settings for all instances of the date picker.
         * @param  settings  object - the new settings to use as defaults (anonymous object)
         * @return the manager object
         */
        setDefaults: function(settings) {
            datepicker_extendRemove(this._defaults, settings || {});
            return this;
        },

        /* Attach the date picker to a jQuery selection.
         * @param  target	element - the target input field or division or span
         * @param  settings  object - the new settings to use for this date picker instance (anonymous)
         */
        _attachDatepicker: function(target, settings) {
            var nodeName, inline, inst;
            nodeName = target.nodeName.toLowerCase();
            inline = (nodeName === "div" || nodeName === "span");
            if (!target.id) {
                this.uuid += 1;
                target.id = "dp" + this.uuid;
            }
            inst = this._newInst($(target), inline);
            inst.settings = $.extend({}, settings || {});
            if (nodeName === "input") {
                this._connectDatepicker(target, inst);
            } else if (inline) {
                this._inlineDatepicker(target, inst);
            }
        },

        /* Create a new instance object. */
        _newInst: function(target, inline) {
            var id = target[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"); // escape jQuery meta chars
            return {id: id, input: target, // associated target
                selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
                drawMonth: 0, drawYear: 0, // month being drawn
                inline: inline, // is datepicker inline or not
                dpDiv: (!inline ? this.dpDiv : // presentation div
                    datepicker_bindHover($("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")))};
        },

        /* Attach the date picker to an input field. */
        _connectDatepicker: function(target, inst) {
            var input = $(target);
            inst.append = $([]);
            inst.trigger = $([]);
            if (input.hasClass(this.markerClassName)) {
                return;
            }
            this._attachments(input, inst);
            input.addClass(this.markerClassName).keydown(this._doKeyDown).
                keypress(this._doKeyPress).keyup(this._doKeyUp);
            this._autoSize(inst);
            $.data(target, "datepicker", inst);
            //If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
            if( inst.settings.disabled ) {
                this._disableDatepicker( target );
            }
        },

        /* Make attachments based on settings. */
        _attachments: function(input, inst) {
            var showOn, buttonText, buttonImage,
                appendText = this._get(inst, "appendText"),
                isRTL = this._get(inst, "isRTL");

            if (inst.append) {
                inst.append.remove();
            }
            if (appendText) {
                inst.append = $("<span class='" + this._appendClass + "'>" + appendText + "</span>");
                input[isRTL ? "before" : "after"](inst.append);
            }

            input.unbind("focus", this._showDatepicker);

            if (inst.trigger) {
                inst.trigger.remove();
            }

            showOn = this._get(inst, "showOn");
            if (showOn === "focus" || showOn === "both") { // pop-up date picker when in the marked field
                input.focus(this._showDatepicker);
            }
            if (showOn === "button" || showOn === "both") { // pop-up date picker when button clicked
                buttonText = this._get(inst, "buttonText");
                buttonImage = this._get(inst, "buttonImage");
                inst.trigger = $(this._get(inst, "buttonImageOnly") ?
                    $("<img/>").addClass(this._triggerClass).
                        attr({ src: buttonImage, alt: buttonText, title: buttonText }) :
                    $("<button type='button'></button>").addClass(this._triggerClass).
                        html(!buttonImage ? buttonText : $("<img/>").attr(
                            { src:buttonImage, alt:buttonText, title:buttonText })));
                input[isRTL ? "before" : "after"](inst.trigger);
                inst.trigger.click(function() {
                    if ($.datepicker._datepickerShowing && $.datepicker._lastInput === input[0]) {
                        $.datepicker._hideDatepicker();
                    } else if ($.datepicker._datepickerShowing && $.datepicker._lastInput !== input[0]) {
                        $.datepicker._hideDatepicker();
                        $.datepicker._showDatepicker(input[0]);
                    } else {
                        $.datepicker._showDatepicker(input[0]);
                    }
                    return false;
                });
            }
        },

        /* Apply the maximum length for the date format. */
        _autoSize: function(inst) {
            if (this._get(inst, "autoSize") && !inst.inline) {
                var findMax, max, maxI, i,
                    date = new Date(2009, 12 - 1, 20), // Ensure double digits
                    dateFormat = this._get(inst, "dateFormat");

                if (dateFormat.match(/[DM]/)) {
                    findMax = function(names) {
                        max = 0;
                        maxI = 0;
                        for (i = 0; i < names.length; i++) {
                            if (names[i].length > max) {
                                max = names[i].length;
                                maxI = i;
                            }
                        }
                        return maxI;
                    };
                    date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ?
                        "monthNames" : "monthNamesShort"))));
                    date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ?
                        "dayNames" : "dayNamesShort"))) + 20 - date.getDay());
                }
                inst.input.attr("size", this._formatDate(inst, date).length);
            }
        },

        /* Attach an inline date picker to a div. */
        _inlineDatepicker: function(target, inst) {
            var divSpan = $(target);
            if (divSpan.hasClass(this.markerClassName)) {
                return;
            }
            divSpan.addClass(this.markerClassName).append(inst.dpDiv);
            $.data(target, "datepicker", inst);
            this._setDate(inst, this._getDefaultDate(inst), true);
            this._updateDatepicker(inst);
            this._updateAlternate(inst);
            //If disabled option is true, disable the datepicker before showing it (see ticket #5665)
            if( inst.settings.disabled ) {
                this._disableDatepicker( target );
            }
            // Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
            // http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
            inst.dpDiv.css( "display", "block" );
        },

        /* Pop-up the date picker in a "dialog" box.
         * @param  input element - ignored
         * @param  date	string or Date - the initial date to display
         * @param  onSelect  function - the function to call when a date is selected
         * @param  settings  object - update the dialog date picker instance's settings (anonymous object)
         * @param  pos int[2] - coordinates for the dialog's position within the screen or
         *					event - with x/y coordinates or
         *					leave empty for default (screen centre)
         * @return the manager object
         */
        _dialogDatepicker: function(input, date, onSelect, settings, pos) {
            var id, browserWidth, browserHeight, scrollX, scrollY,
                inst = this._dialogInst; // internal instance

            if (!inst) {
                this.uuid += 1;
                id = "dp" + this.uuid;
                this._dialogInput = $("<input type='text' id='" + id +
                "' style='position: absolute; top: -100px; width: 0px;'/>");
                this._dialogInput.keydown(this._doKeyDown);
                $("body").append(this._dialogInput);
                inst = this._dialogInst = this._newInst(this._dialogInput, false);
                inst.settings = {};
                $.data(this._dialogInput[0], "datepicker", inst);
            }
            datepicker_extendRemove(inst.settings, settings || {});
            date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
            this._dialogInput.val(date);

            this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
            if (!this._pos) {
                browserWidth = document.documentElement.clientWidth;
                browserHeight = document.documentElement.clientHeight;
                scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                this._pos = // should use actual width/height below
                    [(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
            }

            // move input on screen for focus, but hidden behind dialog
            this._dialogInput.css("left", (this._pos[0] + 20) + "px").css("top", this._pos[1] + "px");
            inst.settings.onSelect = onSelect;
            this._inDialog = true;
            this.dpDiv.addClass(this._dialogClass);
            this._showDatepicker(this._dialogInput[0]);
            if ($.blockUI) {
                $.blockUI(this.dpDiv);
            }
            $.data(this._dialogInput[0], "datepicker", inst);
            return this;
        },

        /* Detach a datepicker from its control.
         * @param  target	element - the target input field or division or span
         */
        _destroyDatepicker: function(target) {
            var nodeName,
                $target = $(target),
                inst = $.data(target, "datepicker");

            if (!$target.hasClass(this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            $.removeData(target, "datepicker");
            if (nodeName === "input") {
                inst.append.remove();
                inst.trigger.remove();
                $target.removeClass(this.markerClassName).
                    unbind("focus", this._showDatepicker).
                    unbind("keydown", this._doKeyDown).
                    unbind("keypress", this._doKeyPress).
                    unbind("keyup", this._doKeyUp);
            } else if (nodeName === "div" || nodeName === "span") {
                $target.removeClass(this.markerClassName).empty();
            }
        },

        /* Enable the date picker to a jQuery selection.
         * @param  target	element - the target input field or division or span
         */
        _enableDatepicker: function(target) {
            var nodeName, inline,
                $target = $(target),
                inst = $.data(target, "datepicker");

            if (!$target.hasClass(this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            if (nodeName === "input") {
                target.disabled = false;
                inst.trigger.filter("button").
                    each(function() { this.disabled = false; }).end().
                    filter("img").css({opacity: "1.0", cursor: ""});
            } else if (nodeName === "div" || nodeName === "span") {
                inline = $target.children("." + this._inlineClass);
                inline.children().removeClass("ui-state-disabled");
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
                    prop("disabled", false);
            }
            this._disabledInputs = $.map(this._disabledInputs,
                function(value) { return (value === target ? null : value); }); // delete entry
        },

        /* Disable the date picker to a jQuery selection.
         * @param  target	element - the target input field or division or span
         */
        _disableDatepicker: function(target) {
            var nodeName, inline,
                $target = $(target),
                inst = $.data(target, "datepicker");

            if (!$target.hasClass(this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            if (nodeName === "input") {
                target.disabled = true;
                inst.trigger.filter("button").
                    each(function() { this.disabled = true; }).end().
                    filter("img").css({opacity: "0.5", cursor: "default"});
            } else if (nodeName === "div" || nodeName === "span") {
                inline = $target.children("." + this._inlineClass);
                inline.children().addClass("ui-state-disabled");
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
                    prop("disabled", true);
            }
            this._disabledInputs = $.map(this._disabledInputs,
                function(value) { return (value === target ? null : value); }); // delete entry
            this._disabledInputs[this._disabledInputs.length] = target;
        },

        /* Is the first field in a jQuery collection disabled as a datepicker?
         * @param  target	element - the target input field or division or span
         * @return boolean - true if disabled, false if enabled
         */
        _isDisabledDatepicker: function(target) {
            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] === target) {
                    return true;
                }
            }
            return false;
        },

        /* Retrieve the instance data for the target control.
         * @param  target  element - the target input field or division or span
         * @return  object - the associated instance data
         * @throws  error if a jQuery problem getting data
         */
        _getInst: function(target) {
            try {
                return $.data(target, "datepicker");
            }
            catch (err) {
                throw "Missing instance data for this datepicker";
            }
        },

        /* Update or retrieve the settings for a date picker attached to an input field or division.
         * @param  target  element - the target input field or division or span
         * @param  name	object - the new settings to update or
         *				string - the name of the setting to change or retrieve,
         *				when retrieving also "all" for all instance settings or
         *				"defaults" for all global defaults
         * @param  value   any - the new value for the setting
         *				(omit if above is an object or to retrieve a value)
         */
        _optionDatepicker: function(target, name, value) {
            var settings, date, minDate, maxDate,
                inst = this._getInst(target);

            if (arguments.length === 2 && typeof name === "string") {
                return (name === "defaults" ? $.extend({}, $.datepicker._defaults) :
                    (inst ? (name === "all" ? $.extend({}, inst.settings) :
                        this._get(inst, name)) : null));
            }

            settings = name || {};
            if (typeof name === "string") {
                settings = {};
                settings[name] = value;
            }

            if (inst) {
                if (this._curInst === inst) {
                    this._hideDatepicker();
                }

                date = this._getDateDatepicker(target, true);
                minDate = this._getMinMaxDate(inst, "min");
                maxDate = this._getMinMaxDate(inst, "max");
                datepicker_extendRemove(inst.settings, settings);
                // reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
                if (minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined) {
                    inst.settings.minDate = this._formatDate(inst, minDate);
                }
                if (maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined) {
                    inst.settings.maxDate = this._formatDate(inst, maxDate);
                }
                if ( "disabled" in settings ) {
                    if ( settings.disabled ) {
                        this._disableDatepicker(target);
                    } else {
                        this._enableDatepicker(target);
                    }
                }
                this._attachments($(target), inst);
                this._autoSize(inst);
                this._setDate(inst, date);
                this._updateAlternate(inst);
                this._updateDatepicker(inst);
            }
        },

        // change method deprecated
        _changeDatepicker: function(target, name, value) {
            this._optionDatepicker(target, name, value);
        },

        /* Redraw the date picker attached to an input field or division.
         * @param  target  element - the target input field or division or span
         */
        _refreshDatepicker: function(target) {
            var inst = this._getInst(target);
            if (inst) {
                this._updateDatepicker(inst);
            }
        },

        /* Set the dates for a jQuery selection.
         * @param  target element - the target input field or division or span
         * @param  date	Date - the new date
         */
        _setDateDatepicker: function(target, date) {
            var inst = this._getInst(target);
            if (inst) {
                this._setDate(inst, date);
                this._updateDatepicker(inst);
                this._updateAlternate(inst);
            }
        },

        /* Get the date(s) for the first entry in a jQuery selection.
         * @param  target element - the target input field or division or span
         * @param  noDefault boolean - true if no default date is to be used
         * @return Date - the current date
         */
        _getDateDatepicker: function(target, noDefault) {
            var inst = this._getInst(target);
            if (inst && !inst.inline) {
                this._setDateFromField(inst, noDefault);
            }
            return (inst ? this._getDate(inst) : null);
        },

        /* Handle keystrokes. */
        _doKeyDown: function(event) {
            var onSelect, dateStr, sel,
                inst = $.datepicker._getInst(event.target),
                handled = true,
                isRTL = inst.dpDiv.is(".ui-datepicker-rtl");

            inst._keyEvent = true;
            if ($.datepicker._datepickerShowing) {
                switch (event.keyCode) {
                    case 9: $.datepicker._hideDatepicker();
                        handled = false;
                        break; // hide on tab out
                    case 13: sel = $("td." + $.datepicker._dayOverClass + ":not(." +
                    $.datepicker._currentClass + ")", inst.dpDiv);
                        if (sel[0]) {
                            $.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
                        }

                        onSelect = $.datepicker._get(inst, "onSelect");
                        if (onSelect) {
                            dateStr = $.datepicker._formatDate(inst);

                            // trigger custom callback
                            onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
                        } else {
                            $.datepicker._hideDatepicker();
                        }

                        return false; // don't submit the form
                    case 27: $.datepicker._hideDatepicker();
                        break; // hide on escape
                    case 33: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
                        -$.datepicker._get(inst, "stepBigMonths") :
                        -$.datepicker._get(inst, "stepMonths")), "M");
                        break; // previous month/year on page up/+ ctrl
                    case 34: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
                        +$.datepicker._get(inst, "stepBigMonths") :
                        +$.datepicker._get(inst, "stepMonths")), "M");
                        break; // next month/year on page down/+ ctrl
                    case 35: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._clearDate(event.target);
                    }
                        handled = event.ctrlKey || event.metaKey;
                        break; // clear on ctrl or command +end
                    case 36: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._gotoToday(event.target);
                    }
                        handled = event.ctrlKey || event.metaKey;
                        break; // current on ctrl or command +home
                    case 37: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), "D");
                    }
                        handled = event.ctrlKey || event.metaKey;
                        // -1 day on ctrl or command +left
                        if (event.originalEvent.altKey) {
                            $.datepicker._adjustDate(event.target, (event.ctrlKey ?
                                -$.datepicker._get(inst, "stepBigMonths") :
                                -$.datepicker._get(inst, "stepMonths")), "M");
                        }
                        // next month/year on alt +left on Mac
                        break;
                    case 38: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._adjustDate(event.target, -7, "D");
                    }
                        handled = event.ctrlKey || event.metaKey;
                        break; // -1 week on ctrl or command +up
                    case 39: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), "D");
                    }
                        handled = event.ctrlKey || event.metaKey;
                        // +1 day on ctrl or command +right
                        if (event.originalEvent.altKey) {
                            $.datepicker._adjustDate(event.target, (event.ctrlKey ?
                                +$.datepicker._get(inst, "stepBigMonths") :
                                +$.datepicker._get(inst, "stepMonths")), "M");
                        }
                        // next month/year on alt +right
                        break;
                    case 40: if (event.ctrlKey || event.metaKey) {
                        $.datepicker._adjustDate(event.target, +7, "D");
                    }
                        handled = event.ctrlKey || event.metaKey;
                        break; // +1 week on ctrl or command +down
                    default: handled = false;
                }
            } else if (event.keyCode === 36 && event.ctrlKey) { // display the date picker on ctrl+home
                $.datepicker._showDatepicker(this);
            } else {
                handled = false;
            }

            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        /* Filter entered characters - based on date format. */
        _doKeyPress: function(event) {
            var chars, chr,
                inst = $.datepicker._getInst(event.target);

            if ($.datepicker._get(inst, "constrainInput")) {
                chars = $.datepicker._possibleChars($.datepicker._get(inst, "dateFormat"));
                chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
                return event.ctrlKey || event.metaKey || (chr < " " || !chars || chars.indexOf(chr) > -1);
            }
        },

        /* Synchronise manual entry and field/alternate field. */
        _doKeyUp: function(event) {
            var date,
                inst = $.datepicker._getInst(event.target);

            if (inst.input.val() !== inst.lastVal) {
                try {
                    date = $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
                        (inst.input ? inst.input.val() : null),
                        $.datepicker._getFormatConfig(inst));

                    if (date) { // only if valid
                        $.datepicker._setDateFromField(inst);
                        $.datepicker._updateAlternate(inst);
                        $.datepicker._updateDatepicker(inst);
                    }
                }
                catch (err) {
                }
            }
            return true;
        },

        /* Pop-up the date picker for a given input field.
         * If false returned from beforeShow event handler do not show.
         * @param  input  element - the input field attached to the date picker or
         *					event - if triggered by focus
         */
        _showDatepicker: function(input) {
            input = input.target || input;
            if (input.nodeName.toLowerCase() !== "input") { // find from button/image trigger
                input = $("input", input.parentNode)[0];
            }

            if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput === input) { // already here
                return;
            }

            var inst, beforeShow, beforeShowSettings, isFixed,
                offset, showAnim, duration;

            inst = $.datepicker._getInst(input);
            if ($.datepicker._curInst && $.datepicker._curInst !== inst) {
                $.datepicker._curInst.dpDiv.stop(true, true);
                if ( inst && $.datepicker._datepickerShowing ) {
                    $.datepicker._hideDatepicker( $.datepicker._curInst.input[0] );
                }
            }

            beforeShow = $.datepicker._get(inst, "beforeShow");
            beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
            if(beforeShowSettings === false){
                return;
            }
            datepicker_extendRemove(inst.settings, beforeShowSettings);

            inst.lastVal = null;
            $.datepicker._lastInput = input;
            $.datepicker._setDateFromField(inst);

            if ($.datepicker._inDialog) { // hide cursor
                input.value = "";
            }
            if (!$.datepicker._pos) { // position below input
                $.datepicker._pos = $.datepicker._findPos(input);
                $.datepicker._pos[1] += input.offsetHeight; // add the height
            }

            isFixed = false;
            $(input).parents().each(function() {
                isFixed |= $(this).css("position") === "fixed";
                return !isFixed;
            });

            offset = {left: $.datepicker._pos[0], top: $.datepicker._pos[1]};
            $.datepicker._pos = null;
            //to avoid flashes on Firefox
            inst.dpDiv.empty();
            // determine sizing offscreen
            inst.dpDiv.css({position: "absolute", display: "block", top: "-1000px"});
            $.datepicker._updateDatepicker(inst);
            // fix width for dynamic number of date pickers
            // and adjust position before showing
            offset = $.datepicker._checkOffset(inst, offset, isFixed);
            inst.dpDiv.css({position: ($.datepicker._inDialog && $.blockUI ?
                "static" : (isFixed ? "fixed" : "absolute")), display: "none",
                left: offset.left + "px", top: offset.top + "px"});

            if (!inst.inline) {
                showAnim = $.datepicker._get(inst, "showAnim");
                duration = $.datepicker._get(inst, "duration");
                inst.dpDiv.css( "z-index", datepicker_getZindex( $( input ) ) + 1 );
                $.datepicker._datepickerShowing = true;

                if ( $.effects && $.effects.effect[ showAnim ] ) {
                    inst.dpDiv.show(showAnim, $.datepicker._get(inst, "showOptions"), duration);
                } else {
                    inst.dpDiv[showAnim || "show"](showAnim ? duration : null);
                }

                if ( $.datepicker._shouldFocusInput( inst ) ) {
                    inst.input.focus();
                }

                $.datepicker._curInst = inst;
            }
        },

        /* Generate the date picker content. */
        _updateDatepicker: function(inst) {
            this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
            datepicker_instActive = inst; // for delegate hover events
            inst.dpDiv.empty().append(this._generateHTML(inst));
            this._attachHandlers(inst);

            var origyearshtml,
                numMonths = this._getNumberOfMonths(inst),
                cols = numMonths[1],
                width = 17,
                activeCell = inst.dpDiv.find( "." + this._dayOverClass + " a" );

            if ( activeCell.length > 0 ) {
                datepicker_handleMouseover.apply( activeCell.get( 0 ) );
            }

            inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
            if (cols > 1) {
                inst.dpDiv.addClass("ui-datepicker-multi-" + cols).css("width", (width * cols) + "em");
            }
            inst.dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") +
            "Class"]("ui-datepicker-multi");
            inst.dpDiv[(this._get(inst, "isRTL") ? "add" : "remove") +
            "Class"]("ui-datepicker-rtl");

            if (inst === $.datepicker._curInst && $.datepicker._datepickerShowing && $.datepicker._shouldFocusInput( inst ) ) {
                inst.input.focus();
            }

            // deffered render of the years select (to avoid flashes on Firefox)
            if( inst.yearshtml ){
                origyearshtml = inst.yearshtml;
                setTimeout(function(){
                    //assure that inst.yearshtml didn't change.
                    if( origyearshtml === inst.yearshtml && inst.yearshtml ){
                        inst.dpDiv.find("select.ui-datepicker-year:first").replaceWith(inst.yearshtml);
                    }
                    origyearshtml = inst.yearshtml = null;
                }, 0);
            }
        },

        // #6694 - don't focus the input if it's already focused
        // this breaks the change event in IE
        // Support: IE and jQuery <1.9
        _shouldFocusInput: function( inst ) {
            return inst.input && inst.input.is( ":visible" ) && !inst.input.is( ":disabled" ) && !inst.input.is( ":focus" );
        },

        /* Check positioning to remain on screen. */
        _checkOffset: function(inst, offset, isFixed) {
            var dpWidth = inst.dpDiv.outerWidth(),
                dpHeight = inst.dpDiv.outerHeight(),
                inputWidth = inst.input ? inst.input.outerWidth() : 0,
                inputHeight = inst.input ? inst.input.outerHeight() : 0,
                viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft()),
                viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());

            offset.left -= (this._get(inst, "isRTL") ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left === inst.input.offset().left) ? $(document).scrollLeft() : 0;
            offset.top -= (isFixed && offset.top === (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

            // now check if datepicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight) : 0);

            return offset;
        },

        /* Find an object's position on the screen. */
        _findPos: function(obj) {
            var position,
                inst = this._getInst(obj),
                isRTL = this._get(inst, "isRTL");

            while (obj && (obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden(obj))) {
                obj = obj[isRTL ? "previousSibling" : "nextSibling"];
            }

            position = $(obj).offset();
            return [position.left, position.top];
        },

        /* Hide the date picker from view.
         * @param  input  element - the input field attached to the date picker
         */
        _hideDatepicker: function(input) {
            var showAnim, duration, postProcess, onClose,
                inst = this._curInst;

            if (!inst || (input && inst !== $.data(input, "datepicker"))) {
                return;
            }

            if (this._datepickerShowing) {
                showAnim = this._get(inst, "showAnim");
                duration = this._get(inst, "duration");
                postProcess = function() {
                    $.datepicker._tidyDialog(inst);
                };

                // DEPRECATED: after BC for 1.8.x $.effects[ showAnim ] is not needed
                if ( $.effects && ( $.effects.effect[ showAnim ] || $.effects[ showAnim ] ) ) {
                    inst.dpDiv.hide(showAnim, $.datepicker._get(inst, "showOptions"), duration, postProcess);
                } else {
                    inst.dpDiv[(showAnim === "slideDown" ? "slideUp" :
                        (showAnim === "fadeIn" ? "fadeOut" : "hide"))]((showAnim ? duration : null), postProcess);
                }

                if (!showAnim) {
                    postProcess();
                }
                this._datepickerShowing = false;

                onClose = this._get(inst, "onClose");
                if (onClose) {
                    onClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ""), inst]);
                }

                this._lastInput = null;
                if (this._inDialog) {
                    this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" });
                    if ($.blockUI) {
                        $.unblockUI();
                        $("body").append(this.dpDiv);
                    }
                }
                this._inDialog = false;
            }
        },

        /* Tidy up after a dialog display. */
        _tidyDialog: function(inst) {
            inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar");
        },

        /* Close date picker if clicked elsewhere. */
        _checkExternalClick: function(event) {
            if (!$.datepicker._curInst) {
                return;
            }

            var $target = $(event.target),
                inst = $.datepicker._getInst($target[0]);

            if ( ( ( $target[0].id !== $.datepicker._mainDivId &&
                $target.parents("#" + $.datepicker._mainDivId).length === 0 &&
                !$target.hasClass($.datepicker.markerClassName) &&
                !$target.closest("." + $.datepicker._triggerClass).length &&
                $.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI) ) ) ||
                ( $target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst !== inst ) ) {
                $.datepicker._hideDatepicker();
            }
        },

        /* Adjust one of the date sub-fields. */
        _adjustDate: function(id, offset, period) {
            var target = $(id),
                inst = this._getInst(target[0]);

            if (this._isDisabledDatepicker(target[0])) {
                return;
            }
            this._adjustInstDate(inst, offset +
                (period === "M" ? this._get(inst, "showCurrentAtPos") : 0), // undo positioning
                period);
            this._updateDatepicker(inst);
        },

        /* Action for current link. */
        _gotoToday: function(id) {
            var date,
                target = $(id),
                inst = this._getInst(target[0]);

            if (this._get(inst, "gotoCurrent") && inst.currentDay) {
                inst.selectedDay = inst.currentDay;
                inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                inst.drawYear = inst.selectedYear = inst.currentYear;
            } else {
                date = new Date();
                inst.selectedDay = date.getDate();
                inst.drawMonth = inst.selectedMonth = date.getMonth();
                inst.drawYear = inst.selectedYear = date.getFullYear();
            }
            this._notifyChange(inst);
            this._adjustDate(target);
        },

        /* Action for selecting a new month/year. */
        _selectMonthYear: function(id, select, period) {
            var target = $(id),
                inst = this._getInst(target[0]);

            inst["selected" + (period === "M" ? "Month" : "Year")] =
                inst["draw" + (period === "M" ? "Month" : "Year")] =
                    parseInt(select.options[select.selectedIndex].value,10);

            this._notifyChange(inst);
            this._adjustDate(target);
        },

        /* Action for selecting a day. */
        _selectDay: function(id, month, year, td) {
            var inst,
                target = $(id);

            if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
                return;
            }

            inst = this._getInst(target[0]);
            inst.selectedDay = inst.currentDay = $("a", td).html();
            inst.selectedMonth = inst.currentMonth = month;
            inst.selectedYear = inst.currentYear = year;
            this._selectDate(id, this._formatDate(inst,
                inst.currentDay, inst.currentMonth, inst.currentYear));
        },

        /* Erase the input field and hide the date picker. */
        _clearDate: function(id) {
            var target = $(id);
            this._selectDate(target, "");
        },

        /* Update the input field with the selected date. */
        _selectDate: function(id, dateStr) {
            var onSelect,
                target = $(id),
                inst = this._getInst(target[0]);

            dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
            if (inst.input) {
                inst.input.val(dateStr);
            }
            this._updateAlternate(inst);

            onSelect = this._get(inst, "onSelect");
            if (onSelect) {
                onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);  // trigger custom callback
            } else if (inst.input) {
                inst.input.trigger("change"); // fire the change event
            }

            if (inst.inline){
                this._updateDatepicker(inst);
            } else {
                this._hideDatepicker();
                this._lastInput = inst.input[0];
                if (typeof(inst.input[0]) !== "object") {
                    inst.input.focus(); // restore focus
                }
                this._lastInput = null;
            }
        },

        /* Update any alternate field to synchronise with the main field. */
        _updateAlternate: function(inst) {
            var altFormat, date, dateStr,
                altField = this._get(inst, "altField");

            if (altField) { // update alternate field too
                altFormat = this._get(inst, "altFormat") || this._get(inst, "dateFormat");
                date = this._getDate(inst);
                dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
                $(altField).each(function() { $(this).val(dateStr); });
            }
        },

        /* Set as beforeShowDay function to prevent selection of weekends.
         * @param  date  Date - the date to customise
         * @return [boolean, string] - is this date selectable?, what is its CSS class?
         */
        noWeekends: function(date) {
            var day = date.getDay();
            return [(day > 0 && day < 6), ""];
        },

        /* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
         * @param  date  Date - the date to get the week for
         * @return  number - the number of the week within the year that contains this date
         */
        iso8601Week: function(date) {
            var time,
                checkDate = new Date(date.getTime());

            // Find Thursday of this week starting on Monday
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

            time = checkDate.getTime();
            checkDate.setMonth(0); // Compare with Jan 1
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        },

        /* Parse a string value into a date object.
         * See formatDate below for the possible formats.
         *
         * @param  format string - the expected format of the date
         * @param  value string - the date in the above format
         * @param  settings Object - attributes include:
         *					shortYearCutoff  number - the cutoff year for determining the century (optional)
         *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
         *					dayNames		string[7] - names of the days from Sunday (optional)
         *					monthNamesShort string[12] - abbreviated names of the months (optional)
         *					monthNames		string[12] - names of the months (optional)
         * @return  Date - the extracted date value or null if value is blank
         */
        parseDate: function (format, value, settings) {
            if (format == null || value == null) {
                throw "Invalid arguments";
            }

            value = (typeof value === "object" ? value.toString() : value + "");
            if (value === "") {
                return null;
            }

            var iFormat, dim, extra,
                iValue = 0,
                shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff,
                shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
                new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date,
            // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
            // Extract a number from the string value
                getNumber = function(match) {
                    var isDoubled = lookAhead(match),
                        size = (match === "@" ? 14 : (match === "!" ? 20 :
                            (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                        minSize = (match === "y" ? size : 1),
                        digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
                        num = value.substring(iValue).match(digits);
                    if (!num) {
                        throw "Missing number at position " + iValue;
                    }
                    iValue += num[0].length;
                    return parseInt(num[0], 10);
                },
            // Extract a name from the string value and convert to an index
                getName = function(match, shortNames, longNames) {
                    var index = -1,
                        names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
                            return [ [k, v] ];
                        }).sort(function (a, b) {
                            return -(a[1].length - b[1].length);
                        });

                    $.each(names, function (i, pair) {
                        var name = pair[1];
                        if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                            index = pair[0];
                            iValue += name.length;
                            return false;
                        }
                    });
                    if (index !== -1) {
                        return index + 1;
                    } else {
                        throw "Unknown name at position " + iValue;
                    }
                },
            // Confirm that a literal character matches the string value
                checkLiteral = function() {
                    if (value.charAt(iValue) !== format.charAt(iFormat)) {
                        throw "Unexpected literal at position " + iValue;
                    }
                    iValue++;
                };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            day = getNumber("d");
                            break;
                        case "D":
                            getName("D", dayNamesShort, dayNames);
                            break;
                        case "o":
                            doy = getNumber("o");
                            break;
                        case "m":
                            month = getNumber("m");
                            break;
                        case "M":
                            month = getName("M", monthNamesShort, monthNames);
                            break;
                        case "y":
                            year = getNumber("y");
                            break;
                        case "@":
                            date = new Date(getNumber("@"));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "!":
                            date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "'":
                            if (lookAhead("'")){
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            if (iValue < value.length){
                extra = value.substr(iValue);
                if (!/^\s+/.test(extra)) {
                    throw "Extra/unparsed characters found in date: " + extra;
                }
            }

            if (year === -1) {
                year = new Date().getFullYear();
            } else if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= shortYearCutoff ? 0 : -100);
            }

            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this._getDaysInMonth(year, month - 1);
                    if (day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }

            date = this._daylightSavingAdjust(new Date(year, month - 1, day));
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw "Invalid date"; // E.g. 31/02/00
            }
            return date;
        },

        /* Standard date formats. */
        ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
        COOKIE: "D, dd M yy",
        ISO_8601: "yy-mm-dd",
        RFC_822: "D, d M y",
        RFC_850: "DD, dd-M-y",
        RFC_1036: "D, d M y",
        RFC_1123: "D, d M yy",
        RFC_2822: "D, d M yy",
        RSS: "D, d M y", // RFC 822
        TICKS: "!",
        TIMESTAMP: "@",
        W3C: "yy-mm-dd", // ISO 8601

        _ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
        Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

        /* Format a date object into a string value.
         * The format can be combinations of the following:
         * d  - day of month (no leading zero)
         * dd - day of month (two digit)
         * o  - day of year (no leading zeros)
         * oo - day of year (three digit)
         * D  - day name short
         * DD - day name long
         * m  - month of year (no leading zero)
         * mm - month of year (two digit)
         * M  - month name short
         * MM - month name long
         * y  - year (two digit)
         * yy - year (four digit)
         * @ - Unix timestamp (ms since 01/01/1970)
         * ! - Windows ticks (100ns since 01/01/0001)
         * "..." - literal text
         * '' - single quote
         *
         * @param  format string - the desired format of the date
         * @param  date Date - the date value to format
         * @param  settings Object - attributes include:
         *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
         *					dayNames		string[7] - names of the days from Sunday (optional)
         *					monthNamesShort string[12] - abbreviated names of the months (optional)
         *					monthNames		string[12] - names of the months (optional)
         * @return  string - the date in the above format
         */
        formatDate: function (format, date, settings) {
            if (!date) {
                return "";
            }

            var iFormat,
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
            // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
            // Format a number, with leading zero if necessary
                formatNumber = function(match, value, len) {
                    var num = "" + value;
                    if (lookAhead(match)) {
                        while (num.length < len) {
                            num = "0" + num;
                        }
                    }
                    return num;
                },
            // Format a name, short or long as requested
                formatName = function(match, value, shortNames, longNames) {
                    return (lookAhead(match) ? longNames[value] : shortNames[value]);
                },
                output = "",
                literal = false;

            if (date) {
                for (iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                            literal = false;
                        } else {
                            output += format.charAt(iFormat);
                        }
                    } else {
                        switch (format.charAt(iFormat)) {
                            case "d":
                                output += formatNumber("d", date.getDate(), 2);
                                break;
                            case "D":
                                output += formatName("D", date.getDay(), dayNamesShort, dayNames);
                                break;
                            case "o":
                                output += formatNumber("o",
                                    Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                                break;
                            case "m":
                                output += formatNumber("m", date.getMonth() + 1, 2);
                                break;
                            case "M":
                                output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case "y":
                                output += (lookAhead("y") ? date.getFullYear() :
                                (date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
                                break;
                            case "@":
                                output += date.getTime();
                                break;
                            case "!":
                                output += date.getTime() * 10000 + this._ticksTo1970;
                                break;
                            case "'":
                                if (lookAhead("'")) {
                                    output += "'";
                                } else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        },

        /* Extract all possible characters from the date format. */
        _possibleChars: function (format) {
            var iFormat,
                chars = "",
                literal = false,
            // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        chars += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d": case "m": case "y": case "@":
                        chars += "0123456789";
                        break;
                        case "D": case "M":
                        return null; // Accept anything
                        case "'":
                            if (lookAhead("'")) {
                                chars += "'";
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            chars += format.charAt(iFormat);
                    }
                }
            }
            return chars;
        },

        /* Get a setting value, defaulting if necessary. */
        _get: function(inst, name) {
            return inst.settings[name] !== undefined ?
                inst.settings[name] : this._defaults[name];
        },

        /* Parse existing date and initialise date picker. */
        _setDateFromField: function(inst, noDefault) {
            if (inst.input.val() === inst.lastVal) {
                return;
            }

            var dateFormat = this._get(inst, "dateFormat"),
                dates = inst.lastVal = inst.input ? inst.input.val() : null,
                defaultDate = this._getDefaultDate(inst),
                date = defaultDate,
                settings = this._getFormatConfig(inst);

            try {
                date = this.parseDate(dateFormat, dates, settings) || defaultDate;
            } catch (event) {
                dates = (noDefault ? "" : dates);
            }
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.currentDay = (dates ? date.getDate() : 0);
            inst.currentMonth = (dates ? date.getMonth() : 0);
            inst.currentYear = (dates ? date.getFullYear() : 0);
            this._adjustInstDate(inst);
        },

        /* Retrieve the default date shown on opening. */
        _getDefaultDate: function(inst) {
            return this._restrictMinMax(inst,
                this._determineDate(inst, this._get(inst, "defaultDate"), new Date()));
        },

        /* A date may be specified as an exact value or a relative one. */
        _determineDate: function(inst, date, defaultDate) {
            var offsetNumeric = function(offset) {
                    var date = new Date();
                    date.setDate(date.getDate() + offset);
                    return date;
                },
                offsetString = function(offset) {
                    try {
                        return $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
                            offset, $.datepicker._getFormatConfig(inst));
                    }
                    catch (e) {
                        // Ignore
                    }

                    var date = (offset.toLowerCase().match(/^c/) ?
                                $.datepicker._getDate(inst) : null) || new Date(),
                        year = date.getFullYear(),
                        month = date.getMonth(),
                        day = date.getDate(),
                        pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
                        matches = pattern.exec(offset);

                    while (matches) {
                        switch (matches[2] || "d") {
                            case "d" : case "D" :
                            day += parseInt(matches[1],10); break;
                            case "w" : case "W" :
                            day += parseInt(matches[1],10) * 7; break;
                            case "m" : case "M" :
                            month += parseInt(matches[1],10);
                            day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                            break;
                            case "y": case "Y" :
                            year += parseInt(matches[1],10);
                            day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                            break;
                        }
                        matches = pattern.exec(offset);
                    }
                    return new Date(year, month, day);
                },
                newDate = (date == null || date === "" ? defaultDate : (typeof date === "string" ? offsetString(date) :
                    (typeof date === "number" ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));

            newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
            if (newDate) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
            }
            return this._daylightSavingAdjust(newDate);
        },

        /* Handle switch to/from daylight saving.
         * Hours may be non-zero on daylight saving cut-over:
         * > 12 when midnight changeover, but then cannot generate
         * midnight datetime, so jump to 1AM, otherwise reset.
         * @param  date  (Date) the date to check
         * @return  (Date) the corrected date
         */
        _daylightSavingAdjust: function(date) {
            if (!date) {
                return null;
            }
            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;
        },

        /* Set the date(s) directly. */
        _setDate: function(inst, date, noChange) {
            var clear = !date,
                origMonth = inst.selectedMonth,
                origYear = inst.selectedYear,
                newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));

            inst.selectedDay = inst.currentDay = newDate.getDate();
            inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
            inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
            if ((origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) && !noChange) {
                this._notifyChange(inst);
            }
            this._adjustInstDate(inst);
            if (inst.input) {
                inst.input.val(clear ? "" : this._formatDate(inst));
            }
        },

        /* Retrieve the date(s) directly. */
        _getDate: function(inst) {
            var startDate = (!inst.currentYear || (inst.input && inst.input.val() === "") ? null :
                this._daylightSavingAdjust(new Date(
                    inst.currentYear, inst.currentMonth, inst.currentDay)));
            return startDate;
        },

        /* Attach the onxxx handlers.  These are declared statically so
         * they work with static code transformers like Caja.
         */
        _attachHandlers: function(inst) {
            var stepMonths = this._get(inst, "stepMonths"),
                id = "#" + inst.id.replace( /\\\\/g, "\\" );
            inst.dpDiv.find("[data-handler]").map(function () {
                var handler = {
                    prev: function () {
                        $.datepicker._adjustDate(id, -stepMonths, "M");
                    },
                    next: function () {
                        $.datepicker._adjustDate(id, +stepMonths, "M");
                    },
                    hide: function () {
                        $.datepicker._hideDatepicker();
                    },
                    today: function () {
                        $.datepicker._gotoToday(id);
                    },
                    selectDay: function () {
                        $.datepicker._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
                        return false;
                    },
                    selectMonth: function () {
                        $.datepicker._selectMonthYear(id, this, "M");
                        return false;
                    },
                    selectYear: function () {
                        $.datepicker._selectMonthYear(id, this, "Y");
                        return false;
                    }
                };
                $(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
            });
        },

        /* Generate the HTML for the current state of the date picker. */
        _generateHTML: function(inst) {
            var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
                controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
                monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
                selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
                cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
                printDate, dRow, tbody, daySettings, otherMonth, unselectable,
                tempDate = new Date(),
                today = this._daylightSavingAdjust(
                    new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
                isRTL = this._get(inst, "isRTL"),
                showButtonPanel = this._get(inst, "showButtonPanel"),
                hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
                navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
                numMonths = this._getNumberOfMonths(inst),
                showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
                stepMonths = this._get(inst, "stepMonths"),
                isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
                currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
                    new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                drawMonth = inst.drawMonth - showCurrentAtPos,
                drawYear = inst.drawYear;

            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
                    maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;

            prevText = this._get(inst, "prevText");
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
                this._getFormatConfig(inst)));

            prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
            "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
            " title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+ prevText +"'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

            nextText = this._get(inst, "nextText");
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
                this._getFormatConfig(inst)));

            next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
            "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
            " title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+ nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

            currentText = this._get(inst, "currentText");
            gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText :
                this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

            controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
            this._get(inst, "closeText") + "</button>" : "");

            buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
            (this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
            ">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";

            firstDay = parseInt(this._get(inst, "firstDay"),10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);

            showWeek = this._get(inst, "showWeek");
            dayNames = this._get(inst, "dayNames");
            dayNamesMin = this._get(inst, "dayNamesMin");
            monthNames = this._get(inst, "monthNames");
            monthNamesShort = this._get(inst, "monthNamesShort");
            beforeShowDay = this._get(inst, "beforeShowDay");
            showOtherMonths = this._get(inst, "showOtherMonths");
            selectOtherMonths = this._get(inst, "selectOtherMonths");
            defaultDate = this._getDefaultDate(inst);
            html = "";
            dow;
            for (row = 0; row < numMonths[0]; row++) {
                group = "";
                this.maxRows = 4;
                for (col = 0; col < numMonths[1]; col++) {
                    selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    cornerClass = " ui-corner-all";
                    calender = "";
                    if (isMultiMonth) {
                        calender += "<div class='ui-datepicker-group";
                        if (numMonths[1] > 1) {
                            switch (col) {
                                case 0: calender += " ui-datepicker-group-first";
                                    cornerClass = " ui-corner-" + (isRTL ? "right" : "left"); break;
                                case numMonths[1]-1: calender += " ui-datepicker-group-last";
                                    cornerClass = " ui-corner-" + (isRTL ? "left" : "right"); break;
                                default: calender += " ui-datepicker-group-middle"; cornerClass = ""; break;
                            }
                        }
                        calender += "'>";
                    }
                    calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
                    (/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
                    (/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
                    this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
                        row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
                    "</div><table class='ui-datepicker-calendar'><thead>" +
                    "<tr>";
                    thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
                    for (dow = 0; dow < 7; dow++) { // days of the week
                        day = (dow + firstDay) % 7;
                        thead += "<th scope='col'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" +
                        "<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
                    }
                    calender += thead + "</tr></thead><tbody>";
                    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    }
                    leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
                    numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
                    this.maxRows = numRows;
                    printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
                        calender += "<tr>";
                        tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
                        this._get(inst, "calculateWeek")(printDate) + "</td>");
                        for (dow = 0; dow < 7; dow++) { // create date picker days
                            daySettings = (beforeShowDay ?
                                beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
                            otherMonth = (printDate.getMonth() !== drawMonth);
                            unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
                            (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += "<td class='" +
                            ((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + // highlight weekends
                            (otherMonth ? " ui-datepicker-other-month" : "") + // highlight days from other months
                            ((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
                            (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
                                // or defaultDate is current printedDate and defaultDate is selectedDate
                            " " + this._dayOverClass : "") + // highlight selected day
                            (unselectable ? " " + this._unselectableClass + " ui-state-disabled": "") +  // highlight unselectable days
                            (otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates
                            (printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
                            (printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" + // highlight today (if different)
                            ((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
                            (unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
                            (otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
                                (unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
                                (printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
                                (printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") + // highlight selected day
                                (otherMonth ? " ui-priority-secondary" : "") + // distinguish dates from other months
                                "' href='#'>" + printDate.getDate() + "</a>")) + "</td>"; // display selectable date
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + "</tr>";
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
                    ((numMonths[0] > 0 && col === numMonths[1]-1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel;
            inst._keyEvent = false;
            return html;
        },

        /* Generate the month and year header. */
        _generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
                                           secondary, monthNames, monthNamesShort) {

            var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
                changeMonth = this._get(inst, "changeMonth"),
                changeYear = this._get(inst, "changeYear"),
                showMonthAfterYear = this._get(inst, "showMonthAfterYear"),
                html = "<div class='ui-datepicker-title'>",
                monthHtml = "";

            // month selection
            if (secondary || !changeMonth) {
                monthHtml += "<span class='ui-datepicker-month'>" + monthNames[drawMonth] + "</span>";
            } else {
                inMinYear = (minDate && minDate.getFullYear() === drawYear);
                inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
                monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
                for ( month = 0; month < 12; month++) {
                    if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                        monthHtml += "<option value='" + month + "'" +
                        (month === drawMonth ? " selected='selected'" : "") +
                        ">" + monthNamesShort[month] + "</option>";
                    }
                }
                monthHtml += "</select>";
            }

            if (!showMonthAfterYear) {
                html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
            }

            // year selection
            if ( !inst.yearshtml ) {
                inst.yearshtml = "";
                if (secondary || !changeYear) {
                    html += "<span class='ui-datepicker-year'>" + drawYear + "</span>";
                } else {
                    // determine range of years to display
                    years = this._get(inst, "yearRange").split(":");
                    thisYear = new Date().getFullYear();
                    determineYear = function(value) {
                        var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
                            (value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
                                parseInt(value, 10)));
                        return (isNaN(year) ? thisYear : year);
                    };
                    year = determineYear(years[0]);
                    endYear = Math.max(year, determineYear(years[1] || ""));
                    year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                    endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                    inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
                    for (; year <= endYear; year++) {
                        inst.yearshtml += "<option value='" + year + "'" +
                        (year === drawYear ? " selected='selected'" : "") +
                        ">" + year + "</option>";
                    }
                    inst.yearshtml += "</select>";

                    html += inst.yearshtml;
                    inst.yearshtml = null;
                }
            }

            html += this._get(inst, "yearSuffix");
            if (showMonthAfterYear) {
                html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + monthHtml;
            }
            html += "</div>"; // Close datepicker_header
            return html;
        },

        /* Adjust one of the date sub-fields. */
        _adjustInstDate: function(inst, offset, period) {
            var year = inst.drawYear + (period === "Y" ? offset : 0),
                month = inst.drawMonth + (period === "M" ? offset : 0),
                day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) + (period === "D" ? offset : 0),
                date = this._restrictMinMax(inst, this._daylightSavingAdjust(new Date(year, month, day)));

            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            if (period === "M" || period === "Y") {
                this._notifyChange(inst);
            }
        },

        /* Ensure a date is within any min/max bounds. */
        _restrictMinMax: function(inst, date) {
            var minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                newDate = (minDate && date < minDate ? minDate : date);
            return (maxDate && newDate > maxDate ? maxDate : newDate);
        },

        /* Notify change of month/year. */
        _notifyChange: function(inst) {
            var onChange = this._get(inst, "onChangeMonthYear");
            if (onChange) {
                onChange.apply((inst.input ? inst.input[0] : null),
                    [inst.selectedYear, inst.selectedMonth + 1, inst]);
            }
        },

        /* Determine the number of months to show. */
        _getNumberOfMonths: function(inst) {
            var numMonths = this._get(inst, "numberOfMonths");
            return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
        },

        /* Determine the current maximum date - ensure no time components are set. */
        _getMinMaxDate: function(inst, minMax) {
            return this._determineDate(inst, this._get(inst, minMax + "Date"), null);
        },

        /* Find the number of days in a given month. */
        _getDaysInMonth: function(year, month) {
            return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
        },

        /* Find the day of the week of the first of a month. */
        _getFirstDayOfMonth: function(year, month) {
            return new Date(year, month, 1).getDay();
        },

        /* Determines if we should allow a "next/prev" month display change. */
        _canAdjustMonth: function(inst, offset, curYear, curMonth) {
            var numMonths = this._getNumberOfMonths(inst),
                date = this._daylightSavingAdjust(new Date(curYear,
                    curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));

            if (offset < 0) {
                date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
            }
            return this._isInRange(inst, date);
        },

        /* Is the given date in the accepted range? */
        _isInRange: function(inst, date) {
            var yearSplit, currentYear,
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                minYear = null,
                maxYear = null,
                years = this._get(inst, "yearRange");
            if (years){
                yearSplit = years.split(":");
                currentYear = new Date().getFullYear();
                minYear = parseInt(yearSplit[0], 10);
                maxYear = parseInt(yearSplit[1], 10);
                if ( yearSplit[0].match(/[+\-].*/) ) {
                    minYear += currentYear;
                }
                if ( yearSplit[1].match(/[+\-].*/) ) {
                    maxYear += currentYear;
                }
            }

            return ((!minDate || date.getTime() >= minDate.getTime()) &&
            (!maxDate || date.getTime() <= maxDate.getTime()) &&
            (!minYear || date.getFullYear() >= minYear) &&
            (!maxYear || date.getFullYear() <= maxYear));
        },

        /* Provide the configuration settings for formatting/parsing. */
        _getFormatConfig: function(inst) {
            var shortYearCutoff = this._get(inst, "shortYearCutoff");
            shortYearCutoff = (typeof shortYearCutoff !== "string" ? shortYearCutoff :
            new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            return {shortYearCutoff: shortYearCutoff,
                dayNamesShort: this._get(inst, "dayNamesShort"), dayNames: this._get(inst, "dayNames"),
                monthNamesShort: this._get(inst, "monthNamesShort"), monthNames: this._get(inst, "monthNames")};
        },

        /* Format the given date for display. */
        _formatDate: function(inst, day, month, year) {
            if (!day) {
                inst.currentDay = inst.selectedDay;
                inst.currentMonth = inst.selectedMonth;
                inst.currentYear = inst.selectedYear;
            }
            var date = (day ? (typeof day === "object" ? day :
                this._daylightSavingAdjust(new Date(year, month, day))) :
                this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            return this.formatDate(this._get(inst, "dateFormat"), date, this._getFormatConfig(inst));
        }
    });

    /*
     * Bind hover events for datepicker elements.
     * Done via delegate so the binding only occurs once in the lifetime of the parent div.
     * Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
     */
    function datepicker_bindHover(dpDiv) {
        var selector = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
        return dpDiv.delegate(selector, "mouseout", function() {
            $(this).removeClass("ui-state-hover");
            if (this.className.indexOf("ui-datepicker-prev") !== -1) {
                $(this).removeClass("ui-datepicker-prev-hover");
            }
            if (this.className.indexOf("ui-datepicker-next") !== -1) {
                $(this).removeClass("ui-datepicker-next-hover");
            }
        })
            .delegate( selector, "mouseover", datepicker_handleMouseover );
    }

    function datepicker_handleMouseover() {
        if (!$.datepicker._isDisabledDatepicker( datepicker_instActive.inline? datepicker_instActive.dpDiv.parent()[0] : datepicker_instActive.input[0])) {
            $(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
            $(this).addClass("ui-state-hover");
            if (this.className.indexOf("ui-datepicker-prev") !== -1) {
                $(this).addClass("ui-datepicker-prev-hover");
            }
            if (this.className.indexOf("ui-datepicker-next") !== -1) {
                $(this).addClass("ui-datepicker-next-hover");
            }
        }
    }

    /* jQuery extend now ignores nulls! */
    function datepicker_extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props) {
            if (props[name] == null) {
                target[name] = props[name];
            }
        }
        return target;
    }

    /* Invoke the datepicker functionality.
     @param  options  string - a command, optionally followed by additional parameters or
     Object - settings for attaching new datepicker functionality
     @return  jQuery object */
    $.fn.datepicker = function(options){

        /* Verify an empty collection wasn't passed - Fixes #6976 */
        if ( !this.length ) {
            return this;
        }

        /* Initialise the date picker. */
        if (!$.datepicker.initialized) {
            $(document).mousedown($.datepicker._checkExternalClick);
            $.datepicker.initialized = true;
        }

        /* Append datepicker main container to body if not exist. */
        if ($("#"+$.datepicker._mainDivId).length === 0) {
            $("body").append($.datepicker.dpDiv);
        }

        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options === "string" && (options === "isDisabled" || options === "getDate" || options === "widget")) {
            return $.datepicker["_" + options + "Datepicker"].
                apply($.datepicker, [this[0]].concat(otherArgs));
        }
        if (options === "option" && arguments.length === 2 && typeof arguments[1] === "string") {
            return $.datepicker["_" + options + "Datepicker"].
                apply($.datepicker, [this[0]].concat(otherArgs));
        }
        return this.each(function() {
            typeof options === "string" ?
                $.datepicker["_" + options + "Datepicker"].
                    apply($.datepicker, [this].concat(otherArgs)) :
                $.datepicker._attachDatepicker(this, options);
        });
    };

    $.datepicker = new Datepicker(); // singleton instance
    $.datepicker.initialized = false;
    $.datepicker.uuid = new Date().getTime();
    $.datepicker.version = "1.11.2";

    var datepicker = $.datepicker;



}));
/*! DataTables 1.10.4
 * Ã‚Â©2008-2014 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     1.10.4
 * @file        jquery.dataTables.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2008-2014 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnScrollBarWidth,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

(/** @lends <global> */function( window, document, undefined ) {

    (function( factory ) {
        "use strict";

        if ( typeof define === 'function' && define.amd ) {
            // Define as an AMD module if possible
            define( 'datatables', ['jquery'], factory );
        }
        else if ( typeof exports === 'object' ) {
            // Node/CommonJS
            factory( require( 'jquery' ) );
        }
        else if ( jQuery && !jQuery.fn.dataTable ) {
            // Define using browser globals otherwise
            // Prevent multiple instantiations if the script is loaded twice
            factory( jQuery );
        }
    }
    (/** @lends <global> */function( $ ) {
        "use strict";

        /**
         * DataTables is a plug-in for the jQuery Javascript library. It is a highly
         * flexible tool, based upon the foundations of progressive enhancement,
         * which will add advanced interaction controls to any HTML table. For a
         * full list of features please refer to
         * [DataTables.net](href="http://datatables.net).
         *
         * Note that the `DataTable` object is not a global variable but is aliased
         * to `jQuery.fn.DataTable` and `jQuery.fn.dataTable` through which it may
         * be  accessed.
         *
         *  @class
         *  @param {object} [init={}] Configuration object for DataTables. Options
         *    are defined by {@link DataTable.defaults}
         *  @requires jQuery 1.7+
         *
         *  @example
         *    // Basic initialisation
         *    $(document).ready( function {
     *      $('#example').dataTable();
     *    } );
         *
         *  @example
         *    // Initialisation with configuration options - in this case, disable
         *    // pagination and sorting.
         *    $(document).ready( function {
     *      $('#example').dataTable( {
     *        "paginate": false,
     *        "sort": false
     *      } );
     *    } );
         */
        var DataTable;


        /*
         * It is useful to have variables which are scoped locally so only the
         * DataTables functions can access them and they don't leak into global space.
         * At the same time these functions are often useful over multiple files in the
         * core and API, so we list, or at least document, all variables which are used
         * by DataTables as private variables here. This also ensures that there is no
         * clashing of variable names and that they can easily referenced for reuse.
         */


        // Defined else where
        //  _selector_run
        //  _selector_opts
        //  _selector_first
        //  _selector_row_indexes

        var _ext; // DataTable.ext
        var _Api; // DataTable.Api
        var _api_register; // DataTable.Api.register
        var _api_registerPlural; // DataTable.Api.registerPlural

        var _re_dic = {};
        var _re_new_lines = /[\r\n]/g;
        var _re_html = /<.*?>/g;
        var _re_date_start = /^[\w\+\-]/;
        var _re_date_end = /[\w\+\-]$/;

        // Escape regular expression special characters
        var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );

        // U+2009 is thin space and U+202F is narrow no-break space, both used in many
        // standards as thousands separators
        var _re_formatted_numeric = /[',$Ã‚Â£Ã¢â€šÂ¬Ã‚Â¥%\u2009\u202F]/g;


        var _empty = function ( d ) {
            return !d || d === true || d === '-' ? true : false;
        };


        var _intVal = function ( s ) {
            var integer = parseInt( s, 10 );
            return !isNaN(integer) && isFinite(s) ? integer : null;
        };

        // Convert from a formatted number with characters other than `.` as the
        // decimal place, to a Javascript number
        var _numToDecimal = function ( num, decimalPoint ) {
            // Cache created regular expressions for speed as this function is called often
            if ( ! _re_dic[ decimalPoint ] ) {
                _re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
            }
            return typeof num === 'string' && decimalPoint !== '.' ?
                num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
                num;
        };


        var _isNumber = function ( d, decimalPoint, formatted ) {
            var strType = typeof d === 'string';

            if ( decimalPoint && strType ) {
                d = _numToDecimal( d, decimalPoint );
            }

            if ( formatted && strType ) {
                d = d.replace( _re_formatted_numeric, '' );
            }

            return _empty( d ) || (!isNaN( parseFloat(d) ) && isFinite( d ));
        };


        // A string without HTML in it can be considered to be HTML still
        var _isHtml = function ( d ) {
            return _empty( d ) || typeof d === 'string';
        };


        var _htmlNumeric = function ( d, decimalPoint, formatted ) {
            if ( _empty( d ) ) {
                return true;
            }

            var html = _isHtml( d );
            return ! html ?
                null :
                _isNumber( _stripHtml( d ), decimalPoint, formatted ) ?
                    true :
                    null;
        };


        var _pluck = function ( a, prop, prop2 ) {
            var out = [];
            var i=0, ien=a.length;

            // Could have the test in the loop for slightly smaller code, but speed
            // is essential here
            if ( prop2 !== undefined ) {
                for ( ; i<ien ; i++ ) {
                    if ( a[i] && a[i][ prop ] ) {
                        out.push( a[i][ prop ][ prop2 ] );
                    }
                }
            }
            else {
                for ( ; i<ien ; i++ ) {
                    if ( a[i] ) {
                        out.push( a[i][ prop ] );
                    }
                }
            }

            return out;
        };


        // Basically the same as _pluck, but rather than looping over `a` we use `order`
        // as the indexes to pick from `a`
        var _pluck_order = function ( a, order, prop, prop2 )
        {
            var out = [];
            var i=0, ien=order.length;

            // Could have the test in the loop for slightly smaller code, but speed
            // is essential here
            if ( prop2 !== undefined ) {
                for ( ; i<ien ; i++ ) {
                    if ( a[ order[i] ][ prop ] ) {
                        out.push( a[ order[i] ][ prop ][ prop2 ] );
                    }
                }
            }
            else {
                for ( ; i<ien ; i++ ) {
                    out.push( a[ order[i] ][ prop ] );
                }
            }

            return out;
        };


        var _range = function ( len, start )
        {
            var out = [];
            var end;

            if ( start === undefined ) {
                start = 0;
                end = len;
            }
            else {
                end = start;
                start = len;
            }

            for ( var i=start ; i<end ; i++ ) {
                out.push( i );
            }

            return out;
        };


        var _removeEmpty = function ( a )
        {
            var out = [];

            for ( var i=0, ien=a.length ; i<ien ; i++ ) {
                if ( a[i] ) { // careful - will remove all falsy values!
                    out.push( a[i] );
                }
            }

            return out;
        };


        var _stripHtml = function ( d ) {
            return d.replace( _re_html, '' );
        };


        /**
         * Find the unique elements in a source array.
         *
         * @param  {array} src Source array
         * @return {array} Array of unique items
         * @ignore
         */
        var _unique = function ( src )
        {
            // A faster unique method is to use object keys to identify used values,
            // but this doesn't work with arrays or objects, which we must also
            // consider. See jsperf.com/compare-array-unique-versions/4 for more
            // information.
            var
                out = [],
                val,
                i, ien=src.length,
                j, k=0;

            again: for ( i=0 ; i<ien ; i++ ) {
                val = src[i];

                for ( j=0 ; j<k ; j++ ) {
                    if ( out[j] === val ) {
                        continue again;
                    }
                }

                out.push( val );
                k++;
            }

            return out;
        };



        /**
         * Create a mapping object that allows camel case parameters to be looked up
         * for their Hungarian counterparts. The mapping is stored in a private
         * parameter called `_hungarianMap` which can be accessed on the source object.
         *  @param {object} o
         *  @memberof DataTable#oApi
         */
        function _fnHungarianMap ( o )
        {
            var
                hungarian = 'a aa ai ao as b fn i m o s ',
                match,
                newKey,
                map = {};

            $.each( o, function (key, val) {
                match = key.match(/^([^A-Z]+?)([A-Z])/);

                if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
                {
                    newKey = key.replace( match[0], match[2].toLowerCase() );
                    map[ newKey ] = key;

                    if ( match[1] === 'o' )
                    {
                        _fnHungarianMap( o[key] );
                    }
                }
            } );

            o._hungarianMap = map;
        }


        /**
         * Convert from camel case parameters to Hungarian, based on a Hungarian map
         * created by _fnHungarianMap.
         *  @param {object} src The model object which holds all parameters that can be
         *    mapped.
         *  @param {object} user The object to convert from camel case to Hungarian.
         *  @param {boolean} force When set to `true`, properties which already have a
         *    Hungarian value in the `user` object will be overwritten. Otherwise they
         *    won't be.
         *  @memberof DataTable#oApi
         */
        function _fnCamelToHungarian ( src, user, force )
        {
            if ( ! src._hungarianMap ) {
                _fnHungarianMap( src );
            }

            var hungarianKey;

            $.each( user, function (key, val) {
                hungarianKey = src._hungarianMap[ key ];

                if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
                {
                    // For objects, we need to buzz down into the object to copy parameters
                    if ( hungarianKey.charAt(0) === 'o' )
                    {
                        // Copy the camelCase options over to the hungarian
                        if ( ! user[ hungarianKey ] ) {
                            user[ hungarianKey ] = {};
                        }
                        $.extend( true, user[hungarianKey], user[key] );

                        _fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
                    }
                    else {
                        user[hungarianKey] = user[ key ];
                    }
                }
            } );
        }


        /**
         * Language compatibility - when certain options are given, and others aren't, we
         * need to duplicate the values over, in order to provide backwards compatibility
         * with older language files.
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnLanguageCompat( lang )
        {
            var defaults = DataTable.defaults.oLanguage;
            var zeroRecords = lang.sZeroRecords;

            /* Backwards compatibility - if there is no sEmptyTable given, then use the same as
             * sZeroRecords - assuming that is given.
             */
            if ( ! lang.sEmptyTable && zeroRecords &&
                defaults.sEmptyTable === "No data available in table" )
            {
                _fnMap( lang, lang, 'sZeroRecords', 'sEmptyTable' );
            }

            /* Likewise with loading records */
            if ( ! lang.sLoadingRecords && zeroRecords &&
                defaults.sLoadingRecords === "Loading..." )
            {
                _fnMap( lang, lang, 'sZeroRecords', 'sLoadingRecords' );
            }

            // Old parameter name of the thousands separator mapped onto the new
            if ( lang.sInfoThousands ) {
                lang.sThousands = lang.sInfoThousands;
            }

            var decimal = lang.sDecimal;
            if ( decimal ) {
                _addNumericSort( decimal );
            }
        }


        /**
         * Map one parameter onto another
         *  @param {object} o Object to map
         *  @param {*} knew The new parameter name
         *  @param {*} old The old parameter name
         */
        var _fnCompatMap = function ( o, knew, old ) {
            if ( o[ knew ] !== undefined ) {
                o[ old ] = o[ knew ];
            }
        };


        /**
         * Provide backwards compatibility for the main DT options. Note that the new
         * options are mapped onto the old parameters, so this is an external interface
         * change only.
         *  @param {object} init Object to map
         */
        function _fnCompatOpts ( init )
        {
            _fnCompatMap( init, 'ordering',      'bSort' );
            _fnCompatMap( init, 'orderMulti',    'bSortMulti' );
            _fnCompatMap( init, 'orderClasses',  'bSortClasses' );
            _fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
            _fnCompatMap( init, 'order',         'aaSorting' );
            _fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
            _fnCompatMap( init, 'paging',        'bPaginate' );
            _fnCompatMap( init, 'pagingType',    'sPaginationType' );
            _fnCompatMap( init, 'pageLength',    'iDisplayLength' );
            _fnCompatMap( init, 'searching',     'bFilter' );

            // Column search objects are in an array, so it needs to be converted
            // element by element
            var searchCols = init.aoSearchCols;

            if ( searchCols ) {
                for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
                    if ( searchCols[i] ) {
                        _fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
                    }
                }
            }
        }


        /**
         * Provide backwards compatibility for column options. Note that the new options
         * are mapped onto the old parameters, so this is an external interface change
         * only.
         *  @param {object} init Object to map
         */
        function _fnCompatCols ( init )
        {
            _fnCompatMap( init, 'orderable',     'bSortable' );
            _fnCompatMap( init, 'orderData',     'aDataSort' );
            _fnCompatMap( init, 'orderSequence', 'asSorting' );
            _fnCompatMap( init, 'orderDataType', 'sortDataType' );
        }


        /**
         * Browser feature detection for capabilities, quirks
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnBrowserDetect( settings )
        {
            var browser = settings.oBrowser;

            // Scrolling feature / quirks detection
            var n = $('<div/>')
                .css( {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 1,
                    width: 1,
                    overflow: 'hidden'
                } )
                .append(
                $('<div/>')
                    .css( {
                        position: 'absolute',
                        top: 1,
                        left: 1,
                        width: 100,
                        overflow: 'scroll'
                    } )
                    .append(
                    $('<div class="test"/>')
                        .css( {
                            width: '100%',
                            height: 10
                        } )
                )
            )
                .appendTo( 'body' );

            var test = n.find('.test');

            // IE6/7 will oversize a width 100% element inside a scrolling element, to
            // include the width of the scrollbar, while other browsers ensure the inner
            // element is contained without forcing scrolling
            browser.bScrollOversize = test[0].offsetWidth === 100;

            // In rtl text layout, some browsers (most, but not all) will place the
            // scrollbar on the left, rather than the right.
            browser.bScrollbarLeft = test.offset().left !== 1;

            n.remove();
        }


        /**
         * Array.prototype reduce[Right] method, used for browsers which don't support
         * JS 1.6. Done this way to reduce code size, since we iterate either way
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnReduce ( that, fn, init, start, end, inc )
        {
            var
                i = start,
                value,
                isSet = false;

            if ( init !== undefined ) {
                value = init;
                isSet = true;
            }

            while ( i !== end ) {
                if ( ! that.hasOwnProperty(i) ) {
                    continue;
                }

                value = isSet ?
                    fn( value, that[i], i, that ) :
                    that[i];

                isSet = true;
                i += inc;
            }

            return value;
        }

        /**
         * Add a column to the list used for the table with default values
         *  @param {object} oSettings dataTables settings object
         *  @param {node} nTh The th element for this column
         *  @memberof DataTable#oApi
         */
        function _fnAddColumn( oSettings, nTh )
        {
            // Add column to aoColumns array
            var oDefaults = DataTable.defaults.column;
            var iCol = oSettings.aoColumns.length;
            var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
                "nTh": nTh ? nTh : document.createElement('th'),
                "sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
                "aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
                "mData": oDefaults.mData ? oDefaults.mData : iCol,
                idx: iCol
            } );
            oSettings.aoColumns.push( oCol );

            // Add search object for column specific search. Note that the `searchCols[ iCol ]`
            // passed into extend can be undefined. This allows the user to give a default
            // with only some of the parameters defined, and also not give a default
            var searchCols = oSettings.aoPreSearchCols;
            searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );

            // Use the default column options function to initialise classes etc
            _fnColumnOptions( oSettings, iCol, null );
        }


        /**
         * Apply options for a column
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iCol column index to consider
         *  @param {object} oOptions object with sType, bVisible and bSearchable etc
         *  @memberof DataTable#oApi
         */
        function _fnColumnOptions( oSettings, iCol, oOptions )
        {
            var oCol = oSettings.aoColumns[ iCol ];
            var oClasses = oSettings.oClasses;
            var th = $(oCol.nTh);

            // Try to get width information from the DOM. We can't get it from CSS
            // as we'd need to parse the CSS stylesheet. `width` option can override
            if ( ! oCol.sWidthOrig ) {
                // Width attribute
                oCol.sWidthOrig = th.attr('width') || null;

                // Style attribute
                var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
                if ( t ) {
                    oCol.sWidthOrig = t[1];
                }
            }

            /* User specified column options */
            if ( oOptions !== undefined && oOptions !== null )
            {
                // Backwards compatibility
                _fnCompatCols( oOptions );

                // Map camel case parameters to their Hungarian counterparts
                _fnCamelToHungarian( DataTable.defaults.column, oOptions );

                /* Backwards compatibility for mDataProp */
                if ( oOptions.mDataProp !== undefined && !oOptions.mData )
                {
                    oOptions.mData = oOptions.mDataProp;
                }

                if ( oOptions.sType )
                {
                    oCol._sManualType = oOptions.sType;
                }

                // `class` is a reserved word in Javascript, so we need to provide
                // the ability to use a valid name for the camel case input
                if ( oOptions.className && ! oOptions.sClass )
                {
                    oOptions.sClass = oOptions.className;
                }

                $.extend( oCol, oOptions );
                _fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );

                /* iDataSort to be applied (backwards compatibility), but aDataSort will take
                 * priority if defined
                 */
                if ( typeof oOptions.iDataSort === 'number' )
                {
                    oCol.aDataSort = [ oOptions.iDataSort ];
                }
                _fnMap( oCol, oOptions, "aDataSort" );
            }

            /* Cache the data get and set functions for speed */
            var mDataSrc = oCol.mData;
            var mData = _fnGetObjectDataFn( mDataSrc );
            var mRender = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;

            var attrTest = function( src ) {
                return typeof src === 'string' && src.indexOf('@') !== -1;
            };
            oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
            attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
            );

            oCol.fnGetData = function (rowData, type, meta) {
                var innerData = mData( rowData, type, undefined, meta );

                return mRender && type ?
                    mRender( innerData, type, rowData, meta ) :
                    innerData;
            };
            oCol.fnSetData = function ( rowData, val, meta ) {
                return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
            };

            // Indicate if DataTables should read DOM data as an object or array
            // Used in _fnGetRowElements
            if ( typeof mDataSrc !== 'number' ) {
                oSettings._rowReadObject = true;
            }

            /* Feature sorting overrides column specific when off */
            if ( !oSettings.oFeatures.bSort )
            {
                oCol.bSortable = false;
                th.addClass( oClasses.sSortableNone ); // Have to add class here as order event isn't called
            }

            /* Check that the class assignment is correct for sorting */
            var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
            var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
            if ( !oCol.bSortable || (!bAsc && !bDesc) )
            {
                oCol.sSortingClass = oClasses.sSortableNone;
                oCol.sSortingClassJUI = "";
            }
            else if ( bAsc && !bDesc )
            {
                oCol.sSortingClass = oClasses.sSortableAsc;
                oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
            }
            else if ( !bAsc && bDesc )
            {
                oCol.sSortingClass = oClasses.sSortableDesc;
                oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
            }
            else
            {
                oCol.sSortingClass = oClasses.sSortable;
                oCol.sSortingClassJUI = oClasses.sSortJUI;
            }
        }


        /**
         * Adjust the table column widths for new data. Note: you would probably want to
         * do a redraw after calling this function!
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnAdjustColumnSizing ( settings )
        {
            /* Not interested in doing column width calculation if auto-width is disabled */
            if ( settings.oFeatures.bAutoWidth !== false )
            {
                var columns = settings.aoColumns;

                _fnCalculateColumnWidths( settings );
                for ( var i=0 , iLen=columns.length ; i<iLen ; i++ )
                {
                    columns[i].nTh.style.width = columns[i].sWidth;
                }
            }

            var scroll = settings.oScroll;
            if ( scroll.sY !== '' || scroll.sX !== '')
            {
                _fnScrollDraw( settings );
            }

            _fnCallbackFire( settings, null, 'column-sizing', [settings] );
        }


        /**
         * Covert the index of a visible column to the index in the data array (take account
         * of hidden columns)
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iMatch Visible column index to lookup
         *  @returns {int} i the data index
         *  @memberof DataTable#oApi
         */
        function _fnVisibleToColumnIndex( oSettings, iMatch )
        {
            var aiVis = _fnGetColumns( oSettings, 'bVisible' );

            return typeof aiVis[iMatch] === 'number' ?
                aiVis[iMatch] :
                null;
        }


        /**
         * Covert the index of an index in the data array and convert it to the visible
         *   column index (take account of hidden columns)
         *  @param {int} iMatch Column index to lookup
         *  @param {object} oSettings dataTables settings object
         *  @returns {int} i the data index
         *  @memberof DataTable#oApi
         */
        function _fnColumnIndexToVisible( oSettings, iMatch )
        {
            var aiVis = _fnGetColumns( oSettings, 'bVisible' );
            var iPos = $.inArray( iMatch, aiVis );

            return iPos !== -1 ? iPos : null;
        }


        /**
         * Get the number of visible columns
         *  @param {object} oSettings dataTables settings object
         *  @returns {int} i the number of visible columns
         *  @memberof DataTable#oApi
         */
        function _fnVisbleColumns( oSettings )
        {
            return _fnGetColumns( oSettings, 'bVisible' ).length;
        }


        /**
         * Get an array of column indexes that match a given property
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sParam Parameter in aoColumns to look for - typically
         *    bVisible or bSearchable
         *  @returns {array} Array of indexes with matched properties
         *  @memberof DataTable#oApi
         */
        function _fnGetColumns( oSettings, sParam )
        {
            var a = [];

            $.map( oSettings.aoColumns, function(val, i) {
                if ( val[sParam] ) {
                    a.push( i );
                }
            } );

            return a;
        }


        /**
         * Calculate the 'type' of a column
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnColumnTypes ( settings )
        {
            var columns = settings.aoColumns;
            var data = settings.aoData;
            var types = DataTable.ext.type.detect;
            var i, ien, j, jen, k, ken;
            var col, cell, detectedType, cache;

            // For each column, spin over the
            for ( i=0, ien=columns.length ; i<ien ; i++ ) {
                col = columns[i];
                cache = [];

                if ( ! col.sType && col._sManualType ) {
                    col.sType = col._sManualType;
                }
                else if ( ! col.sType ) {
                    for ( j=0, jen=types.length ; j<jen ; j++ ) {
                        for ( k=0, ken=data.length ; k<ken ; k++ ) {
                            // Use a cache array so we only need to get the type data
                            // from the formatter once (when using multiple detectors)
                            if ( cache[k] === undefined ) {
                                cache[k] = _fnGetCellData( settings, k, i, 'type' );
                            }

                            detectedType = types[j]( cache[k], settings );

                            // If null, then this type can't apply to this column, so
                            // rather than testing all cells, break out. There is an
                            // exception for the last type which is `html`. We need to
                            // scan all rows since it is possible to mix string and HTML
                            // types
                            if ( ! detectedType && j !== types.length-1 ) {
                                break;
                            }

                            // Only a single match is needed for html type since it is
                            // bottom of the pile and very similar to string
                            if ( detectedType === 'html' ) {
                                break;
                            }
                        }

                        // Type is valid for all data points in the column - use this
                        // type
                        if ( detectedType ) {
                            col.sType = detectedType;
                            break;
                        }
                    }

                    // Fall back - if no type was detected, always use string
                    if ( ! col.sType ) {
                        col.sType = 'string';
                    }
                }
            }
        }


        /**
         * Take the column definitions and static columns arrays and calculate how
         * they relate to column indexes. The callback function will then apply the
         * definition found for a column to a suitable configuration object.
         *  @param {object} oSettings dataTables settings object
         *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
         *  @param {array} aoCols The aoColumns array that defines columns individually
         *  @param {function} fn Callback function - takes two parameters, the calculated
         *    column index and the definition for that column.
         *  @memberof DataTable#oApi
         */
        function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
        {
            var i, iLen, j, jLen, k, kLen, def;
            var columns = oSettings.aoColumns;

            // Column definitions with aTargets
            if ( aoColDefs )
            {
                /* Loop over the definitions array - loop in reverse so first instance has priority */
                for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
                {
                    def = aoColDefs[i];

                    /* Each definition can target multiple columns, as it is an array */
                    var aTargets = def.targets !== undefined ?
                        def.targets :
                        def.aTargets;

                    if ( ! $.isArray( aTargets ) )
                    {
                        aTargets = [ aTargets ];
                    }

                    for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
                    {
                        if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
                        {
                            /* Add columns that we don't yet know about */
                            while( columns.length <= aTargets[j] )
                            {
                                _fnAddColumn( oSettings );
                            }

                            /* Integer, basic index */
                            fn( aTargets[j], def );
                        }
                        else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
                        {
                            /* Negative integer, right to left column counting */
                            fn( columns.length+aTargets[j], def );
                        }
                        else if ( typeof aTargets[j] === 'string' )
                        {
                            /* Class name matching on TH element */
                            for ( k=0, kLen=columns.length ; k<kLen ; k++ )
                            {
                                if ( aTargets[j] == "_all" ||
                                    $(columns[k].nTh).hasClass( aTargets[j] ) )
                                {
                                    fn( k, def );
                                }
                            }
                        }
                    }
                }
            }

            // Statically defined columns array
            if ( aoCols )
            {
                for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
                {
                    fn( i, aoCols[i] );
                }
            }
        }

        /**
         * Add a data array to the table, creating DOM node etc. This is the parallel to
         * _fnGatherData, but for adding rows from a Javascript source, rather than a
         * DOM source.
         *  @param {object} oSettings dataTables settings object
         *  @param {array} aData data array to be added
         *  @param {node} [nTr] TR element to add to the table - optional. If not given,
         *    DataTables will create a row automatically
         *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
         *    if nTr is.
         *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
         *  @memberof DataTable#oApi
         */
        function _fnAddData ( oSettings, aDataIn, nTr, anTds )
        {
            /* Create the object for storing information about this new row */
            var iRow = oSettings.aoData.length;
            var oData = $.extend( true, {}, DataTable.models.oRow, {
                src: nTr ? 'dom' : 'data'
            } );

            oData._aData = aDataIn;
            oSettings.aoData.push( oData );

            /* Create the cells */
            var nTd, sThisType;
            var columns = oSettings.aoColumns;
            for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
            {
                // When working with a row, the data source object must be populated. In
                // all other cases, the data source object is already populated, so we
                // don't overwrite it, which might break bindings etc
                if ( nTr ) {
                    _fnSetCellData( oSettings, iRow, i, _fnGetCellData( oSettings, iRow, i ) );
                }
                columns[i].sType = null;
            }

            /* Add to the display array */
            oSettings.aiDisplayMaster.push( iRow );

            /* Create the DOM information, or register it if already present */
            if ( nTr || ! oSettings.oFeatures.bDeferRender )
            {
                _fnCreateTr( oSettings, iRow, nTr, anTds );
            }

            return iRow;
        }


        /**
         * Add one or more TR elements to the table. Generally we'd expect to
         * use this for reading data from a DOM sourced table, but it could be
         * used for an TR element. Note that if a TR is given, it is used (i.e.
         * it is not cloned).
         *  @param {object} settings dataTables settings object
         *  @param {array|node|jQuery} trs The TR element(s) to add to the table
         *  @returns {array} Array of indexes for the added rows
         *  @memberof DataTable#oApi
         */
        function _fnAddTr( settings, trs )
        {
            var row;

            // Allow an individual node to be passed in
            if ( ! (trs instanceof $) ) {
                trs = $(trs);
            }

            return trs.map( function (i, el) {
                row = _fnGetRowElements( settings, el );
                return _fnAddData( settings, row.data, el, row.cells );
            } );
        }


        /**
         * Take a TR element and convert it to an index in aoData
         *  @param {object} oSettings dataTables settings object
         *  @param {node} n the TR element to find
         *  @returns {int} index if the node is found, null if not
         *  @memberof DataTable#oApi
         */
        function _fnNodeToDataIndex( oSettings, n )
        {
            return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
        }


        /**
         * Take a TD element and convert it into a column data index (not the visible index)
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow The row number the TD/TH can be found in
         *  @param {node} n The TD/TH element to find
         *  @returns {int} index if the node is found, -1 if not
         *  @memberof DataTable#oApi
         */
        function _fnNodeToColumnIndex( oSettings, iRow, n )
        {
            return $.inArray( n, oSettings.aoData[ iRow ].anCells );
        }


        /**
         * Get the data for a given cell from the internal cache, taking into account data mapping
         *  @param {object} settings dataTables settings object
         *  @param {int} rowIdx aoData row id
         *  @param {int} colIdx Column index
         *  @param {string} type data get type ('display', 'type' 'filter' 'sort')
         *  @returns {*} Cell data
         *  @memberof DataTable#oApi
         */
        function _fnGetCellData( settings, rowIdx, colIdx, type )
        {
            var draw           = settings.iDraw;
            var col            = settings.aoColumns[colIdx];
            var rowData        = settings.aoData[rowIdx]._aData;
            var defaultContent = col.sDefaultContent;
            var cellData       = col.fnGetData( rowData, type, {
                settings: settings,
                row:      rowIdx,
                col:      colIdx
            } );

            if ( cellData === undefined ) {
                if ( settings.iDrawError != draw && defaultContent === null ) {
                    _fnLog( settings, 0, "Requested unknown parameter "+
                    (typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
                    " for row "+rowIdx, 4 );
                    settings.iDrawError = draw;
                }
                return defaultContent;
            }

            /* When the data source is null, we can use default column data */
            if ( (cellData === rowData || cellData === null) && defaultContent !== null ) {
                cellData = defaultContent;
            }
            else if ( typeof cellData === 'function' ) {
                // If the data source is a function, then we run it and use the return,
                // executing in the scope of the data object (for instances)
                return cellData.call( rowData );
            }

            if ( cellData === null && type == 'display' ) {
                return '';
            }
            return cellData;
        }


        /**
         * Set the value for a specific cell, into the internal data cache
         *  @param {object} settings dataTables settings object
         *  @param {int} rowIdx aoData row id
         *  @param {int} colIdx Column index
         *  @param {*} val Value to set
         *  @memberof DataTable#oApi
         */
        function _fnSetCellData( settings, rowIdx, colIdx, val )
        {
            var col     = settings.aoColumns[colIdx];
            var rowData = settings.aoData[rowIdx]._aData;

            col.fnSetData( rowData, val, {
                settings: settings,
                row:      rowIdx,
                col:      colIdx
            }  );
        }


        // Private variable that is used to match action syntax in the data property object
        var __reArray = /\[.*?\]$/;
        var __reFn = /\(\)$/;

        /**
         * Split string on periods, taking into account escaped periods
         * @param  {string} str String to split
         * @return {array} Split string
         */
        function _fnSplitObjNotation( str )
        {
            return $.map( str.match(/(\\.|[^\.])+/g), function ( s ) {
                return s.replace(/\\./g, '.');
            } );
        }


        /**
         * Return a function that can be used to get data from a source object, taking
         * into account the ability to use nested objects as a source
         *  @param {string|int|function} mSource The data source for the object
         *  @returns {function} Data get function
         *  @memberof DataTable#oApi
         */
        function _fnGetObjectDataFn( mSource )
        {
            if ( $.isPlainObject( mSource ) )
            {
                /* Build an object of get functions, and wrap them in a single call */
                var o = {};
                $.each( mSource, function (key, val) {
                    if ( val ) {
                        o[key] = _fnGetObjectDataFn( val );
                    }
                } );

                return function (data, type, row, meta) {
                    var t = o[type] || o._;
                    return t !== undefined ?
                        t(data, type, row, meta) :
                        data;
                };
            }
            else if ( mSource === null )
            {
                /* Give an empty string for rendering / sorting etc */
                return function (data) { // type, row and meta also passed, but not used
                    return data;
                };
            }
            else if ( typeof mSource === 'function' )
            {
                return function (data, type, row, meta) {
                    return mSource( data, type, row, meta );
                };
            }
            else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
                mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
            {
                /* If there is a . in the source string then the data source is in a
                 * nested object so we loop over the data for each level to get the next
                 * level down. On each loop we test for undefined, and if found immediately
                 * return. This allows entire objects to be missing and sDefaultContent to
                 * be used if defined, rather than throwing an error
                 */
                var fetchData = function (data, type, src) {
                    var arrayNotation, funcNotation, out, innerSrc;

                    if ( src !== "" )
                    {
                        var a = _fnSplitObjNotation( src );

                        for ( var i=0, iLen=a.length ; i<iLen ; i++ )
                        {
                            // Check if we are dealing with special notation
                            arrayNotation = a[i].match(__reArray);
                            funcNotation = a[i].match(__reFn);

                            if ( arrayNotation )
                            {
                                // Array notation
                                a[i] = a[i].replace(__reArray, '');

                                // Condition allows simply [] to be passed in
                                if ( a[i] !== "" ) {
                                    data = data[ a[i] ];
                                }
                                out = [];

                                // Get the remainder of the nested object to get
                                a.splice( 0, i+1 );
                                innerSrc = a.join('.');

                                // Traverse each entry in the array getting the properties requested
                                for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
                                    out.push( fetchData( data[j], type, innerSrc ) );
                                }

                                // If a string is given in between the array notation indicators, that
                                // is used to join the strings together, otherwise an array is returned
                                var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
                                data = (join==="") ? out : out.join(join);

                                // The inner call to fetchData has already traversed through the remainder
                                // of the source requested, so we exit from the loop
                                break;
                            }
                            else if ( funcNotation )
                            {
                                // Function call
                                a[i] = a[i].replace(__reFn, '');
                                data = data[ a[i] ]();
                                continue;
                            }

                            if ( data === null || data[ a[i] ] === undefined )
                            {
                                return undefined;
                            }
                            data = data[ a[i] ];
                        }
                    }

                    return data;
                };

                return function (data, type) { // row and meta also passed, but not used
                    return fetchData( data, type, mSource );
                };
            }
            else
            {
                /* Array or flat object mapping */
                return function (data, type) { // row and meta also passed, but not used
                    return data[mSource];
                };
            }
        }


        /**
         * Return a function that can be used to set data from a source object, taking
         * into account the ability to use nested objects as a source
         *  @param {string|int|function} mSource The data source for the object
         *  @returns {function} Data set function
         *  @memberof DataTable#oApi
         */
        function _fnSetObjectDataFn( mSource )
        {
            if ( $.isPlainObject( mSource ) )
            {
                /* Unlike get, only the underscore (global) option is used for for
                 * setting data since we don't know the type here. This is why an object
                 * option is not documented for `mData` (which is read/write), but it is
                 * for `mRender` which is read only.
                 */
                return _fnSetObjectDataFn( mSource._ );
            }
            else if ( mSource === null )
            {
                /* Nothing to do when the data source is null */
                return function () {};
            }
            else if ( typeof mSource === 'function' )
            {
                return function (data, val, meta) {
                    mSource( data, 'set', val, meta );
                };
            }
            else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
                mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
            {
                /* Like the get, we need to get data from a nested object */
                var setData = function (data, val, src) {
                    var a = _fnSplitObjNotation( src ), b;
                    var aLast = a[a.length-1];
                    var arrayNotation, funcNotation, o, innerSrc;

                    for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
                    {
                        // Check if we are dealing with an array notation request
                        arrayNotation = a[i].match(__reArray);
                        funcNotation = a[i].match(__reFn);

                        if ( arrayNotation )
                        {
                            a[i] = a[i].replace(__reArray, '');
                            data[ a[i] ] = [];

                            // Get the remainder of the nested object to set so we can recurse
                            b = a.slice();
                            b.splice( 0, i+1 );
                            innerSrc = b.join('.');

                            // Traverse each entry in the array setting the properties requested
                            for ( var j=0, jLen=val.length ; j<jLen ; j++ )
                            {
                                o = {};
                                setData( o, val[j], innerSrc );
                                data[ a[i] ].push( o );
                            }

                            // The inner call to setData has already traversed through the remainder
                            // of the source and has set the data, thus we can exit here
                            return;
                        }
                        else if ( funcNotation )
                        {
                            // Function call
                            a[i] = a[i].replace(__reFn, '');
                            data = data[ a[i] ]( val );
                        }

                        // If the nested object doesn't currently exist - since we are
                        // trying to set the value - create it
                        if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
                        {
                            data[ a[i] ] = {};
                        }
                        data = data[ a[i] ];
                    }

                    // Last item in the input - i.e, the actual set
                    if ( aLast.match(__reFn ) )
                    {
                        // Function call
                        data = data[ aLast.replace(__reFn, '') ]( val );
                    }
                    else
                    {
                        // If array notation is used, we just want to strip it and use the property name
                        // and assign the value. If it isn't used, then we get the result we want anyway
                        data[ aLast.replace(__reArray, '') ] = val;
                    }
                };

                return function (data, val) { // meta is also passed in, but not used
                    return setData( data, val, mSource );
                };
            }
            else
            {
                /* Array or flat object mapping */
                return function (data, val) { // meta is also passed in, but not used
                    data[mSource] = val;
                };
            }
        }


        /**
         * Return an array with the full table data
         *  @param {object} oSettings dataTables settings object
         *  @returns array {array} aData Master data array
         *  @memberof DataTable#oApi
         */
        function _fnGetDataMaster ( settings )
        {
            return _pluck( settings.aoData, '_aData' );
        }


        /**
         * Nuke the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnClearTable( settings )
        {
            settings.aoData.length = 0;
            settings.aiDisplayMaster.length = 0;
            settings.aiDisplay.length = 0;
        }


        /**
         * Take an array of integers (index array) and remove a target integer (value - not
         * the key!)
         *  @param {array} a Index array to target
         *  @param {int} iTarget value to find
         *  @memberof DataTable#oApi
         */
        function _fnDeleteIndex( a, iTarget, splice )
        {
            var iTargetIndex = -1;

            for ( var i=0, iLen=a.length ; i<iLen ; i++ )
            {
                if ( a[i] == iTarget )
                {
                    iTargetIndex = i;
                }
                else if ( a[i] > iTarget )
                {
                    a[i]--;
                }
            }

            if ( iTargetIndex != -1 && splice === undefined )
            {
                a.splice( iTargetIndex, 1 );
            }
        }


        /**
         * Mark cached data as invalid such that a re-read of the data will occur when
         * the cached data is next requested. Also update from the data source object.
         *
         * @param {object} settings DataTables settings object
         * @param {int}    rowIdx   Row index to invalidate
         * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
         *     or 'data'
         * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
         *     row will be invalidated
         * @memberof DataTable#oApi
         *
         * @todo For the modularisation of v1.11 this will need to become a callback, so
         *   the sort and filter methods can subscribe to it. That will required
         *   initialisation options for sorting, which is why it is not already baked in
         */
        function _fnInvalidate( settings, rowIdx, src, colIdx )
        {
            var row = settings.aoData[ rowIdx ];
            var i, ien;
            var cellWrite = function ( cell, col ) {
                // This is very frustrating, but in IE if you just write directly
                // to innerHTML, and elements that are overwritten are GC'ed,
                // even if there is a reference to them elsewhere
                while ( cell.childNodes.length ) {
                    cell.removeChild( cell.firstChild );
                }

                cell.innerHTML = _fnGetCellData( settings, rowIdx, col, 'display' );
            };

            // Are we reading last data from DOM or the data object?
            if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
                // Read the data from the DOM
                row._aData = _fnGetRowElements(
                    settings, row, colIdx, colIdx === undefined ? undefined : row._aData
                )
                    .data;
            }
            else {
                // Reading from data object, update the DOM
                var cells = row.anCells;

                if ( cells ) {
                    if ( colIdx !== undefined ) {
                        cellWrite( cells[colIdx], colIdx );
                    }
                    else {
                        for ( i=0, ien=cells.length ; i<ien ; i++ ) {
                            cellWrite( cells[i], i );
                        }
                    }
                }
            }

            // For both row and cell invalidation, the cached data for sorting and
            // filtering is nulled out
            row._aSortData = null;
            row._aFilterData = null;

            // Invalidate the type for a specific column (if given) or all columns since
            // the data might have changed
            var cols = settings.aoColumns;
            if ( colIdx !== undefined ) {
                cols[ colIdx ].sType = null;
            }
            else {
                for ( i=0, ien=cols.length ; i<ien ; i++ ) {
                    cols[i].sType = null;
                }

                // Update DataTables special `DT_*` attributes for the row
                _fnRowAttributes( row );
            }
        }


        /**
         * Build a data source object from an HTML row, reading the contents of the
         * cells that are in the row.
         *
         * @param {object} settings DataTables settings object
         * @param {node|object} TR element from which to read data or existing row
         *   object from which to re-read the data from the cells
         * @param {int} [colIdx] Optional column index
         * @param {array|object} [d] Data source object. If `colIdx` is given then this
         *   parameter should also be given and will be used to write the data into.
         *   Only the column in question will be written
         * @returns {object} Object with two parameters: `data` the data read, in
         *   document order, and `cells` and array of nodes (they can be useful to the
         *   caller, so rather than needing a second traversal to get them, just return
         *   them from here).
         * @memberof DataTable#oApi
         */
        function _fnGetRowElements( settings, row, colIdx, d )
        {
            var
                tds = [],
                td = row.firstChild,
                name, col, o, i=0, contents,
                columns = settings.aoColumns,
                objectRead = settings._rowReadObject;

            // Allow the data object to be passed in, or construct
            d = d || objectRead ? {} : [];

            var attr = function ( str, td  ) {
                if ( typeof str === 'string' ) {
                    var idx = str.indexOf('@');

                    if ( idx !== -1 ) {
                        var attr = str.substring( idx+1 );
                        var setter = _fnSetObjectDataFn( str );
                        setter( d, td.getAttribute( attr ) );
                    }
                }
            };

            // Read data from a cell and store into the data object
            var cellProcess = function ( cell ) {
                if ( colIdx === undefined || colIdx === i ) {
                    col = columns[i];
                    contents = $.trim(cell.innerHTML);

                    if ( col && col._bAttrSrc ) {
                        var setter = _fnSetObjectDataFn( col.mData._ );
                        setter( d, contents );

                        attr( col.mData.sort, cell );
                        attr( col.mData.type, cell );
                        attr( col.mData.filter, cell );
                    }
                    else {
                        // Depending on the `data` option for the columns the data can
                        // be read to either an object or an array.
                        if ( objectRead ) {
                            if ( ! col._setter ) {
                                // Cache the setter function
                                col._setter = _fnSetObjectDataFn( col.mData );
                            }
                            col._setter( d, contents );
                        }
                        else {
                            d[i] = contents;
                        }
                    }
                }

                i++;
            };

            if ( td ) {
                // `tr` element was passed in
                while ( td ) {
                    name = td.nodeName.toUpperCase();

                    if ( name == "TD" || name == "TH" ) {
                        cellProcess( td );
                        tds.push( td );
                    }

                    td = td.nextSibling;
                }
            }
            else {
                // Existing row object passed in
                tds = row.anCells;

                for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
                    cellProcess( tds[j] );
                }
            }

            return {
                data: d,
                cells: tds
            };
        }
        /**
         * Create a new TR element (and it's TD children) for a row
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow Row to consider
         *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
         *    DataTables will create a row automatically
         *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
         *    if nTr is.
         *  @memberof DataTable#oApi
         */
        function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
        {
            var
                row = oSettings.aoData[iRow],
                rowData = row._aData,
                cells = [],
                nTr, nTd, oCol,
                i, iLen;

            if ( row.nTr === null )
            {
                nTr = nTrIn || document.createElement('tr');

                row.nTr = nTr;
                row.anCells = cells;

                /* Use a private property on the node to allow reserve mapping from the node
                 * to the aoData array for fast look up
                 */
                nTr._DT_RowIndex = iRow;

                /* Special parameters can be given by the data source to be used on the row */
                _fnRowAttributes( row );

                /* Process each column */
                for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
                {
                    oCol = oSettings.aoColumns[i];

                    nTd = nTrIn ? anTds[i] : document.createElement( oCol.sCellType );
                    cells.push( nTd );

                    // Need to create the HTML if new, or if a rendering function is defined
                    if ( !nTrIn || oCol.mRender || oCol.mData !== i )
                    {
                        nTd.innerHTML = _fnGetCellData( oSettings, iRow, i, 'display' );
                    }

                    /* Add user defined class */
                    if ( oCol.sClass )
                    {
                        nTd.className += ' '+oCol.sClass;
                    }

                    // Visibility - add or remove as required
                    if ( oCol.bVisible && ! nTrIn )
                    {
                        nTr.appendChild( nTd );
                    }
                    else if ( ! oCol.bVisible && nTrIn )
                    {
                        nTd.parentNode.removeChild( nTd );
                    }

                    if ( oCol.fnCreatedCell )
                    {
                        oCol.fnCreatedCell.call( oSettings.oInstance,
                            nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
                        );
                    }
                }

                _fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow] );
            }

            // Remove once webkit bug 131819 and Chromium bug 365619 have been resolved
            // and deployed
            row.nTr.setAttribute( 'role', 'row' );
        }


        /**
         * Add attributes to a row based on the special `DT_*` parameters in a data
         * source object.
         *  @param {object} DataTables row object for the row to be modified
         *  @memberof DataTable#oApi
         */
        function _fnRowAttributes( row )
        {
            var tr = row.nTr;
            var data = row._aData;

            if ( tr ) {
                if ( data.DT_RowId ) {
                    tr.id = data.DT_RowId;
                }

                if ( data.DT_RowClass ) {
                    // Remove any classes added by DT_RowClass before
                    var a = data.DT_RowClass.split(' ');
                    row.__rowc = row.__rowc ?
                        _unique( row.__rowc.concat( a ) ) :
                        a;

                    $(tr)
                        .removeClass( row.__rowc.join(' ') )
                        .addClass( data.DT_RowClass );
                }

                if ( data.DT_RowData ) {
                    $(tr).data( data.DT_RowData );
                }
            }
        }


        /**
         * Create the HTML header for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnBuildHead( oSettings )
        {
            var i, ien, cell, row, column;
            var thead = oSettings.nTHead;
            var tfoot = oSettings.nTFoot;
            var createHeader = $('th, td', thead).length === 0;
            var classes = oSettings.oClasses;
            var columns = oSettings.aoColumns;

            if ( createHeader ) {
                row = $('<tr/>').appendTo( thead );
            }

            for ( i=0, ien=columns.length ; i<ien ; i++ ) {
                column = columns[i];
                cell = $( column.nTh ).addClass( column.sClass );

                if ( createHeader ) {
                    cell.appendTo( row );
                }

                // 1.11 move into sorting
                if ( oSettings.oFeatures.bSort ) {
                    cell.addClass( column.sSortingClass );

                    if ( column.bSortable !== false ) {
                        cell
                            .attr( 'tabindex', oSettings.iTabIndex )
                            .attr( 'aria-controls', oSettings.sTableId );

                        _fnSortAttachListener( oSettings, column.nTh, i );
                    }
                }

                if ( column.sTitle != cell.html() ) {
                    cell.html( column.sTitle );
                }

                _fnRenderer( oSettings, 'header' )(
                    oSettings, cell, column, classes
                );
            }

            if ( createHeader ) {
                _fnDetectHeader( oSettings.aoHeader, thead );
            }

            /* ARIA role for the rows */
            $(thead).find('>tr').attr('role', 'row');

            /* Deal with the footer - add classes if required */
            $(thead).find('>tr>th, >tr>td').addClass( classes.sHeaderTH );
            $(tfoot).find('>tr>th, >tr>td').addClass( classes.sFooterTH );

            // Cache the footer cells. Note that we only take the cells from the first
            // row in the footer. If there is more than one row the user wants to
            // interact with, they need to use the table().foot() method. Note also this
            // allows cells to be used for multiple columns using colspan
            if ( tfoot !== null ) {
                var cells = oSettings.aoFooter[0];

                for ( i=0, ien=cells.length ; i<ien ; i++ ) {
                    column = columns[i];
                    column.nTf = cells[i].cell;

                    if ( column.sClass ) {
                        $(column.nTf).addClass( column.sClass );
                    }
                }
            }
        }


        /**
         * Draw the header (or footer) element based on the column visibility states. The
         * methodology here is to use the layout array from _fnDetectHeader, modified for
         * the instantaneous column visibility, to construct the new layout. The grid is
         * traversed over cell at a time in a rows x columns grid fashion, although each
         * cell insert can cover multiple elements in the grid - which is tracks using the
         * aApplied array. Cell inserts in the grid will only occur where there isn't
         * already a cell in that position.
         *  @param {object} oSettings dataTables settings object
         *  @param array {objects} aoSource Layout array from _fnDetectHeader
         *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
         *  @memberof DataTable#oApi
         */
        function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
        {
            var i, iLen, j, jLen, k, kLen, n, nLocalTr;
            var aoLocal = [];
            var aApplied = [];
            var iColumns = oSettings.aoColumns.length;
            var iRowspan, iColspan;

            if ( ! aoSource )
            {
                return;
            }

            if (  bIncludeHidden === undefined )
            {
                bIncludeHidden = false;
            }

            /* Make a copy of the master layout array, but without the visible columns in it */
            for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
            {
                aoLocal[i] = aoSource[i].slice();
                aoLocal[i].nTr = aoSource[i].nTr;

                /* Remove any columns which are currently hidden */
                for ( j=iColumns-1 ; j>=0 ; j-- )
                {
                    if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
                    {
                        aoLocal[i].splice( j, 1 );
                    }
                }

                /* Prep the applied array - it needs an element for each row */
                aApplied.push( [] );
            }

            for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
            {
                nLocalTr = aoLocal[i].nTr;

                /* All cells are going to be replaced, so empty out the row */
                if ( nLocalTr )
                {
                    while( (n = nLocalTr.firstChild) )
                    {
                        nLocalTr.removeChild( n );
                    }
                }

                for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
                {
                    iRowspan = 1;
                    iColspan = 1;

                    /* Check to see if there is already a cell (row/colspan) covering our target
                     * insert point. If there is, then there is nothing to do.
                     */
                    if ( aApplied[i][j] === undefined )
                    {
                        nLocalTr.appendChild( aoLocal[i][j].cell );
                        aApplied[i][j] = 1;

                        /* Expand the cell to cover as many rows as needed */
                        while ( aoLocal[i+iRowspan] !== undefined &&
                        aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
                        {
                            aApplied[i+iRowspan][j] = 1;
                            iRowspan++;
                        }

                        /* Expand the cell to cover as many columns as needed */
                        while ( aoLocal[i][j+iColspan] !== undefined &&
                        aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
                        {
                            /* Must update the applied array over the rows for the columns */
                            for ( k=0 ; k<iRowspan ; k++ )
                            {
                                aApplied[i+k][j+iColspan] = 1;
                            }
                            iColspan++;
                        }

                        /* Do the actual expansion in the DOM */
                        $(aoLocal[i][j].cell)
                            .attr('rowspan', iRowspan)
                            .attr('colspan', iColspan);
                    }
                }
            }
        }


        /**
         * Insert the required TR nodes into the table for display
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnDraw( oSettings )
        {
            /* Provide a pre-callback function which can be used to cancel the draw is false is returned */
            var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
            if ( $.inArray( false, aPreDraw ) !== -1 )
            {
                _fnProcessingDisplay( oSettings, false );
                return;
            }

            var i, iLen, n;
            var anRows = [];
            var iRowCount = 0;
            var asStripeClasses = oSettings.asStripeClasses;
            var iStripes = asStripeClasses.length;
            var iOpenRows = oSettings.aoOpenRows.length;
            var oLang = oSettings.oLanguage;
            var iInitDisplayStart = oSettings.iInitDisplayStart;
            var bServerSide = _fnDataSource( oSettings ) == 'ssp';
            var aiDisplay = oSettings.aiDisplay;

            oSettings.bDrawing = true;

            /* Check and see if we have an initial draw position from state saving */
            if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
            {
                oSettings._iDisplayStart = bServerSide ?
                    iInitDisplayStart :
                    iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
                        0 :
                        iInitDisplayStart;

                oSettings.iInitDisplayStart = -1;
            }

            var iDisplayStart = oSettings._iDisplayStart;
            var iDisplayEnd = oSettings.fnDisplayEnd();

            /* Server-side processing draw intercept */
            if ( oSettings.bDeferLoading )
            {
                oSettings.bDeferLoading = false;
                oSettings.iDraw++;
                _fnProcessingDisplay( oSettings, false );
            }
            else if ( !bServerSide )
            {
                oSettings.iDraw++;
            }
            else if ( !oSettings.bDestroying && !_fnAjaxUpdate( oSettings ) )
            {
                return;
            }

            if ( aiDisplay.length !== 0 )
            {
                var iStart = bServerSide ? 0 : iDisplayStart;
                var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;

                for ( var j=iStart ; j<iEnd ; j++ )
                {
                    var iDataIndex = aiDisplay[j];
                    var aoData = oSettings.aoData[ iDataIndex ];
                    if ( aoData.nTr === null )
                    {
                        _fnCreateTr( oSettings, iDataIndex );
                    }

                    var nRow = aoData.nTr;

                    /* Remove the old striping classes and then add the new one */
                    if ( iStripes !== 0 )
                    {
                        var sStripe = asStripeClasses[ iRowCount % iStripes ];
                        if ( aoData._sRowStripe != sStripe )
                        {
                            $(nRow).removeClass( aoData._sRowStripe ).addClass( sStripe );
                            aoData._sRowStripe = sStripe;
                        }
                    }

                    // Row callback functions - might want to manipulate the row
                    // iRowCount and j are not currently documented. Are they at all
                    // useful?
                    _fnCallbackFire( oSettings, 'aoRowCallback', null,
                        [nRow, aoData._aData, iRowCount, j] );

                    anRows.push( nRow );
                    iRowCount++;
                }
            }
            else
            {
                /* Table is empty - create a row with an empty message in it */
                var sZero = oLang.sZeroRecords;
                if ( oSettings.iDraw == 1 &&  _fnDataSource( oSettings ) == 'ajax' )
                {
                    sZero = oLang.sLoadingRecords;
                }
                else if ( oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0 )
                {
                    sZero = oLang.sEmptyTable;
                }

                anRows[ 0 ] = $( '<tr/>', { 'class': iStripes ? asStripeClasses[0] : '' } )
                    .append( $('<td />', {
                        'valign':  'top',
                        'colSpan': _fnVisbleColumns( oSettings ),
                        'class':   oSettings.oClasses.sRowEmpty
                    } ).html( sZero ) )[0];
            }

            /* Header and footer callbacks */
            _fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
                _fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );

            _fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
                _fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );

            var body = $(oSettings.nTBody);

            body.children().detach();
            body.append( $(anRows) );

            /* Call all required callback functions for the end of a draw */
            _fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings] );

            /* Draw is complete, sorting and filtering must be as well */
            oSettings.bSorted = false;
            oSettings.bFiltered = false;
            oSettings.bDrawing = false;
        }


        /**
         * Redraw the table - taking account of the various features which are enabled
         *  @param {object} oSettings dataTables settings object
         *  @param {boolean} [holdPosition] Keep the current paging position. By default
         *    the paging is reset to the first page
         *  @memberof DataTable#oApi
         */
        function _fnReDraw( settings, holdPosition )
        {
            var
                features = settings.oFeatures,
                sort     = features.bSort,
                filter   = features.bFilter;

            if ( sort ) {
                _fnSort( settings );
            }

            if ( filter ) {
                _fnFilterComplete( settings, settings.oPreviousSearch );
            }
            else {
                // No filtering, so we want to just use the display master
                settings.aiDisplay = settings.aiDisplayMaster.slice();
            }

            if ( holdPosition !== true ) {
                settings._iDisplayStart = 0;
            }

            // Let any modules know about the draw hold position state (used by
            // scrolling internally)
            settings._drawHold = holdPosition;

            _fnDraw( settings );

            settings._drawHold = false;
        }


        /**
         * Add the options to the page HTML for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnAddOptionsHtml ( oSettings )
        {
            var classes = oSettings.oClasses;
            var table = $(oSettings.nTable);
            var holding = $('<div/>').insertBefore( table ); // Holding element for speed
            var features = oSettings.oFeatures;

            // All DataTables are wrapped in a div
            var insert = $('<div/>', {
                id:      oSettings.sTableId+'_wrapper',
                'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' '+classes.sNoFooter)
            } );

            oSettings.nHolding = holding[0];
            oSettings.nTableWrapper = insert[0];
            oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;

            /* Loop over the user set positioning and place the elements as needed */
            var aDom = oSettings.sDom.split('');
            var featureNode, cOption, nNewNode, cNext, sAttr, j;
            for ( var i=0 ; i<aDom.length ; i++ )
            {
                featureNode = null;
                cOption = aDom[i];

                if ( cOption == '<' )
                {
                    /* New container div */
                    nNewNode = $('<div/>')[0];

                    /* Check to see if we should append an id and/or a class name to the container */
                    cNext = aDom[i+1];
                    if ( cNext == "'" || cNext == '"' )
                    {
                        sAttr = "";
                        j = 2;
                        while ( aDom[i+j] != cNext )
                        {
                            sAttr += aDom[i+j];
                            j++;
                        }

                        /* Replace jQuery UI constants @todo depreciated */
                        if ( sAttr == "H" )
                        {
                            sAttr = classes.sJUIHeader;
                        }
                        else if ( sAttr == "F" )
                        {
                            sAttr = classes.sJUIFooter;
                        }

                        /* The attribute can be in the format of "#id.class", "#id" or "class" This logic
                         * breaks the string into parts and applies them as needed
                         */
                        if ( sAttr.indexOf('.') != -1 )
                        {
                            var aSplit = sAttr.split('.');
                            nNewNode.id = aSplit[0].substr(1, aSplit[0].length-1);
                            nNewNode.className = aSplit[1];
                        }
                        else if ( sAttr.charAt(0) == "#" )
                        {
                            nNewNode.id = sAttr.substr(1, sAttr.length-1);
                        }
                        else
                        {
                            nNewNode.className = sAttr;
                        }

                        i += j; /* Move along the position array */
                    }

                    insert.append( nNewNode );
                    insert = $(nNewNode);
                }
                else if ( cOption == '>' )
                {
                    /* End container div */
                    insert = insert.parent();
                }
                // @todo Move options into their own plugins?
                else if ( cOption == 'l' && features.bPaginate && features.bLengthChange )
                {
                    /* Length */
                    featureNode = _fnFeatureHtmlLength( oSettings );
                }
                else if ( cOption == 'f' && features.bFilter )
                {
                    /* Filter */
                    featureNode = _fnFeatureHtmlFilter( oSettings );
                }
                else if ( cOption == 'r' && features.bProcessing )
                {
                    /* pRocessing */
                    featureNode = _fnFeatureHtmlProcessing( oSettings );
                }
                else if ( cOption == 't' )
                {
                    /* Table */
                    featureNode = _fnFeatureHtmlTable( oSettings );
                }
                else if ( cOption ==  'i' && features.bInfo )
                {
                    /* Info */
                    featureNode = _fnFeatureHtmlInfo( oSettings );
                }
                else if ( cOption == 'p' && features.bPaginate )
                {
                    /* Pagination */
                    featureNode = _fnFeatureHtmlPaginate( oSettings );
                }
                else if ( DataTable.ext.feature.length !== 0 )
                {
                    /* Plug-in features */
                    var aoFeatures = DataTable.ext.feature;
                    for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
                    {
                        if ( cOption == aoFeatures[k].cFeature )
                        {
                            featureNode = aoFeatures[k].fnInit( oSettings );
                            break;
                        }
                    }
                }

                /* Add to the 2D features array */
                if ( featureNode )
                {
                    var aanFeatures = oSettings.aanFeatures;

                    if ( ! aanFeatures[cOption] )
                    {
                        aanFeatures[cOption] = [];
                    }

                    aanFeatures[cOption].push( featureNode );
                    insert.append( featureNode );
                }
            }

            /* Built our DOM structure - replace the holding div with what we want */
            holding.replaceWith( insert );
        }


        /**
         * Use the DOM source to create up an array of header cells. The idea here is to
         * create a layout grid (array) of rows x columns, which contains a reference
         * to the cell that that point in the grid (regardless of col/rowspan), such that
         * any column / row could be removed and the new grid constructed
         *  @param array {object} aLayout Array to store the calculated layout in
         *  @param {node} nThead The header/footer element for the table
         *  @memberof DataTable#oApi
         */
        function _fnDetectHeader ( aLayout, nThead )
        {
            var nTrs = $(nThead).children('tr');
            var nTr, nCell;
            var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
            var bUnique;
            var fnShiftCol = function ( a, i, j ) {
                var k = a[i];
                while ( k[j] ) {
                    j++;
                }
                return j;
            };

            aLayout.splice( 0, aLayout.length );

            /* We know how many rows there are in the layout - so prep it */
            for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
            {
                aLayout.push( [] );
            }

            /* Calculate a layout array */
            for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
            {
                nTr = nTrs[i];
                iColumn = 0;

                /* For every cell in the row... */
                nCell = nTr.firstChild;
                while ( nCell ) {
                    if ( nCell.nodeName.toUpperCase() == "TD" ||
                        nCell.nodeName.toUpperCase() == "TH" )
                    {
                        /* Get the col and rowspan attributes from the DOM and sanitise them */
                        iColspan = nCell.getAttribute('colspan') * 1;
                        iRowspan = nCell.getAttribute('rowspan') * 1;
                        iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
                        iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;

                        /* There might be colspan cells already in this row, so shift our target
                         * accordingly
                         */
                        iColShifted = fnShiftCol( aLayout, i, iColumn );

                        /* Cache calculation for unique columns */
                        bUnique = iColspan === 1 ? true : false;

                        /* If there is col / rowspan, copy the information into the layout grid */
                        for ( l=0 ; l<iColspan ; l++ )
                        {
                            for ( k=0 ; k<iRowspan ; k++ )
                            {
                                aLayout[i+k][iColShifted+l] = {
                                    "cell": nCell,
                                    "unique": bUnique
                                };
                                aLayout[i+k].nTr = nTr;
                            }
                        }
                    }
                    nCell = nCell.nextSibling;
                }
            }
        }


        /**
         * Get an array of unique th elements, one for each column
         *  @param {object} oSettings dataTables settings object
         *  @param {node} nHeader automatically detect the layout from this node - optional
         *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
         *  @returns array {node} aReturn list of unique th's
         *  @memberof DataTable#oApi
         */
        function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
        {
            var aReturn = [];
            if ( !aLayout )
            {
                aLayout = oSettings.aoHeader;
                if ( nHeader )
                {
                    aLayout = [];
                    _fnDetectHeader( aLayout, nHeader );
                }
            }

            for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
            {
                for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
                {
                    if ( aLayout[i][j].unique &&
                        (!aReturn[j] || !oSettings.bSortCellsTop) )
                    {
                        aReturn[j] = aLayout[i][j].cell;
                    }
                }
            }

            return aReturn;
        }



        /**
         * Create an Ajax call based on the table's settings, taking into account that
         * parameters can have multiple forms, and backwards compatibility.
         *
         * @param {object} oSettings dataTables settings object
         * @param {array} data Data to send to the server, required by
         *     DataTables - may be augmented by developer callbacks
         * @param {function} fn Callback function to run when data is obtained
         */
        function _fnBuildAjax( oSettings, data, fn )
        {
            // Compatibility with 1.9-, allow fnServerData and event to manipulate
            _fnCallbackFire( oSettings, 'aoServerParams', 'serverParams', [data] );

            // Convert to object based for 1.10+ if using the old array scheme which can
            // come from server-side processing or serverParams
            if ( data && $.isArray(data) ) {
                var tmp = {};
                var rbracket = /(.*?)\[\]$/;

                $.each( data, function (key, val) {
                    var match = val.name.match(rbracket);

                    if ( match ) {
                        // Support for arrays
                        var name = match[0];

                        if ( ! tmp[ name ] ) {
                            tmp[ name ] = [];
                        }
                        tmp[ name ].push( val.value );
                    }
                    else {
                        tmp[val.name] = val.value;
                    }
                } );
                data = tmp;
            }

            var ajaxData;
            var ajax = oSettings.ajax;
            var instance = oSettings.oInstance;

            if ( $.isPlainObject( ajax ) && ajax.data )
            {
                ajaxData = ajax.data;

                var newData = $.isFunction( ajaxData ) ?
                    ajaxData( data ) :  // fn can manipulate data or return an object
                    ajaxData;           // object or array to merge

                // If the function returned an object, use that alone
                data = $.isFunction( ajaxData ) && newData ?
                    newData :
                    $.extend( true, data, newData );

                // Remove the data property as we've resolved it already and don't want
                // jQuery to do it again (it is restored at the end of the function)
                delete ajax.data;
            }

            var baseAjax = {
                "data": data,
                "success": function (json) {
                    var error = json.error || json.sError;
                    if ( error ) {
                        oSettings.oApi._fnLog( oSettings, 0, error );
                    }

                    oSettings.json = json;
                    _fnCallbackFire( oSettings, null, 'xhr', [oSettings, json] );
                    fn( json );
                },
                "dataType": "json",
                "cache": false,
                "type": oSettings.sServerMethod,
                "error": function (xhr, error, thrown) {
                    var log = oSettings.oApi._fnLog;

                    if ( error == "parsererror" ) {
                        log( oSettings, 0, 'Invalid JSON response', 1 );
                    }
                    else if ( xhr.readyState === 4 ) {
                        log( oSettings, 0, 'Ajax error', 7 );
                    }

                    _fnProcessingDisplay( oSettings, false );
                }
            };

            // Store the data submitted for the API
            oSettings.oAjaxData = data;

            // Allow plug-ins and external processes to modify the data
            _fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data] );

            if ( oSettings.fnServerData )
            {
                // DataTables 1.9- compatibility
                oSettings.fnServerData.call( instance,
                    oSettings.sAjaxSource,
                    $.map( data, function (val, key) { // Need to convert back to 1.9 trad format
                        return { name: key, value: val };
                    } ),
                    fn,
                    oSettings
                );
            }
            else if ( oSettings.sAjaxSource || typeof ajax === 'string' )
            {
                // DataTables 1.9- compatibility
                oSettings.jqXHR = $.ajax( $.extend( baseAjax, {
                    url: ajax || oSettings.sAjaxSource
                } ) );
            }
            else if ( $.isFunction( ajax ) )
            {
                // Is a function - let the caller define what needs to be done
                oSettings.jqXHR = ajax.call( instance, data, fn, oSettings );
            }
            else
            {
                // Object to extend the base settings
                oSettings.jqXHR = $.ajax( $.extend( baseAjax, ajax ) );

                // Restore for next time around
                ajax.data = ajaxData;
            }
        }


        /**
         * Update the table using an Ajax call
         *  @param {object} settings dataTables settings object
         *  @returns {boolean} Block the table drawing or not
         *  @memberof DataTable#oApi
         */
        function _fnAjaxUpdate( settings )
        {
            if ( settings.bAjaxDataGet ) {
                settings.iDraw++;
                _fnProcessingDisplay( settings, true );

                _fnBuildAjax(
                    settings,
                    _fnAjaxParameters( settings ),
                    function(json) {
                        _fnAjaxUpdateDraw( settings, json );
                    }
                );

                return false;
            }
            return true;
        }


        /**
         * Build up the parameters in an object needed for a server-side processing
         * request. Note that this is basically done twice, is different ways - a modern
         * method which is used by default in DataTables 1.10 which uses objects and
         * arrays, or the 1.9- method with is name / value pairs. 1.9 method is used if
         * the sAjaxSource option is used in the initialisation, or the legacyAjax
         * option is set.
         *  @param {object} oSettings dataTables settings object
         *  @returns {bool} block the table drawing or not
         *  @memberof DataTable#oApi
         */
        function _fnAjaxParameters( settings )
        {
            var
                columns = settings.aoColumns,
                columnCount = columns.length,
                features = settings.oFeatures,
                preSearch = settings.oPreviousSearch,
                preColSearch = settings.aoPreSearchCols,
                i, data = [], dataProp, column, columnSearch,
                sort = _fnSortFlatten( settings ),
                displayStart = settings._iDisplayStart,
                displayLength = features.bPaginate !== false ?
                    settings._iDisplayLength :
                    -1;

            var param = function ( name, value ) {
                data.push( { 'name': name, 'value': value } );
            };

            // DataTables 1.9- compatible method
            param( 'sEcho',          settings.iDraw );
            param( 'iColumns',       columnCount );
            param( 'sColumns',       _pluck( columns, 'sName' ).join(',') );
            param( 'iDisplayStart',  displayStart );
            param( 'iDisplayLength', displayLength );

            // DataTables 1.10+ method
            var d = {
                draw:    settings.iDraw,
                columns: [],
                order:   [],
                start:   displayStart,
                length:  displayLength,
                search:  {
                    value: preSearch.sSearch,
                    regex: preSearch.bRegex
                }
            };

            for ( i=0 ; i<columnCount ; i++ ) {
                column = columns[i];
                columnSearch = preColSearch[i];
                dataProp = typeof column.mData=="function" ? 'function' : column.mData ;

                d.columns.push( {
                    data:       dataProp,
                    name:       column.sName,
                    searchable: column.bSearchable,
                    orderable:  column.bSortable,
                    search:     {
                        value: columnSearch.sSearch,
                        regex: columnSearch.bRegex
                    }
                } );

                param( "mDataProp_"+i, dataProp );

                if ( features.bFilter ) {
                    param( 'sSearch_'+i,     columnSearch.sSearch );
                    param( 'bRegex_'+i,      columnSearch.bRegex );
                    param( 'bSearchable_'+i, column.bSearchable );
                }

                if ( features.bSort ) {
                    param( 'bSortable_'+i, column.bSortable );
                }
            }

            if ( features.bFilter ) {
                param( 'sSearch', preSearch.sSearch );
                param( 'bRegex', preSearch.bRegex );
            }

            if ( features.bSort ) {
                $.each( sort, function ( i, val ) {
                    d.order.push( { column: val.col, dir: val.dir } );

                    param( 'iSortCol_'+i, val.col );
                    param( 'sSortDir_'+i, val.dir );
                } );

                param( 'iSortingCols', sort.length );
            }

            // If the legacy.ajax parameter is null, then we automatically decide which
            // form to use, based on sAjaxSource
            var legacy = DataTable.ext.legacy.ajax;
            if ( legacy === null ) {
                return settings.sAjaxSource ? data : d;
            }

            // Otherwise, if legacy has been specified then we use that to decide on the
            // form
            return legacy ? data : d;
        }


        /**
         * Data the data from the server (nuking the old) and redraw the table
         *  @param {object} oSettings dataTables settings object
         *  @param {object} json json data return from the server.
         *  @param {string} json.sEcho Tracking flag for DataTables to match requests
         *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
         *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
         *  @param {array} json.aaData The data to display on this page
         *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
         *  @memberof DataTable#oApi
         */
        function _fnAjaxUpdateDraw ( settings, json )
        {
            // v1.10 uses camelCase variables, while 1.9 uses Hungarian notation.
            // Support both
            var compat = function ( old, modern ) {
                return json[old] !== undefined ? json[old] : json[modern];
            };

            var draw            = compat( 'sEcho',                'draw' );
            var recordsTotal    = compat( 'iTotalRecords',        'recordsTotal' );
            var recordsFiltered = compat( 'iTotalDisplayRecords', 'recordsFiltered' );

            if ( draw ) {
                // Protect against out of sequence returns
                if ( draw*1 < settings.iDraw ) {
                    return;
                }
                settings.iDraw = draw * 1;
            }

            _fnClearTable( settings );
            settings._iRecordsTotal   = parseInt(recordsTotal, 10);
            settings._iRecordsDisplay = parseInt(recordsFiltered, 10);

            var data = _fnAjaxDataSrc( settings, json );
            for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                _fnAddData( settings, data[i] );
            }
            settings.aiDisplay = settings.aiDisplayMaster.slice();

            settings.bAjaxDataGet = false;
            _fnDraw( settings );

            if ( ! settings._bInitComplete ) {
                _fnInitComplete( settings, json );
            }

            settings.bAjaxDataGet = true;
            _fnProcessingDisplay( settings, false );
        }


        /**
         * Get the data from the JSON data source to use for drawing a table. Using
         * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
         * source object, or from a processing function.
         *  @param {object} oSettings dataTables settings object
         *  @param  {object} json Data source object / array from the server
         *  @return {array} Array of data to use
         */
        function _fnAjaxDataSrc ( oSettings, json )
        {
            var dataSrc = $.isPlainObject( oSettings.ajax ) && oSettings.ajax.dataSrc !== undefined ?
                oSettings.ajax.dataSrc :
                oSettings.sAjaxDataProp; // Compatibility with 1.9-.

            // Compatibility with 1.9-. In order to read from aaData, check if the
            // default has been changed, if not, check for aaData
            if ( dataSrc === 'data' ) {
                return json.aaData || json[dataSrc];
            }

            return dataSrc !== "" ?
                _fnGetObjectDataFn( dataSrc )( json ) :
                json;
        }


        /**
         * Generate the node required for filtering text
         *  @returns {node} Filter control element
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlFilter ( settings )
        {
            var classes = settings.oClasses;
            var tableId = settings.sTableId;
            var language = settings.oLanguage;
            var previousSearch = settings.oPreviousSearch;
            var features = settings.aanFeatures;
            var input = '<input type="search" class="'+classes.sFilterInput+'"/>';

            var str = language.sSearch;
            str = str.match(/_INPUT_/) ?
                str.replace('_INPUT_', input) :
            str+input;

            var filter = $('<div/>', {
                'id': ! features.f ? tableId+'_filter' : null,
                'class': classes.sFilter
            } )
                .append( $('<label/>' ).append( str ) );

            var searchFn = function() {
                /* Update all other filter input elements for the new display */
                var n = features.f;
                var val = !this.value ? "" : this.value; // mental IE8 fix :-(

                /* Now do the filter */
                if ( val != previousSearch.sSearch ) {
                    _fnFilterComplete( settings, {
                        "sSearch": val,
                        "bRegex": previousSearch.bRegex,
                        "bSmart": previousSearch.bSmart ,
                        "bCaseInsensitive": previousSearch.bCaseInsensitive
                    } );

                    // Need to redraw, without resorting
                    settings._iDisplayStart = 0;
                    _fnDraw( settings );
                }
            };

            var searchDelay = settings.searchDelay !== null ?
                settings.searchDelay :
                _fnDataSource( settings ) === 'ssp' ?
                    400 :
                    0;

            var jqFilter = $('input', filter)
                .val( previousSearch.sSearch )
                .attr( 'placeholder', language.sSearchPlaceholder )
                .bind(
                'keyup.DT search.DT input.DT paste.DT cut.DT',
                searchDelay ?
                    _fnThrottle( searchFn, searchDelay ) :
                    searchFn
            )
                .bind( 'keypress.DT', function(e) {
                    /* Prevent form submission */
                    if ( e.keyCode == 13 ) {
                        return false;
                    }
                } )
                .attr('aria-controls', tableId);

            // Update the input elements whenever the table is filtered
            $(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
                if ( settings === s ) {
                    // IE9 throws an 'unknown error' if document.activeElement is used
                    // inside an iframe or frame...
                    try {
                        if ( jqFilter[0] !== document.activeElement ) {
                            jqFilter.val( previousSearch.sSearch );
                        }
                    }
                    catch ( e ) {}
                }
            } );

            return filter[0];
        }


        /**
         * Filter the table using both the global filter and column based filtering
         *  @param {object} oSettings dataTables settings object
         *  @param {object} oSearch search information
         *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
         *  @memberof DataTable#oApi
         */
        function _fnFilterComplete ( oSettings, oInput, iForce )
        {
            var oPrevSearch = oSettings.oPreviousSearch;
            var aoPrevSearch = oSettings.aoPreSearchCols;
            var fnSaveFilter = function ( oFilter ) {
                /* Save the filtering values */
                oPrevSearch.sSearch = oFilter.sSearch;
                oPrevSearch.bRegex = oFilter.bRegex;
                oPrevSearch.bSmart = oFilter.bSmart;
                oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
            };
            var fnRegex = function ( o ) {
                // Backwards compatibility with the bEscapeRegex option
                return o.bEscapeRegex !== undefined ? !o.bEscapeRegex : o.bRegex;
            };

            // Resolve any column types that are unknown due to addition or invalidation
            // @todo As per sort - can this be moved into an event handler?
            _fnColumnTypes( oSettings );

            /* In server-side processing all filtering is done by the server, so no point hanging around here */
            if ( _fnDataSource( oSettings ) != 'ssp' )
            {
                /* Global filter */
                _fnFilter( oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive );
                fnSaveFilter( oInput );

                /* Now do the individual column filter */
                for ( var i=0 ; i<aoPrevSearch.length ; i++ )
                {
                    _fnFilterColumn( oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]),
                        aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive );
                }

                /* Custom filtering */
                _fnFilterCustom( oSettings );
            }
            else
            {
                fnSaveFilter( oInput );
            }

            /* Tell the draw function we have been filtering */
            oSettings.bFiltered = true;
            _fnCallbackFire( oSettings, null, 'search', [oSettings] );
        }


        /**
         * Apply custom filtering functions
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnFilterCustom( settings )
        {
            var filters = DataTable.ext.search;
            var displayRows = settings.aiDisplay;
            var row, rowIdx;

            for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
                var rows = [];

                // Loop over each row and see if it should be included
                for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
                    rowIdx = displayRows[ j ];
                    row = settings.aoData[ rowIdx ];

                    if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
                        rows.push( rowIdx );
                    }
                }

                // So the array reference doesn't break set the results into the
                // existing array
                displayRows.length = 0;
                displayRows.push.apply( displayRows, rows );
            }
        }


        /**
         * Filter the table on a per-column basis
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sInput string to filter on
         *  @param {int} iColumn column to filter
         *  @param {bool} bRegex treat search string as a regular expression or not
         *  @param {bool} bSmart use smart filtering or not
         *  @param {bool} bCaseInsensitive Do case insenstive matching or not
         *  @memberof DataTable#oApi
         */
        function _fnFilterColumn ( settings, searchStr, colIdx, regex, smart, caseInsensitive )
        {
            if ( searchStr === '' ) {
                return;
            }

            var data;
            var display = settings.aiDisplay;
            var rpSearch = _fnFilterCreateSearch( searchStr, regex, smart, caseInsensitive );

            for ( var i=display.length-1 ; i>=0 ; i-- ) {
                data = settings.aoData[ display[i] ]._aFilterData[ colIdx ];

                if ( ! rpSearch.test( data ) ) {
                    display.splice( i, 1 );
                }
            }
        }


        /**
         * Filter the data table based on user input and draw the table
         *  @param {object} settings dataTables settings object
         *  @param {string} input string to filter on
         *  @param {int} force optional - force a research of the master array (1) or not (undefined or 0)
         *  @param {bool} regex treat as a regular expression or not
         *  @param {bool} smart perform smart filtering or not
         *  @param {bool} caseInsensitive Do case insenstive matching or not
         *  @memberof DataTable#oApi
         */
        function _fnFilter( settings, input, force, regex, smart, caseInsensitive )
        {
            var rpSearch = _fnFilterCreateSearch( input, regex, smart, caseInsensitive );
            var prevSearch = settings.oPreviousSearch.sSearch;
            var displayMaster = settings.aiDisplayMaster;
            var display, invalidated, i;

            // Need to take account of custom filtering functions - always filter
            if ( DataTable.ext.search.length !== 0 ) {
                force = true;
            }

            // Check if any of the rows were invalidated
            invalidated = _fnFilterData( settings );

            // If the input is blank - we just want the full data set
            if ( input.length <= 0 ) {
                settings.aiDisplay = displayMaster.slice();
            }
            else {
                // New search - start from the master array
                if ( invalidated ||
                    force ||
                    prevSearch.length > input.length ||
                    input.indexOf(prevSearch) !== 0 ||
                    settings.bSorted // On resort, the display master needs to be
                                     // re-filtered since indexes will have changed
                ) {
                    settings.aiDisplay = displayMaster.slice();
                }

                // Search the display array
                display = settings.aiDisplay;

                for ( i=display.length-1 ; i>=0 ; i-- ) {
                    if ( ! rpSearch.test( settings.aoData[ display[i] ]._sFilterRow ) ) {
                        display.splice( i, 1 );
                    }
                }
            }
        }


        /**
         * Build a regular expression object suitable for searching a table
         *  @param {string} sSearch string to search for
         *  @param {bool} bRegex treat as a regular expression or not
         *  @param {bool} bSmart perform smart filtering or not
         *  @param {bool} bCaseInsensitive Do case insensitive matching or not
         *  @returns {RegExp} constructed object
         *  @memberof DataTable#oApi
         */
        function _fnFilterCreateSearch( search, regex, smart, caseInsensitive )
        {
            search = regex ?
                search :
                _fnEscapeRegex( search );

            if ( smart ) {
                /* For smart filtering we want to allow the search to work regardless of
                 * word order. We also want double quoted text to be preserved, so word
                 * order is important - a la google. So this is what we want to
                 * generate:
                 *
                 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
                 */
                var a = $.map( search.match( /"[^"]+"|[^ ]+/g ) || '', function ( word ) {
                    if ( word.charAt(0) === '"' ) {
                        var m = word.match( /^"(.*)"$/ );
                        word = m ? m[1] : word;
                    }

                    return word.replace('"', '');
                } );

                search = '^(?=.*?'+a.join( ')(?=.*?' )+').*$';
            }

            return new RegExp( search, caseInsensitive ? 'i' : '' );
        }


        /**
         * Escape a string such that it can be used in a regular expression
         *  @param {string} sVal string to escape
         *  @returns {string} escaped string
         *  @memberof DataTable#oApi
         */
        function _fnEscapeRegex ( sVal )
        {
            return sVal.replace( _re_escape_regex, '\\$1' );
        }



        var __filter_div = $('<div>')[0];
        var __filter_div_textContent = __filter_div.textContent !== undefined;

        // Update the filtering data for each row if needed (by invalidation or first run)
        function _fnFilterData ( settings )
        {
            var columns = settings.aoColumns;
            var column;
            var i, j, ien, jen, filterData, cellData, row;
            var fomatters = DataTable.ext.type.search;
            var wasInvalidated = false;

            for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
                row = settings.aoData[i];

                if ( ! row._aFilterData ) {
                    filterData = [];

                    for ( j=0, jen=columns.length ; j<jen ; j++ ) {
                        column = columns[j];

                        if ( column.bSearchable ) {
                            cellData = _fnGetCellData( settings, i, j, 'filter' );

                            if ( fomatters[ column.sType ] ) {
                                cellData = fomatters[ column.sType ]( cellData );
                            }

                            // Search in DataTables 1.10 is string based. In 1.11 this
                            // should be altered to also allow strict type checking.
                            if ( cellData === null ) {
                                cellData = '';
                            }

                            if ( typeof cellData !== 'string' && cellData.toString ) {
                                cellData = cellData.toString();
                            }
                        }
                        else {
                            cellData = '';
                        }

                        // If it looks like there is an HTML entity in the string,
                        // attempt to decode it so sorting works as expected. Note that
                        // we could use a single line of jQuery to do this, but the DOM
                        // method used here is much faster http://jsperf.com/html-decode
                        if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
                            __filter_div.innerHTML = cellData;
                            cellData = __filter_div_textContent ?
                                __filter_div.textContent :
                                __filter_div.innerText;
                        }

                        if ( cellData.replace ) {
                            cellData = cellData.replace(/[\r\n]/g, '');
                        }

                        filterData.push( cellData );
                    }

                    row._aFilterData = filterData;
                    row._sFilterRow = filterData.join('  ');
                    wasInvalidated = true;
                }
            }

            return wasInvalidated;
        }


        /**
         * Convert from the internal Hungarian notation to camelCase for external
         * interaction
         *  @param {object} obj Object to convert
         *  @returns {object} Inverted object
         *  @memberof DataTable#oApi
         */
        function _fnSearchToCamel ( obj )
        {
            return {
                search:          obj.sSearch,
                smart:           obj.bSmart,
                regex:           obj.bRegex,
                caseInsensitive: obj.bCaseInsensitive
            };
        }



        /**
         * Convert from camelCase notation to the internal Hungarian. We could use the
         * Hungarian convert function here, but this is cleaner
         *  @param {object} obj Object to convert
         *  @returns {object} Inverted object
         *  @memberof DataTable#oApi
         */
        function _fnSearchToHung ( obj )
        {
            return {
                sSearch:          obj.search,
                bSmart:           obj.smart,
                bRegex:           obj.regex,
                bCaseInsensitive: obj.caseInsensitive
            };
        }

        /**
         * Generate the node required for the info display
         *  @param {object} oSettings dataTables settings object
         *  @returns {node} Information element
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlInfo ( settings )
        {
            var
                tid = settings.sTableId,
                nodes = settings.aanFeatures.i,
                n = $('<div/>', {
                    'class': settings.oClasses.sInfo,
                    'id': ! nodes ? tid+'_info' : null
                } );

            if ( ! nodes ) {
                // Update display on each draw
                settings.aoDrawCallback.push( {
                    "fn": _fnUpdateInfo,
                    "sName": "information"
                } );

                n
                    .attr( 'role', 'status' )
                    .attr( 'aria-live', 'polite' );

                // Table is described by our info div
                $(settings.nTable).attr( 'aria-describedby', tid+'_info' );
            }

            return n[0];
        }


        /**
         * Update the information elements in the display
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnUpdateInfo ( settings )
        {
            /* Show information about the table */
            var nodes = settings.aanFeatures.i;
            if ( nodes.length === 0 ) {
                return;
            }

            var
                lang  = settings.oLanguage,
                start = settings._iDisplayStart+1,
                end   = settings.fnDisplayEnd(),
                max   = settings.fnRecordsTotal(),
                total = settings.fnRecordsDisplay(),
                out   = total ?
                    lang.sInfo :
                    lang.sInfoEmpty;

            if ( total !== max ) {
                /* Record set after filtering */
                out += ' ' + lang.sInfoFiltered;
            }

            // Convert the macros
            out += lang.sInfoPostFix;
            out = _fnInfoMacros( settings, out );

            var callback = lang.fnInfoCallback;
            if ( callback !== null ) {
                out = callback.call( settings.oInstance,
                    settings, start, end, max, total, out
                );
            }

            $(nodes).html( out );
        }


        function _fnInfoMacros ( settings, str )
        {
            // When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
            // internally
            var
                formatter  = settings.fnFormatNumber,
                start      = settings._iDisplayStart+1,
                len        = settings._iDisplayLength,
                vis        = settings.fnRecordsDisplay(),
                all        = len === -1;

            return str.
                replace(/_START_/g, formatter.call( settings, start ) ).
                replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
                replace(/_MAX_/g,   formatter.call( settings, settings.fnRecordsTotal() ) ).
                replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
                replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
                replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) );
        }



        /**
         * Draw the table for the first time, adding all required features
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnInitialise ( settings )
        {
            var i, iLen, iAjaxStart=settings.iInitDisplayStart;
            var columns = settings.aoColumns, column;
            var features = settings.oFeatures;

            /* Ensure that the table data is fully initialised */
            if ( ! settings.bInitialised ) {
                setTimeout( function(){ _fnInitialise( settings ); }, 200 );
                return;
            }

            /* Show the display HTML options */
            _fnAddOptionsHtml( settings );

            /* Build and draw the header / footer for the table */
            _fnBuildHead( settings );
            _fnDrawHead( settings, settings.aoHeader );
            _fnDrawHead( settings, settings.aoFooter );

            /* Okay to show that something is going on now */
            _fnProcessingDisplay( settings, true );

            /* Calculate sizes for columns */
            if ( features.bAutoWidth ) {
                _fnCalculateColumnWidths( settings );
            }

            for ( i=0, iLen=columns.length ; i<iLen ; i++ ) {
                column = columns[i];

                if ( column.sWidth ) {
                    column.nTh.style.width = _fnStringToCss( column.sWidth );
                }
            }

            // If there is default sorting required - let's do it. The sort function
            // will do the drawing for us. Otherwise we draw the table regardless of the
            // Ajax source - this allows the table to look initialised for Ajax sourcing
            // data (show 'loading' message possibly)
            _fnReDraw( settings );

            // Server-side processing init complete is done by _fnAjaxUpdateDraw
            var dataSrc = _fnDataSource( settings );
            if ( dataSrc != 'ssp' ) {
                // if there is an ajax source load the data
                if ( dataSrc == 'ajax' ) {
                    _fnBuildAjax( settings, [], function(json) {
                        var aData = _fnAjaxDataSrc( settings, json );

                        // Got the data - add it to the table
                        for ( i=0 ; i<aData.length ; i++ ) {
                            _fnAddData( settings, aData[i] );
                        }

                        // Reset the init display for cookie saving. We've already done
                        // a filter, and therefore cleared it before. So we need to make
                        // it appear 'fresh'
                        settings.iInitDisplayStart = iAjaxStart;

                        _fnReDraw( settings );

                        _fnProcessingDisplay( settings, false );
                        _fnInitComplete( settings, json );
                    }, settings );
                }
                else {
                    _fnProcessingDisplay( settings, false );
                    _fnInitComplete( settings );
                }
            }
        }


        /**
         * Draw the table for the first time, adding all required features
         *  @param {object} oSettings dataTables settings object
         *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
         *    with client-side processing (optional)
         *  @memberof DataTable#oApi
         */
        function _fnInitComplete ( settings, json )
        {
            settings._bInitComplete = true;

            // On an Ajax load we now have data and therefore want to apply the column
            // sizing
            if ( json ) {
                _fnAdjustColumnSizing( settings );
            }

            _fnCallbackFire( settings, 'aoInitComplete', 'init', [settings, json] );
        }


        function _fnLengthChange ( settings, val )
        {
            var len = parseInt( val, 10 );
            settings._iDisplayLength = len;

            _fnLengthOverflow( settings );

            // Fire length change event
            _fnCallbackFire( settings, null, 'length', [settings, len] );
        }


        /**
         * Generate the node required for user display length changing
         *  @param {object} settings dataTables settings object
         *  @returns {node} Display length feature node
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlLength ( settings )
        {
            var
                classes  = settings.oClasses,
                tableId  = settings.sTableId,
                menu     = settings.aLengthMenu,
                d2       = $.isArray( menu[0] ),
                lengths  = d2 ? menu[0] : menu,
                language = d2 ? menu[1] : menu;

            var select = $('<select/>', {
                'name':          tableId+'_length',
                'aria-controls': tableId,
                'class':         classes.sLengthSelect
            } );

            for ( var i=0, ien=lengths.length ; i<ien ; i++ ) {
                select[0][ i ] = new Option( language[i], lengths[i] );
            }

            var div = $('<div><label/></div>').addClass( classes.sLength );
            if ( ! settings.aanFeatures.l ) {
                div[0].id = tableId+'_length';
            }

            div.children().append(
                settings.oLanguage.sLengthMenu.replace( '_MENU_', select[0].outerHTML )
            );

            // Can't use `select` variable as user might provide their own and the
            // reference is broken by the use of outerHTML
            $('select', div)
                .val( settings._iDisplayLength )
                .bind( 'change.DT', function(e) {
                    _fnLengthChange( settings, $(this).val() );
                    _fnDraw( settings );
                } );

            // Update node value whenever anything changes the table's length
            $(settings.nTable).bind( 'length.dt.DT', function (e, s, len) {
                if ( settings === s ) {
                    $('select', div).val( len );
                }
            } );

            return div[0];
        }



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Note that most of the paging logic is done in
         * DataTable.ext.pager
         */

        /**
         * Generate the node required for default pagination
         *  @param {object} oSettings dataTables settings object
         *  @returns {node} Pagination feature node
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlPaginate ( settings )
        {
            var
                type   = settings.sPaginationType,
                plugin = DataTable.ext.pager[ type ],
                modern = typeof plugin === 'function',
                redraw = function( settings ) {
                    _fnDraw( settings );
                },
                node = $('<div/>').addClass( settings.oClasses.sPaging + type )[0],
                features = settings.aanFeatures;

            if ( ! modern ) {
                plugin.fnInit( settings, node, redraw );
            }

            /* Add a draw callback for the pagination on first instance, to update the paging display */
            if ( ! features.p )
            {
                node.id = settings.sTableId+'_paginate';

                settings.aoDrawCallback.push( {
                    "fn": function( settings ) {
                        if ( modern ) {
                            var
                                start      = settings._iDisplayStart,
                                len        = settings._iDisplayLength,
                                visRecords = settings.fnRecordsDisplay(),
                                all        = len === -1,
                                page = all ? 0 : Math.ceil( start / len ),
                                pages = all ? 1 : Math.ceil( visRecords / len ),
                                buttons = plugin(page, pages),
                                i, ien;

                            for ( i=0, ien=features.p.length ; i<ien ; i++ ) {
                                _fnRenderer( settings, 'pageButton' )(
                                    settings, features.p[i], i, buttons, page, pages
                                );
                            }
                        }
                        else {
                            plugin.fnUpdate( settings, redraw );
                        }
                    },
                    "sName": "pagination"
                } );
            }

            return node;
        }


        /**
         * Alter the display settings to change the page
         *  @param {object} settings DataTables settings object
         *  @param {string|int} action Paging action to take: "first", "previous",
         *    "next" or "last" or page number to jump to (integer)
         *  @param [bool] redraw Automatically draw the update or not
         *  @returns {bool} true page has changed, false - no change
         *  @memberof DataTable#oApi
         */
        function _fnPageChange ( settings, action, redraw )
        {
            var
                start     = settings._iDisplayStart,
                len       = settings._iDisplayLength,
                records   = settings.fnRecordsDisplay();

            if ( records === 0 || len === -1 )
            {
                start = 0;
            }
            else if ( typeof action === "number" )
            {
                start = action * len;

                if ( start > records )
                {
                    start = 0;
                }
            }
            else if ( action == "first" )
            {
                start = 0;
            }
            else if ( action == "previous" )
            {
                start = len >= 0 ?
                start - len :
                    0;

                if ( start < 0 )
                {
                    start = 0;
                }
            }
            else if ( action == "next" )
            {
                if ( start + len < records )
                {
                    start += len;
                }
            }
            else if ( action == "last" )
            {
                start = Math.floor( (records-1) / len) * len;
            }
            else
            {
                _fnLog( settings, 0, "Unknown paging action: "+action, 5 );
            }

            var changed = settings._iDisplayStart !== start;
            settings._iDisplayStart = start;

            if ( changed ) {
                _fnCallbackFire( settings, null, 'page', [settings] );

                if ( redraw ) {
                    _fnDraw( settings );
                }
            }

            return changed;
        }



        /**
         * Generate the node required for the processing node
         *  @param {object} settings dataTables settings object
         *  @returns {node} Processing element
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlProcessing ( settings )
        {
            return $('<div/>', {
                'id': ! settings.aanFeatures.r ? settings.sTableId+'_processing' : null,
                'class': settings.oClasses.sProcessing
            } )
                .html( settings.oLanguage.sProcessing )
                .insertBefore( settings.nTable )[0];
        }


        /**
         * Display or hide the processing indicator
         *  @param {object} settings dataTables settings object
         *  @param {bool} show Show the processing indicator (true) or not (false)
         *  @memberof DataTable#oApi
         */
        function _fnProcessingDisplay ( settings, show )
        {
            if ( settings.oFeatures.bProcessing ) {
                $(settings.aanFeatures.r).css( 'display', show ? 'block' : 'none' );
            }

            _fnCallbackFire( settings, null, 'processing', [settings, show] );
        }

        /**
         * Add any control elements for the table - specifically scrolling
         *  @param {object} settings dataTables settings object
         *  @returns {node} Node to add to the DOM
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlTable ( settings )
        {
            var table = $(settings.nTable);

            // Add the ARIA grid role to the table
            table.attr( 'role', 'grid' );

            // Scrolling from here on in
            var scroll = settings.oScroll;

            if ( scroll.sX === '' && scroll.sY === '' ) {
                return settings.nTable;
            }

            var scrollX = scroll.sX;
            var scrollY = scroll.sY;
            var classes = settings.oClasses;
            var caption = table.children('caption');
            var captionSide = caption.length ? caption[0]._captionSide : null;
            var headerClone = $( table[0].cloneNode(false) );
            var footerClone = $( table[0].cloneNode(false) );
            var footer = table.children('tfoot');
            var _div = '<div/>';
            var size = function ( s ) {
                return !s ? null : _fnStringToCss( s );
            };

            // This is fairly messy, but with x scrolling enabled, if the table has a
            // width attribute, regardless of any width applied using the column width
            // options, the browser will shrink or grow the table as needed to fit into
            // that 100%. That would make the width options useless. So we remove it.
            // This is okay, under the assumption that width:100% is applied to the
            // table in CSS (it is in the default stylesheet) which will set the table
            // width as appropriate (the attribute and css behave differently...)
            if ( scroll.sX && table.attr('width') === '100%' ) {
                table.removeAttr('width');
            }

            if ( ! footer.length ) {
                footer = null;
            }

            /*
             * The HTML structure that we want to generate in this function is:
             *  div - scroller
             *    div - scroll head
             *      div - scroll head inner
             *        table - scroll head table
             *          thead - thead
             *    div - scroll body
             *      table - table (master table)
             *        thead - thead clone for sizing
             *        tbody - tbody
             *    div - scroll foot
             *      div - scroll foot inner
             *        table - scroll foot table
             *          tfoot - tfoot
             */
            var scroller = $( _div, { 'class': classes.sScrollWrapper } )
                .append(
                $(_div, { 'class': classes.sScrollHead } )
                    .css( {
                        overflow: 'hidden',
                        position: 'relative',
                        border: 0,
                        width: scrollX ? size(scrollX) : '100%'
                    } )
                    .append(
                    $(_div, { 'class': classes.sScrollHeadInner } )
                        .css( {
                            'box-sizing': 'content-box',
                            width: scroll.sXInner || '100%'
                        } )
                        .append(
                        headerClone
                            .removeAttr('id')
                            .css( 'margin-left', 0 )
                            .append( captionSide === 'top' ? caption : null )
                            .append(
                            table.children('thead')
                        )
                    )
                )
            )
                .append(
                $(_div, { 'class': classes.sScrollBody } )
                    .css( {
                        overflow: 'auto',
                        height: size( scrollY ),
                        width: size( scrollX )
                    } )
                    .append( table )
            );

            if ( footer ) {
                scroller.append(
                    $(_div, { 'class': classes.sScrollFoot } )
                        .css( {
                            overflow: 'hidden',
                            border: 0,
                            width: scrollX ? size(scrollX) : '100%'
                        } )
                        .append(
                        $(_div, { 'class': classes.sScrollFootInner } )
                            .append(
                            footerClone
                                .removeAttr('id')
                                .css( 'margin-left', 0 )
                                .append( captionSide === 'bottom' ? caption : null )
                                .append(
                                table.children('tfoot')
                            )
                        )
                    )
                );
            }

            var children = scroller.children();
            var scrollHead = children[0];
            var scrollBody = children[1];
            var scrollFoot = footer ? children[2] : null;

            // When the body is scrolled, then we also want to scroll the headers
            if ( scrollX ) {
                $(scrollBody).scroll( function (e) {
                    var scrollLeft = this.scrollLeft;

                    scrollHead.scrollLeft = scrollLeft;

                    if ( footer ) {
                        scrollFoot.scrollLeft = scrollLeft;
                    }
                } );
            }

            settings.nScrollHead = scrollHead;
            settings.nScrollBody = scrollBody;
            settings.nScrollFoot = scrollFoot;

            // On redraw - align columns
            settings.aoDrawCallback.push( {
                "fn": _fnScrollDraw,
                "sName": "scrolling"
            } );

            return scroller[0];
        }



        /**
         * Update the header, footer and body tables for resizing - i.e. column
         * alignment.
         *
         * Welcome to the most horrible function DataTables. The process that this
         * function follows is basically:
         *   1. Re-create the table inside the scrolling div
         *   2. Take live measurements from the DOM
         *   3. Apply the measurements to align the columns
         *   4. Clean up
         *
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnScrollDraw ( settings )
        {
            // Given that this is such a monster function, a lot of variables are use
            // to try and keep the minimised size as small as possible
            var
                scroll         = settings.oScroll,
                scrollX        = scroll.sX,
                scrollXInner   = scroll.sXInner,
                scrollY        = scroll.sY,
                barWidth       = scroll.iBarWidth,
                divHeader      = $(settings.nScrollHead),
                divHeaderStyle = divHeader[0].style,
                divHeaderInner = divHeader.children('div'),
                divHeaderInnerStyle = divHeaderInner[0].style,
                divHeaderTable = divHeaderInner.children('table'),
                divBodyEl      = settings.nScrollBody,
                divBody        = $(divBodyEl),
                divBodyStyle   = divBodyEl.style,
                divFooter      = $(settings.nScrollFoot),
                divFooterInner = divFooter.children('div'),
                divFooterTable = divFooterInner.children('table'),
                header         = $(settings.nTHead),
                table          = $(settings.nTable),
                tableEl        = table[0],
                tableStyle     = tableEl.style,
                footer         = settings.nTFoot ? $(settings.nTFoot) : null,
                browser        = settings.oBrowser,
                ie67           = browser.bScrollOversize,
                headerTrgEls, footerTrgEls,
                headerSrcEls, footerSrcEls,
                headerCopy, footerCopy,
                headerWidths=[], footerWidths=[],
                headerContent=[],
                idx, correction, sanityWidth,
                zeroOut = function(nSizer) {
                    var style = nSizer.style;
                    style.paddingTop = "0";
                    style.paddingBottom = "0";
                    style.borderTopWidth = "0";
                    style.borderBottomWidth = "0";
                    style.height = 0;
                };

            /*
             * 1. Re-create the table inside the scrolling div
             */

            // Remove the old minimised thead and tfoot elements in the inner table
            table.children('thead, tfoot').remove();

            // Clone the current header and footer elements and then place it into the inner table
            headerCopy = header.clone().prependTo( table );
            headerTrgEls = header.find('tr'); // original header is in its own table
            headerSrcEls = headerCopy.find('tr');
            headerCopy.find('th, td').removeAttr('tabindex');

            if ( footer ) {
                footerCopy = footer.clone().prependTo( table );
                footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
                footerSrcEls = footerCopy.find('tr');
            }


            /*
             * 2. Take live measurements from the DOM - do not alter the DOM itself!
             */

            // Remove old sizing and apply the calculated column widths
            // Get the unique column headers in the newly created (cloned) header. We want to apply the
            // calculated sizes to this header
            if ( ! scrollX )
            {
                divBodyStyle.width = '100%';
                divHeader[0].style.width = '100%';
            }

            $.each( _fnGetUniqueThs( settings, headerCopy ), function ( i, el ) {
                idx = _fnVisibleToColumnIndex( settings, i );
                el.style.width = settings.aoColumns[idx].sWidth;
            } );

            if ( footer ) {
                _fnApplyToChildren( function(n) {
                    n.style.width = "";
                }, footerSrcEls );
            }

            // If scroll collapse is enabled, when we put the headers back into the body for sizing, we
            // will end up forcing the scrollbar to appear, making our measurements wrong for when we
            // then hide it (end of this function), so add the header height to the body scroller.
            if ( scroll.bCollapse && scrollY !== "" ) {
                divBodyStyle.height = (divBody[0].offsetHeight + header[0].offsetHeight)+"px";
            }

            // Size the table as a whole
            sanityWidth = table.outerWidth();
            if ( scrollX === "" ) {
                // No x scrolling
                tableStyle.width = "100%";

                // IE7 will make the width of the table when 100% include the scrollbar
                // - which is shouldn't. When there is a scrollbar we need to take this
                // into account.
                if ( ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
                    divBody.css('overflow-y') == "scroll")
                ) {
                    tableStyle.width = _fnStringToCss( table.outerWidth() - barWidth);
                }
            }
            else
            {
                // x scrolling
                if ( scrollXInner !== "" ) {
                    // x scroll inner has been given - use it
                    tableStyle.width = _fnStringToCss(scrollXInner);
                }
                else if ( sanityWidth == divBody.width() && divBody.height() < table.height() ) {
                    // There is y-scrolling - try to take account of the y scroll bar
                    tableStyle.width = _fnStringToCss( sanityWidth-barWidth );
                    if ( table.outerWidth() > sanityWidth-barWidth ) {
                        // Not possible to take account of it
                        tableStyle.width = _fnStringToCss( sanityWidth );
                    }
                }
                else {
                    // When all else fails
                    tableStyle.width = _fnStringToCss( sanityWidth );
                }
            }

            // Recalculate the sanity width - now that we've applied the required width,
            // before it was a temporary variable. This is required because the column
            // width calculation is done before this table DOM is created.
            sanityWidth = table.outerWidth();

            // Hidden header should have zero height, so remove padding and borders. Then
            // set the width based on the real headers

            // Apply all styles in one pass
            _fnApplyToChildren( zeroOut, headerSrcEls );

            // Read all widths in next pass
            _fnApplyToChildren( function(nSizer) {
                headerContent.push( nSizer.innerHTML );
                headerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
            }, headerSrcEls );

            // Apply all widths in final pass
            _fnApplyToChildren( function(nToSize, i) {
                nToSize.style.width = headerWidths[i];
            }, headerTrgEls );

            $(headerSrcEls).height(0);

            /* Same again with the footer if we have one */
            if ( footer )
            {
                _fnApplyToChildren( zeroOut, footerSrcEls );

                _fnApplyToChildren( function(nSizer) {
                    footerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
                }, footerSrcEls );

                _fnApplyToChildren( function(nToSize, i) {
                    nToSize.style.width = footerWidths[i];
                }, footerTrgEls );

                $(footerSrcEls).height(0);
            }


            /*
             * 3. Apply the measurements
             */

            // "Hide" the header and footer that we used for the sizing. We need to keep
            // the content of the cell so that the width applied to the header and body
            // both match, but we want to hide it completely. We want to also fix their
            // width to what they currently are
            _fnApplyToChildren( function(nSizer, i) {
                nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">'+headerContent[i]+'</div>';
                nSizer.style.width = headerWidths[i];
            }, headerSrcEls );

            if ( footer )
            {
                _fnApplyToChildren( function(nSizer, i) {
                    nSizer.innerHTML = "";
                    nSizer.style.width = footerWidths[i];
                }, footerSrcEls );
            }

            // Sanity check that the table is of a sensible width. If not then we are going to get
            // misalignment - try to prevent this by not allowing the table to shrink below its min width
            if ( table.outerWidth() < sanityWidth )
            {
                // The min width depends upon if we have a vertical scrollbar visible or not */
                correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
                divBody.css('overflow-y') == "scroll")) ?
                sanityWidth+barWidth :
                    sanityWidth;

                // IE6/7 are a law unto themselves...
                if ( ie67 && (divBodyEl.scrollHeight >
                    divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
                ) {
                    tableStyle.width = _fnStringToCss( correction-barWidth );
                }

                // And give the user a warning that we've stopped the table getting too small
                if ( scrollX === "" || scrollXInner !== "" ) {
                    _fnLog( settings, 1, 'Possible column misalignment', 6 );
                }
            }
            else
            {
                correction = '100%';
            }

            // Apply to the container elements
            divBodyStyle.width = _fnStringToCss( correction );
            divHeaderStyle.width = _fnStringToCss( correction );

            if ( footer ) {
                settings.nScrollFoot.style.width = _fnStringToCss( correction );
            }


            /*
             * 4. Clean up
             */
            if ( ! scrollY ) {
                /* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
                 * the scrollbar height from the visible display, rather than adding it on. We need to
                 * set the height in order to sort this. Don't want to do it in any other browsers.
                 */
                if ( ie67 ) {
                    divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+barWidth );
                }
            }

            if ( scrollY && scroll.bCollapse ) {
                divBodyStyle.height = _fnStringToCss( scrollY );

                var iExtra = (scrollX && tableEl.offsetWidth > divBodyEl.offsetWidth) ?
                    barWidth :
                    0;

                if ( tableEl.offsetHeight < divBodyEl.offsetHeight ) {
                    divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+iExtra );
                }
            }

            /* Finally set the width's of the header and footer tables */
            var iOuterWidth = table.outerWidth();
            divHeaderTable[0].style.width = _fnStringToCss( iOuterWidth );
            divHeaderInnerStyle.width = _fnStringToCss( iOuterWidth );

            // Figure out if there are scrollbar present - if so then we need a the header and footer to
            // provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
            var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
            var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
            divHeaderInnerStyle[ padding ] = bScrolling ? barWidth+"px" : "0px";

            if ( footer ) {
                divFooterTable[0].style.width = _fnStringToCss( iOuterWidth );
                divFooterInner[0].style.width = _fnStringToCss( iOuterWidth );
                divFooterInner[0].style[padding] = bScrolling ? barWidth+"px" : "0px";
            }

            /* Adjust the position of the header in case we loose the y-scrollbar */
            divBody.scroll();

            // If sorting or filtering has occurred, jump the scrolling back to the top
            // only if we aren't holding the position
            if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
                divBodyEl.scrollTop = 0;
            }
        }



        /**
         * Apply a given function to the display child nodes of an element array (typically
         * TD children of TR rows
         *  @param {function} fn Method to apply to the objects
         *  @param array {nodes} an1 List of elements to look through for display children
         *  @param array {nodes} an2 Another list (identical structure to the first) - optional
         *  @memberof DataTable#oApi
         */
        function _fnApplyToChildren( fn, an1, an2 )
        {
            var index=0, i=0, iLen=an1.length;
            var nNode1, nNode2;

            while ( i < iLen ) {
                nNode1 = an1[i].firstChild;
                nNode2 = an2 ? an2[i].firstChild : null;

                while ( nNode1 ) {
                    if ( nNode1.nodeType === 1 ) {
                        if ( an2 ) {
                            fn( nNode1, nNode2, index );
                        }
                        else {
                            fn( nNode1, index );
                        }

                        index++;
                    }

                    nNode1 = nNode1.nextSibling;
                    nNode2 = an2 ? nNode2.nextSibling : null;
                }

                i++;
            }
        }



        var __re_html_remove = /<.*?>/g;


        /**
         * Calculate the width of columns for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnCalculateColumnWidths ( oSettings )
        {
            var
                table = oSettings.nTable,
                columns = oSettings.aoColumns,
                scroll = oSettings.oScroll,
                scrollY = scroll.sY,
                scrollX = scroll.sX,
                scrollXInner = scroll.sXInner,
                columnCount = columns.length,
                visibleColumns = _fnGetColumns( oSettings, 'bVisible' ),
                headerCells = $('th', oSettings.nTHead),
                tableWidthAttr = table.getAttribute('width'),
                tableContainer = table.parentNode,
                userInputs = false,
                i, column, columnIdx, width, outerWidth;

            /* Convert any user input sizes into pixel sizes */
            for ( i=0 ; i<visibleColumns.length ; i++ ) {
                column = columns[ visibleColumns[i] ];

                if ( column.sWidth !== null ) {
                    column.sWidth = _fnConvertToWidth( column.sWidthOrig, tableContainer );

                    userInputs = true;
                }
            }

            /* If the number of columns in the DOM equals the number that we have to
             * process in DataTables, then we can use the offsets that are created by
             * the web- browser. No custom sizes can be set in order for this to happen,
             * nor scrolling used
             */
            if ( ! userInputs && ! scrollX && ! scrollY &&
                columnCount == _fnVisbleColumns( oSettings ) &&
                columnCount == headerCells.length
            ) {
                for ( i=0 ; i<columnCount ; i++ ) {
                    columns[i].sWidth = _fnStringToCss( headerCells.eq(i).width() );
                }
            }
            else
            {
                // Otherwise construct a single row table with the widest node in the
                // data, assign any user defined widths, then insert it into the DOM and
                // allow the browser to do all the hard work of calculating table widths
                var tmpTable = $(table).clone() // don't use cloneNode - IE8 will remove events on the main table
                    .empty()
                    .css( 'visibility', 'hidden' )
                    .removeAttr( 'id' )
                    .append( $(oSettings.nTHead).clone( false ) )
                    .append( $(oSettings.nTFoot).clone( false ) )
                    .append( $('<tbody><tr/></tbody>') );

                // Remove any assigned widths from the footer (from scrolling)
                tmpTable.find('tfoot th, tfoot td').css('width', '');

                var tr = tmpTable.find( 'tbody tr' );

                // Apply custom sizing to the cloned header
                headerCells = _fnGetUniqueThs( oSettings, tmpTable.find('thead')[0] );

                for ( i=0 ; i<visibleColumns.length ; i++ ) {
                    column = columns[ visibleColumns[i] ];

                    headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
                        _fnStringToCss( column.sWidthOrig ) :
                        '';
                }

                // Find the widest cell for each column and put it into the table
                if ( oSettings.aoData.length ) {
                    for ( i=0 ; i<visibleColumns.length ; i++ ) {
                        columnIdx = visibleColumns[i];
                        column = columns[ columnIdx ];

                        $( _fnGetWidestNode( oSettings, columnIdx ) )
                            .clone( false )
                            .append( column.sContentPadding )
                            .appendTo( tr );
                    }
                }

                // Table has been built, attach to the document so we can work with it
                tmpTable.appendTo( tableContainer );

                // When scrolling (X or Y) we want to set the width of the table as
                // appropriate. However, when not scrolling leave the table width as it
                // is. This results in slightly different, but I think correct behaviour
                if ( scrollX && scrollXInner ) {
                    tmpTable.width( scrollXInner );
                }
                else if ( scrollX ) {
                    tmpTable.css( 'width', 'auto' );

                    if ( tmpTable.width() < tableContainer.offsetWidth ) {
                        tmpTable.width( tableContainer.offsetWidth );
                    }
                }
                else if ( scrollY ) {
                    tmpTable.width( tableContainer.offsetWidth );
                }
                else if ( tableWidthAttr ) {
                    tmpTable.width( tableWidthAttr );
                }

                // Take into account the y scrollbar
                _fnScrollingWidthAdjust( oSettings, tmpTable[0] );

                // Browsers need a bit of a hand when a width is assigned to any columns
                // when x-scrolling as they tend to collapse the table to the min-width,
                // even if we sent the column widths. So we need to keep track of what
                // the table width should be by summing the user given values, and the
                // automatic values
                if ( scrollX )
                {
                    var total = 0;

                    for ( i=0 ; i<visibleColumns.length ; i++ ) {
                        column = columns[ visibleColumns[i] ];
                        outerWidth = $(headerCells[i]).outerWidth();

                        total += column.sWidthOrig === null ?
                            outerWidth :
                        parseInt( column.sWidth, 10 ) + outerWidth - $(headerCells[i]).width();
                    }

                    tmpTable.width( _fnStringToCss( total ) );
                    table.style.width = _fnStringToCss( total );
                }

                // Get the width of each column in the constructed table
                for ( i=0 ; i<visibleColumns.length ; i++ ) {
                    column = columns[ visibleColumns[i] ];
                    width = $(headerCells[i]).width();

                    if ( width ) {
                        column.sWidth = _fnStringToCss( width );
                    }
                }

                table.style.width = _fnStringToCss( tmpTable.css('width') );

                // Finished with the table - ditch it
                tmpTable.remove();
            }

            // If there is a width attr, we want to attach an event listener which
            // allows the table sizing to automatically adjust when the window is
            // resized. Use the width attr rather than CSS, since we can't know if the
            // CSS is a relative value or absolute - DOM read is always px.
            if ( tableWidthAttr ) {
                table.style.width = _fnStringToCss( tableWidthAttr );
            }

            if ( (tableWidthAttr || scrollX) && ! oSettings._reszEvt ) {
                $(window).bind('resize.DT-'+oSettings.sInstance, _fnThrottle( function () {
                    _fnAdjustColumnSizing( oSettings );
                } ) );

                oSettings._reszEvt = true;
            }
        }


        /**
         * Throttle the calls to a function. Arguments and context are maintained for
         * the throttled function
         *  @param {function} fn Function to be called
         *  @param {int} [freq=200] call frequency in mS
         *  @returns {function} wrapped function
         *  @memberof DataTable#oApi
         */
        function _fnThrottle( fn, freq ) {
            var
                frequency = freq !== undefined ? freq : 200,
                last,
                timer;

            return function () {
                var
                    that = this,
                    now  = +new Date(),
                    args = arguments;

                if ( last && now < last + frequency ) {
                    clearTimeout( timer );

                    timer = setTimeout( function () {
                        last = undefined;
                        fn.apply( that, args );
                    }, frequency );
                }
                else if ( last ) {
                    last = now;
                    fn.apply( that, args );
                }
                else {
                    last = now;
                }
            };
        }


        /**
         * Convert a CSS unit width to pixels (e.g. 2em)
         *  @param {string} width width to be converted
         *  @param {node} parent parent to get the with for (required for relative widths) - optional
         *  @returns {int} width in pixels
         *  @memberof DataTable#oApi
         */
        function _fnConvertToWidth ( width, parent )
        {
            if ( ! width ) {
                return 0;
            }

            var n = $('<div/>')
                .css( 'width', _fnStringToCss( width ) )
                .appendTo( parent || document.body );

            var val = n[0].offsetWidth;
            n.remove();

            return val;
        }


        /**
         * Adjust a table's width to take account of vertical scroll bar
         *  @param {object} oSettings dataTables settings object
         *  @param {node} n table node
         *  @memberof DataTable#oApi
         */

        function _fnScrollingWidthAdjust ( settings, n )
        {
            var scroll = settings.oScroll;

            if ( scroll.sX || scroll.sY ) {
                // When y-scrolling only, we want to remove the width of the scroll bar
                // so the table + scroll bar will fit into the area available, otherwise
                // we fix the table at its current size with no adjustment
                var correction = ! scroll.sX ? scroll.iBarWidth : 0;
                n.style.width = _fnStringToCss( $(n).outerWidth() - correction );
            }
        }


        /**
         * Get the widest node
         *  @param {object} settings dataTables settings object
         *  @param {int} colIdx column of interest
         *  @returns {node} widest table node
         *  @memberof DataTable#oApi
         */
        function _fnGetWidestNode( settings, colIdx )
        {
            var idx = _fnGetMaxLenString( settings, colIdx );
            if ( idx < 0 ) {
                return null;
            }

            var data = settings.aoData[ idx ];
            return ! data.nTr ? // Might not have been created when deferred rendering
                $('<td/>').html( _fnGetCellData( settings, idx, colIdx, 'display' ) )[0] :
                data.anCells[ colIdx ];
        }


        /**
         * Get the maximum strlen for each data column
         *  @param {object} settings dataTables settings object
         *  @param {int} colIdx column of interest
         *  @returns {string} max string length for each column
         *  @memberof DataTable#oApi
         */
        function _fnGetMaxLenString( settings, colIdx )
        {
            var s, max=-1, maxIdx = -1;

            for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
                s = _fnGetCellData( settings, i, colIdx, 'display' )+'';
                s = s.replace( __re_html_remove, '' );

                if ( s.length > max ) {
                    max = s.length;
                    maxIdx = i;
                }
            }

            return maxIdx;
        }


        /**
         * Append a CSS unit (only if required) to a string
         *  @param {string} value to css-ify
         *  @returns {string} value with css unit
         *  @memberof DataTable#oApi
         */
        function _fnStringToCss( s )
        {
            if ( s === null ) {
                return '0px';
            }

            if ( typeof s == 'number' ) {
                return s < 0 ?
                    '0px' :
                s+'px';
            }

            // Check it has a unit character already
            return s.match(/\d$/) ?
            s+'px' :
                s;
        }


        /**
         * Get the width of a scroll bar in this browser being used
         *  @returns {int} width in pixels
         *  @memberof DataTable#oApi
         */
        function _fnScrollBarWidth ()
        {
            // On first run a static variable is set, since this is only needed once.
            // Subsequent runs will just use the previously calculated value
            if ( ! DataTable.__scrollbarWidth ) {
                var inner = $('<p/>').css( {
                    width: '100%',
                    height: 200,
                    padding: 0
                } )[0];

                var outer = $('<div/>')
                    .css( {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 150,
                        padding: 0,
                        overflow: 'hidden',
                        visibility: 'hidden'
                    } )
                    .append( inner )
                    .appendTo( 'body' );

                var w1 = inner.offsetWidth;
                outer.css( 'overflow', 'scroll' );
                var w2 = inner.offsetWidth;

                if ( w1 === w2 ) {
                    w2 = outer[0].clientWidth;
                }

                outer.remove();

                DataTable.__scrollbarWidth = w1 - w2;
            }

            return DataTable.__scrollbarWidth;
        }



        function _fnSortFlatten ( settings )
        {
            var
                i, iLen, k, kLen,
                aSort = [],
                aiOrig = [],
                aoColumns = settings.aoColumns,
                aDataSort, iCol, sType, srcCol,
                fixed = settings.aaSortingFixed,
                fixedObj = $.isPlainObject( fixed ),
                nestedSort = [],
                add = function ( a ) {
                    if ( a.length && ! $.isArray( a[0] ) ) {
                        // 1D array
                        nestedSort.push( a );
                    }
                    else {
                        // 2D array
                        nestedSort.push.apply( nestedSort, a );
                    }
                };

            // Build the sort array, with pre-fix and post-fix options if they have been
            // specified
            if ( $.isArray( fixed ) ) {
                add( fixed );
            }

            if ( fixedObj && fixed.pre ) {
                add( fixed.pre );
            }

            add( settings.aaSorting );

            if (fixedObj && fixed.post ) {
                add( fixed.post );
            }

            for ( i=0 ; i<nestedSort.length ; i++ )
            {
                srcCol = nestedSort[i][0];
                aDataSort = aoColumns[ srcCol ].aDataSort;

                for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
                {
                    iCol = aDataSort[k];
                    sType = aoColumns[ iCol ].sType || 'string';

                    if ( nestedSort[i]._idx === undefined ) {
                        nestedSort[i]._idx = $.inArray( nestedSort[i][1], aoColumns[iCol].asSorting );
                    }

                    aSort.push( {
                        src:       srcCol,
                        col:       iCol,
                        dir:       nestedSort[i][1],
                        index:     nestedSort[i]._idx,
                        type:      sType,
                        formatter: DataTable.ext.type.order[ sType+"-pre" ]
                    } );
                }
            }

            return aSort;
        }

        /**
         * Change the order of the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         *  @todo This really needs split up!
         */
        function _fnSort ( oSettings )
        {
            var
                i, ien, iLen, j, jLen, k, kLen,
                sDataType, nTh,
                aiOrig = [],
                oExtSort = DataTable.ext.type.order,
                aoData = oSettings.aoData,
                aoColumns = oSettings.aoColumns,
                aDataSort, data, iCol, sType, oSort,
                formatters = 0,
                sortCol,
                displayMaster = oSettings.aiDisplayMaster,
                aSort;

            // Resolve any column types that are unknown due to addition or invalidation
            // @todo Can this be moved into a 'data-ready' handler which is called when
            //   data is going to be used in the table?
            _fnColumnTypes( oSettings );

            aSort = _fnSortFlatten( oSettings );

            for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
                sortCol = aSort[i];

                // Track if we can use the fast sort algorithm
                if ( sortCol.formatter ) {
                    formatters++;
                }

                // Load the data needed for the sort, for each cell
                _fnSortData( oSettings, sortCol.col );
            }

            /* No sorting required if server-side or no sorting array */
            if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
            {
                // Create a value - key array of the current row positions such that we can use their
                // current position during the sort, if values match, in order to perform stable sorting
                for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
                    aiOrig[ displayMaster[i] ] = i;
                }

                /* Do the sort - here we want multi-column sorting based on a given data source (column)
                 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
                 * follow on it's own, but this is what we want (example two column sorting):
                 *  fnLocalSorting = function(a,b){
                 *    var iTest;
                 *    iTest = oSort['string-asc']('data11', 'data12');
                 *      if (iTest !== 0)
                 *        return iTest;
                 *    iTest = oSort['numeric-desc']('data21', 'data22');
                 *    if (iTest !== 0)
                 *      return iTest;
                 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
                 *  }
                 * Basically we have a test for each sorting column, if the data in that column is equal,
                 * test the next column. If all columns match, then we use a numeric sort on the row
                 * positions in the original data array to provide a stable sort.
                 *
                 * Note - I know it seems excessive to have two sorting methods, but the first is around
                 * 15% faster, so the second is only maintained for backwards compatibility with sorting
                 * methods which do not have a pre-sort formatting function.
                 */
                if ( formatters === aSort.length ) {
                    // All sort types have formatting functions
                    displayMaster.sort( function ( a, b ) {
                        var
                            x, y, k, test, sort,
                            len=aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;

                        for ( k=0 ; k<len ; k++ ) {
                            sort = aSort[k];

                            x = dataA[ sort.col ];
                            y = dataB[ sort.col ];

                            test = x<y ? -1 : x>y ? 1 : 0;
                            if ( test !== 0 ) {
                                return sort.dir === 'asc' ? test : -test;
                            }
                        }

                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x<y ? -1 : x>y ? 1 : 0;
                    } );
                }
                else {
                    // Depreciated - remove in 1.11 (providing a plug-in option)
                    // Not all sort types have formatting methods, so we have to call their sorting
                    // methods.
                    displayMaster.sort( function ( a, b ) {
                        var
                            x, y, k, l, test, sort, fn,
                            len=aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;

                        for ( k=0 ; k<len ; k++ ) {
                            sort = aSort[k];

                            x = dataA[ sort.col ];
                            y = dataB[ sort.col ];

                            fn = oExtSort[ sort.type+"-"+sort.dir ] || oExtSort[ "string-"+sort.dir ];
                            test = fn( x, y );
                            if ( test !== 0 ) {
                                return test;
                            }
                        }

                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x<y ? -1 : x>y ? 1 : 0;
                    } );
                }
            }

            /* Tell the draw function that we have sorted the data */
            oSettings.bSorted = true;
        }


        function _fnSortAria ( settings )
        {
            var label;
            var nextSort;
            var columns = settings.aoColumns;
            var aSort = _fnSortFlatten( settings );
            var oAria = settings.oLanguage.oAria;

            // ARIA attributes - need to loop all columns, to update all (removing old
            // attributes as needed)
            for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
            {
                var col = columns[i];
                var asSorting = col.asSorting;
                var sTitle = col.sTitle.replace( /<.*?>/g, "" );
                var th = col.nTh;

                // IE7 is throwing an error when setting these properties with jQuery's
                // attr() and removeAttr() methods...
                th.removeAttribute('aria-sort');

                /* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
                if ( col.bSortable ) {
                    if ( aSort.length > 0 && aSort[0].col == i ) {
                        th.setAttribute('aria-sort', aSort[0].dir=="asc" ? "ascending" : "descending" );
                        nextSort = asSorting[ aSort[0].index+1 ] || asSorting[0];
                    }
                    else {
                        nextSort = asSorting[0];
                    }

                    label = sTitle + ( nextSort === "asc" ?
                        oAria.sSortAscending :
                        oAria.sSortDescending
                    );
                }
                else {
                    label = sTitle;
                }

                th.setAttribute('aria-label', label);
            }
        }


        /**
         * Function to run on user sort request
         *  @param {object} settings dataTables settings object
         *  @param {node} attachTo node to attach the handler to
         *  @param {int} colIdx column sorting index
         *  @param {boolean} [append=false] Append the requested sort to the existing
         *    sort if true (i.e. multi-column sort)
         *  @param {function} [callback] callback function
         *  @memberof DataTable#oApi
         */
        function _fnSortListener ( settings, colIdx, append, callback )
        {
            var col = settings.aoColumns[ colIdx ];
            var sorting = settings.aaSorting;
            var asSorting = col.asSorting;
            var nextSortIdx;
            var next = function ( a, overflow ) {
                var idx = a._idx;
                if ( idx === undefined ) {
                    idx = $.inArray( a[1], asSorting );
                }

                return idx+1 < asSorting.length ?
                idx+1 :
                    overflow ?
                        null :
                        0;
            };

            // Convert to 2D array if needed
            if ( typeof sorting[0] === 'number' ) {
                sorting = settings.aaSorting = [ sorting ];
            }

            // If appending the sort then we are multi-column sorting
            if ( append && settings.oFeatures.bSortMulti ) {
                // Are we already doing some kind of sort on this column?
                var sortIdx = $.inArray( colIdx, _pluck(sorting, '0') );

                if ( sortIdx !== -1 ) {
                    // Yes, modify the sort
                    nextSortIdx = next( sorting[sortIdx], true );

                    if ( nextSortIdx === null ) {
                        sorting.splice( sortIdx, 1 );
                    }
                    else {
                        sorting[sortIdx][1] = asSorting[ nextSortIdx ];
                        sorting[sortIdx]._idx = nextSortIdx;
                    }
                }
                else {
                    // No sort on this column yet
                    sorting.push( [ colIdx, asSorting[0], 0 ] );
                    sorting[sorting.length-1]._idx = 0;
                }
            }
            else if ( sorting.length && sorting[0][0] == colIdx ) {
                // Single column - already sorting on this column, modify the sort
                nextSortIdx = next( sorting[0] );

                sorting.length = 1;
                sorting[0][1] = asSorting[ nextSortIdx ];
                sorting[0]._idx = nextSortIdx;
            }
            else {
                // Single column - sort only on this column
                sorting.length = 0;
                sorting.push( [ colIdx, asSorting[0] ] );
                sorting[0]._idx = 0;
            }

            // Run the sort by calling a full redraw
            _fnReDraw( settings );

            // callback used for async user interaction
            if ( typeof callback == 'function' ) {
                callback( settings );
            }
        }


        /**
         * Attach a sort handler (click) to a node
         *  @param {object} settings dataTables settings object
         *  @param {node} attachTo node to attach the handler to
         *  @param {int} colIdx column sorting index
         *  @param {function} [callback] callback function
         *  @memberof DataTable#oApi
         */
        function _fnSortAttachListener ( settings, attachTo, colIdx, callback )
        {
            var col = settings.aoColumns[ colIdx ];

            _fnBindAction( attachTo, {}, function (e) {
                /* If the column is not sortable - don't to anything */
                if ( col.bSortable === false ) {
                    return;
                }

                // If processing is enabled use a timeout to allow the processing
                // display to be shown - otherwise to it synchronously
                if ( settings.oFeatures.bProcessing ) {
                    _fnProcessingDisplay( settings, true );

                    setTimeout( function() {
                        _fnSortListener( settings, colIdx, e.shiftKey, callback );

                        // In server-side processing, the draw callback will remove the
                        // processing display
                        if ( _fnDataSource( settings ) !== 'ssp' ) {
                            _fnProcessingDisplay( settings, false );
                        }
                    }, 0 );
                }
                else {
                    _fnSortListener( settings, colIdx, e.shiftKey, callback );
                }
            } );
        }


        /**
         * Set the sorting classes on table's body, Note: it is safe to call this function
         * when bSort and bSortClasses are false
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnSortingClasses( settings )
        {
            var oldSort = settings.aLastSort;
            var sortClass = settings.oClasses.sSortColumn;
            var sort = _fnSortFlatten( settings );
            var features = settings.oFeatures;
            var i, ien, colIdx;

            if ( features.bSort && features.bSortClasses ) {
                // Remove old sorting classes
                for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
                    colIdx = oldSort[i].src;

                    // Remove column sorting
                    $( _pluck( settings.aoData, 'anCells', colIdx ) )
                        .removeClass( sortClass + (i<2 ? i+1 : 3) );
                }

                // Add new column sorting
                for ( i=0, ien=sort.length ; i<ien ; i++ ) {
                    colIdx = sort[i].src;

                    $( _pluck( settings.aoData, 'anCells', colIdx ) )
                        .addClass( sortClass + (i<2 ? i+1 : 3) );
                }
            }

            settings.aLastSort = sort;
        }


        // Get the data to sort a column, be it from cache, fresh (populating the
        // cache), or from a sort formatter
        function _fnSortData( settings, idx )
        {
            // Custom sorting function - provided by the sort data type
            var column = settings.aoColumns[ idx ];
            var customSort = DataTable.ext.order[ column.sSortDataType ];
            var customData;

            if ( customSort ) {
                customData = customSort.call( settings.oInstance, settings, idx,
                    _fnColumnIndexToVisible( settings, idx )
                );
            }

            // Use / populate cache
            var row, cellData;
            var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];

            for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
                row = settings.aoData[i];

                if ( ! row._aSortData ) {
                    row._aSortData = [];
                }

                if ( ! row._aSortData[idx] || customSort ) {
                    cellData = customSort ?
                        customData[i] : // If there was a custom sort function, use data from there
                        _fnGetCellData( settings, i, idx, 'sort' );

                    row._aSortData[ idx ] = formatter ?
                        formatter( cellData ) :
                        cellData;
                }
            }
        }



        /**
         * Save the state of a table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnSaveState ( settings )
        {
            if ( !settings.oFeatures.bStateSave || settings.bDestroying )
            {
                return;
            }

            /* Store the interesting variables */
            var state = {
                time:    +new Date(),
                start:   settings._iDisplayStart,
                length:  settings._iDisplayLength,
                order:   $.extend( true, [], settings.aaSorting ),
                search:  _fnSearchToCamel( settings.oPreviousSearch ),
                columns: $.map( settings.aoColumns, function ( col, i ) {
                    return {
                        visible: col.bVisible,
                        search: _fnSearchToCamel( settings.aoPreSearchCols[i] )
                    };
                } )
            };

            _fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );

            settings.oSavedState = state;
            settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
        }


        /**
         * Attempt to load a saved table state
         *  @param {object} oSettings dataTables settings object
         *  @param {object} oInit DataTables init object so we can override settings
         *  @memberof DataTable#oApi
         */
        function _fnLoadState ( settings, oInit )
        {
            var i, ien;
            var columns = settings.aoColumns;

            if ( ! settings.oFeatures.bStateSave ) {
                return;
            }

            var state = settings.fnStateLoadCallback.call( settings.oInstance, settings );
            if ( ! state || ! state.time ) {
                return;
            }

            /* Allow custom and plug-in manipulation functions to alter the saved data set and
             * cancelling of loading by returning false
             */
            var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, state] );
            if ( $.inArray( false, abStateLoad ) !== -1 ) {
                return;
            }

            /* Reject old data */
            var duration = settings.iStateDuration;
            if ( duration > 0 && state.time < +new Date() - (duration*1000) ) {
                return;
            }

            // Number of columns have changed - all bets are off, no restore of settings
            if ( columns.length !== state.columns.length ) {
                return;
            }

            // Store the saved state so it might be accessed at any time
            settings.oLoadedState = $.extend( true, {}, state );

            // Restore key features - todo - for 1.11 this needs to be done by
            // subscribed events
            settings._iDisplayStart    = state.start;
            settings.iInitDisplayStart = state.start;
            settings._iDisplayLength   = state.length;
            settings.aaSorting = [];

            // Order
            $.each( state.order, function ( i, col ) {
                settings.aaSorting.push( col[0] >= columns.length ?
                        [ 0, col[1] ] :
                        col
                );
            } );

            // Search
            $.extend( settings.oPreviousSearch, _fnSearchToHung( state.search ) );

            // Columns
            for ( i=0, ien=state.columns.length ; i<ien ; i++ ) {
                var col = state.columns[i];

                // Visibility
                columns[i].bVisible = col.visible;

                // Search
                $.extend( settings.aoPreSearchCols[i], _fnSearchToHung( col.search ) );
            }

            _fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, state] );
        }


        /**
         * Return the settings object for a particular table
         *  @param {node} table table we are using as a dataTable
         *  @returns {object} Settings object - or null if not found
         *  @memberof DataTable#oApi
         */
        function _fnSettingsFromNode ( table )
        {
            var settings = DataTable.settings;
            var idx = $.inArray( table, _pluck( settings, 'nTable' ) );

            return idx !== -1 ?
                settings[ idx ] :
                null;
        }


        /**
         * Log an error message
         *  @param {object} settings dataTables settings object
         *  @param {int} level log error messages, or display them to the user
         *  @param {string} msg error message
         *  @param {int} tn Technical note id to get more information about the error.
         *  @memberof DataTable#oApi
         */
        function _fnLog( settings, level, msg, tn )
        {
            msg = 'DataTables warning: '+
            (settings!==null ? 'table id='+settings.sTableId+' - ' : '')+msg;

            if ( tn ) {
                msg += '. For more information about this error, please see '+
                'http://datatables.net/tn/'+tn;
            }

            if ( ! level  ) {
                // Backwards compatibility pre 1.10
                var ext = DataTable.ext;
                var type = ext.sErrMode || ext.errMode;

                if ( type == 'alert' ) {
                    alert( msg );
                }
                else {
                    throw new Error(msg);
                }
            }
            else if ( window.console && console.log ) {
               // console.log( msg );
            }
        }


        /**
         * See if a property is defined on one object, if so assign it to the other object
         *  @param {object} ret target object
         *  @param {object} src source object
         *  @param {string} name property
         *  @param {string} [mappedName] name to map too - optional, name used if not given
         *  @memberof DataTable#oApi
         */
        function _fnMap( ret, src, name, mappedName )
        {
            if ( $.isArray( name ) ) {
                $.each( name, function (i, val) {
                    if ( $.isArray( val ) ) {
                        _fnMap( ret, src, val[0], val[1] );
                    }
                    else {
                        _fnMap( ret, src, val );
                    }
                } );

                return;
            }

            if ( mappedName === undefined ) {
                mappedName = name;
            }

            if ( src[name] !== undefined ) {
                ret[mappedName] = src[name];
            }
        }


        /**
         * Extend objects - very similar to jQuery.extend, but deep copy objects, and
         * shallow copy arrays. The reason we need to do this, is that we don't want to
         * deep copy array init values (such as aaSorting) since the dev wouldn't be
         * able to override them, but we do want to deep copy arrays.
         *  @param {object} out Object to extend
         *  @param {object} extender Object from which the properties will be applied to
         *      out
         *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
         *      independent copy with the exception of the `data` or `aaData` parameters
         *      if they are present. This is so you can pass in a collection to
         *      DataTables and have that used as your data source without breaking the
         *      references
         *  @returns {object} out Reference, just for convenience - out === the return.
         *  @memberof DataTable#oApi
         *  @todo This doesn't take account of arrays inside the deep copied objects.
         */
        function _fnExtend( out, extender, breakRefs )
        {
            var val;

            for ( var prop in extender ) {
                if ( extender.hasOwnProperty(prop) ) {
                    val = extender[prop];

                    if ( $.isPlainObject( val ) ) {
                        if ( ! $.isPlainObject( out[prop] ) ) {
                            out[prop] = {};
                        }
                        $.extend( true, out[prop], val );
                    }
                    else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && $.isArray(val) ) {
                        out[prop] = val.slice();
                    }
                    else {
                        out[prop] = val;
                    }
                }
            }

            return out;
        }


        /**
         * Bind an event handers to allow a click or return key to activate the callback.
         * This is good for accessibility since a return on the keyboard will have the
         * same effect as a click, if the element has focus.
         *  @param {element} n Element to bind the action to
         *  @param {object} oData Data object to pass to the triggered function
         *  @param {function} fn Callback function for when the event is triggered
         *  @memberof DataTable#oApi
         */
        function _fnBindAction( n, oData, fn )
        {
            $(n)
                .bind( 'click.DT', oData, function (e) {
                    n.blur(); // Remove focus outline for mouse users
                    fn(e);
                } )
                .bind( 'keypress.DT', oData, function (e){
                    if ( e.which === 13 ) {
                        e.preventDefault();
                        fn(e);
                    }
                } )
                .bind( 'selectstart.DT', function () {
                    /* Take the brutal approach to cancelling text selection */
                    return false;
                } );
        }


        /**
         * Register a callback function. Easily allows a callback function to be added to
         * an array store of callback functions that can then all be called together.
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sStore Name of the array storage for the callbacks in oSettings
         *  @param {function} fn Function to be called back
         *  @param {string} sName Identifying name for the callback (i.e. a label)
         *  @memberof DataTable#oApi
         */
        function _fnCallbackReg( oSettings, sStore, fn, sName )
        {
            if ( fn )
            {
                oSettings[sStore].push( {
                    "fn": fn,
                    "sName": sName
                } );
            }
        }


        /**
         * Fire callback functions and trigger events. Note that the loop over the
         * callback array store is done backwards! Further note that you do not want to
         * fire off triggers in time sensitive applications (for example cell creation)
         * as its slow.
         *  @param {object} settings dataTables settings object
         *  @param {string} callbackArr Name of the array storage for the callbacks in
         *      oSettings
         *  @param {string} event Name of the jQuery custom event to trigger. If null no
         *      trigger is fired
         *  @param {array} args Array of arguments to pass to the callback function /
         *      trigger
         *  @memberof DataTable#oApi
         */
        function _fnCallbackFire( settings, callbackArr, e, args )
        {
            var ret = [];

            if ( callbackArr ) {
                ret = $.map( settings[callbackArr].slice().reverse(), function (val, i) {
                    return val.fn.apply( settings.oInstance, args );
                } );
            }

            if ( e !== null ) {
                $(settings.nTable).trigger( e+'.dt', args );
            }

            return ret;
        }


        function _fnLengthOverflow ( settings )
        {
            var
                start = settings._iDisplayStart,
                end = settings.fnDisplayEnd(),
                len = settings._iDisplayLength;

            /* If we have space to show extra rows (backing up from the end point - then do so */
            if ( start >= end )
            {
                start = end - len;
            }

            // Keep the start record on the current page
            start -= (start % len);

            if ( len === -1 || start < 0 )
            {
                start = 0;
            }

            settings._iDisplayStart = start;
        }


        function _fnRenderer( settings, type )
        {
            var renderer = settings.renderer;
            var host = DataTable.ext.renderer[type];

            if ( $.isPlainObject( renderer ) && renderer[type] ) {
                // Specific renderer for this type. If available use it, otherwise use
                // the default.
                return host[renderer[type]] || host._;
            }
            else if ( typeof renderer === 'string' ) {
                // Common renderer - if there is one available for this type use it,
                // otherwise use the default
                return host[renderer] || host._;
            }

            // Use the default
            return host._;
        }


        /**
         * Detect the data source being used for the table. Used to simplify the code
         * a little (ajax) and to make it compress a little smaller.
         *
         *  @param {object} settings dataTables settings object
         *  @returns {string} Data source
         *  @memberof DataTable#oApi
         */
        function _fnDataSource ( settings )
        {
            if ( settings.oFeatures.bServerSide ) {
                return 'ssp';
            }
            else if ( settings.ajax || settings.sAjaxSource ) {
                return 'ajax';
            }
            return 'dom';
        }


        DataTable = function( options )
        {
            /**
             * Perform a jQuery selector action on the table's TR elements (from the tbody) and
             * return the resulting jQuery object.
             *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
             *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
             *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
             *    criterion ("applied") or all TR elements (i.e. no filter).
             *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
             *    Can be either 'current', whereby the current sorting of the table is used, or
             *    'original' whereby the original order the data was read into the table is used.
             *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
             *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
             *    'current' and filter is 'applied', regardless of what they might be given as.
             *  @returns {object} jQuery object, filtered by the given selector.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Highlight every second row
         *      oTable.$('tr:odd').css('backgroundColor', 'blue');
         *    } );
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Filter to rows with 'Webkit' in them, add a background colour and then
         *      // remove the filter, thus highlighting the 'Webkit' rows only.
         *      oTable.fnFilter('Webkit');
         *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
         *      oTable.fnFilter('');
         *    } );
             */
            this.$ = function ( sSelector, oOpts )
            {
                return this.api(true).$( sSelector, oOpts );
            };


            /**
             * Almost identical to $ in operation, but in this case returns the data for the matched
             * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
             * rather than any descendants, so the data can be obtained for the row/cell. If matching
             * rows are found, the data returned is the original data array/object that was used to
             * create the row (or a generated array if from a DOM source).
             *
             * This method is often useful in-combination with $ where both functions are given the
             * same parameters and the array indexes will match identically.
             *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
             *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
             *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
             *    criterion ("applied") or all elements (i.e. no filter).
             *  @param {string} [oOpts.order=current] Order of the data in the processed array.
             *    Can be either 'current', whereby the current sorting of the table is used, or
             *    'original' whereby the original order the data was read into the table is used.
             *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
             *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
             *    'current' and filter is 'applied', regardless of what they might be given as.
             *  @returns {array} Data for the matched elements. If any elements, as a result of the
             *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
             *    entry in the array.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Get the data from the first row in the table
         *      var data = oTable._('tr:first');
         *
         *      // Do something useful with the data
         *      alert( "First cell is: "+data[0] );
         *    } );
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Filter to 'Webkit' and get all data for
         *      oTable.fnFilter('Webkit');
         *      var data = oTable._('tr', {"search": "applied"});
         *
         *      // Do something with the data
         *      alert( data.length+" rows matched the search" );
         *    } );
             */
            this._ = function ( sSelector, oOpts )
            {
                return this.api(true).rows( sSelector, oOpts ).data();
            };


            /**
             * Create a DataTables Api instance, with the currently selected tables for
             * the Api's context.
             * @param {boolean} [traditional=false] Set the API instance's context to be
             *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
             *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
             *   or if all tables captured in the jQuery object should be used.
             * @return {DataTables.Api}
             */
            this.api = function ( traditional )
            {
                return traditional ?
                    new _Api(
                        _fnSettingsFromNode( this[ _ext.iApiIndex ] )
                    ) :
                    new _Api( this );
            };


            /**
             * Add a single new row or multiple rows of data to the table. Please note
             * that this is suitable for client-side processing only - if you are using
             * server-side processing (i.e. "bServerSide": true), then to add data, you
             * must add it to the data source, i.e. the server-side, through an Ajax call.
             *  @param {array|object} data The data to be added to the table. This can be:
             *    <ul>
             *      <li>1D array of data - add a single row with the data provided</li>
             *      <li>2D array of arrays - add multiple rows in a single call</li>
             *      <li>object - data object when using <i>mData</i></li>
             *      <li>array of objects - multiple data objects when using <i>mData</i></li>
             *    </ul>
             *  @param {bool} [redraw=true] redraw the table or not
             *  @returns {array} An array of integers, representing the list of indexes in
             *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
             *    the table.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    // Global var for counter
             *    var giCount = 2;
             *
             *    $(document).ready(function() {
         *      $('#example').dataTable();
         *    } );
             *
             *    function fnClickAddRow() {
         *      $('#example').dataTable().fnAddData( [
         *        giCount+".1",
         *        giCount+".2",
         *        giCount+".3",
         *        giCount+".4" ]
         *      );
         *
         *      giCount++;
         *    }
             */
            this.fnAddData = function( data, redraw )
            {
                var api = this.api( true );

                /* Check if we want to add multiple rows or not */
                var rows = $.isArray(data) && ( $.isArray(data[0]) || $.isPlainObject(data[0]) ) ?
                    api.rows.add( data ) :
                    api.row.add( data );

                if ( redraw === undefined || redraw ) {
                    api.draw();
                }

                return rows.flatten().toArray();
            };


            /**
             * This function will make DataTables recalculate the column sizes, based on the data
             * contained in the table and the sizes applied to the columns (in the DOM, CSS or
             * through the sWidth parameter). This can be useful when the width of the table's
             * parent element changes (for example a window resize).
             *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable( {
         *        "sScrollY": "200px",
         *        "bPaginate": false
         *      } );
         *
         *      $(window).bind('resize', function () {
         *        oTable.fnAdjustColumnSizing();
         *      } );
         *    } );
             */
            this.fnAdjustColumnSizing = function ( bRedraw )
            {
                var api = this.api( true ).columns.adjust();
                var settings = api.settings()[0];
                var scroll = settings.oScroll;

                if ( bRedraw === undefined || bRedraw ) {
                    api.draw( false );
                }
                else if ( scroll.sX !== "" || scroll.sY !== "" ) {
                    /* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
                    _fnScrollDraw( settings );
                }
            };


            /**
             * Quickly and simply clear a table
             *  @param {bool} [bRedraw=true] redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
         *      oTable.fnClearTable();
         *    } );
             */
            this.fnClearTable = function( bRedraw )
            {
                var api = this.api( true ).clear();

                if ( bRedraw === undefined || bRedraw ) {
                    api.draw();
                }
            };


            /**
             * The exact opposite of 'opening' a row, this function will close any rows which
             * are currently 'open'.
             *  @param {node} nTr the table row to 'close'
             *  @returns {int} 0 on success, or 1 if failed (can't find the row)
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable;
         *
         *      // 'open' an information row when a row is clicked on
         *      $('#example tbody tr').click( function () {
         *        if ( oTable.fnIsOpen(this) ) {
         *          oTable.fnClose( this );
         *        } else {
         *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
         *        }
         *      } );
         *
         *      oTable = $('#example').dataTable();
         *    } );
             */
            this.fnClose = function( nTr )
            {
                this.api( true ).row( nTr ).child.hide();
            };


            /**
             * Remove a row for the table
             *  @param {mixed} target The index of the row from aoData to be deleted, or
             *    the TR element you want to delete
             *  @param {function|null} [callBack] Callback function
             *  @param {bool} [redraw=true] Redraw the table or not
             *  @returns {array} The row that was deleted
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Immediately remove the first row
         *      oTable.fnDeleteRow( 0 );
         *    } );
             */
            this.fnDeleteRow = function( target, callback, redraw )
            {
                var api = this.api( true );
                var rows = api.rows( target );
                var settings = rows.settings()[0];
                var data = settings.aoData[ rows[0][0] ];

                rows.remove();

                if ( callback ) {
                    callback.call( this, settings, data );
                }

                if ( redraw === undefined || redraw ) {
                    api.draw();
                }

                return data;
            };


            /**
             * Restore the table to it's original state in the DOM by removing all of DataTables
             * enhancements, alterations to the DOM structure of the table and event listeners.
             *  @param {boolean} [remove=false] Completely remove the table from the DOM
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
         *      var oTable = $('#example').dataTable();
         *      oTable.fnDestroy();
         *    } );
             */
            this.fnDestroy = function ( remove )
            {
                this.api( true ).destroy( remove );
            };


            /**
             * Redraw the table
             *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
         *      oTable.fnDraw();
         *    } );
             */
            this.fnDraw = function( complete )
            {
                // Note that this isn't an exact match to the old call to _fnDraw - it takes
                // into account the new data, but can old position.
                this.api( true ).draw( ! complete );
            };


            /**
             * Filter the input based on data
             *  @param {string} sInput String to filter the table on
             *  @param {int|null} [iColumn] Column to limit filtering to
             *  @param {bool} [bRegex=false] Treat as regular expression or not
             *  @param {bool} [bSmart=true] Perform smart filtering or not
             *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
             *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Sometime later - filter...
         *      oTable.fnFilter( 'test string' );
         *    } );
             */
            this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
            {
                var api = this.api( true );

                if ( iColumn === null || iColumn === undefined ) {
                    api.search( sInput, bRegex, bSmart, bCaseInsensitive );
                }
                else {
                    api.column( iColumn ).search( sInput, bRegex, bSmart, bCaseInsensitive );
                }

                api.draw();
            };


            /**
             * Get the data for the whole table, an individual row or an individual cell based on the
             * provided parameters.
             *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
             *    a TR node then the data source for the whole row will be returned. If given as a
             *    TD/TH cell node then iCol will be automatically calculated and the data for the
             *    cell returned. If given as an integer, then this is treated as the aoData internal
             *    data index for the row (see fnGetPosition) and the data for that row used.
             *  @param {int} [col] Optional column index that you want the data of.
             *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
             *    returned. If mRow is defined, just data for that row, and is iCol is
             *    defined, only data for the designated cell is returned.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    // Row data
             *    $(document).ready(function() {
         *      oTable = $('#example').dataTable();
         *
         *      oTable.$('tr').click( function () {
         *        var data = oTable.fnGetData( this );
         *        // ... do something with the array / object of data for the row
         *      } );
         *    } );
             *
             *  @example
             *    // Individual cell data
             *    $(document).ready(function() {
         *      oTable = $('#example').dataTable();
         *
         *      oTable.$('td').click( function () {
         *        var sData = oTable.fnGetData( this );
         *        alert( 'The cell clicked on had the value of '+sData );
         *      } );
         *    } );
             */
            this.fnGetData = function( src, col )
            {
                var api = this.api( true );

                if ( src !== undefined ) {
                    var type = src.nodeName ? src.nodeName.toLowerCase() : '';

                    return col !== undefined || type == 'td' || type == 'th' ?
                        api.cell( src, col ).data() :
                    api.row( src ).data() || null;
                }

                return api.data().toArray();
            };


            /**
             * Get an array of the TR nodes that are used in the table's body. Note that you will
             * typically want to use the '$' API method in preference to this as it is more
             * flexible.
             *  @param {int} [iRow] Optional row index for the TR element you want
             *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
             *    in the table's body, or iRow is defined, just the TR element requested.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Get the nodes from the table
         *      var nNodes = oTable.fnGetNodes( );
         *    } );
             */
            this.fnGetNodes = function( iRow )
            {
                var api = this.api( true );

                return iRow !== undefined ?
                    api.row( iRow ).node() :
                    api.rows().nodes().flatten().toArray();
            };


            /**
             * Get the array indexes of a particular cell from it's DOM element
             * and column index including hidden columns
             *  @param {node} node this can either be a TR, TD or TH in the table's body
             *  @returns {int} If nNode is given as a TR, then a single index is returned, or
             *    if given as a cell, an array of [row index, column index (visible),
             *    column index (all)] is given.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      $('#example tbody td').click( function () {
         *        // Get the position of the current data from the node
         *        var aPos = oTable.fnGetPosition( this );
         *
         *        // Get the data array for this row
         *        var aData = oTable.fnGetData( aPos[0] );
         *
         *        // Update the data array and return the value
         *        aData[ aPos[1] ] = 'clicked';
         *        this.innerHTML = 'clicked';
         *      } );
         *
         *      // Init DataTables
         *      oTable = $('#example').dataTable();
         *    } );
             */
            this.fnGetPosition = function( node )
            {
                var api = this.api( true );
                var nodeName = node.nodeName.toUpperCase();

                if ( nodeName == 'TR' ) {
                    return api.row( node ).index();
                }
                else if ( nodeName == 'TD' || nodeName == 'TH' ) {
                    var cell = api.cell( node ).index();

                    return [
                        cell.row,
                        cell.columnVisible,
                        cell.column
                    ];
                }
                return null;
            };


            /**
             * Check to see if a row is 'open' or not.
             *  @param {node} nTr the table row to check
             *  @returns {boolean} true if the row is currently open, false otherwise
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable;
         *
         *      // 'open' an information row when a row is clicked on
         *      $('#example tbody tr').click( function () {
         *        if ( oTable.fnIsOpen(this) ) {
         *          oTable.fnClose( this );
         *        } else {
         *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
         *        }
         *      } );
         *
         *      oTable = $('#example').dataTable();
         *    } );
             */
            this.fnIsOpen = function( nTr )
            {
                return this.api( true ).row( nTr ).child.isShown();
            };


            /**
             * This function will place a new row directly after a row which is currently
             * on display on the page, with the HTML contents that is passed into the
             * function. This can be used, for example, to ask for confirmation that a
             * particular record should be deleted.
             *  @param {node} nTr The table row to 'open'
             *  @param {string|node|jQuery} mHtml The HTML to put into the row
             *  @param {string} sClass Class to give the new TD cell
             *  @returns {node} The row opened. Note that if the table row passed in as the
             *    first parameter, is not found in the table, this method will silently
             *    return.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable;
         *
         *      // 'open' an information row when a row is clicked on
         *      $('#example tbody tr').click( function () {
         *        if ( oTable.fnIsOpen(this) ) {
         *          oTable.fnClose( this );
         *        } else {
         *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
         *        }
         *      } );
         *
         *      oTable = $('#example').dataTable();
         *    } );
             */
            this.fnOpen = function( nTr, mHtml, sClass )
            {
                return this.api( true )
                    .row( nTr )
                    .child( mHtml, sClass )
                    .show()
                    .child()[0];
            };


            /**
             * Change the pagination - provides the internal logic for pagination in a simple API
             * function. With this function you can have a DataTables table go to the next,
             * previous, first or last pages.
             *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
             *    or page number to jump to (integer), note that page 0 is the first page.
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *      oTable.fnPageChange( 'next' );
         *    } );
             */
            this.fnPageChange = function ( mAction, bRedraw )
            {
                var api = this.api( true ).page( mAction );

                if ( bRedraw === undefined || bRedraw ) {
                    api.draw(false);
                }
            };


            /**
             * Show a particular column
             *  @param {int} iCol The column whose display should be changed
             *  @param {bool} bShow Show (true) or hide (false) the column
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Hide the second column after initialisation
         *      oTable.fnSetColumnVis( 1, false );
         *    } );
             */
            this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
            {
                var api = this.api( true ).column( iCol ).visible( bShow );

                if ( bRedraw === undefined || bRedraw ) {
                    api.columns.adjust().draw();
                }
            };


            /**
             * Get the settings for a particular table for external manipulation
             *  @returns {object} DataTables settings object. See
             *    {@link DataTable.models.oSettings}
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *      var oSettings = oTable.fnSettings();
         *
         *      // Show an example parameter from the settings
         *      alert( oSettings._iDisplayStart );
         *    } );
             */
            this.fnSettings = function()
            {
                return _fnSettingsFromNode( this[_ext.iApiIndex] );
            };


            /**
             * Sort the table by a particular column
             *  @param {int} iCol the data index to sort on. Note that this will not match the
             *    'display index' if you have hidden data entries
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Sort immediately with columns 0 and 1
         *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
         *    } );
             */
            this.fnSort = function( aaSort )
            {
                this.api( true ).order( aaSort ).draw();
            };


            /**
             * Attach a sort listener to an element for a given column
             *  @param {node} nNode the element to attach the sort listener to
             *  @param {int} iColumn the column that a click on this node will sort on
             *  @param {function} [fnCallback] callback function when sort is run
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *
         *      // Sort on column 1, when 'sorter' is clicked on
         *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
         *    } );
             */
            this.fnSortListener = function( nNode, iColumn, fnCallback )
            {
                this.api( true ).order.listener( nNode, iColumn, fnCallback );
            };


            /**
             * Update a table cell or row - this method will accept either a single value to
             * update the cell with, an array of values with one element for each column or
             * an object in the same format as the original data source. The function is
             * self-referencing in order to make the multi column updates easier.
             *  @param {object|array|string} mData Data to update the cell/row with
             *  @param {node|int} mRow TR element you want to update or the aoData index
             *  @param {int} [iColumn] The column to update, give as null or undefined to
             *    update a whole row.
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @param {bool} [bAction=true] Perform pre-draw actions or not
             *  @returns {int} 0 on success, 1 on error
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
         *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
         *    } );
             */
            this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
            {
                var api = this.api( true );

                if ( iColumn === undefined || iColumn === null ) {
                    api.row( mRow ).data( mData );
                }
                else {
                    api.cell( mRow, iColumn ).data( mData );
                }

                if ( bAction === undefined || bAction ) {
                    api.columns.adjust();
                }

                if ( bRedraw === undefined || bRedraw ) {
                    api.draw();
                }
                return 0;
            };


            /**
             * Provide a common method for plug-ins to check the version of DataTables being used, in order
             * to ensure compatibility.
             *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
             *    formats "X" and "X.Y" are also acceptable.
             *  @returns {boolean} true if this version of DataTables is greater or equal to the required
             *    version, or false if this version of DataTales is not suitable
             *  @method
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
         *      var oTable = $('#example').dataTable();
         *      alert( oTable.fnVersionCheck( '1.9.0' ) );
         *    } );
             */
            this.fnVersionCheck = _ext.fnVersionCheck;


            var _that = this;
            var emptyInit = options === undefined;
            var len = this.length;

            if ( emptyInit ) {
                options = {};
            }

            this.oApi = this.internal = _ext.internal;

            // Extend with old style plug-in API methods
            for ( var fn in DataTable.ext.internal ) {
                if ( fn ) {
                    this[fn] = _fnExternApiFunc(fn);
                }
            }

            this.each(function() {
                // For each initialisation we want to give it a clean initialisation
                // object that can be bashed around
                var o = {};
                var oInit = len > 1 ? // optimisation for single table case
                    _fnExtend( o, options, true ) :
                    options;

                /*global oInit,_that,emptyInit*/
                var i=0, iLen, j, jLen, k, kLen;
                var sId = this.getAttribute( 'id' );
                var bInitHandedOff = false;
                var defaults = DataTable.defaults;


                /* Sanity check */
                if ( this.nodeName.toLowerCase() != 'table' )
                {
                    _fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
                    return;
                }

                /* Backwards compatibility for the defaults */
                _fnCompatOpts( defaults );
                _fnCompatCols( defaults.column );

                /* Convert the camel-case defaults to Hungarian */
                _fnCamelToHungarian( defaults, defaults, true );
                _fnCamelToHungarian( defaults.column, defaults.column, true );

                /* Setting up the initialisation object */
                _fnCamelToHungarian( defaults, oInit );

                /* Check to see if we are re-initialising a table */
                var allSettings = DataTable.settings;
                for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
                {
                    /* Base check on table node */
                    if ( allSettings[i].nTable == this )
                    {
                        var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
                        var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;

                        if ( emptyInit || bRetrieve )
                        {
                            return allSettings[i].oInstance;
                        }
                        else if ( bDestroy )
                        {
                            allSettings[i].oInstance.fnDestroy();
                            break;
                        }
                        else
                        {
                            _fnLog( allSettings[i], 0, 'Cannot reinitialise DataTable', 3 );
                            return;
                        }
                    }

                    /* If the element we are initialising has the same ID as a table which was previously
                     * initialised, but the table nodes don't match (from before) then we destroy the old
                     * instance by simply deleting it. This is under the assumption that the table has been
                     * destroyed by other methods. Anyone using non-id selectors will need to do this manually
                     */
                    if ( allSettings[i].sTableId == this.id )
                    {
                        allSettings.splice( i, 1 );
                        break;
                    }
                }

                /* Ensure the table has an ID - required for accessibility */
                if ( sId === null || sId === "" )
                {
                    sId = "DataTables_Table_"+(DataTable.ext._unique++);
                    this.id = sId;
                }

                /* Create the settings object for this table and set some of the default parameters */
                var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
                    "nTable":        this,
                    "oApi":          _that.internal,
                    "oInit":         oInit,
                    "sDestroyWidth": $(this)[0].style.width,
                    "sInstance":     sId,
                    "sTableId":      sId
                } );
                allSettings.push( oSettings );

                // Need to add the instance after the instance after the settings object has been added
                // to the settings array, so we can self reference the table instance if more than one
                oSettings.oInstance = (_that.length===1) ? _that : $(this).dataTable();

                // Backwards compatibility, before we apply all the defaults
                _fnCompatOpts( oInit );

                if ( oInit.oLanguage )
                {
                    _fnLanguageCompat( oInit.oLanguage );
                }

                // If the length menu is given, but the init display length is not, use the length menu
                if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
                {
                    oInit.iDisplayLength = $.isArray( oInit.aLengthMenu[0] ) ?
                        oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
                }

                // Apply the defaults and init options to make a single init object will all
                // options defined from defaults and instance options.
                oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );


                // Map the initialisation options onto the settings object
                _fnMap( oSettings.oFeatures, oInit, [
                    "bPaginate",
                    "bLengthChange",
                    "bFilter",
                    "bSort",
                    "bSortMulti",
                    "bInfo",
                    "bProcessing",
                    "bAutoWidth",
                    "bSortClasses",
                    "bServerSide",
                    "bDeferRender"
                ] );
                _fnMap( oSettings, oInit, [
                    "asStripeClasses",
                    "ajax",
                    "fnServerData",
                    "fnFormatNumber",
                    "sServerMethod",
                    "aaSorting",
                    "aaSortingFixed",
                    "aLengthMenu",
                    "sPaginationType",
                    "sAjaxSource",
                    "sAjaxDataProp",
                    "iStateDuration",
                    "sDom",
                    "bSortCellsTop",
                    "iTabIndex",
                    "fnStateLoadCallback",
                    "fnStateSaveCallback",
                    "renderer",
                    "searchDelay",
                    [ "iCookieDuration", "iStateDuration" ], // backwards compat
                    [ "oSearch", "oPreviousSearch" ],
                    [ "aoSearchCols", "aoPreSearchCols" ],
                    [ "iDisplayLength", "_iDisplayLength" ],
                    [ "bJQueryUI", "bJUI" ]
                ] );
                _fnMap( oSettings.oScroll, oInit, [
                    [ "sScrollX", "sX" ],
                    [ "sScrollXInner", "sXInner" ],
                    [ "sScrollY", "sY" ],
                    [ "bScrollCollapse", "bCollapse" ]
                ] );
                _fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );

                /* Callback functions which are array driven */
                _fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
                _fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
                _fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
                _fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
                _fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
                _fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
                _fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
                _fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
                _fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
                _fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
                _fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );

                var oClasses = oSettings.oClasses;

                // @todo Remove in 1.11
                if ( oInit.bJQueryUI )
                {
                    /* Use the JUI classes object for display. You could clone the oStdClasses object if
                     * you want to have multiple tables with multiple independent classes
                     */
                    $.extend( oClasses, DataTable.ext.oJUIClasses, oInit.oClasses );

                    if ( oInit.sDom === defaults.sDom && defaults.sDom === "lfrtip" )
                    {
                        /* Set the DOM to use a layout suitable for jQuery UI's theming */
                        oSettings.sDom = '<"H"lfr>t<"F"ip>';
                    }

                    if ( ! oSettings.renderer ) {
                        oSettings.renderer = 'jqueryui';
                    }
                    else if ( $.isPlainObject( oSettings.renderer ) && ! oSettings.renderer.header ) {
                        oSettings.renderer.header = 'jqueryui';
                    }
                }
                else
                {
                    $.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
                }
                $(this).addClass( oClasses.sTable );

                /* Calculate the scroll bar width and cache it for use later on */
                if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
                {
                    oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
                }
                if ( oSettings.oScroll.sX === true ) { // Easy initialisation of x-scrolling
                    oSettings.oScroll.sX = '100%';
                }

                if ( oSettings.iInitDisplayStart === undefined )
                {
                    /* Display start point, taking into account the save saving */
                    oSettings.iInitDisplayStart = oInit.iDisplayStart;
                    oSettings._iDisplayStart = oInit.iDisplayStart;
                }

                if ( oInit.iDeferLoading !== null )
                {
                    oSettings.bDeferLoading = true;
                    var tmp = $.isArray( oInit.iDeferLoading );
                    oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
                    oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
                }

                /* Language definitions */
                var oLanguage = oSettings.oLanguage;
                $.extend( true, oLanguage, oInit.oLanguage );

                if ( oLanguage.sUrl !== "" )
                {
                    /* Get the language definitions from a file - because this Ajax call makes the language
                     * get async to the remainder of this function we use bInitHandedOff to indicate that
                     * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
                     */
                    $.ajax( {
                        dataType: 'json',
                        url: oLanguage.sUrl,
                        success: function ( json ) {
                            _fnLanguageCompat( json );
                            _fnCamelToHungarian( defaults.oLanguage, json );
                            $.extend( true, oLanguage, json );
                            _fnInitialise( oSettings );
                        },
                        error: function () {
                            // Error occurred loading language file, continue on as best we can
                            _fnInitialise( oSettings );
                        }
                    } );
                    bInitHandedOff = true;
                }

                /*
                 * Stripes
                 */
                if ( oInit.asStripeClasses === null )
                {
                    oSettings.asStripeClasses =[
                        oClasses.sStripeOdd,
                        oClasses.sStripeEven
                    ];
                }

                /* Remove row stripe classes if they are already on the table row */
                var stripeClasses = oSettings.asStripeClasses;
                var rowOne = $('tbody tr:eq(0)', this);
                if ( $.inArray( true, $.map( stripeClasses, function(el, i) {
                        return rowOne.hasClass(el);
                    } ) ) !== -1 ) {
                    $('tbody tr', this).removeClass( stripeClasses.join(' ') );
                    oSettings.asDestroyStripes = stripeClasses.slice();
                }

                /*
                 * Columns
                 * See if we should load columns automatically or use defined ones
                 */
                var anThs = [];
                var aoColumnsInit;
                var nThead = this.getElementsByTagName('thead');
                if ( nThead.length !== 0 )
                {
                    _fnDetectHeader( oSettings.aoHeader, nThead[0] );
                    anThs = _fnGetUniqueThs( oSettings );
                }

                /* If not given a column array, generate one with nulls */
                if ( oInit.aoColumns === null )
                {
                    aoColumnsInit = [];
                    for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
                    {
                        aoColumnsInit.push( null );
                    }
                }
                else
                {
                    aoColumnsInit = oInit.aoColumns;
                }

                /* Add the columns */
                for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
                {
                    _fnAddColumn( oSettings, anThs ? anThs[i] : null );
                }

                /* Apply the column definitions */
                _fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
                    _fnColumnOptions( oSettings, iCol, oDef );
                } );

                /* HTML5 attribute detection - build an mData object automatically if the
                 * attributes are found
                 */
                if ( rowOne.length ) {
                    var a = function ( cell, name ) {
                        return cell.getAttribute( 'data-'+name ) ? name : null;
                    };

                    $.each( _fnGetRowElements( oSettings, rowOne[0] ).cells, function (i, cell) {
                        var col = oSettings.aoColumns[i];

                        if ( col.mData === i ) {
                            var sort = a( cell, 'sort' ) || a( cell, 'order' );
                            var filter = a( cell, 'filter' ) || a( cell, 'search' );

                            if ( sort !== null || filter !== null ) {
                                col.mData = {
                                    _:      i+'.display',
                                    sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
                                    type:   sort !== null   ? i+'.@data-'+sort   : undefined,
                                    filter: filter !== null ? i+'.@data-'+filter : undefined
                                };

                                _fnColumnOptions( oSettings, i );
                            }
                        }
                    } );
                }

                var features = oSettings.oFeatures;

                /* Must be done after everything which can be overridden by the state saving! */
                if ( oInit.bStateSave )
                {
                    features.bStateSave = true;
                    _fnLoadState( oSettings, oInit );
                    _fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
                }


                /*
                 * Sorting
                 * @todo For modularisation (1.11) this needs to do into a sort start up handler
                 */

                // If aaSorting is not defined, then we use the first indicator in asSorting
                // in case that has been altered, so the default sort reflects that option
                if ( oInit.aaSorting === undefined )
                {
                    var sorting = oSettings.aaSorting;
                    for ( i=0, iLen=sorting.length ; i<iLen ; i++ )
                    {
                        sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
                    }
                }

                /* Do a first pass on the sorting classes (allows any size changes to be taken into
                 * account, and also will apply sorting disabled classes if disabled
                 */
                _fnSortingClasses( oSettings );

                if ( features.bSort )
                {
                    _fnCallbackReg( oSettings, 'aoDrawCallback', function () {
                        if ( oSettings.bSorted ) {
                            var aSort = _fnSortFlatten( oSettings );
                            var sortedColumns = {};

                            $.each( aSort, function (i, val) {
                                sortedColumns[ val.src ] = val.dir;
                            } );

                            _fnCallbackFire( oSettings, null, 'order', [oSettings, aSort, sortedColumns] );
                            _fnSortAria( oSettings );
                        }
                    } );
                }

                _fnCallbackReg( oSettings, 'aoDrawCallback', function () {
                    if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
                        _fnSortingClasses( oSettings );
                    }
                }, 'sc' );


                /*
                 * Final init
                 * Cache the header, body and footer as required, creating them if needed
                 */

                /* Browser support detection */
                _fnBrowserDetect( oSettings );

                // Work around for Webkit bug 83867 - store the caption-side before removing from doc
                var captions = $(this).children('caption').each( function () {
                    this._captionSide = $(this).css('caption-side');
                } );

                var thead = $(this).children('thead');
                if ( thead.length === 0 )
                {
                    thead = $('<thead/>').appendTo(this);
                }
                oSettings.nTHead = thead[0];

                var tbody = $(this).children('tbody');
                if ( tbody.length === 0 )
                {
                    tbody = $('<tbody/>').appendTo(this);
                }
                oSettings.nTBody = tbody[0];

                var tfoot = $(this).children('tfoot');
                if ( tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") )
                {
                    // If we are a scrolling table, and no footer has been given, then we need to create
                    // a tfoot element for the caption element to be appended to
                    tfoot = $('<tfoot/>').appendTo(this);
                }

                if ( tfoot.length === 0 || tfoot.children().length === 0 ) {
                    $(this).addClass( oClasses.sNoFooter );
                }
                else if ( tfoot.length > 0 ) {
                    oSettings.nTFoot = tfoot[0];
                    _fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
                }

                /* Check if there is data passing into the constructor */
                if ( oInit.aaData )
                {
                    for ( i=0 ; i<oInit.aaData.length ; i++ )
                    {
                        _fnAddData( oSettings, oInit.aaData[ i ] );
                    }
                }
                else if ( oSettings.bDeferLoading || _fnDataSource( oSettings ) == 'dom' )
                {
                    /* Grab the data from the page - only do this when deferred loading or no Ajax
                     * source since there is no point in reading the DOM data if we are then going
                     * to replace it with Ajax data
                     */
                    _fnAddTr( oSettings, $(oSettings.nTBody).children('tr') );
                }

                /* Copy the data index array */
                oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

                /* Initialisation complete - table can be drawn */
                oSettings.bInitialised = true;

                /* Check if we need to initialise the table (it might not have been handed off to the
                 * language processor)
                 */
                if ( bInitHandedOff === false )
                {
                    _fnInitialise( oSettings );
                }
            } );
            _that = null;
            return this;
        };



        /**
         * Computed structure of the DataTables API, defined by the options passed to
         * `DataTable.Api.register()` when building the API.
         *
         * The structure is built in order to speed creation and extension of the Api
         * objects since the extensions are effectively pre-parsed.
         *
         * The array is an array of objects with the following structure, where this
         * base array represents the Api prototype base:
         *
         *     [
         *       {
     *         name:      'data'                -- string   - Property name
     *         val:       function () {},       -- function - Api method (or undefined if just an object
     *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
     *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
     *       },
         *       {
     *         name:     'row'
     *         val:       {},
     *         methodExt: [ ... ],
     *         propExt:   [
     *           {
     *             name:      'data'
     *             val:       function () {},
     *             methodExt: [ ... ],
     *             propExt:   [ ... ]
     *           },
     *           ...
     *         ]
     *       }
         *     ]
         *
         * @type {Array}
         * @ignore
         */
        var __apiStruct = [];


        /**
         * `Array.prototype` reference.
         *
         * @type object
         * @ignore
         */
        var __arrayProto = Array.prototype;


        /**
         * Abstraction for `context` parameter of the `Api` constructor to allow it to
         * take several different forms for ease of use.
         *
         * Each of the input parameter types will be converted to a DataTables settings
         * object where possible.
         *
         * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
         *   of:
         *
         *   * `string` - jQuery selector. Any DataTables' matching the given selector
         *     with be found and used.
         *   * `node` - `TABLE` node which has already been formed into a DataTable.
         *   * `jQuery` - A jQuery object of `TABLE` nodes.
         *   * `object` - DataTables settings object
         *   * `DataTables.Api` - API instance
         * @return {array|null} Matching DataTables settings objects. `null` or
         *   `undefined` is returned if no matching DataTable is found.
         * @ignore
         */
        var _toSettings = function ( mixed )
        {
            var idx, jq;
            var settings = DataTable.settings;
            var tables = $.map( settings, function (el, i) {
                return el.nTable;
            } );

            if ( ! mixed ) {
                return [];
            }
            else if ( mixed.nTable && mixed.oApi ) {
                // DataTables settings object
                return [ mixed ];
            }
            else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
                // Table node
                idx = $.inArray( mixed, tables );
                return idx !== -1 ? [ settings[idx] ] : null;
            }
            else if ( mixed && typeof mixed.settings === 'function' ) {
                return mixed.settings().toArray();
            }
            else if ( typeof mixed === 'string' ) {
                // jQuery selector
                jq = $(mixed);
            }
            else if ( mixed instanceof $ ) {
                // jQuery object (also DataTables instance)
                jq = mixed;
            }

            if ( jq ) {
                return jq.map( function(i) {
                    idx = $.inArray( this, tables );
                    return idx !== -1 ? settings[idx] : null;
                } ).toArray();
            }
        };


        /**
         * DataTables API class - used to control and interface with  one or more
         * DataTables enhanced tables.
         *
         * The API class is heavily based on jQuery, presenting a chainable interface
         * that you can use to interact with tables. Each instance of the API class has
         * a "context" - i.e. the tables that it will operate on. This could be a single
         * table, all tables on a page or a sub-set thereof.
         *
         * Additionally the API is designed to allow you to easily work with the data in
         * the tables, retrieving and manipulating it as required. This is done by
         * presenting the API class as an array like interface. The contents of the
         * array depend upon the actions requested by each method (for example
         * `rows().nodes()` will return an array of nodes, while `rows().data()` will
         * return an array of objects or arrays depending upon your table's
         * configuration). The API object has a number of array like methods (`push`,
         * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
         * `unique` etc) to assist your working with the data held in a table.
         *
         * Most methods (those which return an Api instance) are chainable, which means
         * the return from a method call also has all of the methods available that the
         * top level object had. For example, these two calls are equivalent:
         *
         *     // Not chained
         *     api.row.add( {...} );
         *     api.draw();
         *
         *     // Chained
         *     api.row.add( {...} ).draw();
         *
         * @class DataTable.Api
         * @param {array|object|string|jQuery} context DataTable identifier. This is
         *   used to define which DataTables enhanced tables this API will operate on.
         *   Can be one of:
         *
         *   * `string` - jQuery selector. Any DataTables' matching the given selector
         *     with be found and used.
         *   * `node` - `TABLE` node which has already been formed into a DataTable.
         *   * `jQuery` - A jQuery object of `TABLE` nodes.
         *   * `object` - DataTables settings object
         * @param {array} [data] Data to initialise the Api instance with.
         *
         * @example
         *   // Direct initialisation during DataTables construction
         *   var api = $('#example').DataTable();
         *
         * @example
         *   // Initialisation using a DataTables jQuery object
         *   var api = $('#example').dataTable().api();
         *
         * @example
         *   // Initialisation as a constructor
         *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
         */
        _Api = function ( context, data )
        {
            if ( ! this instanceof _Api ) {
                throw 'DT API must be constructed as a new object';
                // or should it do the 'new' for the caller?
                // return new _Api.apply( this, arguments );
            }

            var settings = [];
            var ctxSettings = function ( o ) {
                var a = _toSettings( o );
                if ( a ) {
                    settings.push.apply( settings, a );
                }
            };

            if ( $.isArray( context ) ) {
                for ( var i=0, ien=context.length ; i<ien ; i++ ) {
                    ctxSettings( context[i] );
                }
            }
            else {
                ctxSettings( context );
            }

            // Remove duplicates
            this.context = _unique( settings );

            // Initial data
            if ( data ) {
                this.push.apply( this, data.toArray ? data.toArray() : data );
            }

            // selector
            this.selector = {
                rows: null,
                cols: null,
                opts: null
            };

            _Api.extend( this, this, __apiStruct );
        };

        DataTable.Api = _Api;

        _Api.prototype = /** @lends DataTables.Api */{
            /**
             * Return a new Api instance, comprised of the data held in the current
             * instance, join with the other array(s) and/or value(s).
             *
             * An alias for `Array.prototype.concat`.
             *
             * @type method
             * @param {*} value1 Arrays and/or values to concatenate.
             * @param {*} [...] Additional arrays and/or values to concatenate.
             * @returns {DataTables.Api} New API instance, comprising of the combined
             *   array.
             */
            concat:  __arrayProto.concat,


            context: [], // array of table settings objects


            each: function ( fn )
            {
                for ( var i=0, ien=this.length ; i<ien; i++ ) {
                    fn.call( this, this[i], i, this );
                }

                return this;
            },


            eq: function ( idx )
            {
                var ctx = this.context;

                return ctx.length > idx ?
                    new _Api( ctx[idx], this[idx] ) :
                    null;
            },


            filter: function ( fn )
            {
                var a = [];

                if ( __arrayProto.filter ) {
                    a = __arrayProto.filter.call( this, fn, this );
                }
                else {
                    // Compatibility for browsers without EMCA-252-5 (JS 1.6)
                    for ( var i=0, ien=this.length ; i<ien ; i++ ) {
                        if ( fn.call( this, this[i], i, this ) ) {
                            a.push( this[i] );
                        }
                    }
                }

                return new _Api( this.context, a );
            },


            flatten: function ()
            {
                var a = [];
                return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
            },


            join:    __arrayProto.join,


            indexOf: __arrayProto.indexOf || function (obj, start)
            {
                for ( var i=(start || 0), ien=this.length ; i<ien ; i++ ) {
                    if ( this[i] === obj ) {
                        return i;
                    }
                }
                return -1;
            },

            // Note that `alwaysNew` is internal - use iteratorNew externally
            iterator: function ( flatten, type, fn, alwaysNew ) {
                var
                    a = [], ret,
                    i, ien, j, jen,
                    context = this.context,
                    rows, items, item,
                    selector = this.selector;

                // Argument shifting
                if ( typeof flatten === 'string' ) {
                    alwaysNew = fn;
                    fn = type;
                    type = flatten;
                    flatten = false;
                }

                for ( i=0, ien=context.length ; i<ien ; i++ ) {
                    var apiInst = new _Api( context[i] );

                    if ( type === 'table' ) {
                        ret = fn.call( apiInst, context[i], i );

                        if ( ret !== undefined ) {
                            a.push( ret );
                        }
                    }
                    else if ( type === 'columns' || type === 'rows' ) {
                        // this has same length as context - one entry for each table
                        ret = fn.call( apiInst, context[i], this[i], i );

                        if ( ret !== undefined ) {
                            a.push( ret );
                        }
                    }
                    else if ( type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
                        // columns and rows share the same structure.
                        // 'this' is an array of column indexes for each context
                        items = this[i];

                        if ( type === 'column-rows' ) {
                            rows = _selector_row_indexes( context[i], selector.opts );
                        }

                        for ( j=0, jen=items.length ; j<jen ; j++ ) {
                            item = items[j];

                            if ( type === 'cell' ) {
                                ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
                            }
                            else {
                                ret = fn.call( apiInst, context[i], item, i, j, rows );
                            }

                            if ( ret !== undefined ) {
                                a.push( ret );
                            }
                        }
                    }
                }

                if ( a.length || alwaysNew ) {
                    var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
                    var apiSelector = api.selector;
                    apiSelector.rows = selector.rows;
                    apiSelector.cols = selector.cols;
                    apiSelector.opts = selector.opts;
                    return api;
                }
                return this;
            },


            lastIndexOf: __arrayProto.lastIndexOf || function (obj, start)
            {
                // Bit cheeky...
                return this.indexOf.apply( this.toArray.reverse(), arguments );
            },


            length:  0,


            map: function ( fn )
            {
                var a = [];

                if ( __arrayProto.map ) {
                    a = __arrayProto.map.call( this, fn, this );
                }
                else {
                    // Compatibility for browsers without EMCA-252-5 (JS 1.6)
                    for ( var i=0, ien=this.length ; i<ien ; i++ ) {
                        a.push( fn.call( this, this[i], i ) );
                    }
                }

                return new _Api( this.context, a );
            },


            pluck: function ( prop )
            {
                return this.map( function ( el ) {
                    return el[ prop ];
                } );
            },

            pop:     __arrayProto.pop,


            push:    __arrayProto.push,


            // Does not return an API instance
            reduce: __arrayProto.reduce || function ( fn, init )
            {
                return _fnReduce( this, fn, init, 0, this.length, 1 );
            },


            reduceRight: __arrayProto.reduceRight || function ( fn, init )
            {
                return _fnReduce( this, fn, init, this.length-1, -1, -1 );
            },


            reverse: __arrayProto.reverse,


            // Object with rows, columns and opts
            selector: null,


            shift:   __arrayProto.shift,


            sort:    __arrayProto.sort, // ? name - order?


            splice:  __arrayProto.splice,


            toArray: function ()
            {
                return __arrayProto.slice.call( this );
            },


            to$: function ()
            {
                return $( this );
            },


            toJQuery: function ()
            {
                return $( this );
            },


            unique: function ()
            {
                return new _Api( this.context, _unique(this) );
            },


            unshift: __arrayProto.unshift
        };


        _Api.extend = function ( scope, obj, ext )
        {
            // Only extend API instances and static properties of the API
            if ( ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
                return;
            }

            var
                i, ien,
                j, jen,
                struct, inner,
                methodScoping = function ( scope, fn, struc ) {
                    return function () {
                        var ret = fn.apply( scope, arguments );

                        // Method extension
                        _Api.extend( ret, ret, struc.methodExt );
                        return ret;
                    };
                };

            for ( i=0, ien=ext.length ; i<ien ; i++ ) {
                struct = ext[i];

                // Value
                obj[ struct.name ] = typeof struct.val === 'function' ?
                    methodScoping( scope, struct.val, struct ) :
                    $.isPlainObject( struct.val ) ?
                    {} :
                        struct.val;

                obj[ struct.name ].__dt_wrapper = true;

                // Property extension
                _Api.extend( scope, obj[ struct.name ], struct.propExt );
            }
        };


        // @todo - Is there need for an augment function?
        // _Api.augment = function ( inst, name )
        // {
        //  // Find src object in the structure from the name
        //  var parts = name.split('.');

        //  _Api.extend( inst, obj );
        // };


        //     [
        //       {
        //         name:      'data'                -- string   - Property name
        //         val:       function () {},       -- function - Api method (or undefined if just an object
        //         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
        //         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
        //       },
        //       {
        //         name:     'row'
        //         val:       {},
        //         methodExt: [ ... ],
        //         propExt:   [
        //           {
        //             name:      'data'
        //             val:       function () {},
        //             methodExt: [ ... ],
        //             propExt:   [ ... ]
        //           },
        //           ...
        //         ]
        //       }
        //     ]

        _Api.register = _api_register = function ( name, val )
        {
            if ( $.isArray( name ) ) {
                for ( var j=0, jen=name.length ; j<jen ; j++ ) {
                    _Api.register( name[j], val );
                }
                return;
            }

            var
                i, ien,
                heir = name.split('.'),
                struct = __apiStruct,
                key, method;

            var find = function ( src, name ) {
                for ( var i=0, ien=src.length ; i<ien ; i++ ) {
                    if ( src[i].name === name ) {
                        return src[i];
                    }
                }
                return null;
            };

            for ( i=0, ien=heir.length ; i<ien ; i++ ) {
                method = heir[i].indexOf('()') !== -1;
                key = method ?
                    heir[i].replace('()', '') :
                    heir[i];

                var src = find( struct, key );
                if ( ! src ) {
                    src = {
                        name:      key,
                        val:       {},
                        methodExt: [],
                        propExt:   []
                    };
                    struct.push( src );
                }

                if ( i === ien-1 ) {
                    src.val = val;
                }
                else {
                    struct = method ?
                        src.methodExt :
                        src.propExt;
                }
            }
        };


        _Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
            _Api.register( pluralName, val );

            _Api.register( singularName, function () {
                var ret = val.apply( this, arguments );

                if ( ret === this ) {
                    // Returned item is the API instance that was passed in, return it
                    return this;
                }
                else if ( ret instanceof _Api ) {
                    // New API instance returned, want the value from the first item
                    // in the returned array for the singular result.
                    return ret.length ?
                        $.isArray( ret[0] ) ?
                            new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
                            ret[0] :
                        undefined;
                }

                // Non-API return - just fire it back
                return ret;
            } );
        };


        /**
         * Selector for HTML tables. Apply the given selector to the give array of
         * DataTables settings objects.
         *
         * @param {string|integer} [selector] jQuery selector string or integer
         * @param  {array} Array of DataTables settings objects to be filtered
         * @return {array}
         * @ignore
         */
        var __table_selector = function ( selector, a )
        {
            // Integer is used to pick out a table by index
            if ( typeof selector === 'number' ) {
                return [ a[ selector ] ];
            }

            // Perform a jQuery selector on the table nodes
            var nodes = $.map( a, function (el, i) {
                return el.nTable;
            } );

            return $(nodes)
                .filter( selector )
                .map( function (i) {
                    // Need to translate back from the table node to the settings
                    var idx = $.inArray( this, nodes );
                    return a[ idx ];
                } )
                .toArray();
        };



        /**
         * Context selector for the API's context (i.e. the tables the API instance
         * refers to.
         *
         * @name    DataTable.Api#tables
         * @param {string|integer} [selector] Selector to pick which tables the iterator
         *   should operate on. If not given, all tables in the current context are
         *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
         *   select multiple tables or as an integer to select a single table.
         * @returns {DataTable.Api} Returns a new API instance if a selector is given.
         */
        _api_register( 'tables()', function ( selector ) {
            // A new instance is created if there was a selector specified
            return selector ?
                new _Api( __table_selector( selector, this.context ) ) :
                this;
        } );


        _api_register( 'table()', function ( selector ) {
            var tables = this.tables( selector );
            var ctx = tables.context;

            // Truncate to the first matched table
            return ctx.length ?
                new _Api( ctx[0] ) :
                tables;
        } );


        _api_registerPlural( 'tables().nodes()', 'table().node()' , function () {
            return this.iterator( 'table', function ( ctx ) {
                return ctx.nTable;
            }, 1 );
        } );


        _api_registerPlural( 'tables().body()', 'table().body()' , function () {
            return this.iterator( 'table', function ( ctx ) {
                return ctx.nTBody;
            }, 1 );
        } );


        _api_registerPlural( 'tables().header()', 'table().header()' , function () {
            return this.iterator( 'table', function ( ctx ) {
                return ctx.nTHead;
            }, 1 );
        } );


        _api_registerPlural( 'tables().footer()', 'table().footer()' , function () {
            return this.iterator( 'table', function ( ctx ) {
                return ctx.nTFoot;
            }, 1 );
        } );


        _api_registerPlural( 'tables().containers()', 'table().container()' , function () {
            return this.iterator( 'table', function ( ctx ) {
                return ctx.nTableWrapper;
            }, 1 );
        } );



        /**
         * Redraw the tables in the current context.
         *
         * @param {boolean} [reset=true] Reset (default) or hold the current paging
         *   position. A full re-sort and re-filter is performed when this method is
         *   called, which is why the pagination reset is the default action.
         * @returns {DataTables.Api} this
         */
        _api_register( 'draw()', function ( resetPaging ) {
            return this.iterator( 'table', function ( settings ) {
                _fnReDraw( settings, resetPaging===false );
            } );
        } );



        /**
         * Get the current page index.
         *
         * @return {integer} Current page index (zero based)
         *//**
         * Set the current page.
         *
         * Note that if you attempt to show a page which does not exist, DataTables will
         * not throw an error, but rather reset the paging.
         *
         * @param {integer|string} action The paging action to take. This can be one of:
         *  * `integer` - The page index to jump to
         *  * `string` - An action to take:
         *    * `first` - Jump to first page.
         *    * `next` - Jump to the next page
         *    * `previous` - Jump to previous page
         *    * `last` - Jump to the last page.
         * @returns {DataTables.Api} this
         */
        _api_register( 'page()', function ( action ) {
            if ( action === undefined ) {
                return this.page.info().page; // not an expensive call
            }

            // else, have an action to take on all tables
            return this.iterator( 'table', function ( settings ) {
                _fnPageChange( settings, action );
            } );
        } );


        /**
         * Paging information for the first table in the current context.
         *
         * If you require paging information for another table, use the `table()` method
         * with a suitable selector.
         *
         * @return {object} Object with the following properties set:
         *  * `page` - Current page index (zero based - i.e. the first page is `0`)
         *  * `pages` - Total number of pages
         *  * `start` - Display index for the first record shown on the current page
         *  * `end` - Display index for the last record shown on the current page
         *  * `length` - Display length (number of records). Note that generally `start
         *    + length = end`, but this is not always true, for example if there are
         *    only 2 records to show on the final page, with a length of 10.
         *  * `recordsTotal` - Full data set length
         *  * `recordsDisplay` - Data set length once the current filtering criterion
         *    are applied.
         */
        _api_register( 'page.info()', function ( action ) {
            if ( this.context.length === 0 ) {
                return undefined;
            }

            var
                settings   = this.context[0],
                start      = settings._iDisplayStart,
                len        = settings._iDisplayLength,
                visRecords = settings.fnRecordsDisplay(),
                all        = len === -1;

            return {
                "page":           all ? 0 : Math.floor( start / len ),
                "pages":          all ? 1 : Math.ceil( visRecords / len ),
                "start":          start,
                "end":            settings.fnDisplayEnd(),
                "length":         len,
                "recordsTotal":   settings.fnRecordsTotal(),
                "recordsDisplay": visRecords
            };
        } );


        /**
         * Get the current page length.
         *
         * @return {integer} Current page length. Note `-1` indicates that all records
         *   are to be shown.
         *//**
         * Set the current page length.
         *
         * @param {integer} Page length to set. Use `-1` to show all records.
         * @returns {DataTables.Api} this
         */
        _api_register( 'page.len()', function ( len ) {
            // Note that we can't call this function 'length()' because `length`
            // is a Javascript property of functions which defines how many arguments
            // the function expects.
            if ( len === undefined ) {
                return this.context.length !== 0 ?
                    this.context[0]._iDisplayLength :
                    undefined;
            }

            // else, set the page length
            return this.iterator( 'table', function ( settings ) {
                _fnLengthChange( settings, len );
            } );
        } );



        var __reload = function ( settings, holdPosition, callback ) {
            if ( _fnDataSource( settings ) == 'ssp' ) {
                _fnReDraw( settings, holdPosition );
            }
            else {
                // Trigger xhr
                _fnProcessingDisplay( settings, true );

                _fnBuildAjax( settings, [], function( json ) {
                    _fnClearTable( settings );

                    var data = _fnAjaxDataSrc( settings, json );
                    for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                        _fnAddData( settings, data[i] );
                    }

                    _fnReDraw( settings, holdPosition );
                    _fnProcessingDisplay( settings, false );
                } );
            }

            // Use the draw event to trigger a callback, regardless of if it is an async
            // or sync draw
            if ( callback ) {
                var api = new _Api( settings );

                api.one( 'draw', function () {
                    callback( api.ajax.json() );
                } );
            }
        };


        /**
         * Get the JSON response from the last Ajax request that DataTables made to the
         * server. Note that this returns the JSON from the first table in the current
         * context.
         *
         * @return {object} JSON received from the server.
         */
        _api_register( 'ajax.json()', function () {
            var ctx = this.context;

            if ( ctx.length > 0 ) {
                return ctx[0].json;
            }

            // else return undefined;
        } );


        /**
         * Get the data submitted in the last Ajax request
         */
        _api_register( 'ajax.params()', function () {
            var ctx = this.context;

            if ( ctx.length > 0 ) {
                return ctx[0].oAjaxData;
            }

            // else return undefined;
        } );


        /**
         * Reload tables from the Ajax data source. Note that this function will
         * automatically re-draw the table when the remote data has been loaded.
         *
         * @param {boolean} [reset=true] Reset (default) or hold the current paging
         *   position. A full re-sort and re-filter is performed when this method is
         *   called, which is why the pagination reset is the default action.
         * @returns {DataTables.Api} this
         */
        _api_register( 'ajax.reload()', function ( callback, resetPaging ) {
            return this.iterator( 'table', function (settings) {
                __reload( settings, resetPaging===false, callback );
            } );
        } );


        /**
         * Get the current Ajax URL. Note that this returns the URL from the first
         * table in the current context.
         *
         * @return {string} Current Ajax source URL
         *//**
         * Set the Ajax URL. Note that this will set the URL for all tables in the
         * current context.
         *
         * @param {string} url URL to set.
         * @returns {DataTables.Api} this
         */
        _api_register( 'ajax.url()', function ( url ) {
            var ctx = this.context;

            if ( url === undefined ) {
                // get
                if ( ctx.length === 0 ) {
                    return undefined;
                }
                ctx = ctx[0];

                return ctx.ajax ?
                    $.isPlainObject( ctx.ajax ) ?
                        ctx.ajax.url :
                        ctx.ajax :
                    ctx.sAjaxSource;
            }

            // set
            return this.iterator( 'table', function ( settings ) {
                if ( $.isPlainObject( settings.ajax ) ) {
                    settings.ajax.url = url;
                }
                else {
                    settings.ajax = url;
                }
                // No need to consider sAjaxSource here since DataTables gives priority
                // to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
                // value of `sAjaxSource` redundant.
            } );
        } );


        /**
         * Load data from the newly set Ajax URL. Note that this method is only
         * available when `ajax.url()` is used to set a URL. Additionally, this method
         * has the same effect as calling `ajax.reload()` but is provided for
         * convenience when setting a new URL. Like `ajax.reload()` it will
         * automatically redraw the table once the remote data has been loaded.
         *
         * @returns {DataTables.Api} this
         */
        _api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
            // Same as a reload, but makes sense to present it for easy access after a
            // url change
            return this.iterator( 'table', function ( ctx ) {
                __reload( ctx, resetPaging===false, callback );
            } );
        } );




        var _selector_run = function ( selector, select )
        {
            var
                out = [], res,
                a, i, ien, j, jen,
                selectorType = typeof selector;

            // Can't just check for isArray here, as an API or jQuery instance might be
            // given with their array like look
            if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
                selector = [ selector ];
            }

            for ( i=0, ien=selector.length ; i<ien ; i++ ) {
                a = selector[i] && selector[i].split ?
                    selector[i].split(',') :
                    [ selector[i] ];

                for ( j=0, jen=a.length ; j<jen ; j++ ) {
                    res = select( typeof a[j] === 'string' ? $.trim(a[j]) : a[j] );

                    if ( res && res.length ) {
                        out.push.apply( out, res );
                    }
                }
            }

            return out;
        };


        var _selector_opts = function ( opts )
        {
            if ( ! opts ) {
                opts = {};
            }

            // Backwards compatibility for 1.9- which used the terminology filter rather
            // than search
            if ( opts.filter && ! opts.search ) {
                opts.search = opts.filter;
            }

            return {
                search: opts.search || 'none',
                order:  opts.order  || 'current',
                page:   opts.page   || 'all'
            };
        };


        var _selector_first = function ( inst )
        {
            // Reduce the API instance to the first item found
            for ( var i=0, ien=inst.length ; i<ien ; i++ ) {
                if ( inst[i].length > 0 ) {
                    // Assign the first element to the first item in the instance
                    // and truncate the instance and context
                    inst[0] = inst[i];
                    inst.length = 1;
                    inst.context = [ inst.context[i] ];

                    return inst;
                }
            }

            // Not found - return an empty instance
            inst.length = 0;
            return inst;
        };


        var _selector_row_indexes = function ( settings, opts )
        {
            var
                i, ien, tmp, a=[],
                displayFiltered = settings.aiDisplay,
                displayMaster = settings.aiDisplayMaster;

            var
                search = opts.search,  // none, applied, removed
                order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
                page   = opts.page;    // all, current

            if ( _fnDataSource( settings ) == 'ssp' ) {
                // In server-side processing mode, most options are irrelevant since
                // rows not shown don't exist and the index order is the applied order
                // Removed is a special case - for consistency just return an empty
                // array
                return search === 'removed' ?
                    [] :
                    _range( 0, displayMaster.length );
            }
            else if ( page == 'current' ) {
                // Current page implies that order=current and fitler=applied, since it is
                // fairly senseless otherwise, regardless of what order and search actually
                // are
                for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
                    a.push( displayFiltered[i] );
                }
            }
            else if ( order == 'current' || order == 'applied' ) {
                a = search == 'none' ?
                    displayMaster.slice() :                      // no search
                    search == 'applied' ?
                        displayFiltered.slice() :                // applied search
                        $.map( displayMaster, function (el, i) { // removed search
                            return $.inArray( el, displayFiltered ) === -1 ? el : null;
                        } );
            }
            else if ( order == 'index' || order == 'original' ) {
                for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
                    if ( search == 'none' ) {
                        a.push( i );
                    }
                    else { // applied | removed
                        tmp = $.inArray( i, displayFiltered );

                        if ((tmp === -1 && search == 'removed') ||
                            (tmp >= 0   && search == 'applied') )
                        {
                            a.push( i );
                        }
                    }
                }
            }

            return a;
        };


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Rows
         *
         * {}          - no selector - use all available rows
         * {integer}   - row aoData index
         * {node}      - TR node
         * {string}    - jQuery selector to apply to the TR elements
         * {array}     - jQuery array of nodes, or simply an array of TR nodes
         *
         */


        var __row_selector = function ( settings, selector, opts )
        {
            return _selector_run( selector, function ( sel ) {
                var selInt = _intVal( sel );
                var i, ien;

                // Short cut - selector is a number and no options provided (default is
                // all records, so no need to check if the index is in there, since it
                // must be - dev error if the index doesn't exist).
                if ( selInt !== null && ! opts ) {
                    return [ selInt ];
                }

                var rows = _selector_row_indexes( settings, opts );

                if ( selInt !== null && $.inArray( selInt, rows ) !== -1 ) {
                    // Selector - integer
                    return [ selInt ];
                }
                else if ( ! sel ) {
                    // Selector - none
                    return rows;
                }

                // Selector - function
                if ( typeof sel === 'function' ) {
                    return $.map( rows, function (idx) {
                        var row = settings.aoData[ idx ];
                        return sel( idx, row._aData, row.nTr ) ? idx : null;
                    } );
                }

                // Get nodes in the order from the `rows` array with null values removed
                var nodes = _removeEmpty(
                    _pluck_order( settings.aoData, rows, 'nTr' )
                );

                // Selector - node
                if ( sel.nodeName ) {
                    if ( $.inArray( sel, nodes ) !== -1 ) {
                        return [ sel._DT_RowIndex ]; // sel is a TR node that is in the table
                                                     // and DataTables adds a prop for fast lookup
                    }
                }

                // Selector - jQuery selector string, array of nodes or jQuery object/
                // As jQuery's .filter() allows jQuery objects to be passed in filter,
                // it also allows arrays, so this will cope with all three options
                return $(nodes)
                    .filter( sel )
                    .map( function () {
                        return this._DT_RowIndex;
                    } )
                    .toArray();
            } );
        };


        /**
         *
         */
        _api_register( 'rows()', function ( selector, opts ) {
            // argument shifting
            if ( selector === undefined ) {
                selector = '';
            }
            else if ( $.isPlainObject( selector ) ) {
                opts = selector;
                selector = '';
            }

            opts = _selector_opts( opts );

            var inst = this.iterator( 'table', function ( settings ) {
                return __row_selector( settings, selector, opts );
            }, 1 );

            // Want argument shifting here and in __row_selector?
            inst.selector.rows = selector;
            inst.selector.opts = opts;

            return inst;
        } );


        _api_register( 'rows().nodes()', function () {
            return this.iterator( 'row', function ( settings, row ) {
                return settings.aoData[ row ].nTr || undefined;
            }, 1 );
        } );

        _api_register( 'rows().data()', function () {
            return this.iterator( true, 'rows', function ( settings, rows ) {
                return _pluck_order( settings.aoData, rows, '_aData' );
            }, 1 );
        } );

        _api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
            return this.iterator( 'row', function ( settings, row ) {
                var r = settings.aoData[ row ];
                return type === 'search' ? r._aFilterData : r._aSortData;
            }, 1 );
        } );

        _api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
            return this.iterator( 'row', function ( settings, row ) {
                _fnInvalidate( settings, row, src );
            } );
        } );

        _api_registerPlural( 'rows().indexes()', 'row().index()', function () {
            return this.iterator( 'row', function ( settings, row ) {
                return row;
            }, 1 );
        } );

        _api_registerPlural( 'rows().remove()', 'row().remove()', function () {
            var that = this;

            return this.iterator( 'row', function ( settings, row, thatIdx ) {
                var data = settings.aoData;

                data.splice( row, 1 );

                // Update the _DT_RowIndex parameter on all rows in the table
                for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                    if ( data[i].nTr !== null ) {
                        data[i].nTr._DT_RowIndex = i;
                    }
                }

                // Remove the target row from the search array
                var displayIndex = $.inArray( row, settings.aiDisplay );

                // Delete from the display arrays
                _fnDeleteIndex( settings.aiDisplayMaster, row );
                _fnDeleteIndex( settings.aiDisplay, row );
                _fnDeleteIndex( that[ thatIdx ], row, false ); // maintain local indexes

                // Check for an 'overflow' they case for displaying the table
                _fnLengthOverflow( settings );
            } );
        } );


        _api_register( 'rows.add()', function ( rows ) {
            var newRows = this.iterator( 'table', function ( settings ) {
                var row, i, ien;
                var out = [];

                for ( i=0, ien=rows.length ; i<ien ; i++ ) {
                    row = rows[i];

                    if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
                        out.push( _fnAddTr( settings, row )[0] );
                    }
                    else {
                        out.push( _fnAddData( settings, row ) );
                    }
                }

                return out;
            }, 1 );

            // Return an Api.rows() extended instance, so rows().nodes() etc can be used
            var modRows = this.rows( -1 );
            modRows.pop();
            modRows.push.apply( modRows, newRows.toArray() );

            return modRows;
        } );





        /**
         *
         */
        _api_register( 'row()', function ( selector, opts ) {
            return _selector_first( this.rows( selector, opts ) );
        } );


        _api_register( 'row().data()', function ( data ) {
            var ctx = this.context;

            if ( data === undefined ) {
                // Get
                return ctx.length && this.length ?
                    ctx[0].aoData[ this[0] ]._aData :
                    undefined;
            }

            // Set
            ctx[0].aoData[ this[0] ]._aData = data;

            // Automatically invalidate
            _fnInvalidate( ctx[0], this[0], 'data' );

            return this;
        } );


        _api_register( 'row().node()', function () {
            var ctx = this.context;

            return ctx.length && this.length ?
            ctx[0].aoData[ this[0] ].nTr || null :
                null;
        } );


        _api_register( 'row.add()', function ( row ) {
            // Allow a jQuery object to be passed in - only a single row is added from
            // it though - the first element in the set
            if ( row instanceof $ && row.length ) {
                row = row[0];
            }

            var rows = this.iterator( 'table', function ( settings ) {
                if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
                    return _fnAddTr( settings, row )[0];
                }
                return _fnAddData( settings, row );
            } );

            // Return an Api.rows() extended instance, with the newly added row selected
            return this.row( rows[0] );
        } );



        var __details_add = function ( ctx, row, data, klass )
        {
            // Convert to array of TR elements
            var rows = [];
            var addRow = function ( r, k ) {
                // If we get a TR element, then just add it directly - up to the dev
                // to add the correct number of columns etc
                if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
                    rows.push( r );
                }
                else {
                    // Otherwise create a row with a wrapper
                    var created = $('<tr><td/></tr>').addClass( k );
                    $('td', created)
                        .addClass( k )
                        .html( r )
                        [0].colSpan = _fnVisbleColumns( ctx );

                    rows.push( created[0] );
                }
            };

            if ( $.isArray( data ) || data instanceof $ ) {
                for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                    addRow( data[i], klass );
                }
            }
            else {
                addRow( data, klass );
            }

            if ( row._details ) {
                row._details.remove();
            }

            row._details = $(rows);

            // If the children were already shown, that state should be retained
            if ( row._detailsShow ) {
                row._details.insertAfter( row.nTr );
            }
        };


        var __details_remove = function ( api, idx )
        {
            var ctx = api.context;

            if ( ctx.length ) {
                var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];

                if ( row._details ) {
                    row._details.remove();

                    row._detailsShow = undefined;
                    row._details = undefined;
                }
            }
        };


        var __details_display = function ( api, show ) {
            var ctx = api.context;

            if ( ctx.length && api.length ) {
                var row = ctx[0].aoData[ api[0] ];

                if ( row._details ) {
                    row._detailsShow = show;

                    if ( show ) {
                        row._details.insertAfter( row.nTr );
                    }
                    else {
                        row._details.detach();
                    }

                    __details_events( ctx[0] );
                }
            }
        };


        var __details_events = function ( settings )
        {
            var api = new _Api( settings );
            var namespace = '.dt.DT_details';
            var drawEvent = 'draw'+namespace;
            var colvisEvent = 'column-visibility'+namespace;
            var destroyEvent = 'destroy'+namespace;
            var data = settings.aoData;

            api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );

            if ( _pluck( data, '_details' ).length > 0 ) {
                // On each draw, insert the required elements into the document
                api.on( drawEvent, function ( e, ctx ) {
                    if ( settings !== ctx ) {
                        return;
                    }

                    api.rows( {page:'current'} ).eq(0).each( function (idx) {
                        // Internal data grab
                        var row = data[ idx ];

                        if ( row._detailsShow ) {
                            row._details.insertAfter( row.nTr );
                        }
                    } );
                } );

                // Column visibility change - update the colspan
                api.on( colvisEvent, function ( e, ctx, idx, vis ) {
                    if ( settings !== ctx ) {
                        return;
                    }

                    // Update the colspan for the details rows (note, only if it already has
                    // a colspan)
                    var row, visible = _fnVisbleColumns( ctx );

                    for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                        row = data[i];

                        if ( row._details ) {
                            row._details.children('td[colspan]').attr('colspan', visible );
                        }
                    }
                } );

                // Table destroyed - nuke any child rows
                api.on( destroyEvent, function ( e, ctx ) {
                    if ( settings !== ctx ) {
                        return;
                    }

                    for ( var i=0, ien=data.length ; i<ien ; i++ ) {
                        if ( data[i]._details ) {
                            __details_remove( api, i );
                        }
                    }
                } );
            }
        };

        // Strings for the method names to help minification
        var _emp = '';
        var _child_obj = _emp+'row().child';
        var _child_mth = _child_obj+'()';

        // data can be:
        //  tr
        //  string
        //  jQuery or array of any of the above
        _api_register( _child_mth, function ( data, klass ) {
            var ctx = this.context;

            if ( data === undefined ) {
                // get
                return ctx.length && this.length ?
                    ctx[0].aoData[ this[0] ]._details :
                    undefined;
            }
            else if ( data === true ) {
                // show
                this.child.show();
            }
            else if ( data === false ) {
                // remove
                __details_remove( this );
            }
            else if ( ctx.length && this.length ) {
                // set
                __details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
            }

            return this;
        } );


        _api_register( [
            _child_obj+'.show()',
            _child_mth+'.show()' // only when `child()` was called with parameters (without
        ], function ( show ) {   // it returns an object and this method is not executed)
            __details_display( this, true );
            return this;
        } );


        _api_register( [
            _child_obj+'.hide()',
            _child_mth+'.hide()' // only when `child()` was called with parameters (without
        ], function () {         // it returns an object and this method is not executed)
            __details_display( this, false );
            return this;
        } );


        _api_register( [
            _child_obj+'.remove()',
            _child_mth+'.remove()' // only when `child()` was called with parameters (without
        ], function () {           // it returns an object and this method is not executed)
            __details_remove( this );
            return this;
        } );


        _api_register( _child_obj+'.isShown()', function () {
            var ctx = this.context;

            if ( ctx.length && this.length ) {
                // _detailsShown as false or undefined will fall through to return false
                return ctx[0].aoData[ this[0] ]._detailsShow || false;
            }
            return false;
        } );



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Columns
         *
         * {integer}           - column index (>=0 count from left, <0 count from right)
         * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
         * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
         * "{string}:name"     - column name
         * "{string}"          - jQuery selector on column header nodes
         *
         */

        // can be an array of these items, comma separated list, or an array of comma
        // separated lists

        var __re_column_selector = /^(.+):(name|visIdx|visible)$/;


        // r1 and r2 are redundant - but it means that the parameters match for the
        // iterator callback in columns().data()
        var __columnData = function ( settings, column, r1, r2, rows ) {
            var a = [];
            for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
                a.push( _fnGetCellData( settings, rows[row], column ) );
            }
            return a;
        };


        var __column_selector = function ( settings, selector, opts )
        {
            var
                columns = settings.aoColumns,
                names = _pluck( columns, 'sName' ),
                nodes = _pluck( columns, 'nTh' );

            return _selector_run( selector, function ( s ) {
                var selInt = _intVal( s );

                // Selector - all
                if ( s === '' ) {
                    return _range( columns.length );
                }

                // Selector - index
                if ( selInt !== null ) {
                    return [ selInt >= 0 ?
                        selInt : // Count from left
                    columns.length + selInt // Count from right (+ because its a negative value)
                    ];
                }

                // Selector = function
                if ( typeof s === 'function' ) {
                    var rows = _selector_row_indexes( settings, opts );

                    return $.map( columns, function (col, idx) {
                        return s(
                            idx,
                            __columnData( settings, idx, 0, 0, rows ),
                            nodes[ idx ]
                        ) ? idx : null;
                    } );
                }

                // jQuery or string selector
                var match = typeof s === 'string' ?
                    s.match( __re_column_selector ) :
                    '';

                if ( match ) {
                    switch( match[2] ) {
                        case 'visIdx':
                        case 'visible':
                            var idx = parseInt( match[1], 10 );
                            // Visible index given, convert to column index
                            if ( idx < 0 ) {
                                // Counting from the right
                                var visColumns = $.map( columns, function (col,i) {
                                    return col.bVisible ? i : null;
                                } );
                                return [ visColumns[ visColumns.length + idx ] ];
                            }
                            // Counting from the left
                            return [ _fnVisibleToColumnIndex( settings, idx ) ];

                        case 'name':
                            // match by name. `names` is column index complete and in order
                            return $.map( names, function (name, i) {
                                return name === match[1] ? i : null;
                            } );
                    }
                }
                else {
                    // jQuery selector on the TH elements for the columns
                    return $( nodes )
                        .filter( s )
                        .map( function () {
                            return $.inArray( this, nodes ); // `nodes` is column index complete and in order
                        } )
                        .toArray();
                }
            } );
        };


        var __setColumnVis = function ( settings, column, vis, recalc ) {
            var
                cols = settings.aoColumns,
                col  = cols[ column ],
                data = settings.aoData,
                row, cells, i, ien, tr;

            // Get
            if ( vis === undefined ) {
                return col.bVisible;
            }

            // Set
            // No change
            if ( col.bVisible === vis ) {
                return;
            }

            if ( vis ) {
                // Insert column
                // Need to decide if we should use appendChild or insertBefore
                var insertBefore = $.inArray( true, _pluck(cols, 'bVisible'), column+1 );

                for ( i=0, ien=data.length ; i<ien ; i++ ) {
                    tr = data[i].nTr;
                    cells = data[i].anCells;

                    if ( tr ) {
                        // insertBefore can act like appendChild if 2nd arg is null
                        tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
                    }
                }
            }
            else {
                // Remove column
                $( _pluck( settings.aoData, 'anCells', column ) ).detach();
            }

            // Common actions
            col.bVisible = vis;
            _fnDrawHead( settings, settings.aoHeader );
            _fnDrawHead( settings, settings.aoFooter );

            if ( recalc === undefined || recalc ) {
                // Automatically adjust column sizing
                _fnAdjustColumnSizing( settings );

                // Realign columns for scrolling
                if ( settings.oScroll.sX || settings.oScroll.sY ) {
                    _fnScrollDraw( settings );
                }
            }

            _fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis] );

            _fnSaveState( settings );
        };


        /**
         *
         */
        _api_register( 'columns()', function ( selector, opts ) {
            // argument shifting
            if ( selector === undefined ) {
                selector = '';
            }
            else if ( $.isPlainObject( selector ) ) {
                opts = selector;
                selector = '';
            }

            opts = _selector_opts( opts );

            var inst = this.iterator( 'table', function ( settings ) {
                return __column_selector( settings, selector, opts );
            }, 1 );

            // Want argument shifting here and in _row_selector?
            inst.selector.cols = selector;
            inst.selector.opts = opts;

            return inst;
        } );


        /**
         *
         */
        _api_registerPlural( 'columns().header()', 'column().header()', function ( selector, opts ) {
            return this.iterator( 'column', function ( settings, column ) {
                return settings.aoColumns[column].nTh;
            }, 1 );
        } );


        /**
         *
         */
        _api_registerPlural( 'columns().footer()', 'column().footer()', function ( selector, opts ) {
            return this.iterator( 'column', function ( settings, column ) {
                return settings.aoColumns[column].nTf;
            }, 1 );
        } );


        /**
         *
         */
        _api_registerPlural( 'columns().data()', 'column().data()', function () {
            return this.iterator( 'column-rows', __columnData, 1 );
        } );


        _api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
            return this.iterator( 'column', function ( settings, column ) {
                return settings.aoColumns[column].mData;
            }, 1 );
        } );


        _api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
            return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
                return _pluck_order( settings.aoData, rows,
                    type === 'search' ? '_aFilterData' : '_aSortData', column
                );
            }, 1 );
        } );


        _api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
            return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
                return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
            }, 1 );
        } );



        _api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
            return this.iterator( 'column', function ( settings, column ) {
                if ( vis === undefined ) {
                    return settings.aoColumns[ column ].bVisible;
                } // else
                __setColumnVis( settings, column, vis, calc );
            } );
        } );



        _api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
            return this.iterator( 'column', function ( settings, column ) {
                return type === 'visible' ?
                    _fnColumnIndexToVisible( settings, column ) :
                    column;
            }, 1 );
        } );


        // _api_register( 'columns().show()', function () {
        //  var selector = this.selector;
        //  return this.columns( selector.cols, selector.opts ).visible( true );
        // } );


        // _api_register( 'columns().hide()', function () {
        //  var selector = this.selector;
        //  return this.columns( selector.cols, selector.opts ).visible( false );
        // } );



        _api_register( 'columns.adjust()', function () {
            return this.iterator( 'table', function ( settings ) {
                _fnAdjustColumnSizing( settings );
            }, 1 );
        } );


        // Convert from one column index type, to another type
        _api_register( 'column.index()', function ( type, idx ) {
            if ( this.context.length !== 0 ) {
                var ctx = this.context[0];

                if ( type === 'fromVisible' || type === 'toData' ) {
                    return _fnVisibleToColumnIndex( ctx, idx );
                }
                else if ( type === 'fromData' || type === 'toVisible' ) {
                    return _fnColumnIndexToVisible( ctx, idx );
                }
            }
        } );


        _api_register( 'column()', function ( selector, opts ) {
            return _selector_first( this.columns( selector, opts ) );
        } );




        var __cell_selector = function ( settings, selector, opts )
        {
            var data = settings.aoData;
            var rows = _selector_row_indexes( settings, opts );
            var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
            var allCells = $( [].concat.apply([], cells) );
            var row;
            var columns = settings.aoColumns.length;
            var a, i, ien, j, o, host;

            return _selector_run( selector, function ( s ) {
                var fnSelector = typeof s === 'function';

                if ( s === null || s === undefined || fnSelector ) {
                    // All cells and function selectors
                    a = [];

                    for ( i=0, ien=rows.length ; i<ien ; i++ ) {
                        row = rows[i];

                        for ( j=0 ; j<columns ; j++ ) {
                            o = {
                                row: row,
                                column: j
                            };

                            if ( fnSelector ) {
                                // Selector - function
                                host = settings.aoData[ row ];

                                if ( s( o, _fnGetCellData(settings, row, j), host.anCells[j] ) ) {
                                    a.push( o );
                                }
                            }
                            else {
                                // Selector - all
                                a.push( o );
                            }
                        }
                    }

                    return a;
                }

                // Selector - index
                if ( $.isPlainObject( s ) ) {
                    return [s];
                }

                // Selector - jQuery filtered cells
                return allCells
                    .filter( s )
                    .map( function (i, el) {
                        row = el.parentNode._DT_RowIndex;

                        return {
                            row: row,
                            column: $.inArray( el, data[ row ].anCells )
                        };
                    } )
                    .toArray();
            } );
        };




        _api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
            // Argument shifting
            if ( $.isPlainObject( rowSelector ) ) {
                // Indexes
                if ( typeof rowSelector.row !== undefined ) {
                    opts = columnSelector;
                    columnSelector = null;
                }
                else {
                    opts = rowSelector;
                    rowSelector = null;
                }
            }
            if ( $.isPlainObject( columnSelector ) ) {
                opts = columnSelector;
                columnSelector = null;
            }

            // Cell selector
            if ( columnSelector === null || columnSelector === undefined ) {
                return this.iterator( 'table', function ( settings ) {
                    return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
                } );
            }

            // Row + column selector
            var columns = this.columns( columnSelector, opts );
            var rows = this.rows( rowSelector, opts );
            var a, i, ien, j, jen;

            var cells = this.iterator( 'table', function ( settings, idx ) {
                a = [];

                for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
                    for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
                        a.push( {
                            row:    rows[idx][i],
                            column: columns[idx][j]
                        } );
                    }
                }

                return a;
            }, 1 );

            $.extend( cells.selector, {
                cols: columnSelector,
                rows: rowSelector,
                opts: opts
            } );

            return cells;
        } );


        _api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
            return this.iterator( 'cell', function ( settings, row, column ) {
                var cells = settings.aoData[ row ].anCells;
                return cells ?
                    cells[ column ] :
                    undefined;
            }, 1 );
        } );


        _api_register( 'cells().data()', function () {
            return this.iterator( 'cell', function ( settings, row, column ) {
                return _fnGetCellData( settings, row, column );
            }, 1 );
        } );


        _api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
            type = type === 'search' ? '_aFilterData' : '_aSortData';

            return this.iterator( 'cell', function ( settings, row, column ) {
                return settings.aoData[ row ][ type ][ column ];
            }, 1 );
        } );


        _api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
            return this.iterator( 'cell', function ( settings, row, column ) {
                return _fnGetCellData( settings, row, column, type );
            }, 1 );
        } );


        _api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
            return this.iterator( 'cell', function ( settings, row, column ) {
                return {
                    row: row,
                    column: column,
                    columnVisible: _fnColumnIndexToVisible( settings, column )
                };
            }, 1 );
        } );


        _api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
            return this.iterator( 'cell', function ( settings, row, column ) {
                _fnInvalidate( settings, row, src, column );
            } );
        } );



        _api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
            return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
        } );


        _api_register( 'cell().data()', function ( data ) {
            var ctx = this.context;
            var cell = this[0];

            if ( data === undefined ) {
                // Get
                return ctx.length && cell.length ?
                    _fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
                    undefined;
            }

            // Set
            _fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
            _fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );

            return this;
        } );



        /**
         * Get current ordering (sorting) that has been applied to the table.
         *
         * @returns {array} 2D array containing the sorting information for the first
         *   table in the current context. Each element in the parent array represents
         *   a column being sorted upon (i.e. multi-sorting with two columns would have
         *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
         *   the column index that the sorting condition applies to, the second is the
         *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
         *   index of the sorting order from the `column.sorting` initialisation array.
         *//**
         * Set the ordering for the table.
         *
         * @param {integer} order Column index to sort upon.
         * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
         * @returns {DataTables.Api} this
         *//**
         * Set the ordering for the table.
         *
         * @param {array} order 1D array of sorting information to be applied.
         * @param {array} [...] Optional additional sorting conditions
         * @returns {DataTables.Api} this
         *//**
         * Set the ordering for the table.
         *
         * @param {array} order 2D array of sorting information to be applied.
         * @returns {DataTables.Api} this
         */
        _api_register( 'order()', function ( order, dir ) {
            var ctx = this.context;

            if ( order === undefined ) {
                // get
                return ctx.length !== 0 ?
                    ctx[0].aaSorting :
                    undefined;
            }

            // set
            if ( typeof order === 'number' ) {
                // Simple column / direction passed in
                order = [ [ order, dir ] ];
            }
            else if ( ! $.isArray( order[0] ) ) {
                // Arguments passed in (list of 1D arrays)
                order = Array.prototype.slice.call( arguments );
            }
            // otherwise a 2D array was passed in

            return this.iterator( 'table', function ( settings ) {
                settings.aaSorting = order.slice();
            } );
        } );


        /**
         * Attach a sort listener to an element for a given column
         *
         * @param {node|jQuery|string} node Identifier for the element(s) to attach the
         *   listener to. This can take the form of a single DOM node, a jQuery
         *   collection of nodes or a jQuery selector which will identify the node(s).
         * @param {integer} column the column that a click on this node will sort on
         * @param {function} [callback] callback function when sort is run
         * @returns {DataTables.Api} this
         */
        _api_register( 'order.listener()', function ( node, column, callback ) {
            return this.iterator( 'table', function ( settings ) {
                _fnSortAttachListener( settings, node, column, callback );
            } );
        } );


        // Order by the selected column(s)
        _api_register( [
            'columns().order()',
            'column().order()'
        ], function ( dir ) {
            var that = this;

            return this.iterator( 'table', function ( settings, i ) {
                var sort = [];

                $.each( that[i], function (j, col) {
                    sort.push( [ col, dir ] );
                } );

                settings.aaSorting = sort;
            } );
        } );



        _api_register( 'search()', function ( input, regex, smart, caseInsen ) {
            var ctx = this.context;

            if ( input === undefined ) {
                // get
                return ctx.length !== 0 ?
                    ctx[0].oPreviousSearch.sSearch :
                    undefined;
            }

            // set
            return this.iterator( 'table', function ( settings ) {
                if ( ! settings.oFeatures.bFilter ) {
                    return;
                }

                _fnFilterComplete( settings, $.extend( {}, settings.oPreviousSearch, {
                    "sSearch": input+"",
                    "bRegex":  regex === null ? false : regex,
                    "bSmart":  smart === null ? true  : smart,
                    "bCaseInsensitive": caseInsen === null ? true : caseInsen
                } ), 1 );
            } );
        } );


        _api_registerPlural(
            'columns().search()',
            'column().search()',
            function ( input, regex, smart, caseInsen ) {
                return this.iterator( 'column', function ( settings, column ) {
                    var preSearch = settings.aoPreSearchCols;

                    if ( input === undefined ) {
                        // get
                        return preSearch[ column ].sSearch;
                    }

                    // set
                    if ( ! settings.oFeatures.bFilter ) {
                        return;
                    }

                    $.extend( preSearch[ column ], {
                        "sSearch": input+"",
                        "bRegex":  regex === null ? false : regex,
                        "bSmart":  smart === null ? true  : smart,
                        "bCaseInsensitive": caseInsen === null ? true : caseInsen
                    } );

                    _fnFilterComplete( settings, settings.oPreviousSearch, 1 );
                } );
            }
        );

        /*
         * State API methods
         */

        _api_register( 'state()', function () {
            return this.context.length ?
                this.context[0].oSavedState :
                null;
        } );


        _api_register( 'state.clear()', function () {
            return this.iterator( 'table', function ( settings ) {
                // Save an empty object
                settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
            } );
        } );


        _api_register( 'state.loaded()', function () {
            return this.context.length ?
                this.context[0].oLoadedState :
                null;
        } );


        _api_register( 'state.save()', function () {
            return this.iterator( 'table', function ( settings ) {
                _fnSaveState( settings );
            } );
        } );



        /**
         * Provide a common method for plug-ins to check the version of DataTables being
         * used, in order to ensure compatibility.
         *
         *  @param {string} version Version string to check for, in the format "X.Y.Z".
         *    Note that the formats "X" and "X.Y" are also acceptable.
         *  @returns {boolean} true if this version of DataTables is greater or equal to
         *    the required version, or false if this version of DataTales is not
         *    suitable
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
         */
        DataTable.versionCheck = DataTable.fnVersionCheck = function( version )
        {
            var aThis = DataTable.version.split('.');
            var aThat = version.split('.');
            var iThis, iThat;

            for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
                iThis = parseInt( aThis[i], 10 ) || 0;
                iThat = parseInt( aThat[i], 10 ) || 0;

                // Parts are the same, keep comparing
                if (iThis === iThat) {
                    continue;
                }

                // Parts are different, return immediately
                return iThis > iThat;
            }

            return true;
        };


        /**
         * Check if a `<table>` node is a DataTable table already or not.
         *
         *  @param {node|jquery|string} table Table node, jQuery object or jQuery
         *      selector for the table to test. Note that if more than more than one
         *      table is passed on, only the first will be checked
         *  @returns {boolean} true the table given is a DataTable, or false otherwise
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
     *      $('#example').dataTable();
     *    }
         */
        DataTable.isDataTable = DataTable.fnIsDataTable = function ( table )
        {
            var t = $(table).get(0);
            var is = false;

            $.each( DataTable.settings, function (i, o) {
                if ( o.nTable === t || o.nScrollHead === t || o.nScrollFoot === t ) {
                    is = true;
                }
            } );

            return is;
        };


        /**
         * Get all DataTable tables that have been initialised - optionally you can
         * select to get only currently visible tables.
         *
         *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
         *    or visible tables only.
         *  @returns {array} Array of `table` nodes (not DataTable instances) which are
         *    DataTables
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    $.each( $.fn.dataTable.tables(true), function () {
     *      $(table).DataTable().columns.adjust();
     *    } );
         */
        DataTable.tables = DataTable.fnTables = function ( visible )
        {
            return $.map( DataTable.settings, function (o) {
                if ( !visible || (visible && $(o.nTable).is(':visible')) ) {
                    return o.nTable;
                }
            } );
        };


        /**
         * DataTables utility methods
         *
         * This namespace provides helper methods that DataTables uses internally to
         * create a DataTable, but which are not exclusively used only for DataTables.
         * These methods can be used by extension authors to save the duplication of
         * code.
         *
         *  @namespace
         */
        DataTable.util = {
            /**
             * Throttle the calls to a function. Arguments and context are maintained
             * for the throttled function.
             *
             * @param {function} fn Function to be called
             * @param {integer} freq Call frequency in mS
             * @return {function} Wrapped function
             */
            throttle: _fnThrottle,


            /**
             * Escape a string such that it can be used in a regular expression
             *
             *  @param {string} sVal string to escape
             *  @returns {string} escaped string
             */
            escapeRegex: _fnEscapeRegex
        };


        /**
         * Convert from camel case parameters to Hungarian notation. This is made public
         * for the extensions to provide the same ability as DataTables core to accept
         * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
         * parameters.
         *
         *  @param {object} src The model object which holds all parameters that can be
         *    mapped.
         *  @param {object} user The object to convert from camel case to Hungarian.
         *  @param {boolean} force When set to `true`, properties which already have a
         *    Hungarian value in the `user` object will be overwritten. Otherwise they
         *    won't be.
         */
        DataTable.camelToHungarian = _fnCamelToHungarian;



        /**
         *
         */
        _api_register( '$()', function ( selector, opts ) {
            var
                rows   = this.rows( opts ).nodes(), // Get all rows
                jqRows = $(rows);

            return $( [].concat(
                jqRows.filter( selector ).toArray(),
                jqRows.find( selector ).toArray()
            ) );
        } );


        // jQuery functions to operate on the tables
        $.each( [ 'on', 'one', 'off' ], function (i, key) {
            _api_register( key+'()', function ( /* event, handler */ ) {
                var args = Array.prototype.slice.call(arguments);

                // Add the `dt` namespace automatically if it isn't already present
                if ( ! args[0].match(/\.dt\b/) ) {
                    args[0] += '.dt';
                }

                var inst = $( this.tables().nodes() );
                inst[key].apply( inst, args );
                return this;
            } );
        } );


        _api_register( 'clear()', function () {
            return this.iterator( 'table', function ( settings ) {
                _fnClearTable( settings );
            } );
        } );


        _api_register( 'settings()', function () {
            return new _Api( this.context, this.context );
        } );


        _api_register( 'data()', function () {
            return this.iterator( 'table', function ( settings ) {
                return _pluck( settings.aoData, '_aData' );
            } ).flatten();
        } );


        _api_register( 'destroy()', function ( remove ) {
            remove = remove || false;

            return this.iterator( 'table', function ( settings ) {
                var orig      = settings.nTableWrapper.parentNode;
                var classes   = settings.oClasses;
                var table     = settings.nTable;
                var tbody     = settings.nTBody;
                var thead     = settings.nTHead;
                var tfoot     = settings.nTFoot;
                var jqTable   = $(table);
                var jqTbody   = $(tbody);
                var jqWrapper = $(settings.nTableWrapper);
                var rows      = $.map( settings.aoData, function (r) { return r.nTr; } );
                var i, ien;

                // Flag to note that the table is currently being destroyed - no action
                // should be taken
                settings.bDestroying = true;

                // Fire off the destroy callbacks for plug-ins etc
                _fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings] );

                // If not being removed from the document, make all columns visible
                if ( ! remove ) {
                    new _Api( settings ).columns().visible( true );
                }

                // Blitz all `DT` namespaced events (these are internal events, the
                // lowercase, `dt` events are user subscribed and they are responsible
                // for removing them
                jqWrapper.unbind('.DT').find(':not(tbody *)').unbind('.DT');
                $(window).unbind('.DT-'+settings.sInstance);

                // When scrolling we had to break the table up - restore it
                if ( table != thead.parentNode ) {
                    jqTable.children('thead').detach();
                    jqTable.append( thead );
                }

                if ( tfoot && table != tfoot.parentNode ) {
                    jqTable.children('tfoot').detach();
                    jqTable.append( tfoot );
                }

                // Remove the DataTables generated nodes, events and classes
                jqTable.detach();
                jqWrapper.detach();

                settings.aaSorting = [];
                settings.aaSortingFixed = [];
                _fnSortingClasses( settings );

                $( rows ).removeClass( settings.asStripeClasses.join(' ') );

                $('th, td', thead).removeClass( classes.sSortable+' '+
                    classes.sSortableAsc+' '+classes.sSortableDesc+' '+classes.sSortableNone
                );

                if ( settings.bJUI ) {
                    $('th span.'+classes.sSortIcon+ ', td span.'+classes.sSortIcon, thead).detach();
                    $('th, td', thead).each( function () {
                        var wrapper = $('div.'+classes.sSortJUIWrapper, this);
                        $(this).append( wrapper.contents() );
                        wrapper.detach();
                    } );
                }

                if ( ! remove && orig ) {
                    // insertBefore acts like appendChild if !arg[1]
                    orig.insertBefore( table, settings.nTableReinsertBefore );
                }

                // Add the TR elements back into the table in their original order
                jqTbody.children().detach();
                jqTbody.append( rows );

                // Restore the width of the original table - was read from the style property,
                // so we can restore directly to that
                jqTable
                    .css( 'width', settings.sDestroyWidth )
                    .removeClass( classes.sTable );

                // If the were originally stripe classes - then we add them back here.
                // Note this is not fool proof (for example if not all rows had stripe
                // classes - but it's a good effort without getting carried away
                ien = settings.asDestroyStripes.length;

                if ( ien ) {
                    jqTbody.children().each( function (i) {
                        $(this).addClass( settings.asDestroyStripes[i % ien] );
                    } );
                }

                /* Remove the settings object from the settings array */
                var idx = $.inArray( settings, DataTable.settings );
                if ( idx !== -1 ) {
                    DataTable.settings.splice( idx, 1 );
                }
            } );
        } );


        /**
         * Version string for plug-ins to check compatibility. Allowed format is
         * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
         * only for non-release builds. See http://semver.org/ for more information.
         *  @member
         *  @type string
         *  @default Version number
         */
        DataTable.version = "1.10.4";

        /**
         * Private data store, containing all of the settings objects that are
         * created for the tables on a given page.
         *
         * Note that the `DataTable.settings` object is aliased to
         * `jQuery.fn.dataTableExt` through which it may be accessed and
         * manipulated, or `jQuery.fn.dataTable.settings`.
         *  @member
         *  @type array
         *  @default []
         *  @private
         */
        DataTable.settings = [];

        /**
         * Object models container, for the various models that DataTables has
         * available to it. These models define the objects that are used to hold
         * the active state and configuration of the table.
         *  @namespace
         */
        DataTable.models = {};



        /**
         * Template object for the way in which DataTables holds information about
         * search information for the global filter and individual column filters.
         *  @namespace
         */
        DataTable.models.oSearch = {
            /**
             * Flag to indicate if the filtering should be case insensitive or not
             *  @type boolean
             *  @default true
             */
            "bCaseInsensitive": true,

            /**
             * Applied search term
             *  @type string
             *  @default <i>Empty string</i>
             */
            "sSearch": "",

            /**
             * Flag to indicate if the search term should be interpreted as a
             * regular expression (true) or not (false) and therefore and special
             * regex characters escaped.
             *  @type boolean
             *  @default false
             */
            "bRegex": false,

            /**
             * Flag to indicate if DataTables is to use its smart filtering or not.
             *  @type boolean
             *  @default true
             */
            "bSmart": true
        };




        /**
         * Template object for the way in which DataTables holds information about
         * each individual row. This is the object format used for the settings
         * aoData array.
         *  @namespace
         */
        DataTable.models.oRow = {
            /**
             * TR element for the row
             *  @type node
             *  @default null
             */
            "nTr": null,

            /**
             * Array of TD elements for each row. This is null until the row has been
             * created.
             *  @type array nodes
             *  @default []
             */
            "anCells": null,

            /**
             * Data object from the original data source for the row. This is either
             * an array if using the traditional form of DataTables, or an object if
             * using mData options. The exact type will depend on the passed in
             * data from the data source, or will be an array if using DOM a data
             * source.
             *  @type array|object
             *  @default []
             */
            "_aData": [],

            /**
             * Sorting data cache - this array is ostensibly the same length as the
             * number of columns (although each index is generated only as it is
             * needed), and holds the data that is used for sorting each column in the
             * row. We do this cache generation at the start of the sort in order that
             * the formatting of the sort data need be done only once for each cell
             * per sort. This array should not be read from or written to by anything
             * other than the master sorting methods.
             *  @type array
             *  @default null
             *  @private
             */
            "_aSortData": null,

            /**
             * Per cell filtering data cache. As per the sort data cache, used to
             * increase the performance of the filtering in DataTables
             *  @type array
             *  @default null
             *  @private
             */
            "_aFilterData": null,

            /**
             * Filtering data cache. This is the same as the cell filtering cache, but
             * in this case a string rather than an array. This is easily computed with
             * a join on `_aFilterData`, but is provided as a cache so the join isn't
             * needed on every search (memory traded for performance)
             *  @type array
             *  @default null
             *  @private
             */
            "_sFilterRow": null,

            /**
             * Cache of the class name that DataTables has applied to the row, so we
             * can quickly look at this variable rather than needing to do a DOM check
             * on className for the nTr property.
             *  @type string
             *  @default <i>Empty string</i>
             *  @private
             */
            "_sRowStripe": "",

            /**
             * Denote if the original data source was from the DOM, or the data source
             * object. This is used for invalidating data, so DataTables can
             * automatically read data from the original source, unless uninstructed
             * otherwise.
             *  @type string
             *  @default null
             *  @private
             */
            "src": null
        };


        /**
         * Template object for the column information object in DataTables. This object
         * is held in the settings aoColumns array and contains all the information that
         * DataTables needs about each individual column.
         *
         * Note that this object is related to {@link DataTable.defaults.column}
         * but this one is the internal data store for DataTables's cache of columns.
         * It should NOT be manipulated outside of DataTables. Any configuration should
         * be done through the initialisation options.
         *  @namespace
         */
        DataTable.models.oColumn = {
            /**
             * Column index. This could be worked out on-the-fly with $.inArray, but it
             * is faster to just hold it as a variable
             *  @type integer
             *  @default null
             */
            "idx": null,

            /**
             * A list of the columns that sorting should occur on when this column
             * is sorted. That this property is an array allows multi-column sorting
             * to be defined for a column (for example first name / last name columns
             * would benefit from this). The values are integers pointing to the
             * columns to be sorted on (typically it will be a single integer pointing
             * at itself, but that doesn't need to be the case).
             *  @type array
             */
            "aDataSort": null,

            /**
             * Define the sorting directions that are applied to the column, in sequence
             * as the column is repeatedly sorted upon - i.e. the first value is used
             * as the sorting direction when the column if first sorted (clicked on).
             * Sort it again (click again) and it will move on to the next index.
             * Repeat until loop.
             *  @type array
             */
            "asSorting": null,

            /**
             * Flag to indicate if the column is searchable, and thus should be included
             * in the filtering or not.
             *  @type boolean
             */
            "bSearchable": null,

            /**
             * Flag to indicate if the column is sortable or not.
             *  @type boolean
             */
            "bSortable": null,

            /**
             * Flag to indicate if the column is currently visible in the table or not
             *  @type boolean
             */
            "bVisible": null,

            /**
             * Store for manual type assignment using the `column.type` option. This
             * is held in store so we can manipulate the column's `sType` property.
             *  @type string
             *  @default null
             *  @private
             */
            "_sManualType": null,

            /**
             * Flag to indicate if HTML5 data attributes should be used as the data
             * source for filtering or sorting. True is either are.
             *  @type boolean
             *  @default false
             *  @private
             */
            "_bAttrSrc": false,

            /**
             * Developer definable function that is called whenever a cell is created (Ajax source,
             * etc) or processed for input (DOM source). This can be used as a compliment to mRender
             * allowing you to modify the DOM element (add background colour for example) when the
             * element is available.
             *  @type function
             *  @param {element} nTd The TD node that has been created
             *  @param {*} sData The Data for the cell
             *  @param {array|object} oData The data for the whole row
             *  @param {int} iRow The row index for the aoData data store
             *  @default null
             */
            "fnCreatedCell": null,

            /**
             * Function to get data from a cell in a column. You should <b>never</b>
             * access data directly through _aData internally in DataTables - always use
             * the method attached to this property. It allows mData to function as
             * required. This function is automatically assigned by the column
             * initialisation method
             *  @type function
             *  @param {array|object} oData The data array/object for the array
             *    (i.e. aoData[]._aData)
             *  @param {string} sSpecific The specific data type you want to get -
             *    'display', 'type' 'filter' 'sort'
             *  @returns {*} The data for the cell from the given row's data
             *  @default null
             */
            "fnGetData": null,

            /**
             * Function to set data for a cell in the column. You should <b>never</b>
             * set the data directly to _aData internally in DataTables - always use
             * this method. It allows mData to function as required. This function
             * is automatically assigned by the column initialisation method
             *  @type function
             *  @param {array|object} oData The data array/object for the array
             *    (i.e. aoData[]._aData)
             *  @param {*} sValue Value to set
             *  @default null
             */
            "fnSetData": null,

            /**
             * Property to read the value for the cells in the column from the data
             * source array / object. If null, then the default content is used, if a
             * function is given then the return from the function is used.
             *  @type function|int|string|null
             *  @default null
             */
            "mData": null,

            /**
             * Partner property to mData which is used (only when defined) to get
             * the data - i.e. it is basically the same as mData, but without the
             * 'set' option, and also the data fed to it is the result from mData.
             * This is the rendering method to match the data method of mData.
             *  @type function|int|string|null
             *  @default null
             */
            "mRender": null,

            /**
             * Unique header TH/TD element for this column - this is what the sorting
             * listener is attached to (if sorting is enabled.)
             *  @type node
             *  @default null
             */
            "nTh": null,

            /**
             * Unique footer TH/TD element for this column (if there is one). Not used
             * in DataTables as such, but can be used for plug-ins to reference the
             * footer for each column.
             *  @type node
             *  @default null
             */
            "nTf": null,

            /**
             * The class to apply to all TD elements in the table's TBODY for the column
             *  @type string
             *  @default null
             */
            "sClass": null,

            /**
             * When DataTables calculates the column widths to assign to each column,
             * it finds the longest string in each column and then constructs a
             * temporary table and reads the widths from that. The problem with this
             * is that "mmm" is much wider then "iiii", but the latter is a longer
             * string - thus the calculation can go wrong (doing it properly and putting
             * it into an DOM object and measuring that is horribly(!) slow). Thus as
             * a "work around" we provide this option. It will append its value to the
             * text that is found to be the longest string for the column - i.e. padding.
             *  @type string
             */
            "sContentPadding": null,

            /**
             * Allows a default value to be given for a column's data, and will be used
             * whenever a null data source is encountered (this can be because mData
             * is set to null, or because the data source itself is null).
             *  @type string
             *  @default null
             */
            "sDefaultContent": null,

            /**
             * Name for the column, allowing reference to the column by name as well as
             * by index (needs a lookup to work by name).
             *  @type string
             */
            "sName": null,

            /**
             * Custom sorting data type - defines which of the available plug-ins in
             * afnSortData the custom sorting will use - if any is defined.
             *  @type string
             *  @default std
             */
            "sSortDataType": 'std',

            /**
             * Class to be applied to the header element when sorting on this column
             *  @type string
             *  @default null
             */
            "sSortingClass": null,

            /**
             * Class to be applied to the header element when sorting on this column -
             * when jQuery UI theming is used.
             *  @type string
             *  @default null
             */
            "sSortingClassJUI": null,

            /**
             * Title of the column - what is seen in the TH element (nTh).
             *  @type string
             */
            "sTitle": null,

            /**
             * Column sorting and filtering type
             *  @type string
             *  @default null
             */
            "sType": null,

            /**
             * Width of the column
             *  @type string
             *  @default null
             */
            "sWidth": null,

            /**
             * Width of the column when it was first "encountered"
             *  @type string
             *  @default null
             */
            "sWidthOrig": null
        };


        /*
         * Developer note: The properties of the object below are given in Hungarian
         * notation, that was used as the interface for DataTables prior to v1.10, however
         * from v1.10 onwards the primary interface is camel case. In order to avoid
         * breaking backwards compatibility utterly with this change, the Hungarian
         * version is still, internally the primary interface, but is is not documented
         * - hence the @name tags in each doc comment. This allows a Javascript function
         * to create a map from Hungarian notation to camel case (going the other direction
         * would require each property to be listed, which would at around 3K to the size
         * of DataTables, while this method is about a 0.5K hit.
         *
         * Ultimately this does pave the way for Hungarian notation to be dropped
         * completely, but that is a massive amount of work and will break current
         * installs (therefore is on-hold until v2).
         */

        /**
         * Initialisation options that can be given to DataTables at initialisation
         * time.
         *  @namespace
         */
        DataTable.defaults = {
            /**
             * An array of data to use for the table, passed in at initialisation which
             * will be used in preference to any data which is already in the DOM. This is
             * particularly useful for constructing tables purely in Javascript, for
             * example with a custom Ajax call.
             *  @type array
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.data
             *
             *  @example
             *    // Using a 2D array data source
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "data": [
         *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
         *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
         *        ],
         *        "columns": [
         *          { "title": "Engine" },
         *          { "title": "Browser" },
         *          { "title": "Platform" },
         *          { "title": "Version" },
         *          { "title": "Grade" }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using an array of objects as a data source (`data`)
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "data": [
         *          {
         *            "engine":   "Trident",
         *            "browser":  "Internet Explorer 4.0",
         *            "platform": "Win 95+",
         *            "version":  4,
         *            "grade":    "X"
         *          },
         *          {
         *            "engine":   "Trident",
         *            "browser":  "Internet Explorer 5.0",
         *            "platform": "Win 95+",
         *            "version":  5,
         *            "grade":    "C"
         *          }
         *        ],
         *        "columns": [
         *          { "title": "Engine",   "data": "engine" },
         *          { "title": "Browser",  "data": "browser" },
         *          { "title": "Platform", "data": "platform" },
         *          { "title": "Version",  "data": "version" },
         *          { "title": "Grade",    "data": "grade" }
         *        ]
         *      } );
         *    } );
             */
            "aaData": null,


            /**
             * If ordering is enabled, then DataTables will perform a first pass sort on
             * initialisation. You can define which column(s) the sort is performed
             * upon, and the sorting direction, with this variable. The `sorting` array
             * should contain an array for each column to be sorted initially containing
             * the column's index and a direction string ('asc' or 'desc').
             *  @type array
             *  @default [[0,'asc']]
             *
             *  @dtopt Option
             *  @name DataTable.defaults.order
             *
             *  @example
             *    // Sort by 3rd column first, and then 4th column
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "order": [[2,'asc'], [3,'desc']]
         *      } );
         *    } );
             *
             *    // No initial sorting
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "order": []
         *      } );
         *    } );
             */
            "aaSorting": [[0,'asc']],


            /**
             * This parameter is basically identical to the `sorting` parameter, but
             * cannot be overridden by user interaction with the table. What this means
             * is that you could have a column (visible or hidden) which the sorting
             * will always be forced on first - any sorting after that (from the user)
             * will then be performed as required. This can be useful for grouping rows
             * together.
             *  @type array
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.orderFixed
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "orderFixed": [[0,'asc']]
         *      } );
         *    } )
             */
            "aaSortingFixed": [],


            /**
             * DataTables can be instructed to load data to display in the table from a
             * Ajax source. This option defines how that Ajax call is made and where to.
             *
             * The `ajax` property has three different modes of operation, depending on
             * how it is defined. These are:
             *
             * * `string` - Set the URL from where the data should be loaded from.
             * * `object` - Define properties for `jQuery.ajax`.
             * * `function` - Custom data get function
             *
             * `string`
             * --------
             *
             * As a string, the `ajax` property simply defines the URL from which
             * DataTables will load data.
             *
             * `object`
             * --------
             *
             * As an object, the parameters in the object are passed to
             * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
             * of the Ajax request. DataTables has a number of default parameters which
             * you can override using this option. Please refer to the jQuery
             * documentation for a full description of the options available, although
             * the following parameters provide additional options in DataTables or
             * require special consideration:
             *
             * * `data` - As with jQuery, `data` can be provided as an object, but it
             *   can also be used as a function to manipulate the data DataTables sends
             *   to the server. The function takes a single parameter, an object of
             *   parameters with the values that DataTables has readied for sending. An
             *   object may be returned which will be merged into the DataTables
             *   defaults, or you can add the items to the object that was passed in and
             *   not return anything from the function. This supersedes `fnServerParams`
             *   from DataTables 1.9-.
             *
             * * `dataSrc` - By default DataTables will look for the property `data` (or
             *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
             *   from an Ajax source or for server-side processing - this parameter
             *   allows that property to be changed. You can use Javascript dotted
             *   object notation to get a data source for multiple levels of nesting, or
             *   it my be used as a function. As a function it takes a single parameter,
             *   the JSON returned from the server, which can be manipulated as
             *   required, with the returned value being that used by DataTables as the
             *   data source for the table. This supersedes `sAjaxDataProp` from
             *   DataTables 1.9-.
             *
             * * `success` - Should not be overridden it is used internally in
             *   DataTables. To manipulate / transform the data returned by the server
             *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
             *
             * `function`
             * ----------
             *
             * As a function, making the Ajax call is left up to yourself allowing
             * complete control of the Ajax request. Indeed, if desired, a method other
             * than Ajax could be used to obtain the required data, such as Web storage
             * or an AIR database.
             *
             * The function is given four parameters and no return is required. The
             * parameters are:
             *
             * 1. _object_ - Data to send to the server
             * 2. _function_ - Callback function that must be executed when the required
             *    data has been obtained. That data should be passed into the callback
             *    as the only parameter
             * 3. _object_ - DataTables settings object for the table
             *
             * Note that this supersedes `fnServerData` from DataTables 1.9-.
             *
             *  @type string|object|function
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.ajax
             *  @since 1.10.0
             *
             * @example
             *   // Get JSON data from a file via Ajax.
             *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
             *   $('#example').dataTable( {
         *     "ajax": "data.json"
         *   } );
             *
             * @example
             *   // Get JSON data from a file via Ajax, using `dataSrc` to change
             *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
             *   $('#example').dataTable( {
         *     "ajax": {
         *       "url": "data.json",
         *       "dataSrc": "tableData"
         *     }
         *   } );
             *
             * @example
             *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
             *   // from a plain array rather than an array in an object
             *   $('#example').dataTable( {
         *     "ajax": {
         *       "url": "data.json",
         *       "dataSrc": ""
         *     }
         *   } );
             *
             * @example
             *   // Manipulate the data returned from the server - add a link to data
             *   // (note this can, should, be done using `render` for the column - this
             *   // is just a simple example of how the data can be manipulated).
             *   $('#example').dataTable( {
         *     "ajax": {
         *       "url": "data.json",
         *       "dataSrc": function ( json ) {
         *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
         *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
         *         }
         *         return json;
         *       }
         *     }
         *   } );
             *
             * @example
             *   // Add data to the request
             *   $('#example').dataTable( {
         *     "ajax": {
         *       "url": "data.json",
         *       "data": function ( d ) {
         *         return {
         *           "extra_search": $('#extra').val()
         *         };
         *       }
         *     }
         *   } );
             *
             * @example
             *   // Send request as POST
             *   $('#example').dataTable( {
         *     "ajax": {
         *       "url": "data.json",
         *       "type": "POST"
         *     }
         *   } );
             *
             * @example
             *   // Get the data from localStorage (could interface with a form for
             *   // adding, editing and removing rows).
             *   $('#example').dataTable( {
         *     "ajax": function (data, callback, settings) {
         *       callback(
         *         JSON.parse( localStorage.getItem('dataTablesData') )
         *       );
         *     }
         *   } );
             */
            "ajax": null,


            /**
             * This parameter allows you to readily specify the entries in the length drop
             * down menu that DataTables shows when pagination is enabled. It can be
             * either a 1D array of options which will be used for both the displayed
             * option and the value, or a 2D array which will use the array in the first
             * position as the value, and the array in the second position as the
             * displayed options (useful for language strings such as 'All').
             *
             * Note that the `pageLength` property will be automatically set to the
             * first value given in this array, unless `pageLength` is also provided.
             *  @type array
             *  @default [ 10, 25, 50, 100 ]
             *
             *  @dtopt Option
             *  @name DataTable.defaults.lengthMenu
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
         *      } );
         *    } );
             */
            "aLengthMenu": [ 10, 25, 50, 100 ],


            /**
             * The `columns` option in the initialisation parameter allows you to define
             * details about the way individual columns behave. For a full list of
             * column options that can be set, please see
             * {@link DataTable.defaults.column}. Note that if you use `columns` to
             * define your columns, you must have an entry in the array for every single
             * column that you have in your table (these can be null if you don't which
             * to specify any options).
             *  @member
             *
             *  @name DataTable.defaults.column
             */
            "aoColumns": null,

            /**
             * Very similar to `columns`, `columnDefs` allows you to target a specific
             * column, multiple columns, or all columns, using the `targets` property of
             * each object in the array. This allows great flexibility when creating
             * tables, as the `columnDefs` arrays can be of any length, targeting the
             * columns you specifically want. `columnDefs` may use any of the column
             * options available: {@link DataTable.defaults.column}, but it _must_
             * have `targets` defined in each object in the array. Values in the `targets`
             * array may be:
             *   <ul>
             *     <li>a string - class name will be matched on the TH for the column</li>
             *     <li>0 or a positive integer - column index counting from the left</li>
             *     <li>a negative integer - column index counting from the right</li>
             *     <li>the string "_all" - all columns (i.e. assign a default)</li>
             *   </ul>
             *  @member
             *
             *  @name DataTable.defaults.columnDefs
             */
            "aoColumnDefs": null,


            /**
             * Basically the same as `search`, this parameter defines the individual column
             * filtering state at initialisation time. The array must be of the same size
             * as the number of columns, and each element be an object with the parameters
             * `search` and `escapeRegex` (the latter is optional). 'null' is also
             * accepted and the default will be used.
             *  @type array
             *  @default []
             *
             *  @dtopt Option
             *  @name DataTable.defaults.searchCols
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "searchCols": [
         *          null,
         *          { "search": "My filter" },
         *          null,
         *          { "search": "^[0-9]", "escapeRegex": false }
         *        ]
         *      } );
         *    } )
             */
            "aoSearchCols": [],


            /**
             * An array of CSS classes that should be applied to displayed rows. This
             * array may be of any length, and DataTables will apply each class
             * sequentially, looping when required.
             *  @type array
             *  @default null <i>Will take the values determined by the `oClasses.stripe*`
             *    options</i>
             *
             *  @dtopt Option
             *  @name DataTable.defaults.stripeClasses
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
         *      } );
         *    } )
             */
            "asStripeClasses": null,


            /**
             * Enable or disable automatic column width calculation. This can be disabled
             * as an optimisation (it takes some time to calculate the widths) if the
             * tables widths are passed in using `columns`.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.autoWidth
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "autoWidth": false
         *      } );
         *    } );
             */
            "bAutoWidth": true,


            /**
             * Deferred rendering can provide DataTables with a huge speed boost when you
             * are using an Ajax or JS data source for the table. This option, when set to
             * true, will cause DataTables to defer the creation of the table elements for
             * each row until they are needed for a draw - saving a significant amount of
             * time.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.deferRender
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "ajax": "sources/arrays.txt",
         *        "deferRender": true
         *      } );
         *    } );
             */
            "bDeferRender": false,


            /**
             * Replace a DataTable which matches the given selector and replace it with
             * one which has the properties of the new initialisation object passed. If no
             * table matches the selector, then the new DataTable will be constructed as
             * per normal.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.destroy
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "srollY": "200px",
         *        "paginate": false
         *      } );
         *
         *      // Some time later....
         *      $('#example').dataTable( {
         *        "filter": false,
         *        "destroy": true
         *      } );
         *    } );
             */
            "bDestroy": false,


            /**
             * Enable or disable filtering of data. Filtering in DataTables is "smart" in
             * that it allows the end user to input multiple words (space separated) and
             * will match a row containing those words, even if not in the order that was
             * specified (this allow matching across multiple columns). Note that if you
             * wish to use filtering in DataTables this must remain 'true' - to remove the
             * default filtering input box and retain filtering abilities, please use
             * {@link DataTable.defaults.dom}.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.searching
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "searching": false
         *      } );
         *    } );
             */
            "bFilter": true,


            /**
             * Enable or disable the table information display. This shows information
             * about the data that is currently visible on the page, including information
             * about filtered data if that action is being performed.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.info
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "info": false
         *      } );
         *    } );
             */
            "bInfo": true,


            /**
             * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
             * slightly different and additional mark-up from what DataTables has
             * traditionally used).
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.jQueryUI
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "jQueryUI": true
         *      } );
         *    } );
             */
            "bJQueryUI": false,


            /**
             * Allows the end user to select the size of a formatted page from a select
             * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.lengthChange
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "lengthChange": false
         *      } );
         *    } );
             */
            "bLengthChange": true,


            /**
             * Enable or disable pagination.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.paging
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "paging": false
         *      } );
         *    } );
             */
            "bPaginate": true,


            /**
             * Enable or disable the display of a 'processing' indicator when the table is
             * being processed (e.g. a sort). This is particularly useful for tables with
             * large amounts of data where it can take a noticeable amount of time to sort
             * the entries.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.processing
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "processing": true
         *      } );
         *    } );
             */
            "bProcessing": false,


            /**
             * Retrieve the DataTables object for the given selector. Note that if the
             * table has already been initialised, this parameter will cause DataTables
             * to simply return the object that has already been set up - it will not take
             * account of any changes you might have made to the initialisation object
             * passed to DataTables (setting this parameter to true is an acknowledgement
             * that you understand this). `destroy` can be used to reinitialise a table if
             * you need.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.retrieve
             *
             *  @example
             *    $(document).ready( function() {
         *      initTable();
         *      tableActions();
         *    } );
             *
             *    function initTable ()
             *    {
         *      return $('#example').dataTable( {
         *        "scrollY": "200px",
         *        "paginate": false,
         *        "retrieve": true
         *      } );
         *    }
             *
             *    function tableActions ()
             *    {
         *      var table = initTable();
         *      // perform API operations with oTable
         *    }
             */
            "bRetrieve": false,


            /**
             * When vertical (y) scrolling is enabled, DataTables will force the height of
             * the table's viewport to the given height at all times (useful for layout).
             * However, this can look odd when filtering data down to a small data set,
             * and the footer is left "floating" further down. This parameter (when
             * enabled) will cause DataTables to collapse the table's viewport down when
             * the result set will fit within the given Y height.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.scrollCollapse
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "scrollY": "200",
         *        "scrollCollapse": true
         *      } );
         *    } );
             */
            "bScrollCollapse": false,


            /**
             * Configure DataTables to use server-side processing. Note that the
             * `ajax` parameter must also be given in order to give DataTables a
             * source to obtain the required data for each draw.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverSide
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "serverSide": true,
         *        "ajax": "xhr.php"
         *      } );
         *    } );
             */
            "bServerSide": false,


            /**
             * Enable or disable sorting of columns. Sorting of individual columns can be
             * disabled by the `sortable` option for each column.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.ordering
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "ordering": false
         *      } );
         *    } );
             */
            "bSort": true,


            /**
             * Enable or display DataTables' ability to sort multiple columns at the
             * same time (activated by shift-click by the user).
             *  @type boolean
             *  @default true
             *
             *  @dtopt Options
             *  @name DataTable.defaults.orderMulti
             *
             *  @example
             *    // Disable multiple column sorting ability
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "orderMulti": false
         *      } );
         *    } );
             */
            "bSortMulti": true,


            /**
             * Allows control over whether DataTables should use the top (true) unique
             * cell that is found for a single column, or the bottom (false - default).
             * This is useful when using complex headers.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.orderCellsTop
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "orderCellsTop": true
         *      } );
         *    } );
             */
            "bSortCellsTop": false,


            /**
             * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
             * `sorting\_3` to the columns which are currently being sorted on. This is
             * presented as a feature switch as it can increase processing time (while
             * classes are removed and added) so for large data sets you might want to
             * turn this off.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.orderClasses
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "orderClasses": false
         *      } );
         *    } );
             */
            "bSortClasses": true,


            /**
             * Enable or disable state saving. When enabled HTML5 `localStorage` will be
             * used to save table display information such as pagination information,
             * display length, filtering and sorting. As such when the end user reloads
             * the page the display display will match what thy had previously set up.
             *
             * Due to the use of `localStorage` the default state saving is not supported
             * in IE6 or 7. If state saving is required in those browsers, use
             * `stateSaveCallback` to provide a storage solution such as cookies.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.stateSave
             *
             *  @example
             *    $(document).ready( function () {
         *      $('#example').dataTable( {
         *        "stateSave": true
         *      } );
         *    } );
             */
            "bStateSave": false,


            /**
             * This function is called when a TR element is created (and all TD child
             * elements have been inserted), or registered if using a DOM source, allowing
             * manipulation of the TR element (adding classes etc).
             *  @type function
             *  @param {node} row "TR" element for the current row
             *  @param {array} data Raw data array for this row
             *  @param {int} dataIndex The index of this row in the internal aoData array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.createdRow
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "createdRow": function( row, data, dataIndex ) {
         *          // Bold the grade for all 'A' grade browsers
         *          if ( data[4] == "A" )
         *          {
         *            $('td:eq(4)', row).html( '<b>A</b>' );
         *          }
         *        }
         *      } );
         *    } );
             */
            "fnCreatedRow": null,


            /**
             * This function is called on every 'draw' event, and allows you to
             * dynamically modify any aspect you want about the created DOM.
             *  @type function
             *  @param {object} settings DataTables settings object
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.drawCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "drawCallback": function( settings ) {
         *          alert( 'DataTables has redrawn the table' );
         *        }
         *      } );
         *    } );
             */
            "fnDrawCallback": null,


            /**
             * Identical to fnHeaderCallback() but for the table footer this function
             * allows you to modify the table footer on every 'draw' event.
             *  @type function
             *  @param {node} foot "TR" element for the footer
             *  @param {array} data Full table data (as derived from the original HTML)
             *  @param {int} start Index for the current display starting point in the
             *    display array
             *  @param {int} end Index for the current display ending point in the
             *    display array
             *  @param {array int} display Index array to translate the visual position
             *    to the full data array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.footerCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "footerCallback": function( tfoot, data, start, end, display ) {
         *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
         *        }
         *      } );
         *    } )
             */
            "fnFooterCallback": null,


            /**
             * When rendering large numbers in the information element for the table
             * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
             * to have a comma separator for the 'thousands' units (e.g. 1 million is
             * rendered as "1,000,000") to help readability for the end user. This
             * function will override the default method DataTables uses.
             *  @type function
             *  @member
             *  @param {int} toFormat number to be formatted
             *  @returns {string} formatted string for DataTables to show the number
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.formatNumber
             *
             *  @example
             *    // Format a number using a single quote for the separator (note that
             *    // this can also be done with the language.thousands option)
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "formatNumber": function ( toFormat ) {
         *          return toFormat.toString().replace(
         *            /\B(?=(\d{3})+(?!\d))/g, "'"
         *          );
         *        };
         *      } );
         *    } );
             */
            "fnFormatNumber": function ( toFormat ) {
                return toFormat.toString().replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    this.oLanguage.sThousands
                );
            },


            /**
             * This function is called on every 'draw' event, and allows you to
             * dynamically modify the header row. This can be used to calculate and
             * display useful information about the table.
             *  @type function
             *  @param {node} head "TR" element for the header
             *  @param {array} data Full table data (as derived from the original HTML)
             *  @param {int} start Index for the current display starting point in the
             *    display array
             *  @param {int} end Index for the current display ending point in the
             *    display array
             *  @param {array int} display Index array to translate the visual position
             *    to the full data array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.headerCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "fheaderCallback": function( head, data, start, end, display ) {
         *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
         *        }
         *      } );
         *    } )
             */
            "fnHeaderCallback": null,


            /**
             * The information element can be used to convey information about the current
             * state of the table. Although the internationalisation options presented by
             * DataTables are quite capable of dealing with most customisations, there may
             * be times where you wish to customise the string further. This callback
             * allows you to do exactly that.
             *  @type function
             *  @param {object} oSettings DataTables settings object
             *  @param {int} start Starting position in data for the draw
             *  @param {int} end End position in data for the draw
             *  @param {int} max Total number of rows in the table (regardless of
             *    filtering)
             *  @param {int} total Total number of rows in the data set, after filtering
             *  @param {string} pre The string that DataTables has formatted using it's
             *    own rules
             *  @returns {string} The string to be displayed in the information element.
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.infoCallback
             *
             *  @example
             *    $('#example').dataTable( {
         *      "infoCallback": function( settings, start, end, max, total, pre ) {
         *        return start +" to "+ end;
         *      }
         *    } );
             */
            "fnInfoCallback": null,


            /**
             * Called when the table has been initialised. Normally DataTables will
             * initialise sequentially and there will be no need for this function,
             * however, this does not hold true when using external language information
             * since that is obtained using an async XHR call.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} json The JSON object request from the server - only
             *    present if client-side Ajax sourced data is used
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.initComplete
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "initComplete": function(settings, json) {
         *          alert( 'DataTables has finished its initialisation.' );
         *        }
         *      } );
         *    } )
             */
            "fnInitComplete": null,


            /**
             * Called at the very start of each table draw and can be used to cancel the
             * draw by returning false, any other return (including undefined) results in
             * the full draw occurring).
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @returns {boolean} False will cancel the draw, anything else (including no
             *    return) will allow it to complete.
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.preDrawCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "preDrawCallback": function( settings ) {
         *          if ( $('#test').val() == 1 ) {
         *            return false;
         *          }
         *        }
         *      } );
         *    } );
             */
            "fnPreDrawCallback": null,


            /**
             * This function allows you to 'post process' each row after it have been
             * generated for each table draw, but before it is rendered on screen. This
             * function might be used for setting the row class name etc.
             *  @type function
             *  @param {node} row "TR" element for the current row
             *  @param {array} data Raw data array for this row
             *  @param {int} displayIndex The display index for the current table draw
             *  @param {int} displayIndexFull The index of the data in the full list of
             *    rows (after filtering)
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.rowCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
         *          // Bold the grade for all 'A' grade browsers
         *          if ( data[4] == "A" ) {
         *            $('td:eq(4)', row).html( '<b>A</b>' );
         *          }
         *        }
         *      } );
         *    } );
             */
            "fnRowCallback": null,


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * This parameter allows you to override the default function which obtains
             * the data from the server so something more suitable for your application.
             * For example you could use POST data, or pull information from a Gears or
             * AIR database.
             *  @type function
             *  @member
             *  @param {string} source HTTP source to obtain the data from (`ajax`)
             *  @param {array} data A key/value pair object containing the data to send
             *    to the server
             *  @param {function} callback to be called on completion of the data get
             *    process that will draw the data on the page.
             *  @param {object} settings DataTables settings object
             *
             *  @dtopt Callbacks
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverData
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "fnServerData": null,


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             *  It is often useful to send extra data to the server when making an Ajax
             * request - for example custom filtering information, and this callback
             * function makes it trivial to send extra information to the server. The
             * passed in parameter is the data set that has been constructed by
             * DataTables, and you can add to this or modify it as you require.
             *  @type function
             *  @param {array} data Data array (array of objects which are name/value
             *    pairs) that has been constructed by DataTables and will be sent to the
             *    server. In the case of Ajax sourced data with server-side processing
             *    this will be an empty array, for server-side processing there will be a
             *    significant number of parameters!
             *  @returns {undefined} Ensure that you modify the data array passed in,
             *    as this is passed by reference.
             *
             *  @dtopt Callbacks
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverParams
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "fnServerParams": null,


            /**
             * Load the table state. With this function you can define from where, and how, the
             * state of a table is loaded. By default DataTables will load from `localStorage`
             * but you might wish to use a server-side database or cookies.
             *  @type function
             *  @member
             *  @param {object} settings DataTables settings object
             *  @return {object} The DataTables state object to be loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoadCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateLoadCallback": function (settings) {
         *          var o;
         *
         *          // Send an Ajax request to the server to get the data. Note that
         *          // this is a synchronous request.
         *          $.ajax( {
         *            "url": "/state_load",
         *            "async": false,
         *            "dataType": "json",
         *            "success": function (json) {
         *              o = json;
         *            }
         *          } );
         *
         *          return o;
         *        }
         *      } );
         *    } );
             */
            "fnStateLoadCallback": function ( settings ) {
                try {
                    return JSON.parse(
                        (settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
                            'DataTables_'+settings.sInstance+'_'+location.pathname
                        )
                    );
                } catch (e) {}
            },


            /**
             * Callback which allows modification of the saved state prior to loading that state.
             * This callback is called when the table is loading state from the stored data, but
             * prior to the settings object being modified by the saved state. Note that for
             * plug-in authors, you should use the `stateLoadParams` event to load parameters for
             * a plug-in.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object that is to be loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoadParams
             *
             *  @example
             *    // Remove a saved filter, so filtering is never loaded
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateLoadParams": function (settings, data) {
         *          data.oSearch.sSearch = "";
         *        }
         *      } );
         *    } );
             *
             *  @example
             *    // Disallow state loading by returning false
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateLoadParams": function (settings, data) {
         *          return false;
         *        }
         *      } );
         *    } );
             */
            "fnStateLoadParams": null,


            /**
             * Callback that is called when the state has been loaded from the state saving method
             * and the DataTables settings object has been modified as a result of the loaded state.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object that was loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoaded
             *
             *  @example
             *    // Show an alert with the filtering value that was saved
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateLoaded": function (settings, data) {
         *          alert( 'Saved filter was: '+data.oSearch.sSearch );
         *        }
         *      } );
         *    } );
             */
            "fnStateLoaded": null,


            /**
             * Save the table state. This function allows you to define where and how the state
             * information for the table is stored By default DataTables will use `localStorage`
             * but you might wish to use a server-side database or cookies.
             *  @type function
             *  @member
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object to be saved
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateSaveCallback
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateSaveCallback": function (settings, data) {
         *          // Send an Ajax request to the server with the state object
         *          $.ajax( {
         *            "url": "/state_save",
         *            "data": data,
         *            "dataType": "json",
         *            "method": "POST"
         *            "success": function () {}
         *          } );
         *        }
         *      } );
         *    } );
             */
            "fnStateSaveCallback": function ( settings, data ) {
                try {
                    (settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
                        'DataTables_'+settings.sInstance+'_'+location.pathname,
                        JSON.stringify( data )
                    );
                } catch (e) {}
            },


            /**
             * Callback which allows modification of the state to be saved. Called when the table
             * has changed state a new state save is required. This method allows modification of
             * the state saving object prior to actually doing the save, including addition or
             * other state properties or modification. Note that for plug-in authors, you should
             * use the `stateSaveParams` event to save parameters for a plug-in.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object to be saved
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateSaveParams
             *
             *  @example
             *    // Remove a saved filter, so filtering is never saved
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateSave": true,
         *        "stateSaveParams": function (settings, data) {
         *          data.oSearch.sSearch = "";
         *        }
         *      } );
         *    } );
             */
            "fnStateSaveParams": null,


            /**
             * Duration for which the saved state information is considered valid. After this period
             * has elapsed the state will be returned to the default.
             * Value is given in seconds.
             *  @type int
             *  @default 7200 <i>(2 hours)</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.stateDuration
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "stateDuration": 60*60*24; // 1 day
         *      } );
         *    } )
             */
            "iStateDuration": 7200,


            /**
             * When enabled DataTables will not make a request to the server for the first
             * page draw - rather it will use the data already on the page (no sorting etc
             * will be applied to it), thus saving on an XHR at load time. `deferLoading`
             * is used to indicate that deferred loading is required, but it is also used
             * to tell DataTables how many records there are in the full table (allowing
             * the information element and pagination to be displayed correctly). In the case
             * where a filtering is applied to the table on initial load, this can be
             * indicated by giving the parameter as an array, where the first element is
             * the number of records available after filtering and the second element is the
             * number of records without filtering (allowing the table information element
             * to be shown correctly).
             *  @type int | array
             *  @default null
             *
             *  @dtopt Options
             *  @name DataTable.defaults.deferLoading
             *
             *  @example
             *    // 57 records available in the table, no filtering applied
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "serverSide": true,
         *        "ajax": "scripts/server_processing.php",
         *        "deferLoading": 57
         *      } );
         *    } );
             *
             *  @example
             *    // 57 records after filtering, 100 without filtering (an initial filter applied)
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "serverSide": true,
         *        "ajax": "scripts/server_processing.php",
         *        "deferLoading": [ 57, 100 ],
         *        "search": {
         *          "search": "my_filter"
         *        }
         *      } );
         *    } );
             */
            "iDeferLoading": null,


            /**
             * Number of rows to display on a single page when using pagination. If
             * feature enabled (`lengthChange`) then the end user will be able to override
             * this to a custom setting using a pop-up menu.
             *  @type int
             *  @default 10
             *
             *  @dtopt Options
             *  @name DataTable.defaults.pageLength
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "pageLength": 50
         *      } );
         *    } )
             */
            "iDisplayLength": 10,


            /**
             * Define the starting point for data display when using DataTables with
             * pagination. Note that this parameter is the number of records, rather than
             * the page number, so if you have 10 records per page and want to start on
             * the third page, it should be "20".
             *  @type int
             *  @default 0
             *
             *  @dtopt Options
             *  @name DataTable.defaults.displayStart
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "displayStart": 20
         *      } );
         *    } )
             */
            "iDisplayStart": 0,


            /**
             * By default DataTables allows keyboard navigation of the table (sorting, paging,
             * and filtering) by adding a `tabindex` attribute to the required elements. This
             * allows you to tab through the controls and press the enter key to activate them.
             * The tabindex is default 0, meaning that the tab follows the flow of the document.
             * You can overrule this using this parameter if you wish. Use a value of -1 to
             * disable built-in keyboard navigation.
             *  @type int
             *  @default 0
             *
             *  @dtopt Options
             *  @name DataTable.defaults.tabIndex
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "tabIndex": 1
         *      } );
         *    } );
             */
            "iTabIndex": 0,


            /**
             * Classes that DataTables assigns to the various components and features
             * that it adds to the HTML table. This allows classes to be configured
             * during initialisation in addition to through the static
             * {@link DataTable.ext.oStdClasses} object).
             *  @namespace
             *  @name DataTable.defaults.classes
             */
            "oClasses": {},


            /**
             * All strings that DataTables uses in the user interface that it creates
             * are defined in this object, allowing you to modified them individually or
             * completely replace them all as required.
             *  @namespace
             *  @name DataTable.defaults.language
             */
            "oLanguage": {
                /**
                 * Strings that are used for WAI-ARIA labels and controls only (these are not
                 * actually visible on the page, but will be read by screenreaders, and thus
                 * must be internationalised as well).
                 *  @namespace
                 *  @name DataTable.defaults.language.aria
                 */
                "oAria": {
                    /**
                     * ARIA label that is added to the table headers when the column may be
                     * sorted ascending by activing the column (click or return when focused).
                     * Note that the column header is prefixed to this string.
                     *  @type string
                     *  @default : activate to sort column ascending
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.aria.sortAscending
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "aria": {
                 *            "sortAscending": " - click/return to sort ascending"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sSortAscending": ": activate to sort column ascending",

                    /**
                     * ARIA label that is added to the table headers when the column may be
                     * sorted descending by activing the column (click or return when focused).
                     * Note that the column header is prefixed to this string.
                     *  @type string
                     *  @default : activate to sort column ascending
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.aria.sortDescending
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "aria": {
                 *            "sortDescending": " - click/return to sort descending"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sSortDescending": ": activate to sort column descending"
                },

                /**
                 * Pagination string used by DataTables for the built-in pagination
                 * control types.
                 *  @namespace
                 *  @name DataTable.defaults.language.paginate
                 */
                "oPaginate": {
                    /**
                     * Text to use when using the 'full_numbers' type of pagination for the
                     * button to take the user to the first page.
                     *  @type string
                     *  @default First
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.first
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "paginate": {
                 *            "first": "First page"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sFirst": "First",


                    /**
                     * Text to use when using the 'full_numbers' type of pagination for the
                     * button to take the user to the last page.
                     *  @type string
                     *  @default Last
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.last
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "paginate": {
                 *            "last": "Last page"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sLast": "Last",


                    /**
                     * Text to use for the 'next' pagination button (to take the user to the
                     * next page).
                     *  @type string
                     *  @default Next
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.next
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "paginate": {
                 *            "next": "Next page"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sNext": "Next",


                    /**
                     * Text to use for the 'previous' pagination button (to take the user to
                     * the previous page).
                     *  @type string
                     *  @default Previous
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.previous
                     *
                     *  @example
                     *    $(document).ready( function() {
                 *      $('#example').dataTable( {
                 *        "language": {
                 *          "paginate": {
                 *            "previous": "Previous page"
                 *          }
                 *        }
                 *      } );
                 *    } );
                     */
                    "sPrevious": "Previous"
                },

                /**
                 * This string is shown in preference to `zeroRecords` when the table is
                 * empty of data (regardless of filtering). Note that this is an optional
                 * parameter - if it is not given, the value of `zeroRecords` will be used
                 * instead (either the default or given value).
                 *  @type string
                 *  @default No data available in table
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.emptyTable
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "emptyTable": "No data available in table"
             *        }
             *      } );
             *    } );
                 */
                "sEmptyTable": "No data available in table",


                /**
                 * This string gives information to the end user about the information
                 * that is current on display on the page. The following tokens can be
                 * used in the string and will be dynamically replaced as the table
                 * display updates. This tokens can be placed anywhere in the string, or
                 * removed as needed by the language requires:
                 *
                 * * `\_START\_` - Display index of the first record on the current page
                 * * `\_END\_` - Display index of the last record on the current page
                 * * `\_TOTAL\_` - Number of records in the table after filtering
                 * * `\_MAX\_` - Number of records in the table without filtering
                 * * `\_PAGE\_` - Current page number
                 * * `\_PAGES\_` - Total number of pages of data in the table
                 *
                 *  @type string
                 *  @default Showing _START_ to _END_ of _TOTAL_ entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.info
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "info": "Showing page _PAGE_ of _PAGES_"
             *        }
             *      } );
             *    } );
                 */
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",


                /**
                 * Display information string for when the table is empty. Typically the
                 * format of this string should match `info`.
                 *  @type string
                 *  @default Showing 0 to 0 of 0 entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoEmpty
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "infoEmpty": "No entries to show"
             *        }
             *      } );
             *    } );
                 */
                "sInfoEmpty": "Showing 0 to 0 of 0 entries",


                /**
                 * When a user filters the information in a table, this string is appended
                 * to the information (`info`) to give an idea of how strong the filtering
                 * is. The variable _MAX_ is dynamically updated.
                 *  @type string
                 *  @default (filtered from _MAX_ total entries)
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoFiltered
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "infoFiltered": " - filtering from _MAX_ records"
             *        }
             *      } );
             *    } );
                 */
                "sInfoFiltered": "(filtered from _MAX_ total entries)",


                /**
                 * If can be useful to append extra information to the info string at times,
                 * and this variable does exactly that. This information will be appended to
                 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
                 * being used) at all times.
                 *  @type string
                 *  @default <i>Empty string</i>
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoPostFix
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "infoPostFix": "All records shown are derived from real information."
             *        }
             *      } );
             *    } );
                 */
                "sInfoPostFix": "",


                /**
                 * This decimal place operator is a little different from the other
                 * language options since DataTables doesn't output floating point
                 * numbers, so it won't ever use this for display of a number. Rather,
                 * what this parameter does is modify the sort methods of the table so
                 * that numbers which are in a format which has a character other than
                 * a period (`.`) as a decimal place will be sorted numerically.
                 *
                 * Note that numbers with different decimal places cannot be shown in
                 * the same table and still be sortable, the table must be consistent.
                 * However, multiple different tables on the page can use different
                 * decimal place characters.
                 *  @type string
                 *  @default
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.decimal
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "decimal": ","
             *          "thousands": "."
             *        }
             *      } );
             *    } );
                 */
                "sDecimal": "",


                /**
                 * DataTables has a build in number formatter (`formatNumber`) which is
                 * used to format large numbers that are used in the table information.
                 * By default a comma is used, but this can be trivially changed to any
                 * character you wish with this parameter.
                 *  @type string
                 *  @default ,
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.thousands
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "thousands": "'"
             *        }
             *      } );
             *    } );
                 */
                "sThousands": ",",


                /**
                 * Detail the action that will be taken when the drop down menu for the
                 * pagination length option is changed. The '_MENU_' variable is replaced
                 * with a default select list of 10, 25, 50 and 100, and can be replaced
                 * with a custom select box if required.
                 *  @type string
                 *  @default Show _MENU_ entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.lengthMenu
                 *
                 *  @example
                 *    // Language change only
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "lengthMenu": "Display _MENU_ records"
             *        }
             *      } );
             *    } );
                 *
                 *  @example
                 *    // Language and options change
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "lengthMenu": 'Display <select>'+
             *            '<option value="10">10</option>'+
             *            '<option value="20">20</option>'+
             *            '<option value="30">30</option>'+
             *            '<option value="40">40</option>'+
             *            '<option value="50">50</option>'+
             *            '<option value="-1">All</option>'+
             *            '</select> records'
             *        }
             *      } );
             *    } );
                 */
                "sLengthMenu": "Show _MENU_ entries",


                /**
                 * When using Ajax sourced data and during the first draw when DataTables is
                 * gathering the data, this message is shown in an empty row in the table to
                 * indicate to the end user the the data is being loaded. Note that this
                 * parameter is not used when loading data by server-side processing, just
                 * Ajax sourced data with client-side processing.
                 *  @type string
                 *  @default Loading...
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.loadingRecords
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "loadingRecords": "Please wait - loading..."
             *        }
             *      } );
             *    } );
                 */
                "sLoadingRecords": "Loading...",


                /**
                 * Text which is displayed when the table is processing a user action
                 * (usually a sort command or similar).
                 *  @type string
                 *  @default Processing...
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.processing
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "processing": "DataTables is currently busy"
             *        }
             *      } );
             *    } );
                 */
                "sProcessing": "Processing...",


                /**
                 * Details the actions that will be taken when the user types into the
                 * filtering input text box. The variable "_INPUT_", if used in the string,
                 * is replaced with the HTML text box for the filtering input allowing
                 * control over where it appears in the string. If "_INPUT_" is not given
                 * then the input box is appended to the string automatically.
                 *  @type string
                 *  @default Search:
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.search
                 *
                 *  @example
                 *    // Input text box will be appended at the end automatically
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "search": "Filter records:"
             *        }
             *      } );
             *    } );
                 *
                 *  @example
                 *    // Specify where the filter should appear
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "search": "Apply filter _INPUT_ to table"
             *        }
             *      } );
             *    } );
                 */
                "sSearch": "Search:",


                /**
                 * Assign a `placeholder` attribute to the search `input` element
                 *  @type string
                 *  @default
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.searchPlaceholder
                 */
                "sSearchPlaceholder": "",


                /**
                 * All of the language information can be stored in a file on the
                 * server-side, which DataTables will look up if this parameter is passed.
                 * It must store the URL of the language file, which is in a JSON format,
                 * and the object has the same properties as the oLanguage object in the
                 * initialiser object (i.e. the above parameters). Please refer to one of
                 * the example language files to see how this works in action.
                 *  @type string
                 *  @default <i>Empty string - i.e. disabled</i>
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.url
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "url": "http://www.sprymedia.co.uk/dataTables/lang.txt"
             *        }
             *      } );
             *    } );
                 */
                "sUrl": "",


                /**
                 * Text shown inside the table records when the is no information to be
                 * displayed after filtering. `emptyTable` is shown when there is simply no
                 * information in the table at all (regardless of filtering).
                 *  @type string
                 *  @default No matching records found
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.zeroRecords
                 *
                 *  @example
                 *    $(document).ready( function() {
             *      $('#example').dataTable( {
             *        "language": {
             *          "zeroRecords": "No records to display"
             *        }
             *      } );
             *    } );
                 */
                "sZeroRecords": "No matching records found"
            },


            /**
             * This parameter allows you to have define the global filtering state at
             * initialisation time. As an object the `search` parameter must be
             * defined, but all other parameters are optional. When `regex` is true,
             * the search string will be treated as a regular expression, when false
             * (default) it will be treated as a straight string. When `smart`
             * DataTables will use it's smart filtering methods (to word match at
             * any point in the data), when false this will not be done.
             *  @namespace
             *  @extends DataTable.models.oSearch
             *
             *  @dtopt Options
             *  @name DataTable.defaults.search
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "search": {"search": "Initial search"}
         *      } );
         *    } )
             */
            "oSearch": $.extend( {}, DataTable.models.oSearch ),


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * By default DataTables will look for the property `data` (or `aaData` for
             * compatibility with DataTables 1.9-) when obtaining data from an Ajax
             * source or for server-side processing - this parameter allows that
             * property to be changed. You can use Javascript dotted object notation to
             * get a data source for multiple levels of nesting.
             *  @type string
             *  @default data
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.ajaxDataProp
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sAjaxDataProp": "data",


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * You can instruct DataTables to load data from an external
             * source using this parameter (use aData if you want to pass data in you
             * already have). Simply provide a url a JSON object can be obtained from.
             *  @type string
             *  @default null
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.ajaxSource
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sAjaxSource": null,


            /**
             * This initialisation variable allows you to specify exactly where in the
             * DOM you want DataTables to inject the various controls it adds to the page
             * (for example you might want the pagination controls at the top of the
             * table). DIV elements (with or without a custom class) can also be added to
             * aid styling. The follow syntax is used:
             *   <ul>
             *     <li>The following options are allowed:
             *       <ul>
             *         <li>'l' - Length changing</li>
             *         <li>'f' - Filtering input</li>
             *         <li>'t' - The table!</li>
             *         <li>'i' - Information</li>
             *         <li>'p' - Pagination</li>
             *         <li>'r' - pRocessing</li>
             *       </ul>
             *     </li>
             *     <li>The following constants are allowed:
             *       <ul>
             *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
             *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
             *       </ul>
             *     </li>
             *     <li>The following syntax is expected:
             *       <ul>
             *         <li>'&lt;' and '&gt;' - div elements</li>
             *         <li>'&lt;"class" and '&gt;' - div with a class</li>
             *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
             *       </ul>
             *     </li>
             *     <li>Examples:
             *       <ul>
             *         <li>'&lt;"wrapper"flipt&gt;'</li>
             *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
             *       </ul>
             *     </li>
             *   </ul>
             *  @type string
             *  @default lfrtip <i>(when `jQueryUI` is false)</i> <b>or</b>
             *    <"H"lfr>t<"F"ip> <i>(when `jQueryUI` is true)</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.dom
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "dom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
         *      } );
         *    } );
             */
            "sDom": "lfrtip",


            /**
             * Search delay option. This will throttle full table searches that use the
             * DataTables provided search input element (it does not effect calls to
             * `dt-api search()`, providing a delay before the search is made.
             *  @type integer
             *  @default 0
             *
             *  @dtopt Options
             *  @name DataTable.defaults.searchDelay
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "searchDelay": 200
         *      } );
         *    } )
             */
            "searchDelay": null,


            /**
             * DataTables features four different built-in options for the buttons to
             * display for pagination control:
             *
             * * `simple` - 'Previous' and 'Next' buttons only
             * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
             * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
             * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus
             *   page numbers
             *
             * Further methods can be added using {@link DataTable.ext.oPagination}.
             *  @type string
             *  @default simple_numbers
             *
             *  @dtopt Options
             *  @name DataTable.defaults.pagingType
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "pagingType": "full_numbers"
         *      } );
         *    } )
             */
            "sPaginationType": "simple_numbers",


            /**
             * Enable horizontal scrolling. When a table is too wide to fit into a
             * certain layout, or you have a large number of columns in the table, you
             * can enable x-scrolling to show the table in a viewport, which can be
             * scrolled. This property can be `true` which will allow the table to
             * scroll horizontally when needed, or any CSS unit, or a number (in which
             * case it will be treated as a pixel measurement). Setting as simply `true`
             * is recommended.
             *  @type boolean|string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Features
             *  @name DataTable.defaults.scrollX
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "scrollX": true,
         *        "scrollCollapse": true
         *      } );
         *    } );
             */
            "sScrollX": "",


            /**
             * This property can be used to force a DataTable to use more width than it
             * might otherwise do when x-scrolling is enabled. For example if you have a
             * table which requires to be well spaced, this parameter is useful for
             * "over-sizing" the table, and thus forcing scrolling. This property can by
             * any CSS unit, or a number (in which case it will be treated as a pixel
             * measurement).
             *  @type string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.scrollXInner
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "scrollX": "100%",
         *        "scrollXInner": "110%"
         *      } );
         *    } );
             */
            "sScrollXInner": "",


            /**
             * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
             * to the given height, and enable scrolling for any data which overflows the
             * current viewport. This can be used as an alternative to paging to display
             * a lot of data in a small area (although paging and scrolling can both be
             * enabled at the same time). This property can be any CSS unit, or a number
             * (in which case it will be treated as a pixel measurement).
             *  @type string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Features
             *  @name DataTable.defaults.scrollY
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "scrollY": "200px",
         *        "paginate": false
         *      } );
         *    } );
             */
            "sScrollY": "",


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * Set the HTTP method that is used to make the Ajax call for server-side
             * processing or Ajax sourced data.
             *  @type string
             *  @default GET
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverMethod
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sServerMethod": "GET",


            /**
             * DataTables makes use of renderers when displaying HTML elements for
             * a table. These renderers can be added or modified by plug-ins to
             * generate suitable mark-up for a site. For example the Bootstrap
             * integration plug-in for DataTables uses a paging button renderer to
             * display pagination buttons in the mark-up required by Bootstrap.
             *
             * For further information about the renderers available see
             * DataTable.ext.renderer
             *  @type string|object
             *  @default null
             *
             *  @name DataTable.defaults.renderer
             *
             */
            "renderer": null
        };

        _fnHungarianMap( DataTable.defaults );



        /*
         * Developer note - See note in model.defaults.js about the use of Hungarian
         * notation and camel case.
         */

        /**
         * Column options that can be given to DataTables at initialisation time.
         *  @namespace
         */
        DataTable.defaults.column = {
            /**
             * Define which column(s) an order will occur on for this column. This
             * allows a column's ordering to take multiple columns into account when
             * doing a sort or use the data from a different column. For example first
             * name / last name columns make sense to do a multi-column sort over the
             * two columns.
             *  @type array|int
             *  @default null <i>Takes the value of the column index automatically</i>
             *
             *  @name DataTable.defaults.column.orderData
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "orderData": [ 0, 1 ], "targets": [ 0 ] },
         *          { "orderData": [ 1, 0 ], "targets": [ 1 ] },
         *          { "orderData": 2, "targets": [ 2 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "orderData": [ 0, 1 ] },
         *          { "orderData": [ 1, 0 ] },
         *          { "orderData": 2 },
         *          null,
         *          null
         *        ]
         *      } );
         *    } );
             */
            "aDataSort": null,
            "iDataSort": -1,


            /**
             * You can control the default ordering direction, and even alter the
             * behaviour of the sort handler (i.e. only allow ascending ordering etc)
             * using this parameter.
             *  @type array
             *  @default [ 'asc', 'desc' ]
             *
             *  @name DataTable.defaults.column.orderSequence
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "orderSequence": [ "asc" ], "targets": [ 1 ] },
         *          { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
         *          { "orderSequence": [ "desc" ], "targets": [ 3 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          null,
         *          { "orderSequence": [ "asc" ] },
         *          { "orderSequence": [ "desc", "asc", "asc" ] },
         *          { "orderSequence": [ "desc" ] },
         *          null
         *        ]
         *      } );
         *    } );
             */
            "asSorting": [ 'asc', 'desc' ],


            /**
             * Enable or disable filtering on the data in this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.searchable
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "searchable": false, "targets": [ 0 ] }
         *        ] } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "searchable": false },
         *          null,
         *          null,
         *          null,
         *          null
         *        ] } );
         *    } );
             */
            "bSearchable": true,


            /**
             * Enable or disable ordering on this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.orderable
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "orderable": false, "targets": [ 0 ] }
         *        ] } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "orderable": false },
         *          null,
         *          null,
         *          null,
         *          null
         *        ] } );
         *    } );
             */
            "bSortable": true,


            /**
             * Enable or disable the display of this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.visible
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "visible": false, "targets": [ 0 ] }
         *        ] } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "visible": false },
         *          null,
         *          null,
         *          null,
         *          null
         *        ] } );
         *    } );
             */
            "bVisible": true,


            /**
             * Developer definable function that is called whenever a cell is created (Ajax source,
             * etc) or processed for input (DOM source). This can be used as a compliment to mRender
             * allowing you to modify the DOM element (add background colour for example) when the
             * element is available.
             *  @type function
             *  @param {element} td The TD node that has been created
             *  @param {*} cellData The Data for the cell
             *  @param {array|object} rowData The data for the whole row
             *  @param {int} row The row index for the aoData data store
             *  @param {int} col The column index for aoColumns
             *
             *  @name DataTable.defaults.column.createdCell
             *  @dtopt Columns
             *
             *  @example
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [3],
         *          "createdCell": function (td, cellData, rowData, row, col) {
         *            if ( cellData == "1.7" ) {
         *              $(td).css('color', 'blue')
         *            }
         *          }
         *        } ]
         *      });
         *    } );
             */
            "fnCreatedCell": null,


            /**
             * This parameter has been replaced by `data` in DataTables to ensure naming
             * consistency. `dataProp` can still be used, as there is backwards
             * compatibility in DataTables for this option, but it is strongly
             * recommended that you use `data` in preference to `dataProp`.
             *  @name DataTable.defaults.column.dataProp
             */


            /**
             * This property can be used to read data from any data source property,
             * including deeply nested objects / properties. `data` can be given in a
             * number of different ways which effect its behaviour:
             *
             * * `integer` - treated as an array index for the data source. This is the
             *   default that DataTables uses (incrementally increased for each column).
             * * `string` - read an object property from the data source. There are
             *   three 'special' options that can be used in the string to alter how
             *   DataTables reads the data from the source object:
             *    * `.` - Dotted Javascript notation. Just as you use a `.` in
             *      Javascript to read from nested objects, so to can the options
             *      specified in `data`. For example: `browser.version` or
             *      `browser.name`. If your object parameter name contains a period, use
             *      `\\` to escape it - i.e. `first\\.name`.
             *    * `[]` - Array notation. DataTables can automatically combine data
             *      from and array source, joining the data with the characters provided
             *      between the two brackets. For example: `name[, ]` would provide a
             *      comma-space separated list from the source array. If no characters
             *      are provided between the brackets, the original array source is
             *      returned.
             *    * `()` - Function notation. Adding `()` to the end of a parameter will
             *      execute a function of the name given. For example: `browser()` for a
             *      simple function on the data source, `browser.version()` for a
             *      function in a nested property or even `browser().version` to get an
             *      object property if the function called returns an object. Note that
             *      function notation is recommended for use in `render` rather than
             *      `data` as it is much simpler to use as a renderer.
             * * `null` - use the original data source for the row rather than plucking
             *   data directly from it. This action has effects on two other
             *   initialisation options:
             *    * `defaultContent` - When null is given as the `data` option and
             *      `defaultContent` is specified for the column, the value defined by
             *      `defaultContent` will be used for the cell.
             *    * `render` - When null is used for the `data` option and the `render`
             *      option is specified for the column, the whole data source for the
             *      row is used for the renderer.
             * * `function` - the function given will be executed whenever DataTables
             *   needs to set or get the data for a cell in the column. The function
             *   takes three parameters:
             *    * Parameters:
             *      * `{array|object}` The data source for the row
             *      * `{string}` The type call data requested - this will be 'set' when
             *        setting data or 'filter', 'display', 'type', 'sort' or undefined
             *        when gathering data. Note that when `undefined` is given for the
             *        type DataTables expects to get the raw data for the object back<
             *      * `{*}` Data to set when the second parameter is 'set'.
             *    * Return:
             *      * The return value from the function is not required when 'set' is
             *        the type of call, but otherwise the return is what will be used
             *        for the data requested.
             *
             * Note that `data` is a getter and setter option. If you just require
             * formatting of data for output, you will likely want to use `render` which
             * is simply a getter and thus simpler to use.
             *
             * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
             * name change reflects the flexibility of this property and is consistent
             * with the naming of mRender. If 'mDataProp' is given, then it will still
             * be used by DataTables, as it automatically maps the old name to the new
             * if required.
             *
             *  @type string|int|function|null
             *  @default null <i>Use automatically calculated column index</i>
             *
             *  @name DataTable.defaults.column.data
             *  @dtopt Columns
             *
             *  @example
             *    // Read table data from objects
             *    // JSON structure for each row:
             *    //   {
         *    //      "engine": {value},
         *    //      "browser": {value},
         *    //      "platform": {value},
         *    //      "version": {value},
         *    //      "grade": {value}
         *    //   }
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "ajaxSource": "sources/objects.txt",
         *        "columns": [
         *          { "data": "engine" },
         *          { "data": "browser" },
         *          { "data": "platform" },
         *          { "data": "version" },
         *          { "data": "grade" }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Read information from deeply nested objects
             *    // JSON structure for each row:
             *    //   {
         *    //      "engine": {value},
         *    //      "browser": {value},
         *    //      "platform": {
         *    //         "inner": {value}
         *    //      },
         *    //      "details": [
         *    //         {value}, {value}
         *    //      ]
         *    //   }
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "ajaxSource": "sources/deep.txt",
         *        "columns": [
         *          { "data": "engine" },
         *          { "data": "browser" },
         *          { "data": "platform.inner" },
         *          { "data": "platform.details.0" },
         *          { "data": "platform.details.1" }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `data` as a function to provide different information for
             *    // sorting, filtering and display. In this case, currency (price)
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": function ( source, type, val ) {
         *            if (type === 'set') {
         *              source.price = val;
         *              // Store the computed dislay and filter values for efficiency
         *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
         *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
         *              return;
         *            }
         *            else if (type === 'display') {
         *              return source.price_display;
         *            }
         *            else if (type === 'filter') {
         *              return source.price_filter;
         *            }
         *            // 'sort', 'type' and undefined all just use the integer
         *            return source.price;
         *          }
         *        } ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using default content
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": null,
         *          "defaultContent": "Click to edit"
         *        } ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using array notation - outputting a list from an array
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": "name[, ]"
         *        } ]
         *      } );
         *    } );
             *
             */
            "mData": null,


            /**
             * This property is the rendering partner to `data` and it is suggested that
             * when you want to manipulate data for display (including filtering,
             * sorting etc) without altering the underlying data for the table, use this
             * property. `render` can be considered to be the the read only companion to
             * `data` which is read / write (then as such more complex). Like `data`
             * this option can be given in a number of different ways to effect its
             * behaviour:
             *
             * * `integer` - treated as an array index for the data source. This is the
             *   default that DataTables uses (incrementally increased for each column).
             * * `string` - read an object property from the data source. There are
             *   three 'special' options that can be used in the string to alter how
             *   DataTables reads the data from the source object:
             *    * `.` - Dotted Javascript notation. Just as you use a `.` in
             *      Javascript to read from nested objects, so to can the options
             *      specified in `data`. For example: `browser.version` or
             *      `browser.name`. If your object parameter name contains a period, use
             *      `\\` to escape it - i.e. `first\\.name`.
             *    * `[]` - Array notation. DataTables can automatically combine data
             *      from and array source, joining the data with the characters provided
             *      between the two brackets. For example: `name[, ]` would provide a
             *      comma-space separated list from the source array. If no characters
             *      are provided between the brackets, the original array source is
             *      returned.
             *    * `()` - Function notation. Adding `()` to the end of a parameter will
             *      execute a function of the name given. For example: `browser()` for a
             *      simple function on the data source, `browser.version()` for a
             *      function in a nested property or even `browser().version` to get an
             *      object property if the function called returns an object.
             * * `object` - use different data for the different data types requested by
             *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
             *   of the object is the data type the property refers to and the value can
             *   defined using an integer, string or function using the same rules as
             *   `render` normally does. Note that an `_` option _must_ be specified.
             *   This is the default value to use if you haven't specified a value for
             *   the data type requested by DataTables.
             * * `function` - the function given will be executed whenever DataTables
             *   needs to set or get the data for a cell in the column. The function
             *   takes three parameters:
             *    * Parameters:
             *      * {array|object} The data source for the row (based on `data`)
             *      * {string} The type call data requested - this will be 'filter',
             *        'display', 'type' or 'sort'.
             *      * {array|object} The full data source for the row (not based on
             *        `data`)
             *    * Return:
             *      * The return value from the function is what will be used for the
             *        data requested.
             *
             *  @type string|int|function|object|null
             *  @default null Use the data source value.
             *
             *  @name DataTable.defaults.column.render
             *  @dtopt Columns
             *
             *  @example
             *    // Create a comma separated list from an array of objects
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "ajaxSource": "sources/deep.txt",
         *        "columns": [
         *          { "data": "engine" },
         *          { "data": "browser" },
         *          {
         *            "data": "platform",
         *            "render": "[, ].name"
         *          }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Execute a function to obtain data
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": null, // Use the full data source object for the renderer's source
         *          "render": "browserName()"
         *        } ]
         *      } );
         *    } );
             *
             *  @example
             *    // As an object, extracting different data for the different types
             *    // This would be used with a data source such as:
             *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
             *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
             *    // (which has both forms) is used for filtering for if a user inputs either format, while
             *    // the formatted phone number is the one that is shown in the table.
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": null, // Use the full data source object for the renderer's source
         *          "render": {
         *            "_": "phone",
         *            "filter": "phone_filter",
         *            "display": "phone_display"
         *          }
         *        } ]
         *      } );
         *    } );
             *
             *  @example
             *    // Use as a function to create a link from the data source
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "data": "download_link",
         *          "render": function ( data, type, full ) {
         *            return '<a href="'+data+'">Download</a>';
         *          }
         *        } ]
         *      } );
         *    } );
             */
            "mRender": null,


            /**
             * Change the cell type created for the column - either TD cells or TH cells. This
             * can be useful as TH cells have semantic meaning in the table body, allowing them
             * to act as a header for a row (you may wish to add scope='row' to the TH elements).
             *  @type string
             *  @default td
             *
             *  @name DataTable.defaults.column.cellType
             *  @dtopt Columns
             *
             *  @example
             *    // Make the first column use TH cells
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [ {
         *          "targets": [ 0 ],
         *          "cellType": "th"
         *        } ]
         *      } );
         *    } );
             */
            "sCellType": "td",


            /**
             * Class to give to each cell in this column.
             *  @type string
             *  @default <i>Empty string</i>
             *
             *  @name DataTable.defaults.column.class
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "class": "my_class", "targets": [ 0 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "class": "my_class" },
         *          null,
         *          null,
         *          null,
         *          null
         *        ]
         *      } );
         *    } );
             */
            "sClass": "",

            /**
             * When DataTables calculates the column widths to assign to each column,
             * it finds the longest string in each column and then constructs a
             * temporary table and reads the widths from that. The problem with this
             * is that "mmm" is much wider then "iiii", but the latter is a longer
             * string - thus the calculation can go wrong (doing it properly and putting
             * it into an DOM object and measuring that is horribly(!) slow). Thus as
             * a "work around" we provide this option. It will append its value to the
             * text that is found to be the longest string for the column - i.e. padding.
             * Generally you shouldn't need this!
             *  @type string
             *  @default <i>Empty string<i>
             *
             *  @name DataTable.defaults.column.contentPadding
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          null,
         *          null,
         *          null,
         *          {
         *            "contentPadding": "mmm"
         *          }
         *        ]
         *      } );
         *    } );
             */
            "sContentPadding": "",


            /**
             * Allows a default value to be given for a column's data, and will be used
             * whenever a null data source is encountered (this can be because `data`
             * is set to null, or because the data source itself is null).
             *  @type string
             *  @default null
             *
             *  @name DataTable.defaults.column.defaultContent
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          {
         *            "data": null,
         *            "defaultContent": "Edit",
         *            "targets": [ -1 ]
         *          }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          null,
         *          null,
         *          null,
         *          {
         *            "data": null,
         *            "defaultContent": "Edit"
         *          }
         *        ]
         *      } );
         *    } );
             */
            "sDefaultContent": null,


            /**
             * This parameter is only used in DataTables' server-side processing. It can
             * be exceptionally useful to know what columns are being displayed on the
             * client side, and to map these to database fields. When defined, the names
             * also allow DataTables to reorder information from the server if it comes
             * back in an unexpected order (i.e. if you switch your columns around on the
             * client-side, your server-side code does not also need updating).
             *  @type string
             *  @default <i>Empty string</i>
             *
             *  @name DataTable.defaults.column.name
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "name": "engine", "targets": [ 0 ] },
         *          { "name": "browser", "targets": [ 1 ] },
         *          { "name": "platform", "targets": [ 2 ] },
         *          { "name": "version", "targets": [ 3 ] },
         *          { "name": "grade", "targets": [ 4 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "name": "engine" },
         *          { "name": "browser" },
         *          { "name": "platform" },
         *          { "name": "version" },
         *          { "name": "grade" }
         *        ]
         *      } );
         *    } );
             */
            "sName": "",


            /**
             * Defines a data source type for the ordering which can be used to read
             * real-time information from the table (updating the internally cached
             * version) prior to ordering. This allows ordering to occur on user
             * editable elements such as form inputs.
             *  @type string
             *  @default std
             *
             *  @name DataTable.defaults.column.orderDataType
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "orderDataType": "dom-text", "targets": [ 2, 3 ] },
         *          { "type": "numeric", "targets": [ 3 ] },
         *          { "orderDataType": "dom-select", "targets": [ 4 ] },
         *          { "orderDataType": "dom-checkbox", "targets": [ 5 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          null,
         *          null,
         *          { "orderDataType": "dom-text" },
         *          { "orderDataType": "dom-text", "type": "numeric" },
         *          { "orderDataType": "dom-select" },
         *          { "orderDataType": "dom-checkbox" }
         *        ]
         *      } );
         *    } );
             */
            "sSortDataType": "std",


            /**
             * The title of this column.
             *  @type string
             *  @default null <i>Derived from the 'TH' value for this column in the
             *    original HTML table.</i>
             *
             *  @name DataTable.defaults.column.title
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "title": "My column title", "targets": [ 0 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "title": "My column title" },
         *          null,
         *          null,
         *          null,
         *          null
         *        ]
         *      } );
         *    } );
             */
            "sTitle": null,


            /**
             * The type allows you to specify how the data for this column will be
             * ordered. Four types (string, numeric, date and html (which will strip
             * HTML tags before ordering)) are currently available. Note that only date
             * formats understood by Javascript's Date() object will be accepted as type
             * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
             * 'numeric', 'date' or 'html' (by default). Further types can be adding
             * through plug-ins.
             *  @type string
             *  @default null <i>Auto-detected from raw data</i>
             *
             *  @name DataTable.defaults.column.type
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "type": "html", "targets": [ 0 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "type": "html" },
         *          null,
         *          null,
         *          null,
         *          null
         *        ]
         *      } );
         *    } );
             */
            "sType": null,


            /**
             * Defining the width of the column, this parameter may take any CSS value
             * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
             * been given a specific width through this interface ensuring that the table
             * remains readable.
             *  @type string
             *  @default null <i>Automatic</i>
             *
             *  @name DataTable.defaults.column.width
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columnDefs": [
         *          { "width": "20%", "targets": [ 0 ] }
         *        ]
         *      } );
         *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
         *      $('#example').dataTable( {
         *        "columns": [
         *          { "width": "20%" },
         *          null,
         *          null,
         *          null,
         *          null
         *        ]
         *      } );
         *    } );
             */
            "sWidth": null
        };

        _fnHungarianMap( DataTable.defaults.column );



        /**
         * DataTables settings object - this holds all the information needed for a
         * given table, including configuration, data and current application of the
         * table options. DataTables does not have a single instance for each DataTable
         * with the settings attached to that instance, but rather instances of the
         * DataTable "class" are created on-the-fly as needed (typically by a
         * $().dataTable() call) and the settings object is then applied to that
         * instance.
         *
         * Note that this object is related to {@link DataTable.defaults} but this
         * one is the internal data store for DataTables's cache of columns. It should
         * NOT be manipulated outside of DataTables. Any configuration should be done
         * through the initialisation options.
         *  @namespace
         *  @todo Really should attach the settings object to individual instances so we
         *    don't need to create new instances on each $().dataTable() call (if the
         *    table already exists). It would also save passing oSettings around and
         *    into every single function. However, this is a very significant
         *    architecture change for DataTables and will almost certainly break
         *    backwards compatibility with older installations. This is something that
         *    will be done in 2.0.
         */
        DataTable.models.oSettings = {
            /**
             * Primary features of DataTables and their enablement state.
             *  @namespace
             */
            "oFeatures": {

                /**
                 * Flag to say if DataTables should automatically try to calculate the
                 * optimum table and columns widths (true) or not (false).
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bAutoWidth": null,

                /**
                 * Delay the creation of TR and TD elements until they are actually
                 * needed by a driven page draw. This can give a significant speed
                 * increase for Ajax source and Javascript source data, but makes no
                 * difference at all fro DOM and server-side processing tables.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bDeferRender": null,

                /**
                 * Enable filtering on the table or not. Note that if this is disabled
                 * then there is no filtering at all on the table, including fnFilter.
                 * To just remove the filtering input use sDom and remove the 'f' option.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bFilter": null,

                /**
                 * Table information element (the 'Showing x of y records' div) enable
                 * flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bInfo": null,

                /**
                 * Present a user control allowing the end user to change the page size
                 * when pagination is enabled.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bLengthChange": null,

                /**
                 * Pagination enabled or not. Note that if this is disabled then length
                 * changing must also be disabled.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bPaginate": null,

                /**
                 * Processing indicator enable flag whenever DataTables is enacting a
                 * user request - typically an Ajax request for server-side processing.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bProcessing": null,

                /**
                 * Server-side processing enabled flag - when enabled DataTables will
                 * get all data from the server for every draw - there is no filtering,
                 * sorting or paging done on the client-side.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bServerSide": null,

                /**
                 * Sorting enablement flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSort": null,

                /**
                 * Multi-column sorting
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSortMulti": null,

                /**
                 * Apply a class to the columns which are being sorted to provide a
                 * visual highlight or not. This can slow things down when enabled since
                 * there is a lot of DOM interaction.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSortClasses": null,

                /**
                 * State saving enablement flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bStateSave": null
            },


            /**
             * Scrolling settings for a table.
             *  @namespace
             */
            "oScroll": {
                /**
                 * When the table is shorter in height than sScrollY, collapse the
                 * table container down to the height of the table (when true).
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bCollapse": null,

                /**
                 * Width of the scrollbar for the web-browser's platform. Calculated
                 * during table initialisation.
                 *  @type int
                 *  @default 0
                 */
                "iBarWidth": 0,

                /**
                 * Viewport width for horizontal scrolling. Horizontal scrolling is
                 * disabled if an empty string.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 */
                "sX": null,

                /**
                 * Width to expand the table to when using x-scrolling. Typically you
                 * should not need to use this.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 *  @deprecated
                 */
                "sXInner": null,

                /**
                 * Viewport height for vertical scrolling. Vertical scrolling is disabled
                 * if an empty string.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 */
                "sY": null
            },

            /**
             * Language information for the table.
             *  @namespace
             *  @extends DataTable.defaults.oLanguage
             */
            "oLanguage": {
                /**
                 * Information callback function. See
                 * {@link DataTable.defaults.fnInfoCallback}
                 *  @type function
                 *  @default null
                 */
                "fnInfoCallback": null
            },

            /**
             * Browser support parameters
             *  @namespace
             */
            "oBrowser": {
                /**
                 * Indicate if the browser incorrectly calculates width:100% inside a
                 * scrolling element (IE6/7)
                 *  @type boolean
                 *  @default false
                 */
                "bScrollOversize": false,

                /**
                 * Determine if the vertical scrollbar is on the right or left of the
                 * scrolling container - needed for rtl language layout, although not
                 * all browsers move the scrollbar (Safari).
                 *  @type boolean
                 *  @default false
                 */
                "bScrollbarLeft": false
            },


            "ajax": null,


            /**
             * Array referencing the nodes which are used for the features. The
             * parameters of this object match what is allowed by sDom - i.e.
             *   <ul>
             *     <li>'l' - Length changing</li>
             *     <li>'f' - Filtering input</li>
             *     <li>'t' - The table!</li>
             *     <li>'i' - Information</li>
             *     <li>'p' - Pagination</li>
             *     <li>'r' - pRocessing</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aanFeatures": [],

            /**
             * Store data information - see {@link DataTable.models.oRow} for detailed
             * information.
             *  @type array
             *  @default []
             */
            "aoData": [],

            /**
             * Array of indexes which are in the current display (after filtering etc)
             *  @type array
             *  @default []
             */
            "aiDisplay": [],

            /**
             * Array of indexes for display - no filtering
             *  @type array
             *  @default []
             */
            "aiDisplayMaster": [],

            /**
             * Store information about each column that is in use
             *  @type array
             *  @default []
             */
            "aoColumns": [],

            /**
             * Store information about the table's header
             *  @type array
             *  @default []
             */
            "aoHeader": [],

            /**
             * Store information about the table's footer
             *  @type array
             *  @default []
             */
            "aoFooter": [],

            /**
             * Store the applied global search information in case we want to force a
             * research or compare the old search to a new one.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @namespace
             *  @extends DataTable.models.oSearch
             */
            "oPreviousSearch": {},

            /**
             * Store the applied search for each column - see
             * {@link DataTable.models.oSearch} for the format that is used for the
             * filtering information for each column.
             *  @type array
             *  @default []
             */
            "aoPreSearchCols": [],

            /**
             * Sorting that is applied to the table. Note that the inner arrays are
             * used in the following manner:
             * <ul>
             *   <li>Index 0 - column number</li>
             *   <li>Index 1 - current sorting direction</li>
             * </ul>
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @todo These inner arrays should really be objects
             */
            "aaSorting": null,

            /**
             * Sorting that is always applied to the table (i.e. prefixed in front of
             * aaSorting).
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "aaSortingFixed": [],

            /**
             * Classes to use for the striping of a table.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "asStripeClasses": null,

            /**
             * If restoring a table - we should restore its striping classes as well
             *  @type array
             *  @default []
             */
            "asDestroyStripes": [],

            /**
             * If restoring a table - we should restore its width
             *  @type int
             *  @default 0
             */
            "sDestroyWidth": 0,

            /**
             * Callback functions array for every time a row is inserted (i.e. on a draw).
             *  @type array
             *  @default []
             */
            "aoRowCallback": [],

            /**
             * Callback functions for the header on each draw.
             *  @type array
             *  @default []
             */
            "aoHeaderCallback": [],

            /**
             * Callback function for the footer on each draw.
             *  @type array
             *  @default []
             */
            "aoFooterCallback": [],

            /**
             * Array of callback functions for draw callback functions
             *  @type array
             *  @default []
             */
            "aoDrawCallback": [],

            /**
             * Array of callback functions for row created function
             *  @type array
             *  @default []
             */
            "aoRowCreatedCallback": [],

            /**
             * Callback functions for just before the table is redrawn. A return of
             * false will be used to cancel the draw.
             *  @type array
             *  @default []
             */
            "aoPreDrawCallback": [],

            /**
             * Callback functions for when the table has been initialised.
             *  @type array
             *  @default []
             */
            "aoInitComplete": [],


            /**
             * Callbacks for modifying the settings to be stored for state saving, prior to
             * saving state.
             *  @type array
             *  @default []
             */
            "aoStateSaveParams": [],

            /**
             * Callbacks for modifying the settings that have been stored for state saving
             * prior to using the stored values to restore the state.
             *  @type array
             *  @default []
             */
            "aoStateLoadParams": [],

            /**
             * Callbacks for operating on the settings object once the saved state has been
             * loaded
             *  @type array
             *  @default []
             */
            "aoStateLoaded": [],

            /**
             * Cache the table ID for quick access
             *  @type string
             *  @default <i>Empty string</i>
             */
            "sTableId": "",

            /**
             * The TABLE node for the main table
             *  @type node
             *  @default null
             */
            "nTable": null,

            /**
             * Permanent ref to the thead element
             *  @type node
             *  @default null
             */
            "nTHead": null,

            /**
             * Permanent ref to the tfoot element - if it exists
             *  @type node
             *  @default null
             */
            "nTFoot": null,

            /**
             * Permanent ref to the tbody element
             *  @type node
             *  @default null
             */
            "nTBody": null,

            /**
             * Cache the wrapper node (contains all DataTables controlled elements)
             *  @type node
             *  @default null
             */
            "nTableWrapper": null,

            /**
             * Indicate if when using server-side processing the loading of data
             * should be deferred until the second draw.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             *  @default false
             */
            "bDeferLoading": false,

            /**
             * Indicate if all required information has been read in
             *  @type boolean
             *  @default false
             */
            "bInitialised": false,

            /**
             * Information about open rows. Each object in the array has the parameters
             * 'nTr' and 'nParent'
             *  @type array
             *  @default []
             */
            "aoOpenRows": [],

            /**
             * Dictate the positioning of DataTables' control elements - see
             * {@link DataTable.model.oInit.sDom}.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default null
             */
            "sDom": null,

            /**
             * Search delay (in mS)
             *  @type integer
             *  @default null
             */
            "searchDelay": null,

            /**
             * Which type of pagination should be used.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default two_button
             */
            "sPaginationType": "two_button",

            /**
             * The state duration (for `stateSave`) in seconds.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type int
             *  @default 0
             */
            "iStateDuration": 0,

            /**
             * Array of callback functions for state saving. Each array element is an
             * object with the following parameters:
             *   <ul>
             *     <li>function:fn - function to call. Takes two parameters, oSettings
             *       and the JSON string to save that has been thus far created. Returns
             *       a JSON string to be inserted into a json object
             *       (i.e. '"param": [ 0, 1, 2]')</li>
             *     <li>string:sName - name of callback</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aoStateSave": [],

            /**
             * Array of callback functions for state loading. Each array element is an
             * object with the following parameters:
             *   <ul>
             *     <li>function:fn - function to call. Takes two parameters, oSettings
             *       and the object stored. May return false to cancel state loading</li>
             *     <li>string:sName - name of callback</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aoStateLoad": [],

            /**
             * State that was saved. Useful for back reference
             *  @type object
             *  @default null
             */
            "oSavedState": null,

            /**
             * State that was loaded. Useful for back reference
             *  @type object
             *  @default null
             */
            "oLoadedState": null,

            /**
             * Source url for AJAX data for the table.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default null
             */
            "sAjaxSource": null,

            /**
             * Property from a given object from which to read the table data from. This
             * can be an empty string (when not server-side processing), in which case
             * it is  assumed an an array is given directly.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             */
            "sAjaxDataProp": null,

            /**
             * Note if draw should be blocked while getting data
             *  @type boolean
             *  @default true
             */
            "bAjaxDataGet": true,

            /**
             * The last jQuery XHR object that was used for server-side data gathering.
             * This can be used for working with the XHR information in one of the
             * callbacks
             *  @type object
             *  @default null
             */
            "jqXHR": null,

            /**
             * JSON returned from the server in the last Ajax request
             *  @type object
             *  @default undefined
             */
            "json": undefined,

            /**
             * Data submitted as part of the last Ajax request
             *  @type object
             *  @default undefined
             */
            "oAjaxData": undefined,

            /**
             * Function to get the server-side data.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type function
             */
            "fnServerData": null,

            /**
             * Functions which are called prior to sending an Ajax request so extra
             * parameters can easily be sent to the server
             *  @type array
             *  @default []
             */
            "aoServerParams": [],

            /**
             * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
             * required).
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             */
            "sServerMethod": null,

            /**
             * Format numbers for display.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type function
             */
            "fnFormatNumber": null,

            /**
             * List of options that can be used for the user selectable length menu.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "aLengthMenu": null,

            /**
             * Counter for the draws that the table does. Also used as a tracker for
             * server-side processing
             *  @type int
             *  @default 0
             */
            "iDraw": 0,

            /**
             * Indicate if a redraw is being done - useful for Ajax
             *  @type boolean
             *  @default false
             */
            "bDrawing": false,

            /**
             * Draw index (iDraw) of the last error when parsing the returned data
             *  @type int
             *  @default -1
             */
            "iDrawError": -1,

            /**
             * Paging display length
             *  @type int
             *  @default 10
             */
            "_iDisplayLength": 10,

            /**
             * Paging start point - aiDisplay index
             *  @type int
             *  @default 0
             */
            "_iDisplayStart": 0,

            /**
             * Server-side processing - number of records in the result set
             * (i.e. before filtering), Use fnRecordsTotal rather than
             * this property to get the value of the number of records, regardless of
             * the server-side processing setting.
             *  @type int
             *  @default 0
             *  @private
             */
            "_iRecordsTotal": 0,

            /**
             * Server-side processing - number of records in the current display set
             * (i.e. after filtering). Use fnRecordsDisplay rather than
             * this property to get the value of the number of records, regardless of
             * the server-side processing setting.
             *  @type boolean
             *  @default 0
             *  @private
             */
            "_iRecordsDisplay": 0,

            /**
             * Flag to indicate if jQuery UI marking and classes should be used.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             */
            "bJUI": null,

            /**
             * The classes to use for the table
             *  @type object
             *  @default {}
             */
            "oClasses": {},

            /**
             * Flag attached to the settings object so you can check in the draw
             * callback if filtering has been done in the draw. Deprecated in favour of
             * events.
             *  @type boolean
             *  @default false
             *  @deprecated
             */
            "bFiltered": false,

            /**
             * Flag attached to the settings object so you can check in the draw
             * callback if sorting has been done in the draw. Deprecated in favour of
             * events.
             *  @type boolean
             *  @default false
             *  @deprecated
             */
            "bSorted": false,

            /**
             * Indicate that if multiple rows are in the header and there is more than
             * one unique cell per column, if the top one (true) or bottom one (false)
             * should be used for sorting / title by DataTables.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             */
            "bSortCellsTop": null,

            /**
             * Initialisation object that is used for the table
             *  @type object
             *  @default null
             */
            "oInit": null,

            /**
             * Destroy callback functions - for plug-ins to attach themselves to the
             * destroy so they can clean up markup and events.
             *  @type array
             *  @default []
             */
            "aoDestroyCallback": [],


            /**
             * Get the number of records in the current record set, before filtering
             *  @type function
             */
            "fnRecordsTotal": function ()
            {
                return _fnDataSource( this ) == 'ssp' ?
                this._iRecordsTotal * 1 :
                    this.aiDisplayMaster.length;
            },

            /**
             * Get the number of records in the current record set, after filtering
             *  @type function
             */
            "fnRecordsDisplay": function ()
            {
                return _fnDataSource( this ) == 'ssp' ?
                this._iRecordsDisplay * 1 :
                    this.aiDisplay.length;
            },

            /**
             * Get the display end point - aiDisplay index
             *  @type function
             */
            "fnDisplayEnd": function ()
            {
                var
                    len      = this._iDisplayLength,
                    start    = this._iDisplayStart,
                    calc     = start + len,
                    records  = this.aiDisplay.length,
                    features = this.oFeatures,
                    paginate = features.bPaginate;

                if ( features.bServerSide ) {
                    return paginate === false || len === -1 ?
                    start + records :
                        Math.min( start+len, this._iRecordsDisplay );
                }
                else {
                    return ! paginate || calc>records || len===-1 ?
                        records :
                        calc;
                }
            },

            /**
             * The DataTables object for this table
             *  @type object
             *  @default null
             */
            "oInstance": null,

            /**
             * Unique identifier for each instance of the DataTables object. If there
             * is an ID on the table node, then it takes that value, otherwise an
             * incrementing internal counter is used.
             *  @type string
             *  @default null
             */
            "sInstance": null,

            /**
             * tabindex attribute value that is added to DataTables control elements, allowing
             * keyboard navigation of the table and its controls.
             */
            "iTabIndex": 0,

            /**
             * DIV container for the footer scrolling table if scrolling
             */
            "nScrollHead": null,

            /**
             * DIV container for the footer scrolling table if scrolling
             */
            "nScrollFoot": null,

            /**
             * Last applied sort
             *  @type array
             *  @default []
             */
            "aLastSort": [],

            /**
             * Stored plug-in instances
             *  @type object
             *  @default {}
             */
            "oPlugins": {}
        };

        /**
         * Extension object for DataTables that is used to provide all extension
         * options.
         *
         * Note that the `DataTable.ext` object is available through
         * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
         * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
         *  @namespace
         *  @extends DataTable.models.ext
         */


        /**
         * DataTables extensions
         *
         * This namespace acts as a collection area for plug-ins that can be used to
         * extend DataTables capabilities. Indeed many of the build in methods
         * use this method to provide their own capabilities (sorting methods for
         * example).
         *
         * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
         * reasons
         *
         *  @namespace
         */
        DataTable.ext = _ext = {
            /**
             * Element class names
             *
             *  @type object
             *  @default {}
             */
            classes: {},


            /**
             * Error reporting.
             *
             * How should DataTables report an error. Can take the value 'alert' or
             * 'throw'
             *
             *  @type string
             *  @default alert
             */
            errMode: "alert",


            /**
             * Feature plug-ins.
             *
             * This is an array of objects which describe the feature plug-ins that are
             * available to DataTables. These feature plug-ins are then available for
             * use through the `dom` initialisation option.
             *
             * Each feature plug-in is described by an object which must have the
             * following properties:
             *
             * * `fnInit` - function that is used to initialise the plug-in,
             * * `cFeature` - a character so the feature can be enabled by the `dom`
             *   instillation option. This is case sensitive.
             *
             * The `fnInit` function has the following input parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             *
             * And the following return is expected:
             *
             * * {node|null} The element which contains your feature. Note that the
             *   return may also be void if your plug-in does not require to inject any
             *   DOM elements into DataTables control (`dom`) - for example this might
             *   be useful when developing a plug-in which allows table control via
             *   keyboard entry
             *
             *  @type array
             *
             *  @example
             *    $.fn.dataTable.ext.features.push( {
         *      "fnInit": function( oSettings ) {
         *        return new TableTools( { "oDTSettings": oSettings } );
         *      },
         *      "cFeature": "T"
         *    } );
             */
            feature: [],


            /**
             * Row searching.
             *
             * This method of searching is complimentary to the default type based
             * searching, and a lot more comprehensive as it allows you complete control
             * over the searching logic. Each element in this array is a function
             * (parameters described below) that is called for every row in the table,
             * and your logic decides if it should be included in the searching data set
             * or not.
             *
             * Searching functions have the following input parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             * 2. `{array|object}` Data for the row to be processed (same as the
             *    original format that was passed in as the data source, or an array
             *    from a DOM data source
             * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
             *    can be useful to retrieve the `TR` element if you need DOM interaction.
             *
             * And the following return is expected:
             *
             * * {boolean} Include the row in the searched result set (true) or not
             *   (false)
             *
             * Note that as with the main search ability in DataTables, technically this
             * is "filtering", since it is subtractive. However, for consistency in
             * naming we call it searching here.
             *
             *  @type array
             *  @default []
             *
             *  @example
             *    // The following example shows custom search being applied to the
             *    // fourth column (i.e. the data[3] index) based on two input values
             *    // from the end-user, matching the data in a certain range.
             *    $.fn.dataTable.ext.search.push(
             *      function( settings, data, dataIndex ) {
         *        var min = document.getElementById('min').value * 1;
         *        var max = document.getElementById('max').value * 1;
         *        var version = data[3] == "-" ? 0 : data[3]*1;
         *
         *        if ( min == "" && max == "" ) {
         *          return true;
         *        }
         *        else if ( min == "" && version < max ) {
         *          return true;
         *        }
         *        else if ( min < version && "" == max ) {
         *          return true;
         *        }
         *        else if ( min < version && version < max ) {
         *          return true;
         *        }
         *        return false;
         *      }
             *    );
             */
            search: [],


            /**
             * Internal functions, exposed for used in plug-ins.
             *
             * Please note that you should not need to use the internal methods for
             * anything other than a plug-in (and even then, try to avoid if possible).
             * The internal function may change between releases.
             *
             *  @type object
             *  @default {}
             */
            internal: {},


            /**
             * Legacy configuration options. Enable and disable legacy options that
             * are available in DataTables.
             *
             *  @type object
             */
            legacy: {
                /**
                 * Enable / disable DataTables 1.9 compatible server-side processing
                 * requests
                 *
                 *  @type boolean
                 *  @default null
                 */
                ajax: null
            },


            /**
             * Pagination plug-in methods.
             *
             * Each entry in this object is a function and defines which buttons should
             * be shown by the pagination rendering method that is used for the table:
             * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
             * buttons are displayed in the document, while the functions here tell it
             * what buttons to display. This is done by returning an array of button
             * descriptions (what each button will do).
             *
             * Pagination types (the four built in options and any additional plug-in
             * options defined here) can be used through the `paginationType`
             * initialisation parameter.
             *
             * The functions defined take two parameters:
             *
             * 1. `{int} page` The current page index
             * 2. `{int} pages` The number of pages in the table
             *
             * Each function is expected to return an array where each element of the
             * array can be one of:
             *
             * * `first` - Jump to first page when activated
             * * `last` - Jump to last page when activated
             * * `previous` - Show previous page when activated
             * * `next` - Show next page when activated
             * * `{int}` - Show page of the index given
             * * `{array}` - A nested array containing the above elements to add a
             *   containing 'DIV' element (might be useful for styling).
             *
             * Note that DataTables v1.9- used this object slightly differently whereby
             * an object with two functions would be defined for each plug-in. That
             * ability is still supported by DataTables 1.10+ to provide backwards
             * compatibility, but this option of use is now decremented and no longer
             * documented in DataTables 1.10+.
             *
             *  @type object
             *  @default {}
             *
             *  @example
             *    // Show previous, next and current page buttons only
             *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
         *      return [ 'previous', page, 'next' ];
         *    };
             */
            pager: {},


            renderer: {
                pageButton: {},
                header: {}
            },


            /**
             * Ordering plug-ins - custom data source
             *
             * The extension options for ordering of data available here is complimentary
             * to the default type based ordering that DataTables typically uses. It
             * allows much greater control over the the data that is being used to
             * order a column, but is necessarily therefore more complex.
             *
             * This type of ordering is useful if you want to do ordering based on data
             * live from the DOM (for example the contents of an 'input' element) rather
             * than just the static string that DataTables knows of.
             *
             * The way these plug-ins work is that you create an array of the values you
             * wish to be ordering for the column in question and then return that
             * array. The data in the array much be in the index order of the rows in
             * the table (not the currently ordering order!). Which order data gathering
             * function is run here depends on the `dt-init columns.orderDataType`
             * parameter that is used for the column (if any).
             *
             * The functions defined take two parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             * 2. `{int}` Target column index
             *
             * Each function is expected to return an array:
             *
             * * `{array}` Data for the column to be ordering upon
             *
             *  @type array
             *
             *  @example
             *    // Ordering using `input` node values
             *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
             *    {
         *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
         *        return $('input', td).val();
         *      } );
         *    }
             */
            order: {},


            /**
             * Type based plug-ins.
             *
             * Each column in DataTables has a type assigned to it, either by automatic
             * detection or by direct assignment using the `type` option for the column.
             * The type of a column will effect how it is ordering and search (plug-ins
             * can also make use of the column type if required).
             *
             * @namespace
             */
            type: {
                /**
                 * Type detection functions.
                 *
                 * The functions defined in this object are used to automatically detect
                 * a column's type, making initialisation of DataTables super easy, even
                 * when complex data is in the table.
                 *
                 * The functions defined take two parameters:
                 *
                 *  1. `{*}` Data from the column cell to be analysed
                 *  2. `{settings}` DataTables settings object. This can be used to
                 *     perform context specific type detection - for example detection
                 *     based on language settings such as using a comma for a decimal
                 *     place. Generally speaking the options from the settings will not
                 *     be required
                 *
                 * Each function is expected to return:
                 *
                 * * `{string|null}` Data type detected, or null if unknown (and thus
                 *   pass it on to the other type detection functions.
                 *
                 *  @type array
                 *
                 *  @example
                 *    // Currency type detection plug-in:
                 *    $.fn.dataTable.ext.type.detect.push(
                 *      function ( data, settings ) {
             *        // Check the numeric part
             *        if ( ! $.isNumeric( data.substring(1) ) ) {
             *          return null;
             *        }
             *
             *        // Check prefixed by currency
             *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
             *          return 'currency';
             *        }
             *        return null;
             *      }
                 *    );
                 */
                detect: [],


                /**
                 * Type based search formatting.
                 *
                 * The type based searching functions can be used to pre-format the
                 * data to be search on. For example, it can be used to strip HTML
                 * tags or to de-format telephone numbers for numeric only searching.
                 *
                 * Note that is a search is not defined for a column of a given type,
                 * no search formatting will be performed.
                 *
                 * Pre-processing of searching data plug-ins - When you assign the sType
                 * for a column (or have it automatically detected for you by DataTables
                 * or a type detection plug-in), you will typically be using this for
                 * custom sorting, but it can also be used to provide custom searching
                 * by allowing you to pre-processing the data and returning the data in
                 * the format that should be searched upon. This is done by adding
                 * functions this object with a parameter name which matches the sType
                 * for that target column. This is the corollary of <i>afnSortData</i>
                 * for searching data.
                 *
                 * The functions defined take a single parameter:
                 *
                 *  1. `{*}` Data from the column cell to be prepared for searching
                 *
                 * Each function is expected to return:
                 *
                 * * `{string|null}` Formatted string that will be used for the searching.
                 *
                 *  @type object
                 *  @default {}
                 *
                 *  @example
                 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
             *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
             *    }
                 */
                search: {},


                /**
                 * Type based ordering.
                 *
                 * The column type tells DataTables what ordering to apply to the table
                 * when a column is sorted upon. The order for each type that is defined,
                 * is defined by the functions available in this object.
                 *
                 * Each ordering option can be described by three properties added to
                 * this object:
                 *
                 * * `{type}-pre` - Pre-formatting function
                 * * `{type}-asc` - Ascending order function
                 * * `{type}-desc` - Descending order function
                 *
                 * All three can be used together, only `{type}-pre` or only
                 * `{type}-asc` and `{type}-desc` together. It is generally recommended
                 * that only `{type}-pre` is used, as this provides the optimal
                 * implementation in terms of speed, although the others are provided
                 * for compatibility with existing Javascript sort functions.
                 *
                 * `{type}-pre`: Functions defined take a single parameter:
                 *
                 *  1. `{*}` Data from the column cell to be prepared for ordering
                 *
                 * And return:
                 *
                 * * `{*}` Data to be sorted upon
                 *
                 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
                 * functions, taking two parameters:
                 *
                 *  1. `{*}` Data to compare to the second parameter
                 *  2. `{*}` Data to compare to the first parameter
                 *
                 * And returning:
                 *
                 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
                 *   than the second parameter, ===0 if the two parameters are equal and
                 *   >0 if the first parameter should be sorted height than the second
                 *   parameter.
                 *
                 *  @type object
                 *  @default {}
                 *
                 *  @example
                 *    // Numeric ordering of formatted numbers with a pre-formatter
                 *    $.extend( $.fn.dataTable.ext.type.order, {
             *      "string-pre": function(x) {
             *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
             *        return parseFloat( a );
             *      }
             *    } );
                 *
                 *  @example
                 *    // Case-sensitive string ordering, with no pre-formatting method
                 *    $.extend( $.fn.dataTable.ext.order, {
             *      "string-case-asc": function(x,y) {
             *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
             *      },
             *      "string-case-desc": function(x,y) {
             *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
             *      }
             *    } );
                 */
                order: {}
            },

            /**
             * Unique DataTables instance counter
             *
             * @type int
             * @private
             */
            _unique: 0,


            //
            // Depreciated
            // The following properties are retained for backwards compatiblity only.
            // The should not be used in new projects and will be removed in a future
            // version
            //

            /**
             * Version check function.
             *  @type function
             *  @depreciated Since 1.10
             */
            fnVersionCheck: DataTable.fnVersionCheck,


            /**
             * Index for what 'this' index API functions should use
             *  @type int
             *  @deprecated Since v1.10
             */
            iApiIndex: 0,


            /**
             * jQuery UI class container
             *  @type object
             *  @deprecated Since v1.10
             */
            oJUIClasses: {},


            /**
             * Software version
             *  @type string
             *  @deprecated Since v1.10
             */
            sVersion: DataTable.version
        };


        //
        // Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
        //
        $.extend( _ext, {
            afnFiltering: _ext.search,
            aTypes:       _ext.type.detect,
            ofnSearch:    _ext.type.search,
            oSort:        _ext.type.order,
            afnSortData:  _ext.order,
            aoFeatures:   _ext.feature,
            oApi:         _ext.internal,
            oStdClasses:  _ext.classes,
            oPagination:  _ext.pager
        } );


        $.extend( DataTable.ext.classes, {
            "sTable": "dataTable",
            "sNoFooter": "no-footer",

            /* Paging buttons */
            "sPageButton": "paginate_button",
            "sPageButtonActive": "current",
            "sPageButtonDisabled": "disabled",

            /* Striping classes */
            "sStripeOdd": "odd",
            "sStripeEven": "even",

            /* Empty row */
            "sRowEmpty": "dataTables_empty",

            /* Features */
            "sWrapper": "dataTables_wrapper",
            "sFilter": "dataTables_filter",
            "sInfo": "dataTables_info",
            "sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
            "sLength": "dataTables_length",
            "sProcessing": "dataTables_processing",

            /* Sorting */
            "sSortAsc": "sorting_asc",
            "sSortDesc": "sorting_desc",
            "sSortable": "sorting", /* Sortable in both directions */
            "sSortableAsc": "sorting_asc_disabled",
            "sSortableDesc": "sorting_desc_disabled",
            "sSortableNone": "sorting_disabled",
            "sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */

            /* Filtering */
            "sFilterInput": "",

            /* Page length */
            "sLengthSelect": "",

            /* Scrolling */
            "sScrollWrapper": "dataTables_scroll",
            "sScrollHead": "dataTables_scrollHead",
            "sScrollHeadInner": "dataTables_scrollHeadInner",
            "sScrollBody": "dataTables_scrollBody",
            "sScrollFoot": "dataTables_scrollFoot",
            "sScrollFootInner": "dataTables_scrollFootInner",

            /* Misc */
            "sHeaderTH": "",
            "sFooterTH": "",

            // Deprecated
            "sSortJUIAsc": "",
            "sSortJUIDesc": "",
            "sSortJUI": "",
            "sSortJUIAscAllowed": "",
            "sSortJUIDescAllowed": "",
            "sSortJUIWrapper": "",
            "sSortIcon": "",
            "sJUIHeader": "",
            "sJUIFooter": ""
        } );


        (function() {

            // Reused strings for better compression. Closure compiler appears to have a
            // weird edge case where it is trying to expand strings rather than use the
            // variable version. This results in about 200 bytes being added, for very
            // little preference benefit since it this run on script load only.
            var _empty = '';
            _empty = '';

            var _stateDefault = _empty + 'ui-state-default';
            var _sortIcon     = _empty + 'css_right ui-icon ui-icon-';
            var _headerFooter = _empty + 'fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix';

            $.extend( DataTable.ext.oJUIClasses, DataTable.ext.classes, {
                /* Full numbers paging buttons */
                "sPageButton":         "fg-button ui-button "+_stateDefault,
                "sPageButtonActive":   "ui-state-disabled",
                "sPageButtonDisabled": "ui-state-disabled",

                /* Features */
                "sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
                "ui-buttonset-multi paging_", /* Note that the type is postfixed */

                /* Sorting */
                "sSortAsc":            _stateDefault+" sorting_asc",
                "sSortDesc":           _stateDefault+" sorting_desc",
                "sSortable":           _stateDefault+" sorting",
                "sSortableAsc":        _stateDefault+" sorting_asc_disabled",
                "sSortableDesc":       _stateDefault+" sorting_desc_disabled",
                "sSortableNone":       _stateDefault+" sorting_disabled",
                "sSortJUIAsc":         _sortIcon+"triangle-1-n",
                "sSortJUIDesc":        _sortIcon+"triangle-1-s",
                "sSortJUI":            _sortIcon+"carat-2-n-s",
                "sSortJUIAscAllowed":  _sortIcon+"carat-1-n",
                "sSortJUIDescAllowed": _sortIcon+"carat-1-s",
                "sSortJUIWrapper":     "DataTables_sort_wrapper",
                "sSortIcon":           "DataTables_sort_icon",

                /* Scrolling */
                "sScrollHead": "dataTables_scrollHead "+_stateDefault,
                "sScrollFoot": "dataTables_scrollFoot "+_stateDefault,

                /* Misc */
                "sHeaderTH":  _stateDefault,
                "sFooterTH":  _stateDefault,
                "sJUIHeader": _headerFooter+" ui-corner-tl ui-corner-tr",
                "sJUIFooter": _headerFooter+" ui-corner-bl ui-corner-br"
            } );

        }());



        var extPagination = DataTable.ext.pager;

        function _numbers ( page, pages ) {
            var
                numbers = [],
                buttons = extPagination.numbers_length,
                half = Math.floor( buttons / 2 ),
                i = 1;

            if ( pages <= buttons ) {
                numbers = _range( 0, pages );
            }
            else if ( page <= half ) {
                numbers = _range( 0, buttons-2 );
                numbers.push( 'ellipsis' );
                numbers.push( pages-1 );
            }
            else if ( page >= pages - 1 - half ) {
                numbers = _range( pages-(buttons-2), pages );
                numbers.splice( 0, 0, 'ellipsis' ); // no unshift in ie6
                numbers.splice( 0, 0, 0 );
            }
            else {
                numbers = _range( page-1, page+2 );
                numbers.push( 'ellipsis' );
                numbers.push( pages-1 );
                numbers.splice( 0, 0, 'ellipsis' );
                numbers.splice( 0, 0, 0 );
            }

            numbers.DT_el = 'span';
            return numbers;
        }


        $.extend( extPagination, {
            simple: function ( page, pages ) {
                return [ 'previous', 'next' ];
            },

            full: function ( page, pages ) {
                return [  'first', 'previous', 'next', 'last' ];
            },

            simple_numbers: function ( page, pages ) {
                return [ 'previous', _numbers(page, pages), 'next' ];
            },

            full_numbers: function ( page, pages ) {
                return [ 'first', 'previous', _numbers(page, pages), 'next', 'last' ];
            },

            // For testing and plug-ins to use
            _numbers: _numbers,
            numbers_length: 7
        } );


        $.extend( true, DataTable.ext.renderer, {
            pageButton: {
                _: function ( settings, host, idx, buttons, page, pages ) {
                    var classes = settings.oClasses;
                    var lang = settings.oLanguage.oPaginate;
                    var btnDisplay, btnClass, counter=0;

                    var attach = function( container, buttons ) {
                        var i, ien, node, button;
                        var clickHandler = function ( e ) {
                            _fnPageChange( settings, e.data.action, true );
                        };

                        for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                            button = buttons[i];

                            if ( $.isArray( button ) ) {
                                var inner = $( '<'+(button.DT_el || 'div')+'/>' )
                                    .appendTo( container );
                                attach( inner, button );
                            }
                            else {
                                btnDisplay = '';
                                btnClass = '';

                                switch ( button ) {
                                    case 'ellipsis':
                                        container.append('<span>&hellip;</span>');
                                        break;

                                    case 'first':
                                        btnDisplay = lang.sFirst;
                                        btnClass = button + (page > 0 ?
                                            '' : ' '+classes.sPageButtonDisabled);
                                        break;

                                    case 'previous':
                                        btnDisplay = lang.sPrevious;
                                        btnClass = button + (page > 0 ?
                                            '' : ' '+classes.sPageButtonDisabled);
                                        break;

                                    case 'next':
                                        btnDisplay = lang.sNext;
                                        btnClass = button + (page < pages-1 ?
                                            '' : ' '+classes.sPageButtonDisabled);
                                        break;

                                    case 'last':
                                        btnDisplay = lang.sLast;
                                        btnClass = button + (page < pages-1 ?
                                            '' : ' '+classes.sPageButtonDisabled);
                                        break;

                                    default:
                                        btnDisplay = button + 1;
                                        btnClass = page === button ?
                                            classes.sPageButtonActive : '';
                                        break;
                                }

                                if ( btnDisplay ) {
                                    node = $('<a>', {
                                        'class': classes.sPageButton+' '+btnClass,
                                        'aria-controls': settings.sTableId,
                                        'data-dt-idx': counter,
                                        'tabindex': settings.iTabIndex,
                                        'id': idx === 0 && typeof button === 'string' ?
                                        settings.sTableId +'_'+ button :
                                            null
                                    } )
                                        .html( btnDisplay )
                                        .appendTo( container );

                                    _fnBindAction(
                                        node, {action: button}, clickHandler
                                    );

                                    counter++;
                                }
                            }
                        }
                    };

                    // IE9 throws an 'unknown error' if document.activeElement is used
                    // inside an iframe or frame. Try / catch the error. Not good for
                    // accessibility, but neither are frames.
                    try {
                        // Because this approach is destroying and recreating the paging
                        // elements, focus is lost on the select button which is bad for
                        // accessibility. So we want to restore focus once the draw has
                        // completed
                        var activeEl = $(document.activeElement).data('dt-idx');

                        attach( $(host).empty(), buttons );

                        if ( activeEl !== null ) {
                            $(host).find( '[data-dt-idx='+activeEl+']' ).focus();
                        }
                    }
                    catch (e) {}
                }
            }
        } );



        // Built in type detection. See model.ext.aTypes for information about
        // what is required from this methods.
        $.extend( DataTable.ext.type.detect, [
            // Plain numbers - first since V8 detects some plain numbers as dates
            // e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
            function ( d, settings )
            {
                var decimal = settings.oLanguage.sDecimal;
                return _isNumber( d, decimal ) ? 'num'+decimal : null;
            },

            // Dates (only those recognised by the browser's Date.parse)
            function ( d, settings )
            {
                // V8 will remove any unknown characters at the start and end of the
                // expression, leading to false matches such as `$245.12` or `10%` being
                // a valid date. See forum thread 18941 for detail.
                if ( d && !(d instanceof Date) && ( ! _re_date_start.test(d) || ! _re_date_end.test(d) ) ) {
                    return null;
                }
                var parsed = Date.parse(d);
                return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
            },

            // Formatted numbers
            function ( d, settings )
            {
                var decimal = settings.oLanguage.sDecimal;
                return _isNumber( d, decimal, true ) ? 'num-fmt'+decimal : null;
            },

            // HTML numeric
            function ( d, settings )
            {
                var decimal = settings.oLanguage.sDecimal;
                return _htmlNumeric( d, decimal ) ? 'html-num'+decimal : null;
            },

            // HTML numeric, formatted
            function ( d, settings )
            {
                var decimal = settings.oLanguage.sDecimal;
                return _htmlNumeric( d, decimal, true ) ? 'html-num-fmt'+decimal : null;
            },

            // HTML (this is strict checking - there must be html)
            function ( d, settings )
            {
                return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
                    'html' : null;
            }
        ] );



        // Filter formatting functions. See model.ext.ofnSearch for information about
        // what is required from these methods.
        //
        // Note that additional search methods are added for the html numbers and
        // html formatted numbers by `_addNumericSort()` when we know what the decimal
        // place is


        $.extend( DataTable.ext.type.search, {
            html: function ( data ) {
                return _empty(data) ?
                    data :
                    typeof data === 'string' ?
                        data
                            .replace( _re_new_lines, " " )
                            .replace( _re_html, "" ) :
                        '';
            },

            string: function ( data ) {
                return _empty(data) ?
                    data :
                    typeof data === 'string' ?
                        data.replace( _re_new_lines, " " ) :
                        data;
            }
        } );



        var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
            if ( d !== 0 && (!d || d === '-') ) {
                return -Infinity;
            }

            // If a decimal place other than `.` is used, it needs to be given to the
            // function so we can detect it and replace with a `.` which is the only
            // decimal place Javascript recognises - it is not locale aware.
            if ( decimalPlace ) {
                d = _numToDecimal( d, decimalPlace );
            }

            if ( d.replace ) {
                if ( re1 ) {
                    d = d.replace( re1, '' );
                }

                if ( re2 ) {
                    d = d.replace( re2, '' );
                }
            }

            return d * 1;
        };


        // Add the numeric 'deformatting' functions for sorting and search. This is done
        // in a function to provide an easy ability for the language options to add
        // additional methods if a non-period decimal place is used.
        function _addNumericSort ( decimalPlace ) {
            $.each(
                {
                    // Plain numbers
                    "num": function ( d ) {
                        return __numericReplace( d, decimalPlace );
                    },

                    // Formatted numbers
                    "num-fmt": function ( d ) {
                        return __numericReplace( d, decimalPlace, _re_formatted_numeric );
                    },

                    // HTML numeric
                    "html-num": function ( d ) {
                        return __numericReplace( d, decimalPlace, _re_html );
                    },

                    // HTML numeric, formatted
                    "html-num-fmt": function ( d ) {
                        return __numericReplace( d, decimalPlace, _re_html, _re_formatted_numeric );
                    }
                },
                function ( key, fn ) {
                    // Add the ordering method
                    _ext.type.order[ key+decimalPlace+'-pre' ] = fn;

                    // For HTML types add a search formatter that will strip the HTML
                    if ( key.match(/^html\-/) ) {
                        _ext.type.search[ key+decimalPlace ] = _ext.type.search.html;
                    }
                }
            );
        }


        // Default sort methods
        $.extend( _ext.type.order, {
            // Dates
            "date-pre": function ( d ) {
                return Date.parse( d ) || 0;
            },

            // html
            "html-pre": function ( a ) {
                return _empty(a) ?
                    '' :
                    a.replace ?
                        a.replace( /<.*?>/g, "" ).toLowerCase() :
                    a+'';
            },

            // string
            "string-pre": function ( a ) {
                // This is a little complex, but faster than always calling toString,
                // http://jsperf.com/tostring-v-check
                return _empty(a) ?
                    '' :
                    typeof a === 'string' ?
                        a.toLowerCase() :
                        ! a.toString ?
                            '' :
                            a.toString();
            },

            // string-asc and -desc are retained only for compatibility with the old
            // sort methods
            "string-asc": function ( x, y ) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            },

            "string-desc": function ( x, y ) {
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            }
        } );


        // Numeric sorting types - order doesn't matter here
        _addNumericSort( '' );


        $.extend( true, DataTable.ext.renderer, {
            header: {
                _: function ( settings, cell, column, classes ) {
                    // No additional mark-up required
                    // Attach a sort listener to update on sort - note that using the
                    // `DT` namespace will allow the event to be removed automatically
                    // on destroy, while the `dt` namespaced event is the one we are
                    // listening for
                    $(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
                        if ( settings !== ctx ) { // need to check this this is the host
                            return;               // table, not a nested one
                        }

                        var colIdx = column.idx;

                        cell
                            .removeClass(
                            column.sSortingClass +' '+
                            classes.sSortAsc +' '+
                            classes.sSortDesc
                        )
                            .addClass( columns[ colIdx ] == 'asc' ?
                                classes.sSortAsc : columns[ colIdx ] == 'desc' ?
                                classes.sSortDesc :
                                column.sSortingClass
                        );
                    } );
                },

                jqueryui: function ( settings, cell, column, classes ) {
                    $('<div/>')
                        .addClass( classes.sSortJUIWrapper )
                        .append( cell.contents() )
                        .append( $('<span/>')
                            .addClass( classes.sSortIcon+' '+column.sSortingClassJUI )
                    )
                        .appendTo( cell );

                    // Attach a sort listener to update on sort
                    $(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
                        if ( settings !== ctx ) {
                            return;
                        }

                        var colIdx = column.idx;

                        cell
                            .removeClass( classes.sSortAsc +" "+classes.sSortDesc )
                            .addClass( columns[ colIdx ] == 'asc' ?
                                classes.sSortAsc : columns[ colIdx ] == 'desc' ?
                                classes.sSortDesc :
                                column.sSortingClass
                        );

                        cell
                            .find( 'span.'+classes.sSortIcon )
                            .removeClass(
                            classes.sSortJUIAsc +" "+
                            classes.sSortJUIDesc +" "+
                            classes.sSortJUI +" "+
                            classes.sSortJUIAscAllowed +" "+
                            classes.sSortJUIDescAllowed
                        )
                            .addClass( columns[ colIdx ] == 'asc' ?
                                classes.sSortJUIAsc : columns[ colIdx ] == 'desc' ?
                                classes.sSortJUIDesc :
                                column.sSortingClassJUI
                        );
                    } );
                }
            }
        } );

        /*
         * Public helper functions. These aren't used internally by DataTables, or
         * called by any of the options passed into DataTables, but they can be used
         * externally by developers working with DataTables. They are helper functions
         * to make working with DataTables a little bit easier.
         */

        /**
         * Helpers for `columns.render`.
         *
         * The options defined here can be used with the `columns.render` initialisation
         * option to provide a display renderer. The following functions are defined:
         *
         * * `number` - Will format numeric data (defined by `columns.data`) for
         *   display, retaining the original unformatted data for sorting and filtering.
         *   It takes 4 parameters:
         *   * `string` - Thousands grouping separator
         *   * `string` - Decimal point indicator
         *   * `integer` - Number of decimal points to show
         *   * `string` (optional) - Prefix.
         *
         * @example
         *   // Column definition using the number renderer
         *   {
     *     data: "salary",
     *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
     *   }
         *
         * @namespace
         */
        DataTable.render = {
            number: function ( thousands, decimal, precision, prefix ) {
                return {
                    display: function ( d ) {
                        var negative = d < 0 ? '-' : '';
                        d = Math.abs( parseFloat( d ) );

                        var intPart = parseInt( d, 10 );
                        var floatPart = precision ?
                        decimal+(d - intPart).toFixed( precision ).substring( 2 ):
                            '';

                        return negative + (prefix||'') +
                        intPart.toString().replace(
                            /\B(?=(\d{3})+(?!\d))/g, thousands
                        ) +
                        floatPart;
                    }
                };
            }
        };


        /*
         * This is really a good bit rubbish this method of exposing the internal methods
         * publicly... - To be fixed in 2.0 using methods on the prototype
         */


        /**
         * Create a wrapper function for exporting an internal functions to an external API.
         *  @param {string} fn API function name
         *  @returns {function} wrapped function
         *  @memberof DataTable#internal
         */
        function _fnExternApiFunc (fn)
        {
            return function() {
                var args = [_fnSettingsFromNode( this[DataTable.ext.iApiIndex] )].concat(
                    Array.prototype.slice.call(arguments)
                );
                return DataTable.ext.internal[fn].apply( this, args );
            };
        }


        /**
         * Reference to internal functions for use by plug-in developers. Note that
         * these methods are references to internal functions and are considered to be
         * private. If you use these methods, be aware that they are liable to change
         * between versions.
         *  @namespace
         */
        $.extend( DataTable.ext.internal, {
            _fnExternApiFunc: _fnExternApiFunc,
            _fnBuildAjax: _fnBuildAjax,
            _fnAjaxUpdate: _fnAjaxUpdate,
            _fnAjaxParameters: _fnAjaxParameters,
            _fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
            _fnAjaxDataSrc: _fnAjaxDataSrc,
            _fnAddColumn: _fnAddColumn,
            _fnColumnOptions: _fnColumnOptions,
            _fnAdjustColumnSizing: _fnAdjustColumnSizing,
            _fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
            _fnColumnIndexToVisible: _fnColumnIndexToVisible,
            _fnVisbleColumns: _fnVisbleColumns,
            _fnGetColumns: _fnGetColumns,
            _fnColumnTypes: _fnColumnTypes,
            _fnApplyColumnDefs: _fnApplyColumnDefs,
            _fnHungarianMap: _fnHungarianMap,
            _fnCamelToHungarian: _fnCamelToHungarian,
            _fnLanguageCompat: _fnLanguageCompat,
            _fnBrowserDetect: _fnBrowserDetect,
            _fnAddData: _fnAddData,
            _fnAddTr: _fnAddTr,
            _fnNodeToDataIndex: _fnNodeToDataIndex,
            _fnNodeToColumnIndex: _fnNodeToColumnIndex,
            _fnGetCellData: _fnGetCellData,
            _fnSetCellData: _fnSetCellData,
            _fnSplitObjNotation: _fnSplitObjNotation,
            _fnGetObjectDataFn: _fnGetObjectDataFn,
            _fnSetObjectDataFn: _fnSetObjectDataFn,
            _fnGetDataMaster: _fnGetDataMaster,
            _fnClearTable: _fnClearTable,
            _fnDeleteIndex: _fnDeleteIndex,
            _fnInvalidate: _fnInvalidate,
            _fnGetRowElements: _fnGetRowElements,
            _fnCreateTr: _fnCreateTr,
            _fnBuildHead: _fnBuildHead,
            _fnDrawHead: _fnDrawHead,
            _fnDraw: _fnDraw,
            _fnReDraw: _fnReDraw,
            _fnAddOptionsHtml: _fnAddOptionsHtml,
            _fnDetectHeader: _fnDetectHeader,
            _fnGetUniqueThs: _fnGetUniqueThs,
            _fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
            _fnFilterComplete: _fnFilterComplete,
            _fnFilterCustom: _fnFilterCustom,
            _fnFilterColumn: _fnFilterColumn,
            _fnFilter: _fnFilter,
            _fnFilterCreateSearch: _fnFilterCreateSearch,
            _fnEscapeRegex: _fnEscapeRegex,
            _fnFilterData: _fnFilterData,
            _fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
            _fnUpdateInfo: _fnUpdateInfo,
            _fnInfoMacros: _fnInfoMacros,
            _fnInitialise: _fnInitialise,
            _fnInitComplete: _fnInitComplete,
            _fnLengthChange: _fnLengthChange,
            _fnFeatureHtmlLength: _fnFeatureHtmlLength,
            _fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
            _fnPageChange: _fnPageChange,
            _fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
            _fnProcessingDisplay: _fnProcessingDisplay,
            _fnFeatureHtmlTable: _fnFeatureHtmlTable,
            _fnScrollDraw: _fnScrollDraw,
            _fnApplyToChildren: _fnApplyToChildren,
            _fnCalculateColumnWidths: _fnCalculateColumnWidths,
            _fnThrottle: _fnThrottle,
            _fnConvertToWidth: _fnConvertToWidth,
            _fnScrollingWidthAdjust: _fnScrollingWidthAdjust,
            _fnGetWidestNode: _fnGetWidestNode,
            _fnGetMaxLenString: _fnGetMaxLenString,
            _fnStringToCss: _fnStringToCss,
            _fnScrollBarWidth: _fnScrollBarWidth,
            _fnSortFlatten: _fnSortFlatten,
            _fnSort: _fnSort,
            _fnSortAria: _fnSortAria,
            _fnSortListener: _fnSortListener,
            _fnSortAttachListener: _fnSortAttachListener,
            _fnSortingClasses: _fnSortingClasses,
            _fnSortData: _fnSortData,
            _fnSaveState: _fnSaveState,
            _fnLoadState: _fnLoadState,
            _fnSettingsFromNode: _fnSettingsFromNode,
            _fnLog: _fnLog,
            _fnMap: _fnMap,
            _fnBindAction: _fnBindAction,
            _fnCallbackReg: _fnCallbackReg,
            _fnCallbackFire: _fnCallbackFire,
            _fnLengthOverflow: _fnLengthOverflow,
            _fnRenderer: _fnRenderer,
            _fnDataSource: _fnDataSource,
            _fnRowAttributes: _fnRowAttributes,
            _fnCalculateEnd: function () {} // Used by a lot of plug-ins, but redundant
                                            // in 1.10, so this dead-end function is
                                            // added to prevent errors
        } );


        // jQuery access
        $.fn.dataTable = DataTable;

        // Legacy aliases
        $.fn.dataTableSettings = DataTable.settings;
        $.fn.dataTableExt = DataTable.ext;

        // With a capital `D` we return a DataTables API instance rather than a
        // jQuery object
        $.fn.DataTable = function ( opts ) {
            return $(this).dataTable( opts ).api();
        };

        // All properties that are available to $.fn.dataTable should also be
        // available on $.fn.DataTable
        $.each( DataTable, function ( prop, val ) {
            $.fn.DataTable[ prop ] = val;
        } );


        // Information about events fired by DataTables - for documentation.
        /**
         * Draw event, fired whenever the table is redrawn on the page, at the same
         * point as fnDrawCallback. This may be useful for binding events or
         * performing calculations when the table is altered at all.
         *  @name DataTable#draw.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Search event, fired when the searching applied to the table (using the
         * built-in global search, or column filters) is altered.
         *  @name DataTable#search.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Page change event, fired when the paging of the table is altered.
         *  @name DataTable#page.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Order event, fired when the ordering applied to the table is altered.
         *  @name DataTable#order.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * DataTables initialisation complete event, fired when the table is fully
         * drawn, including Ajax data loaded, if Ajax data is required.
         *  @name DataTable#init.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The JSON object request from the server - only
         *    present if client-side Ajax sourced data is used</li></ol>
         */

        /**
         * State save event, fired when the table has changed state a new state save
         * is required. This event allows modification of the state saving object
         * prior to actually doing the save, including addition or other state
         * properties (for plug-ins) or modification of a DataTables core property.
         *  @name DataTable#stateSaveParams.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The state information to be saved
         */

        /**
         * State load event, fired when the table is loading state from the stored
         * data, but prior to the settings object being modified by the saved state
         * - allowing modification of the saved state is required or loading of
         * state for a plug-in.
         *  @name DataTable#stateLoadParams.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The saved state information
         */

        /**
         * State loaded event, fired when state has been loaded from stored data and
         * the settings object has been modified by the loaded data.
         *  @name DataTable#stateLoaded.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The saved state information
         */

        /**
         * Processing event, fired when DataTables is doing some kind of processing
         * (be it, order, searcg or anything else). It can be used to indicate to
         * the end user that there is something happening, or that something has
         * finished.
         *  @name DataTable#processing.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {boolean} bShow Flag for if DataTables is doing processing or not
         */

        /**
         * Ajax (XHR) event, fired whenever an Ajax request is completed from a
         * request to made to the server for new data. This event is called before
         * DataTables processed the returned data, so it can also be used to pre-
         * process the data returned from the server, if needed.
         *
         * Note that this trigger is called in `fnServerData`, if you override
         * `fnServerData` and which to use this event, you need to trigger it in you
         * success function.
         *  @name DataTable#xhr.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {object} json JSON returned from the server
         *
         *  @example
         *     // Use a custom property returned from the server in another DOM element
         *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
     *       $('#status').html( json.status );
     *     } );
         *
         *  @example
         *     // Pre-process the data returned from the server
         *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
     *       for ( var i=0, ien=json.aaData.length ; i<ien ; i++ ) {
     *         json.aaData[i].sum = json.aaData[i].one + json.aaData[i].two;
     *       }
     *       // Note no return - manipulate the data directly in the JSON object.
     *     } );
         */

        /**
         * Destroy event, fired when the DataTable is destroyed by calling fnDestroy
         * or passing the bDestroy:true parameter in the initialisation object. This
         * can be used to remove bound events, added DOM nodes, etc.
         *  @name DataTable#destroy.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Page length change event, fired when number of records to show on each
         * page (the length) is changed.
         *  @name DataTable#length.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {integer} len New length
         */

        /**
         * Column sizing has changed.
         *  @name DataTable#column-sizing.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Column visibility has changed.
         *  @name DataTable#column-visibility.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {int} column Column index
         *  @param {bool} vis `false` if column now hidden, or `true` if visible
         */

        return $.fn.dataTable;
    }));

}(window, document));

/*! Tablesaw - v1.0.3 - 2015-01-27
 * https://github.com/filamentgroup/tablesaw
 * Copyright (c) 2015 Filament Group; Licensed MIT */
/*! Tablesaw - v1.0.3 - 2015-01-27
 * https://github.com/filamentgroup/tablesaw
 * Copyright (c) 2015 Filament Group; Licensed MIT */
;(function( $ ) {
    var div = document.createElement('div'),
        all = div.getElementsByTagName('i'),
        $doc = $( document.documentElement );

    div.innerHTML = '<!--[if lte IE 8]><i></i><![endif]-->';
    if( all[ 0 ] ) {
        $doc.addClass( 'ie-lte8' );
    }

    // Cut the mustard
    if( !( 'querySelector' in document ) ||
        ( window.blackberry && !window.WebKitPoint ) ||
        window.operamini ) {
        return;
    } else {
        $doc.addClass( 'tablesaw-enhanced' );

        // DOM-ready auto-init of plugins.
        // Many plugins bind to an "enhance" event to init themselves on dom ready, or when new markup is inserted into the DOM
        $( function(){
            $( document ).trigger( "enhance.tablesaw" );
        });
    }

})( jQuery );
/*
 * tablesaw: A set of plugins for responsive tables
 * Stack and Column Toggle tables
 * Copyright (c) 2013 Filament Group, Inc.
 * MIT License
 */

if( typeof Tablesaw === "undefined" ) {
    Tablesaw = {};
}
if( !Tablesaw.config ) {
    Tablesaw.config = {};
}

;(function( $ ) {
    var pluginName = "table",
        classes = {
            toolbar: "tablesaw-bar"
        },
        events = {
            create: "tablesawcreate",
            destroy: "tablesawdestroy",
            refresh: "tablesawrefresh"
        },
        defaultMode = "stack",
        initSelector = "table[data-tablesaw-mode],table[data-tablesaw-sortable]";

    var Table = function( element ) {
        if( !element ) {
            throw new Error( "Tablesaw requires an element." );
        }

        this.table = element;
        this.$table = $( element );

        this.mode = this.$table.attr( "data-tablesaw-mode" ) || defaultMode;

        this.init();
    };

    Table.prototype.init = function() {
        // assign an id if there is none
        if ( !this.$table.attr( "id" ) ) {
            this.$table.attr( "id", pluginName + "-" + Math.round( Math.random() * 10000 ) );
        }

        this.createToolbar();

        var colstart = this._initCells();

        this.$table.trigger( events.create, [ this, colstart ] );
    };

    Table.prototype._initCells = function() {
        var colstart,
            thrs = this.table.querySelectorAll( "thead tr" ),
            self = this;

        $( thrs ).each( function(){
            var coltally = 0;

            $( this ).children().each( function(){
                var span = parseInt( this.getAttribute( "colspan" ), 10 ),
                    sel = ":nth-child(" + ( coltally + 1 ) + ")";

                colstart = coltally + 1;

                if( span ){
                    for( var k = 0; k < span - 1; k++ ){
                        coltally++;
                        sel += ", :nth-child(" + ( coltally + 1 ) + ")";
                    }
                }

                // Store "cells" data on header as a reference to all cells in the same column as this TH
                this.cells = self.$table.find("tr").not( $( thrs ).eq( 0 ) ).not( this ).children( sel );
                coltally++;
            });
        });

        return colstart;
    };

    Table.prototype.refresh = function() {
        this._initCells();

        this.$table.trigger( events.refresh );
    };

    Table.prototype.createToolbar = function() {
        // Insert the toolbar
        // TODO move this into a separate component
        var $toolbar = this.$table.prev( '.' + classes.toolbar );
        if( !$toolbar.length ) {
            $toolbar = $( '<div>' )
                .addClass( classes.toolbar )
                .insertBefore( this.$table );
        }
        this.$toolbar = $toolbar;

        if( this.mode ) {
            this.$toolbar.addClass( 'mode-' + this.mode );
        }
    };

    Table.prototype.destroy = function() {
        // Donâ€™t remove the toolbar. Some of the table features are not yet destroy-friendly.
        this.$table.prev( '.' + classes.toolbar ).each(function() {
            this.className = this.className.replace( /\bmode\-\w*\b/gi, '' );
        });

        var tableId = this.$table.attr( 'id' );
        $( document ).unbind( "." + tableId );
        $( window ).unbind( "." + tableId );

        // other plugins
        this.$table.trigger( events.destroy, [ this ] );

        this.$table.removeAttr( 'data-tablesaw-mode' );

        this.$table.removeData( pluginName );
    };

    // Collection method.
    $.fn[ pluginName ] = function() {
        return this.each( function() {
            var $t = $( this );

            if( $t.data( pluginName ) ){
                return;
            }

            var table = new Table( this );
            $t.data( pluginName, table );
        });
    };

    $( document ).on( "enhance.tablesaw", function( e ) {
        $( e.target ).find( initSelector )[ pluginName ]();
    });

}( jQuery ));

;(function( win, $, undefined ){

    var classes = {
        stackTable: 'tablesaw-stack',
        cellLabels: 'tablesaw-cell-label',
        cellContentLabels: 'tablesaw-cell-content'
    };

    var data = {
        obj: 'tablesaw-stack'
    };

    var attrs = {
        labelless: 'data-tablesaw-no-labels',
        hideempty: 'data-tablesaw-hide-empty'
    };

    var Stack = function( element ) {

        this.$table = $( element );

        this.labelless = this.$table.is( '[' + attrs.labelless + ']' );
        this.hideempty = this.$table.is( '[' + attrs.hideempty + ']' );

        if( !this.labelless ) {
            // allHeaders references headers, plus all THs in the thead, which may include several rows, or not
            this.allHeaders = this.$table.find( "th" );
        }

        this.$table.data( data.obj, this );
    };

    Stack.prototype.init = function( colstart ) {
        this.$table.addClass( classes.stackTable );

        if( this.labelless ) {
            return;
        }

        // get headers in reverse order so that top-level headers are appended last
        var reverseHeaders = $( this.allHeaders );
        var hideempty = this.hideempty;

        // create the hide/show toggles
        reverseHeaders.each(function(){
            var $t = $( this ),
                $cells = $( this.cells ).filter(function() {
                    return !$( this ).parent().is( "[" + attrs.labelless + "]" ) && ( !hideempty || !$( this ).is( ":empty" ) );
                }),
                hierarchyClass = $cells.not( this ).filter( "thead th" ).length && " tablesaw-cell-label-top",
            // TODO reduce coupling with sortable
                $sortableButton = $t.find( ".tablesaw-sortable-btn" ),
                html = $sortableButton.length ? $sortableButton.html() : $t.html();

            if( html !== "" ){
                if( hierarchyClass ){
                    var iteration = parseInt( $( this ).attr( "colspan" ), 10 ),
                        filter = "";

                    if( iteration ){
                        filter = "td:nth-child("+ iteration +"n + " + ( colstart ) +")";
                    }
                    $cells.filter( filter ).prepend( "<b class='" + classes.cellLabels + hierarchyClass + "'>" + html + "</b>"  );
                } else {
                    $cells.wrapInner( "<span class='" + classes.cellContentLabels + "'></span>" );
                    $cells.prepend( "<b class='" + classes.cellLabels + "'>" + html + "</b>"  );
                }
            }
        });
    };

    Stack.prototype.destroy = function() {
        this.$table.removeClass( classes.stackTable );
        this.$table.find( '.' + classes.cellLabels ).remove();
        this.$table.find( '.' + classes.cellContentLabels ).each(function() {
            $( this ).replaceWith( this.childNodes );
        });
    };

    // on tablecreate, init
    $( document ).on( "tablesawcreate", function( e, Tablesaw, colstart ){
        if( Tablesaw.mode === 'stack' ){
            var table = new Stack( Tablesaw.table );
            table.init( colstart );
        }

    } );

    $( document ).on( "tablesawdestroy", function( e, Tablesaw ){

        if( Tablesaw.mode === 'stack' ){
            $( Tablesaw.table ).data( data.obj ).destroy();
        }

    } );

}( this, jQuery ));
;(function ($, window, document, undefined) {
    'use strict';

    Foundation.libs.reveal = {
        name : 'reveal',

        version : '5.5.1',

        locked : false,

        settings : {
            animation : 'fadeAndPop',
            animation_speed : 250,
            close_on_background_click : true,
            close_on_esc : true,
            dismiss_modal_class : 'close-reveal-modal',
            multiple_opened : false,
            bg_class : 'reveal-modal-bg',
            root_element : 'body',
            open : function(){},
            opened : function(){},
            close : function(){},
            closed : function(){},
            bg : $('.reveal-modal-bg'),
            css : {
                open : {
                    'opacity' : 0,
                    'visibility' : 'visible',
                    'display' : 'block'
                },
                close : {
                    'opacity' : 1,
                    'visibility' : 'hidden',
                    'display' : 'none'
                }
            }
        },

        init : function (scope, method, options) {
            $.extend(true, this.settings, method, options);
            this.bindings(method, options);
        },

        events : function (scope) {
            var self = this,
                S = self.S;

            S(this.scope)
                .off('.reveal')
                .on('click.fndtn.reveal', '[' + this.add_namespace('data-reveal-id') + ']:not([disabled])', function (e) {
                    e.preventDefault();

                    if (!self.locked) {
                        var element = S(this),
                            ajax = element.data(self.data_attr('reveal-ajax'));

                        self.locked = true;

                        if (typeof ajax === 'undefined') {
                            self.open.call(self, element);
                        } else {
                            var url = ajax === true ? element.attr('href') : ajax;

                            self.open.call(self, element, {url : url});
                        }
                    }
                });

            S(document)
                .on('click.fndtn.reveal', this.close_targets(), function (e) {
                    e.preventDefault();
                    if (!self.locked) {
                        var settings = S('[' + self.attr_name() + '].open').data(self.attr_name(true) + '-init') || self.settings,
                            bg_clicked = S(e.target)[0] === S('.' + settings.bg_class)[0];

                        if (bg_clicked) {
                            if (settings.close_on_background_click) {
                                e.stopPropagation();
                            } else {
                                return;
                            }
                        }

                        self.locked = true;
                        self.close.call(self, bg_clicked ? S('[' + self.attr_name() + '].open') : S(this).closest('[' + self.attr_name() + ']'));
                    }
                });

            if (S('[' + self.attr_name() + ']', this.scope).length > 0) {
                S(this.scope)
                    // .off('.reveal')
                    .on('open.fndtn.reveal', this.settings.open)
                    .on('opened.fndtn.reveal', this.settings.opened)
                    .on('opened.fndtn.reveal', this.open_video)
                    .on('close.fndtn.reveal', this.settings.close)
                    .on('closed.fndtn.reveal', this.settings.closed)
                    .on('closed.fndtn.reveal', this.close_video);
            } else {
                S(this.scope)
                    // .off('.reveal')
                    .on('open.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.open)
                    .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.opened)
                    .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.open_video)
                    .on('close.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.close)
                    .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.closed)
                    .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.close_video);
            }

            return true;
        },

        // PATCH #3: turning on key up capture only when a reveal window is open
        key_up_on : function (scope) {
            var self = this;

            // PATCH #1: fixing multiple keyup event trigger from single key press
            self.S('body').off('keyup.fndtn.reveal').on('keyup.fndtn.reveal', function ( event ) {
                var open_modal = self.S('[' + self.attr_name() + '].open'),
                    settings = open_modal.data(self.attr_name(true) + '-init') || self.settings ;
                // PATCH #2: making sure that the close event can be called only while unlocked,
                //           so that multiple keyup.fndtn.reveal events don't prevent clean closing of the reveal window.
                if ( settings && event.which === 27  && settings.close_on_esc && !self.locked) { // 27 is the keycode for the Escape key
                    self.close.call(self, open_modal);
                }
            });

            return true;
        },

        // PATCH #3: turning on key up capture only when a reveal window is open
        key_up_off : function (scope) {
            this.S('body').off('keyup.fndtn.reveal');
            return true;
        },

        open : function (target, ajax_settings) {
            var self = this,
                modal;

            if (target) {
                if (typeof target.selector !== 'undefined') {
                    // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
                    modal = self.S('#' + target.data(self.data_attr('reveal-id'))).first();
                } else {
                    modal = self.S(this.scope);

                    ajax_settings = target;
                }
            } else {
                modal = self.S(this.scope);
            }

            var settings = modal.data(self.attr_name(true) + '-init');
            settings = settings || this.settings;

            if (modal.hasClass('open') && target.attr('data-reveal-id') == modal.attr('id')) {
                return self.close(modal);
            }

            if (!modal.hasClass('open')) {
                var open_modal = self.S('[' + self.attr_name() + '].open');

                if (typeof modal.data('css-top') === 'undefined') {
                    modal.data('css-top', parseInt(modal.css('top'), 10))
                        .data('offset', this.cache_offset(modal));
                }

                this.key_up_on(modal);    // PATCH #3: turning on key up capture only when a reveal window is open

                modal.on('open.fndtn.reveal').trigger('open.fndtn.reveal');

                if (open_modal.length < 1) {
                    this.toggle_bg(modal, true);
                }

                if (typeof ajax_settings === 'string') {
                    ajax_settings = {
                        url : ajax_settings
                    };
                }

                if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
                    if (open_modal.length > 0) {
                        if (settings.multiple_opened) {
                            this.to_back(open_modal);
                        } else {
                            this.hide(open_modal, settings.css.close);
                        }
                    }

                    this.show(modal, settings.css.open);
                } else {
                    var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;

                    $.extend(ajax_settings, {
                        success : function (data, textStatus, jqXHR) {
                            if ( $.isFunction(old_success) ) {
                                var result = old_success(data, textStatus, jqXHR);
                                if (typeof result == 'string') {
                                    data = result;
                                }
                            }

                            modal.html(data);
                            self.S(modal).foundation('section', 'reflow');
                            self.S(modal).children().foundation();

                            if (open_modal.length > 0) {
                                if (settings.multiple_opened) {
                                    this.to_back(open_modal);
                                } else {
                                    this.hide(open_modal, settings.css.close);
                                }
                            }
                            self.show(modal, settings.css.open);
                        }
                    });

                    $.ajax(ajax_settings);
                }
            }
            self.S(window).trigger('resize');
        },

        close : function (modal) {
            var modal = modal && modal.length ? modal : this.S(this.scope),
                open_modals = this.S('[' + this.attr_name() + '].open'),
                settings = modal.data(this.attr_name(true) + '-init') || this.settings;

            if (open_modals.length > 0) {
                this.locked = true;
                this.key_up_off(modal);   // PATCH #3: turning on key up capture only when a reveal window is open
                modal.trigger('close').trigger('close.fndtn.reveal');

                if ((settings.multiple_opened && open_modals.length === 1) || !settings.multiple_opened || modal.length > 1) {
                    this.toggle_bg(modal, false);
                    this.to_front(modal);
                }

                if (settings.multiple_opened) {
                    this.hide(modal, settings.css.close, settings);
                    this.to_front($($.makeArray(open_modals).reverse()[1]));
                } else {
                    this.hide(open_modals, settings.css.close, settings);
                }
            }
        },

        close_targets : function () {
            var base = '.' + this.settings.dismiss_modal_class;

            if (this.settings.close_on_background_click) {
                return base + ', .' + this.settings.bg_class;
            }

            return base;
        },

        toggle_bg : function (modal, state) {
            if (this.S('.' + this.settings.bg_class).length === 0) {
                this.settings.bg = $('<div />', {'class': this.settings.bg_class})
                    .appendTo('body').hide();
            }

            var visible = this.settings.bg.filter(':visible').length > 0;
            if ( state != visible ) {
                if ( state == undefined ? visible : !state ) {
                    this.hide(this.settings.bg);
                } else {
                    this.show(this.settings.bg);
                }
            }
        },

        show : function (el, css) {
            // is modal
            if (css) {
                var settings = el.data(this.attr_name(true) + '-init') || this.settings,
                    root_element = settings.root_element;

                if (el.parent(root_element).length === 0) {
                    var placeholder = el.wrap('<div style="display: none;" />').parent();

                    el.on('closed.fndtn.reveal.wrapped', function () {
                        el.detach().appendTo(placeholder);
                        el.unwrap().unbind('closed.fndtn.reveal.wrapped');
                    });

                    el.detach().appendTo(root_element);
                }

                var animData = getAnimationData(settings.animation);
                if (!animData.animate) {
                    this.locked = false;
                }
                if (animData.pop) {
                    css.top = $(window).scrollTop() - el.data('offset') + 'px';
                    var end_css = {
                        top: $(window).scrollTop() + el.data('css-top') + 'px',
                        opacity: 1
                    };

                    return setTimeout(function () {
                        return el
                            .css(css)
                            .animate(end_css, settings.animation_speed, 'linear', function () {
                                this.locked = false;
                                el.trigger('opened').trigger('opened.fndtn.reveal');
                            }.bind(this))
                            .addClass('open');
                    }.bind(this), settings.animation_speed / 2);
                }

                if (animData.fade) {
                    css.top = $(window).scrollTop() + el.data('css-top') + 'px';
                    var end_css = {opacity: 1};

                    return setTimeout(function () {
                        return el
                            .css(css)
                            .animate(end_css, settings.animation_speed, 'linear', function () {
                                this.locked = false;
                                el.trigger('opened').trigger('opened.fndtn.reveal');
                            }.bind(this))
                            .addClass('open');
                    }.bind(this), settings.animation_speed / 2);
                }

                return el.css(css).show().css({opacity : 1}).addClass('open').trigger('opened').trigger('opened.fndtn.reveal');
            }

            var settings = this.settings;

            // should we animate the background?
            if (getAnimationData(settings.animation).fade) {
                return el.fadeIn(settings.animation_speed / 2);
            }

            this.locked = false;

            return el.show();
        },

        to_back : function(el) {
            el.addClass('toback');
        },

        to_front : function(el) {
            el.removeClass('toback');
        },

        hide : function (el, css) {
            // is modal
            if (css) {
                var settings = el.data(this.attr_name(true) + '-init');
                settings = settings || this.settings;

                var animData = getAnimationData(settings.animation);
                if (!animData.animate) {
                    this.locked = false;
                }
                if (animData.pop) {
                    var end_css = {
                        top: - $(window).scrollTop() - el.data('offset') + 'px',
                        opacity: 0
                    };

                    return setTimeout(function () {
                        return el
                            .animate(end_css, settings.animation_speed, 'linear', function () {
                                this.locked = false;
                                el.css(css).trigger('closed').trigger('closed.fndtn.reveal');
                            }.bind(this))
                            .removeClass('open');
                    }.bind(this), settings.animation_speed / 2);
                }

                if (animData.fade) {
                    var end_css = {opacity : 0};

                    return setTimeout(function () {
                        return el
                            .animate(end_css, settings.animation_speed, 'linear', function () {
                                this.locked = false;
                                el.css(css).trigger('closed').trigger('closed.fndtn.reveal');
                            }.bind(this))
                            .removeClass('open');
                    }.bind(this), settings.animation_speed / 2);
                }

                return el.hide().css(css).removeClass('open').trigger('closed').trigger('closed.fndtn.reveal');
            }

            var settings = this.settings;

            // should we animate the background?
            if (getAnimationData(settings.animation).fade) {
                return el.fadeOut(settings.animation_speed / 2);
            }

            return el.hide();
        },

        close_video : function (e) {
            var video = $('.flex-video', e.target),
                iframe = $('iframe', video);

            if (iframe.length > 0) {
                iframe.attr('data-src', iframe[0].src);
                iframe.attr('src', iframe.attr('src'));
                video.hide();
            }
        },

        open_video : function (e) {
            var video = $('.flex-video', e.target),
                iframe = video.find('iframe');

            if (iframe.length > 0) {
                var data_src = iframe.attr('data-src');
                if (typeof data_src === 'string') {
                    iframe[0].src = iframe.attr('data-src');
                } else {
                    var src = iframe[0].src;
                    iframe[0].src = undefined;
                    iframe[0].src = src;
                }
                video.show();
            }
        },

        data_attr : function (str) {
            if (this.namespace.length > 0) {
                return this.namespace + '-' + str;
            }

            return str;
        },

        cache_offset : function (modal) {
            var offset = modal.show().height() + parseInt(modal.css('top'), 10);

            modal.hide();

            return offset;
        },

        off : function () {
            $(this.scope).off('.fndtn.reveal');
        },

        reflow : function () {}
    };

    /*
     * getAnimationData('popAndFade') // {animate: true,  pop: true,  fade: true}
     * getAnimationData('fade')       // {animate: true,  pop: false, fade: true}
     * getAnimationData('pop')        // {animate: true,  pop: true,  fade: false}
     * getAnimationData('foo')        // {animate: false, pop: false, fade: false}
     * getAnimationData(null)         // {animate: false, pop: false, fade: false}
     */
    function getAnimationData(str) {
        var fade = /fade/i.test(str);
        var pop = /pop/i.test(str);
        return {
            animate : fade || pop,
            pop : pop,
            fade : fade
        };
    }
}(jQuery, window, window.document));

/* Personal Info Accordion */

(function($) {
    $(document).ready(function() {
        function tableOverrides() {
            $(".tablesaw-container th:last-child").on("click", function(event) {
                event.stopImmediatePropagation();
            });
        }

        tableOverrides();

        function personalInfoAccordion() {

            var personalInfoButton      = $(".personal-info h2");
            var personalInfo            = $(".personal-info > div");

            var emergencyInfoButton     = $("body:not(.home) .emergency-info h2");
            var emergencyInfo           = $("body:not(.home) .emergency-info > div");

            enquire.register("screen and (max-width:40.0625em)", {

                deferSetup : true,

                match : function() {
                    $(personalInfo).hide();

                    $(personalInfoButton).on("click", function(event) {
                        event.stopImmediatePropagation();
                        $(personalInfo).stop(true, false).slideToggle();
                        $(this).toggleClass("open");
                    });

                    $(emergencyInfo).hide();

                    $(emergencyInfoButton).on("click", function(event) {
                        event.stopImmediatePropagation();
                        $(emergencyInfo).stop(true, false).slideToggle();
                        $(this).toggleClass("open");
                    });
                },

                unmatch : function() {
                    $(personalInfo).show();
                    $(personalInfoButton).off();

                    $(emergencyInfo).show();
                    $(emergencyInfoButton).off();
                }

            });
        }

        personalInfoAccordion();

        /* Breadcrumbs */

        function breadcrumbs() {
            var currentStep     = $(".current-step");
            var numberOfSteps   = $(".steps li").length;

            // Find index of current step
            var index = $(".steps li").index(currentStep) + 1;

           // console.log(index);

            enquire.register("screen and (max-width:47.9375em)", {

                deferSetup : true,

                match : function() {
                    $(".current-step").append("<span> (Step " + index + " of " + numberOfSteps + ")</span>");
                },

                unmatch : function() {
                    $(".current-step span").remove();
                }

            });
        }

        breadcrumbs();

        /* Scheduler */

        function scheduler() {

            var availableTimeslots  = ".available-timeslots";
            var timeOfDay           = ".time-of-day";

            var morning             = ".morning";
            var afternoon           = ".afternoon";


            $(timeOfDay + " li").on("click", function() {
                if ($(this).hasClass("morning")) {
                    // Remove classes from all list items
                    $(timeOfDay + " li").removeClass("active");

                    // Show appropriate timeslots
                    $(availableTimeslots + " " + morning).show();
                    $(availableTimeslots + " " + afternoon).hide();

                    // Set tab to active
                    $(this).addClass("active");

                } else if ($(this).hasClass("afternoon")) {
                    // Remove classes from all list items
                    $(timeOfDay + " li").removeClass("active");

                    // Show appropriate timeslots
                    $(availableTimeslots + " " + morning).hide();
                    $(availableTimeslots + " " + afternoon).show();

                    // Set tab to active
                    $(this).addClass("active");
                }
            });
        }

        scheduler();

        /*function datepickerOverrides() {
            $( "#datepicker" ).datepicker();

            $(".ui-datepicker-calendar td > a").on("click", function() {
                $(".timeslots .time-of-day .morning a").focus();
            });
        }

        datepickerOverrides();*/


        /* Available Timeslots Selector */

        /* Available Timeslots Selector */

        function availableTimeslots() {
            var individualTimeslots         = ".available-timeslots > div > div";

            $(individualTimeslots).on("click", function() {
                $(this).toggleClass("selected");
            });


        }
        availableTimeslots();
    });
})(jQuery);
;(function($) {
    $(document).ready(function() {

        IUComm.addHelper('externalLinksInNewTabs', function() {
            var scope = this;

            $('a:not(.close-reveal-modal, .ui-datepicker-next, .ui-datepicker-prev, .intent, .email)').each(function() {
                var a = new RegExp('/' + window.location.host + '/');

                if (!a.test(this.href)) {

                    $(this).addClass('external');

                    $(this).on('click', function(event) {
                        event.stopPropagation();
                        event.preventDefault();

                        window.open(this.href, '_blank');
                    });
                }
            });

            scope.debug('Helper: [Overridden] Open external links in new tabs');
        });

        IUComm.init( {debug:false} );

    });
})(jQuery);
