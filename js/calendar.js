/**
 * Bootstrap based calendar full view.
 *
 * https://github.com/Serhioromano/bootstrap-calendar
 *
 * User: Sergey Romanov <serg4172@mail.ru>
 * Version 0.1
 */
"use strict";

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};
Date.prototype.getMonthFormatted = function() {
    var month = this.getMonth() + 1;
    return month < 10 ? '0' + month : month;
};
Date.prototype.getDateFormatted = function() {
    var date = this.getDate();
    return date < 10 ? '0' + date : date;
};
if(!String.prototype.format) {
    String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}
(function($) {
	
    var defaults = {
        width: '100%',      // maximum width of all calendar
        view: 'month',      // month, week, day
        day: 'now',  // what day to start with. No matter month, week or day this will be a starting point
        // format yyyy-mm-dd or now
        first_day: 1,       // Which day is first 2 - sunday or 1 - monday
        events_url: '',     // URL to return JSON list of events in special format.
        // {success:1, result: [....]} or for error {success:0, error:'Something terrible happened'}
        // events: [...] as described in events property description
        // The start and end variables will be sent to this url

        /**
         * path to templates should end with slash /. It can be as relative
         *
         * /component/bootstrap-calendar/tmpls/
         *
         * or absolute
         *
         * http://localhost/component/bootstrap-calendar/tmpls/
         */
        tmpl_path: 'tmpls/',
        classes: {
            months: {
                inmonth: 'cal-day-inmonth',
                outmonth: 'cal-day-outmonth',
                saturday: 'cal-day-weekend',
                sunday: 'cal-day-weekend',
                holidays: 'cal-day-holiday',
                today: 'cal-day-today'
            }
        },
        holidays: {
            '08-03': 'International Women\'s Day',
            '25-12': 'Christmas\'s',
            '01-05': "International labor day"
        },
        views: {
            year: {
                slide_events: 1
            },
            month: {
                slide_events: 1
            }
        },


        // ------------------------------------------------------------
        // CALLBACKS. Events triggered by calendar class. You can use
        // those to affect you UI
        // ------------------------------------------------------------
        onAfterEventsLoad: function(events) {
        },
        onBeforeEventsLoad: function(next) {
            next();
        },
        onAfterViewLoad: function(calendar, view) {
        },
        // called only the first time the calendar is rendered, right
        // before onAfterViewLoad
        onAfterInitialize: function(calendar) {
			
		},
        
        // -------------------------------------------------------------
        // INTERNAL USE ONLY. DO NOT ASSIGN IT WILL BE OVERRIDDEN ANYWAY
        // -------------------------------------------------------------
        events: [],
        position: {
            start: new Date(),
            end: new Date()
        },
        templates: {
            year: '',
            'year-month': '',
            month: '',
            'month-day': '',
            week: '',
            'week-days': '',
            day: '',
            'events-list': ''
        },
        break: false
    },
    // end defaults
    
    options = {},
    context = null,
    is_initialized = false;

    function Calendar(params) {
	
        options = $.extend(true, {}, defaults, params);
        context.css('width', options.width);
		var this_Calendar = this;
		this.load_templates.call(this, function(){
			
			this_Calendar.view(options.view);
		});
        
    }

    Calendar.prototype.set_options = function(object) {
        $.extend(options, object);
    }

    Calendar.prototype.render = function(renderCallback) {
		
		var this_render = this;
		
        context.html('');
            
        this_render.break = false;

		var data = {};
		data.events = [];
		data.cal = this_render;
		data.day = 1;

		// Getting list of days in a week in correct order. Works for month and week views
		if(options.first_day == 1) {
			data.months = [
				language.d1, 
				language.d2, 
				language.d3, 
				language.d4, 
				language.d5, 
				language.d6, 
				language.d0
			];
		} 
		else {
			data.months = [
				language.d0, 
				language.d1, 
				language.d2, 
				language.d3, 
				language.d4, 
				language.d5, 
				language.d6
			];
		}

		// Get all events between start and end
		var start = parseInt(options.position.start.getTime()),
			end = parseInt(options.position.end.getTime());
		
		$.each(options.events, function(k, event) {
			if((parseInt(event.start) < end) && (parseInt(event.end) > start)) {
				data.events.push(event);
			}
		});
		
		switch(options.view) {
			case 'month':
				break;
			case 'week':
				break;
			case 'day':
				break;
		}

		data.start = new Date(options.position.start.getTime());
		data.lang = language;
		
		context.append(options.templates[options.view](data));
		
		this_render.update();
		
		renderCallback();
    };

    Calendar.prototype._week = function(event) {
        
		var t = {};
		var start = parseInt(options.position.start.getTime());
		var end = parseInt(options.position.end.getTime());
		var events = [];

		$.each(options.events, function(k, event) {
			if((parseInt(event.start) < end) && (parseInt(event.end) > start)) {

				event.start_day = new Date(parseInt(event.start)).getDay();
				if(options.first_day == 1) {
					event.start_day = event.start_day - 1;
				}
				if(options.start_day < 0) {
					event.start_day = 0;
				}
				if((event.end - event.start) <= 86400000) {
					event.days = 1;
				} else {
					event.days = ((event.end - event.start) / 86400000);
				}

				if(event.start < start) {

					event.days = event.days - ((start - event.start) / 86400000);
					event.start_day = 0;
				}

				event.days = Math.ceil(event.days);

				if(event.start_day + event.days > 7) {
					event.days = 7 - (event.start_day);
				}

				if(options.first_day == 1) {

				}
				events.push(event);
			}
		});
		
		t.events = events;
		return options.templates['week-days'](t);
		
    };
    Calendar.prototype._month = function(month) {
		var t = {};
		var newmonth = month + 1;
		t.data_day = options.position.start.getFullYear() + '-' + (newmonth < 10 ? '0' + newmonth : newmonth) + '-' + '01';
		t.month_name = language['m' + month];

		var curdate = new Date(options.position.start.getFullYear(), month, 1, 0, 0, 0);
		var start = parseInt(curdate.getTime());
		var end = parseInt(new Date(options.position.start.getFullYear(), month + 1, 0, 0, 0, 0).getTime());
		var events = [];
		
		$.each(options.events, function(k, event) {
			if((parseInt(event.start) < end) && (parseInt(event.end) > start)) {
				events.push(event);
			}
		});
		
		t.events = events;
		return options.templates['year-month'](t);
    }
	
    Calendar.prototype._day = function(week, day, _dayCallback) {
		var this_day = this;
		
	
		var t = {tooltip: ''};
		var cls = options.classes.months.outmonth;

		var firstday = options.position.start.getDay();
		
		if(options.first_day == 2) {
			firstday++;
		} 
		else {
			firstday = (firstday == 0 ? 7 : firstday);
		}

		day = (day - firstday) + 1;
		var curdate = new Date(options.position.start.getFullYear(), options.position.start.getMonth(), day, 0, 0, 0);

		// if day of the current month
		if(day > 0) {
			cls = options.classes.months.inmonth;
		}
		// stop cycling table rows;
		if((day + 1) > options.position.end.getDate()) {
			this_day.break = true;
		}
		// if day of the next month
		if(day > options.position.end.getDate()) {
			day = day - options.position.end.getDate();
			cls = options.classes.months.outmonth;
		}

		if(curdate.getDay() == 0 && (cls == options.classes.months.inmonth)) {
			cls = options.classes.months.sunday;
		}
		if(curdate.getDay() == 6 && (cls == options.classes.months.inmonth)) {
			cls = options.classes.months.saturday;
		}
		if(curdate.toDateString() == (new Date()).toDateString()) {
			cls = options.classes.months.today;
		}
		if(day <= 0) {
			var daysinprevmonth = (new Date(options.position.start.getFullYear(), options.position.start.getMonth(), 0)).getDate();
			day = daysinprevmonth - Math.abs(day);
			cls += ' cal-month-first-row';
		}

		var holiday = curdate.getDateFormatted() 
						+ '-' + curdate.getMonthFormatted();
		
		if($.inArray(holiday, _.keys(options.holidays)) > -1) {
			cls += ' ' + options.classes.months.holidays;
			t.tooltip = options.holidays[holiday];
		}

		t.data_day = curdate.getFullYear() 
						+ '-' + curdate.getMonthFormatted() 
						+ '-' + (day < 10 ? '0' + day : day);
		
		t.cls = cls;
		t.day = day;

		var start = parseInt(curdate.getTime());
		var end = parseInt(start + 86400000);
		var events = [];
		
		$.each(options.events, function(k, event) {
			if((parseInt(event.start) < end) && (parseInt(event.end) > start)) {
				events.push(event);
			}
		});
		
		t.events = events;
		
		return options.templates['month-day'](t);
		
    }
	
	// Render or re-ender the calendar with the view specified
    Calendar.prototype.view = function(view) {
        if(view) options.view = view;
		
		var this_view = this;
        
        this_view.init_position.call(this);
        
        this_view.load_url.call(this_view, initLoadUrlCallback);
        
        function initLoadUrlCallback() {
			
			this_view.render.call(this_view, initRenderCallback);
		}
		
		function initRenderCallback() {
			
			if(!is_initialized)
			{
				is_initialized = true;
				options.onAfterInitialize(this_view);
			}
			
			options.onAfterViewLoad.call(this_view, options.view);
		}
    };

    Calendar.prototype.navigate = function(where, next) {

        var to = $.extend({}, options.position);
        if(where == 'next') {
            switch(options.view) {
                case 'year':
                    to.start.setFullYear(options.position.start.getFullYear() + 1);
                    break;
                case 'month':
                    to.start.setMonth(options.position.start.getMonth() + 1);
                    break;
                case 'week':
                    to.start.setDate(options.position.start.getDate() + 7);
                    break;
                case 'day':
                    to.start.setDate(options.position.start.getDate() + 1);
                    break;
            }
        } 
        else if(where == 'prev') {
            switch(options.view) {
                case 'year':
                    to.start.setFullYear(options.position.start.getFullYear() - 1);
                    break;
                case 'month':
                    to.start.setMonth(options.position.start.getMonth() - 1);
                    break;
                case 'week':
                    to.start.setDate(options.position.start.getDate() - 7);
                    break;
                case 'day':
                    to.start.setDate(options.position.start.getDate() - 1);
                    break;
            }
        } 
        else if(where == 'today') {
            to.start.setTime(new Date().getTime());
        }
        else {
            $.error(language.error_where.format(where))
        }
        options.day = to.start.getFullYear() 
						+ '-' + to.start.getMonthFormatted() 
						+ '-' + to.start.getDateFormatted();
		
        this.view.call(this);
        
        if(_.isFunction(next)) {
            next();
        }
    };

    Calendar.prototype.init_position = function() {
        var year, month, day;

        if(options.day == 'now') {
            var date = new Date();
            year = date.getFullYear();
            month = date.getMonth();
            day = date.getDate();
        } else if(options.day.match(/^\d{4}-\d{2}-\d{2}$/g)) {
            var list = options.day.split('-');
            year = list[0];
            month = list[1] - 1;
            day = list[2];
        }
        else {
            $.error(language.error_dateformat.format(options.day));
        }

        switch(options.view) {
            case 'year':
                options.position.start.setTime(new Date(year, 0, 1).getTime());
                options.position.end.setTime(new Date(year, 12, 0, 23, 59, 59).getTime());
                break;
            case 'month':
                options.position.start.setTime(new Date(year, month, 1).getTime());
                options.position.end.setTime(new Date(year, month + 1, 0, 23, 59, 59).getTime());
                break;
            case 'day':
                options.position.start.setTime(new Date(year, month, day).getTime());
                options.position.end.setTime(new Date(year, month, day, 23, 59, 59).getTime());
                break;
            case 'week':
                var curr = new Date(year, month, day);
                var first = curr.getDate() - curr.getDay();
                if(options.first_day == 1) first += 1;
                var last = first + 6;

                options.position.start.setTime(new Date(year, month, first).getTime());
                options.position.end.setTime(new Date(year, month, last, 23, 59, 59).getTime());
                break;
            default:
                $.error(language.error_noview.format(options.view))
        }
        return this;
    };

    Calendar.prototype.title = function() {
        var p = options.position.start;
        
        switch(options.view) {
            case 'year':
                return language.title_year.format(p.getFullYear());
                break;
            case 'month':
                return language.title_month.format(language['m' + p.getMonth()], p.getFullYear());
                break;
            case 'week':
                return language.title_week.format(p.getWeek(), p.getFullYear());
                break;
            case 'day':
                return language.title_day.format(language['d' + p.getDay()], p.getDate(), language['m' + p.getMonth()], p.getFullYear());
                break;
        }
        return;
    };

	// Load the data from the events url
    Calendar.prototype.load_url = function(load_url_callback) {
        if(!options.events_url) {
            return $.error(language.error_loadurl);
        }
        options.onBeforeEventsLoad(function() {
            $.ajax({
                url: options.events_url,
                dataType: 'json', 
				type: 'post',
                data: {
                    from: options.position.start.getTime(),
                    to: options.position.end.getTime()
                },
                success: _onBeforeEventsLoadSuccess(load_url_callback),
                error: _onBeforeEventsLoadFail
            });
        });
    };
    
    function _onBeforeEventsLoadSuccess(callback) {
		return function(json) {
			if(!json.success) {
				return $.error(json.error);
			}
			
			options.events = json.result;
			
			options.onAfterEventsLoad(json.result);
			
			callback();
		};
	}
    
    function _onBeforeEventsLoadFail() {
		$.error(errorThrown);
	}
    
    Calendar.prototype.load_templates = function(templatesLoadedCallback) {
		$.each(options.templates, function(name, val) {
			 $.ajax({
				url: options.tmpl_path + name + '.html',
				dataType: 'html',
				type: 'GET',
				success: _load_templates_success(name, templatesLoadedCallback),
				error: _load_templates_fail
			});
		});
       
    };
	
	function _load_templates_success(tmpl_name, templatesLoadedCallbackSuccess) {
		return function(html) {
			options.templates[tmpl_name] = _.template(html);
			
			var done_loading = true;
			$.each(options.templates, function(tpl_nm, tpl_val) {
				if(!tpl_val)
				{
					done_loading = false;
					return false;
				}
			});
			
			if(done_loading)
			{
				templatesLoadedCallbackSuccess();
			}
		}
	}
		
	function _load_templates_fail(jqxhr, textStatus, errorThrown) {
		$.error(errorThrown);
	}
	
	// update ui interactions
    Calendar.prototype.update = function() {
        var $this = this;
		
        $('*[rel="tooltip"]').tooltip();

        $('*[data-cal-date]').click(function() {
            console.log($(this).data('cal-date'));
            options.day = $(this).data('cal-date');
            $this.view($(this).data('cal-view'));
        });
        
        $('.cal-cell').dblclick(function() {
            options.day = $('[data-cal-date]', this).data('cal-date');
            $this.view($('[data-cal-date]', this).data('cal-view'));
        });

        this['_update_' + options.view]();
    };

    Calendar.prototype._update_day = function() {

    };
    Calendar.prototype._update_week = function() {

    };
    Calendar.prototype._update_year = function() {
        this._update_month_year();

    };
    Calendar.prototype._update_month = function() {
		var $this = this;
		
        this._update_month_year(function(){
			var week = $(document.createElement('div')).attr('id', 'cal-week-box');
			week.html(language.week);
			var start = options.position.start.getFullYear() 
						+ '-' + options.position.start.getMonthFormatted() + '-';
			
			$('.cal-month-box .cal-row-fluid').each(function(k, v) {
				var row = $(v);
				row.bind('mouseenter',function() {
					var child = $('.cal-span1:first-child .cal-month-day', row);
					var day = (child.hasClass('cal-month-first-row') ? 1 : $('[data-cal-date]', child).text());
					day = (day < 10 ? '0' + day : day);
					week.attr('data-cal-week', start + day).show().appendTo(child);
				}).bind('mouseleave', function() {
						week.hide();
					});
			});

			

			week.click(function() {
				options.day = $(this).data('cal-week');
				$this.view('week');
			});

			$('a.event').mouseenter(function() {
				$('a.event' + $(this).data('event-id'))
					.parents('.cal-span1')
					.addClass('day-highlight dh-' + $(this).data('event-class'));
			});
			$('a.event').mouseleave(function() {
				$('div.cal-span1').removeClass('day-highlight dh-' + $(this).data('event-class'));
			});
			
			
		});

    };
    
    Calendar.prototype._update_month_year = function(monthYearCallback) {
		
        if(!options.views[options.view].slide_events) {
            return monthYearCallback();
        }
        var activecell = 0,
			downbox = $(document.createElement('div'))
						.attr('id', 'cal-day-box')
						.html('<i class="icon-chevron-down"></i>');

        $('.cal-month-day, .cal-year-box .span3').each(bindMonthYearInteractions);
	
		function bindMonthYearInteractions(k, v) {
            $(v).bind('mouseenter', function() {
                if($('.events-list', v).length == 0) return;
                if($(v).children('[data-cal-date]').text() == activecell) return;
                downbox.show().appendTo(v);
            });
            $(v).bind('mouseleave', function() {
                downbox.hide();
            });
        }

        var slider = $(document.createElement('div'))
						.attr('id', 'cal-slide-box');
		
        slider.hide().click(function(event) {
            event.stopPropagation();
        });
		
		
        downbox.click(function(event) {
				
			event.stopPropagation();

			var $this = $(this),
				cell = $this.parents('.cal-cell'),
				row = $this.parents('.cal-row-fluid'),
				tick_position = cell.data('cal-row');

			$this.fadeOut('fast');

			slider
				.html(options.templates['events-list']({events: $('.events-list a.event', cell)}))
				.slideUp('fast', function() {
					row.after(slider);
					activecell = $('[data-cal-date]', cell).text();
					$('#cal-slide-tick').addClass('tick' + tick_position).show();
					slider.slideDown('fast', function() {
						$('body').one('click', function() {
							slider.slideUp('fast');
							activecell = 0;
						});
					});
				});

			$('a.event-item')
				.mouseenter(function() {
					$('a.event' + $(this).data('event-id'))
						.parents('.cal-span1')
						.addClass('day-highlight dh-' + $(this).data('event-class'));
				});
			
			$('a.event-item')
				.mouseleave(function() {
					$('div.cal-span1')
						.removeClass('day-highlight dh-' + $(this).data('event-class'));
				});
		});
			
		if(monthYearCallback)
		{
			monthYearCallback(); 
		}
		
    };

    $.fn.calendar = function(params) {
        context = this;
        return new Calendar(params);
    }
}(jQuery));
