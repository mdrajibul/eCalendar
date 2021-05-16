/**
 * An advanced calender.
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * <h3>Features </h3>
 * <ul>
 *  <li>Easy plug and play.</li>
 *  <li>Ajax call for populating modal.</li>
 * </ul>
 * @param settings
 */
var ECalendar = function(settings) {
    /**
     * Default values
     */
    var defaults = {
        monthLabels : ['January', 'February', 'March', 'April','May', 'June', 'July', 'August', 'September','October', 'November', 'December'],
        monthLength : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        weekDayName : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        timePeriod : ['12:00am','12:30am','1:00am','1:30am','2:00am','2:30am','3:00am','3:30am','4:00am','4:30am','5:00am','5:30am','6:00am','6:30am','7:00am','7:30am','8:00am','8:30am','9:00am','9:30am','10:00am','10:30am','11:00am','11:30am','12:00pm','12:30pm','1:00pm','1:30pm','2:00pm','2:30pm','3:00pm','3:30pm','4:00pm','4:30pm','5:00pm','5:30pm','6:00pm','6:30pm','7:00pm','7:30pm','8:00pm','8:30pm','9:00pm','9:30pm','10:00pm','10:30pm','11:00pm','11:30pm'],
        timePeriodValue : ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'],
        calenderType:[
            {'id':'general','name':'General'},
            {'id':'ticket','name':'Ticket'},
            {'id':'project','name':'Project'},
            {'id':'task','name':'Task'},
            {'id':'lead','name':'Lead'},
            {'id':'google','name':'Google'}
        ],
        showCalenderType:true,
        showMonthChange:false,
        showYearChange:false,
        minYear : 1970,
        maxYear : 2050,
        dataFetchMonthInterval:2,
        width:undefined,
        height:undefined,
        verticalCellHeight:20,
        dependCalender:undefined,
        autoHeight:false,
        container:null,
        ajaxUrl :null,
        ajaxLoading:null,
        ajaxAfterLoad:null,
        eventData:{},
        viewType:"month",
        viewDate:undefined,
        plugins:{
            dropDown:'native', //'native','sBox'
            toolTip:'native' //'native','w2lbox'
        },
        color:{
            background:'#cdfdfe',
            border:'#cccccc',
            foreground:'#333333'
        },
        noEventTitle:'(No title)',
        cellClick: undefined,
        listners:{
            nextClick:undefined,
            previousClick:undefined,
            cellClick:undefined
        },
        setModal:undefined
    };

    /**
     * override default value
     */
    $.extend(true, defaults, settings);

    /**
     * Private property
     */
    var clContainer;
    var clHeader;
    var clContainerWidth;
    var clContainerHeight;
    var modalEl;
    var nextCtl;
    var previousCtl;
    var todayCtl;
    var monthCtl;
    var monthTitleCtl;
    var weekCtl;
    var dayCtl;
    var dayContainer;
    var weekContainer;
    var allDayContainer;
    var clType = defaults.viewType ? defaults.viewType : "month";// calender type
    var allDayWeekCell;
    var currDate;
    var nextDate;
    var currDay = defaults.viewDate;
    var currMonth;
    var currYear;
    var currWeekDate;
    var calenderTypeCtrl;
    var monthControl;
    var yearControl;
    var startingDay;
    var monthLength;
    var weekMonth = [];
    var currentQueryDate;// used as track current query date for checking ajaxCall after 5 month gap
    var ajaxData = {};// used as data parameter for ajax call
    var toolTipW2lBox = null;

    /**
     * Custom drag function
     */

    var drag = {
        draggable : false,
        props :{},
        init:function(el, handler) {
            drag.props.handler = handler;
            drag.props.el = el;
            handler.bind("mousedown", function(e) {
                drag.props.parentX = e.pageX;
                drag.props.parentY = e.pageY;
                drag.props.top = parseInt(el.css("top"), 10);
                drag.props.left = parseInt(el.css("left"), 10);
                drag.dragEvent();
            });
        },
        dragEvent: function() {
            drag.draggable = true;
            $(document).bind('mousemove.w2lDrag',
                    function(e) {
                        drag.dragMove(e);
                        return false;
                    }).bind("mouseup.w2lDrag", function(e) {
                        drag.destroy();
                    });
        },
        dragMove:function(e) {
            if (drag.draggable) {
                var xPosition = drag.props.left + e.pageX - drag.props.parentX;
                var yPosition = drag.props.top + e.pageY - drag.props.parentY;
                if (xPosition > 0 && yPosition > 0) {
                    drag.props.el.css({'top':yPosition,'left':xPosition});
                    clearSelection();
                }
            }
        },
        destroy: function() {
            drag.props.handler.unbind('mouseup', drag.dragEvent).unbind('mousedown', drag.dragMove);
            $(document).unbind('mousemove.w2lDrag').unbind("mouseup.w2lDrag");
            drag.draggable = false;
        }
    };

    /**
     * Section clear function
     */
    function clearSelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }

    /**
     * InObject utility function
     * @param value
     * @param compareObject
     */
    function inObject(value, compareObject) {
        if (compareObject) {
            for (var keys in compareObject) {
                if (typeof keys == "object") {
                    return inObject(value, keys);
                } else {
                    if (value == keys) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Check given date in between start date and end date
     * @param startDate
     * @param endDate
     * @param checkDate
     */
    function dateBetween(startDate, endDate, checkDate) {
        var b, e, c;
        b = new Date(startDate).getTime();
        e = new Date(endDate).getTime();
        c = new Date(checkDate).getTime();
        return (c <= e && c >= b);
    }

    var populateEventCache = {};
    var rowBaseEventCache = {};

    /**
     * Check date Between from object
     * @param data
     * @param isTime
     * @param checkDate
     */
    function checkDateBetweenInObject(data, checkDate, isTime) {
        var newObject = [];
        if (data) {
            for (var keys in data) {
                var keyData = data[keys];
                if (typeof keyData == "object") {
                    for (var key in keyData) {
                        var val = keyData[key];
                        var start = val.start.replace(/-/g, '/');
                        var end = val.end.replace(/-/g, '/');
                        if (isTime) {
                            start = start + " " + val.startTime;
                            end = end + " " + val.endTime;
                        }
                        if (dateBetween(start, end, checkDate)) {
                            newObject.push(val);
                        }
                    }
                }
            }
        }
        return newObject;
    }

    /**
     * Check if event is continuous or not
     * @param data
     * @param checkDate
     * @param eventId
     */
    function isContinuousEvent(data, checkDate, eventId, isTime) {
        if (data) {
            for (var keys in data) {
                var keyData = data[keys];
                if (typeof keyData == "object") {
                    for (var key in keyData) {
                        var val = keyData[key];
                        var start = val.start.replace(/-/g, '/');
                        var end = val.end.replace(/-/g, '/');
                        if (isTime) {
                            start = start + " " + val.startTime;
                            end = end + " " + val.endTime;
                        }
                        if (dateBetween(start, end, checkDate) && val.id == eventId) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


    /**
     * InObject utility function
     * @param keyVal - key value for searching
     * @param compareObject - compare object
     */
    function getObject(keyVal, compareObject) {
        if (compareObject) {
            for (var keys in compareObject) {
                if (typeof keys == "object") {
                    return getObject(keyVal, keys);
                } else {
                    if (keyVal == keys) {
                        return compareObject[keyVal];
                    }
                }

            }
        }
        return false;
    }

    /**
     * Get Formatted date Utility function
     * @param date
     */
    function getFormattedMonth(date) {
        return defaults.monthLabels[currMonth - 1] + " " + date.getFullYear();
    }

    /**
     * Get Formatted week range Utility function
     * @param date
     */
    function getFormattedWeek(date) {
        return printWeekHeader(getWeekStartDate(date), true, " ") + " - " + printWeekHeader(getWeekStartDate(date, 6), true, " ") + ", " + date.getFullYear();
    }

    /**
     * Get Formatted date Utility function
     * @param date
     */
    function getFormattedDay(date) {
        return defaults.weekDayName[date.getDay()] + ", " + defaults.monthLabels[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    }

    function getFormattedMonthLength(value) {
        var formattedMonth;
        if (value < 10) {
            formattedMonth = "0" + value;
        } else {
            formattedMonth = value;
        }
        return formattedMonth;
    }

    function getFormattedDayLength(value) {
        var formattedDay;
        if (value < 10) {
            formattedDay = "0" + value;
        } else {
            formattedDay = value;
        }
        return formattedDay;
    }

    /**
     * First character uppercase and then other lowercase
     * @param string
     */
    function ucFirst(string) {
        var length = string.length;
        if (length > 1) {
            return string.substr(0, 1).toUpperCase() + string.substr(1, (length - 1)).toLowerCase()
        } else {
            return string.toUpperCase();
        }
    }

    /**
     * Generate html of calender
     * private
     */
    function generateHTML() {
        clContainer = $("<div/>");
        clContainer.attr("id", "cl-container");
        clContainer.append(generateHeader());
        $(defaults.container).empty().append(clContainer);
        clContainer.append(prepareCalenderBody());
        controlEventBind();
        if (defaults.dependCalender) {
            //defaults.dependCalender.init(defaults.eventData);
        }
    }

    function prepareCalenderBody(isResize) {
        populateEventCache = {};
        rowBaseEventCache = {};
        var clBody = $("<div/>");
        clBody.addClass("cl-body");
        if (!isResize) {
            clBody.css({height:(clContainerHeight - clHeader.outerHeight()) + 20});
        } else {
            clBody.removeClass("style");
            defaults.container.removeAttr("style");
        }
        clBody.append(generateWeekHeaderRow());
        if (clType != "month") {
            allDayContainer = $("<div/>");
            allDayContainer.addClass("cl-allDayContainer");
            clBody.append(allDayContainer);
        }
        generateDateRow(clBody);
        return clBody;
    }

    function generateControl(controlClass, text) {
        var panel = $("<div/>");
        panel.addClass("cl-inb").addClass("ctl-" + controlClass.toLowerCase()).addClass("cm-buttonOuter");
        return panel.append($("<div/>").addClass('cm-buttonInner').addClass('cm-button' + controlClass).text(text || ''));
    }

    function setDateTitle(date) {
        if (monthTitleCtl) {
            monthTitleCtl.text(eval("getFormatted" + ucFirst(clType) + "(date||currDate)"));
        }
    }

    function getDateTitle() {
        return monthTitleCtl.text();
    }

    /**
     * Generate header html of calender
     */
    function generateHeader() {
        var i;
        clHeader = $("<div/>");
        clHeader.addClass("cl-header");

        var clControl = $("<div/>");
        clControl.addClass("cl-controlPanel");
        if (defaults.showMonthChange) {
            monthControl = $("<select/>");
            monthControl.attr("id", "ctl-month");
            monthControl.attr("name", "ctl-month");
            monthControl.addClass("ctl-select");
            var monthLengths = defaults.monthLabels.length;
            for (i = 1; i <= monthLengths; i++) {
                monthControl.append('<option value="' + i + '">' + defaults.monthLabels[i - 1] + '</option>');
            }
            monthControl.val(currMonth);
            clControl.append(monthControl);
        }
        if (defaults.showYearChange) {
            yearControl = $("<select/>");
            yearControl.attr("id", "ctl-year");
            yearControl.attr("name", "ctl-year");
            yearControl.addClass("ctl-select");
            for (i = defaults.minYear; i <= defaults.maxYear; i++) {
                yearControl.append('<option value="' + i + '">' + i + '</option>');
            }
            yearControl.val(currYear);
            clControl.append(yearControl);
        }

        var switchPanel = $("<div/>");
        switchPanel.addClass("cl-switchPanel");

        var switchInnerPanel = $("<div/>");
        switchInnerPanel.addClass("cl-inb").addClass("cl-switchInnerPanel").addClass("left");

        var switchInnerPanelRight = $("<div/>");
        switchInnerPanelRight.addClass("cl-inb").addClass("cl-switchInnerPanel").addClass("right");

        todayCtl = generateControl("Today", "Today");
        previousCtl = generateControl("Previous", "<");
        nextCtl = generateControl("Next", ">").addClass("no-rightRadious").addClass("split-divider");
        monthTitleCtl = $("<div/>").addClass("cl-inb").addClass("cl-monthTitle");
        setDateTitle();
        todayCtl = generateControl("Today", "Today");
        dayCtl = generateControl("Day", "Day").addClass("no-leftRadious");
        weekCtl = generateControl("Week", "Week").addClass("no-radious").addClass("split-divider");
        monthCtl = generateControl("Month", "Month").addClass("no-rightRadious").addClass("split-divider");
        if (defaults.viewType == "month") {
            monthCtl.addClass("cl-active");
        } else if (defaults.viewType == "day") {
            dayCtl.addClass("cl-active");
        } else {
            weekCtl.addClass("cl-active");
        }
        if (defaults.showCalenderType) {
            if (defaults.plugins.dropDown == "sBox") {
                calenderTypeCtrl = generateControl("CalenderType", "Choose Type");
            } else {
                calenderTypeCtrl = $("<select/>");
                calenderTypeCtrl.attr("id", "ctl-calenderType");
                calenderTypeCtrl.attr("name", "ctl-calenderType");
                calenderTypeCtrl.addClass("ctl-select");
                calenderTypeCtrl.append('<option value="">Choose Type</option>');
                for (var calenderType in defaults.calenderType) {
                    calenderTypeCtrl.append('<option value="' + defaults.calenderType[calenderType].id + '">' + defaults.calenderType[calenderType].name + '</option>');
                }
            }
        }
        clHeader.append(clControl);

        switchPanel.append(switchInnerPanel);
        switchPanel.append(switchInnerPanelRight);

        switchInnerPanel.append(todayCtl);
        switchInnerPanel.append(previousCtl);
        switchInnerPanel.append(nextCtl);
        switchInnerPanel.append(monthTitleCtl);

        switchInnerPanelRight.append(calenderTypeCtrl);
        switchInnerPanelRight.append(dayCtl);
        switchInnerPanelRight.append(weekCtl);
        switchInnerPanelRight.append(monthCtl);

        clHeader.append(switchPanel);
        return clHeader;
    }

    function hasLeapYear(year) {
        return (year % 100 != 0) && (year % 4 == 0) || (year % 400 == 0);
    }

    function getTotalDayInYear(year) {
        return hasLeapYear(year) ? 366 : 365;
    }

    function getWeekNo(date) {
        date = date || new Date();
        var day = date.getDay();
        if (day == 0) day = 7;
        date.setDate(date.getDate() + (4 - day));
        var year = date.getFullYear();
        var totalWeekTime = Math.floor((date.getTime() - new Date(year, 0, 1, -6)) / 86400000);
        return Math.floor(totalWeekTime / 7) + 1;
    }

    function printWeekHeader(date, isFormatted, seperator) {
        seperator = seperator || "/";
        var month = date.getMonth() + 1;
        if (isFormatted) {
            month = defaults.monthLabels[month - 1];
            if (weekMonth.length > 1 && weekMonth[1] == month) {
                month = '';
                weekMonth[1] = month;
            } else {
                weekMonth[0], weekMonth[1] = month;
            }
        }
        return  month + seperator + date.getDate();
    }

    function getWeekStartDate(now, intervalDay) {
        var nowDayOfWeek = intervalDay && intervalDay > 0 ? now.getDay() - intervalDay : now.getDay();
        var nowDay = now.getDate();
        var nowMonth = now.getMonth();
        var nowYear = now.getYear();
        nowYear += (nowYear < 2000) ? 1900 : 0;
        return new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    }

    function getNextMonth(currMonth) {
        var nMonth = currMonth + 1;
        if (nMonth > 12) {
            nMonth = 1;
        }
        return nMonth;
    }

    function getPreviousMonth(currMonth) {
        var pMonth = currMonth - 1;
        if (pMonth < 1) {
            pMonth = 12;
        }
        return pMonth;
    }

    function getPreviousMonthLength(currMonth, currYear) {
        var pMonth = getPreviousMonth(currMonth);
        if (pMonth == 12) {
            currYear -= 1;
        }
        var nextDate = new Date(currYear, pMonth, 0);
        return nextDate.getDate();

    }

    function getNextMonthLength(currMonth, currYear) {
        var nMonth = getNextMonth(currMonth);
        if (nMonth == 1) {
            currYear += 1;
        }
        var nextDate = new Date(currYear, nMonth, 0);
        return nextDate.getDate();
    }

    /**
     * ECalendar control event bind
     */
    function controlEventBind() {
        defaults.viewDate = null;
        todayCtl.bind("click", function(e) {
            recalculate();
            if (defaults.dependCalender) {
                defaults.dependCalender.init();
            }
        });
        nextCtl.bind("click", function(e) {
            var nMonth = monthControl ? getPreviousMonth(parseInt(monthControl.val(), 10)) : currMonth;
            if (monthControl) {
                monthControl.val(nMonth);
            }
            if (yearControl && nMonth == 1) {
                yearControl.val(parseInt(yearControl.val(), 10) + 1);
            }
            var cYear = yearControl ? parseInt(yearControl.val(), 10) : currYear;
            var day = 1;
            if (clType == "week") {
                day = currDay + 7;
            } else if (clType == "day") {
                day = currDay + 1;
            }
            if (clType == "month") {
                nMonth = getNextMonth(currMonth);
                if (nMonth == 1) {
                    cYear = cYear + 1;
                }
            }
            recalculate(nMonth, cYear, day);
            if (defaults.listners.nextClick && $.isFunction(defaults.listners.nextClick)) {
                defaults.listners.nextClick(nMonth, cYear, day);
            }
            if (defaults.dependCalender && clType == "month") {
                var depNextCtrl = defaults.dependCalender.getNextCtrl();
                if (depNextCtrl) {
                    depNextCtrl.trigger("click");
                }
            }
        });
        previousCtl.bind("click", function(e) {
            var pMonth = monthControl ? getPreviousMonth(parseInt(monthControl.val(), 10)) : currMonth;
            if (monthControl) {
                monthControl.val(pMonth);
            }
            if (yearControl && pMonth == 12) {
                yearControl.val(parseInt(yearControl.val(), 10) - 1);
            }
            var cYear = yearControl ? parseInt(yearControl.val(), 10) : currYear;
            var day = 1;
            if (clType == "week") {
                day = currDay - 7;
            } else if (clType == "day") {
                day = currDay - 1;
            }
            if (clType == "month") {
                pMonth = getPreviousMonth(currMonth);
                if (pMonth == 12) {
                    cYear = cYear - 1;
                }
            }
            recalculate(pMonth, cYear, day);
            if (defaults.listners.previousClick && $.isFunction(defaults.listners.previousClick)) {
                defaults.listners.previousClick(pMonth, cYear, day);
            }
            if (defaults.dependCalender && clType == "month") {
                var depPreviousCtrl = defaults.dependCalender.getPreviousCtrl();
                if (depPreviousCtrl) {
                    depPreviousCtrl.trigger("click");
                }
            }
        });
        if (defaults.showMonthChange) {
            monthControl.bind("change", function(e) {
                clType = "month";
                if (defaults.showCalenderType) {
                    ajaxData.type = calenderTypeCtrl.val();
                }
                var cMonth = $(this).val();
                var cYear = yearControl && yearControl.val() != "" ? parseInt(yearControl.val(), 10) : currYear;
                recalculate(cMonth, cYear, 1, true);
            });
        }
        if (defaults.showYearChange) {
            yearControl.bind("change", function(e) {
                clType = "month";
                if (defaults.showCalenderType) {
                    ajaxData.type = calenderTypeCtrl.val();
                }
                var cYear = $(this).val();
                var cMonth = monthControl && monthControl.val() != "" ? parseInt(monthControl.val(), 10) : currMonth;
                recalculate(cMonth, cYear, 1, true);
            });
        }
        if (defaults.showCalenderType) {
            if (defaults.plugins.dropDown == "sBox") {
                calenderTypeCtrl.SBOX({
                    typeHeader:false,
                    cls:"no-border",
                    name: "clType",
                    emptyText:'Choose Type',
                    noSelection:'Choose Type',
                    width:200,
                    dataStore:{
                        json:defaults.calenderType
                    },
                    listners:{
                        onSelect:function(el, data) {
                            ajaxData.type = data.id;
                            recalculate(currMonth, currYear, currDay, true);
                        }
                    }
                });
            } else {
                calenderTypeCtrl.bind("change", function(e) {
                    ajaxData.type = $(this).val();
                    recalculate(currMonth, currYear, currDay, true);
                });
            }
        }
        monthCtl.bind("click", function(e) {
            updateCalenderBody($(this), "month");
        });
        weekCtl.bind("click", function(e) {
            updateCalenderBody($(this), "week", true);
        });
        dayCtl.bind("click", function(e) {
            updateCalenderBody($(this), "day", true);
        });
    }

    function updateCalenderBody(el, controlType, fromInner) {
        if (fromInner) {
            var currentDateTime = new Date();
            var day = 1;
            if ((currentDateTime.getMonth() + 1) == currMonth) {
                day = currentDateTime.getDate();
            }
            updateProperty(currMonth, currYear, day);
        }
        el.addClass("cl-active").siblings().removeClass("cl-active");
        clType = controlType;
        if (clContainer) {
            clContainer.find(".cl-body").replaceWith(prepareCalenderBody());
        }
        setDateTitle();
    }

    function updateProperty(cMonth, cYear, day) {
        initVar(cMonth, cYear, day);
        initProperty();
        setDateTitle();
    }

    /**
     * Recalculate calender
     * @param cMonth
     * @param cYear
     */
    function recalculate(cMonth, cYear, day, ajaxReload, isResize) {
        if (!isResize) {
            updateProperty(cMonth, cYear, day);
        } else {
            setContainerWidthHeight();
        }
        if (currentQueryDate) {
            var splitCurrentDate = currentQueryDate.split("-");
            var currentFromDate = new Date(parseInt(splitCurrentDate[0], 10), parseInt(splitCurrentDate[1], 10), parseInt(splitCurrentDate[2], 10));
            var currentFromMonth = currentFromDate.getMonth();
            if ((currMonth < currentFromMonth - defaults.dataFetchMonthInterval) || (currMonth > currentFromMonth + defaults.dataFetchMonthInterval)) {
                ajaxReload = true;
            }
        }
        if (ajaxReload) {
            makeAjaxCall(function() {
                if (clContainer) {
                    clContainer.find(".cl-body").replaceWith(prepareCalenderBody(isResize));
                }
            });
        } else {
            if (clContainer) {
                clContainer.find(".cl-body").replaceWith(prepareCalenderBody(isResize));
            }
        }
    }

    this.recalculate = function(cMonth, cYear, day, ajaxReload, isResize) {
        defaults.viewDate = null;
        recalculate(cMonth, cYear, day, ajaxReload, isResize);
    };

    /**
     * Get per date cell width
     */
    function getCellWidth(length) {
        return Math.round((clContainerWidth / (length || 7) - 4));
    }

    /**
     * Get per date cell width for week
     */
    function getWeekCellWidth(length) {
        return Math.round((clContainerWidth - 100) / (length || 7));
    }

    /**
     * Get per date cell height
     */
    function getCellHeight(countLength) {
        return Math.round(((clContainerHeight - ($(defaults.container).find(".cl-header").outerHeight())) - 20) / (countLength || 7));
    }

    /**
     * Generate week header row
     */
    function generateWeekHeaderRow() {
        var weekTitle = $("<div/>");
        weekTitle.addClass("cl-weekTitle");
        var i = 0;
        var loopLength = clType == "month" ? 7 : (clType == "week" ? 8 : 2);
        var cellWidth = clType == "week" ? getWeekCellWidth(7) : (clContainerWidth - 90);
        if (clType == "month") {
            cellWidth = getCellWidth(7);
        }
        var cellHeight = getCellHeight();
        var weekStartDate;
        var currentDate = new Date();
        for (i = 0; i < loopLength; i++) {
            var weekCell = $("<div/>");
            weekCell.addClass("week-cell week-head");
            weekCell.css({width:cellWidth,height:cellHeight,'line-height':cellHeight + "px"});
            var weekString = "";
            if (i > 0) {
                var interval = i - 1;
                weekStartDate = getWeekStartDate(currWeekDate, interval);
                if (clType == "day") {
                    weekStartDate = currDate;
                }
                weekString = defaults.weekDayName[i - 1] + " " + printWeekHeader(weekStartDate);
            } else if (clType != "month" && i < loopLength) {
                weekCell.addClass("cl-inActiveCol");
            }
            weekCell.text(clType == "month" ? defaults.weekDayName[i] : weekString);
            if (clType != "month" && weekStartDate && weekStartDate.getDate() == currentDate.getDate() && weekStartDate.getMonth() == currentDate.getMonth() && weekStartDate.getFullYear() == currentDate.getFullYear()) {
                weekCell.addClass("cl-active");
            }
            if (clType == "month" && i == 6) {
                weekCell.addClass("bor");
            }
            weekTitle.append(weekCell);
        }
        return weekTitle;
    }

    /**
     * Generate date row
     * @param clBody
     */
    function generateDateRow(clBody) {
        if (clType == "month") {
            dayContainer = $("<div/>");
            dayContainer.addClass("cl-dayContainer");
            clBody.append(dayContainer);
            prepareDateContainer();
        } else {
            weekContainer = $("<div/>");
            weekContainer.addClass("cl-weekContainer");
            clBody.append(weekContainer);
            prepareWeekContainer();
        }
    }

    function generateEventCell(data, className, counter, isVertical, isContinuousEvent, fromTooltipLeft, fromTooltipRight, fromTooltip) {
        var eventCell = $("<div/>").addClass(className || "cl-eventCell");
        eventCell.data("data", data);
        if (data) {
            if (!data.color) {
                data.color = defaults.color;
            }
            if (data.color && !data.color.background) {
                data.color.background = defaults.color.background;
            }
            if (data.color && !data.color.border) {
                data.color.border = defaults.color.border;
            }
            if (data.color && !data.color.foreground) {
                data.color.foreground = defaults.color.foreground;
            }
            if (!data.title) {
                data.title = defaults.noEventTitle;
            }
            if (data.color) {
                if (data.color.background) {
                    eventCell.css({backgroundColor:data.color.background});
                }
                if (data.color.border) {
                    eventCell.css({border:"1px solid " + data.color.border});
                }
                if (isVertical && isContinuousEvent) {
                    eventCell.css({borderTopColor: data.color.background,borderBottomColor: data.color.background});
                }
            }
            if (!isVertical && ((counter == 1 && isContinuousEvent) || fromTooltipLeft)) {
                eventCell.prepend($("<div />").addClass("cl-continuousEvent left").css({"borderRightColor":data.color.background}));
                eventCell.css({"borderLeft":"none"});
            }
            if (!isVertical && ((counter == 7 && isContinuousEvent) || fromTooltipRight)) {
                eventCell.append($("<div />").addClass("cl-continuousEvent right").css({"borderLeftColor":data.color.background}));
                eventCell.css({"borderRight":"none"});
            }
            if (!populateEventCache[data.id] || (!isVertical && counter == 1)) {
                if (data.title) {
                    var spanTitleEl = $("<span />");
                    if (!isVertical && !fromTooltip) {
                        spanTitleEl.css({width:(getCellWidth() - 25)});
                    }
                    if (data.color.foreground) {
                        spanTitleEl.css({color:data.color.foreground});
                    }
                    eventCell.append(spanTitleEl.attr("title", data.title).text(data.title));
                }
                if (data.icon) {
                    eventCell.prepend($("<img />").attr("src", data.icon));
                }
            } else {
                if (data.color && data.color.border) {
                    if (!isVertical) {
                        eventCell.css("border-left", 0).css("margin-left", -2);
                        if (isContinuousEvent) {
                            eventCell.css("border-right", 0);
                        }
                    } else {
                        eventCell.css("border-bottom", 0).css("margin-top", -2);
                        if (isContinuousEvent) {
                            eventCell.css("border-top", 0);
                        }
                    }
                }
            }
            populateEventCache[data.id] = data.title;
        } else {
            eventCell.append("&nbsp;");
        }
        return eventCell;
    }


    function prepareWeekContainer() {
        weekContainer.empty();
        var loopLength = defaults.timePeriod.length;
        var j = 0;
        var cellWidth = clType == "week" ? getWeekCellWidth(7) : (clContainerWidth - 90);
        var cellHeight = defaults.verticalCellHeight;
        var weekCellLoop = clType == "week" ? 8 : 2;
        for (j; j < loopLength; j++) {
            var weekNo = $("<div/>");
            weekNo.addClass("cl-weekNo");
            for (var i = 0; i < weekCellLoop; i++) {
                var weekCell = $("<div/>");
                weekCell.addClass("week-cell");
                weekCell.css({width:cellWidth,height:cellHeight});
                if (i == 0) {
                    if (j % 2 == 0) {
                        weekCell.css({width:60}).text(defaults.timePeriod[j].replace(':00', ''));
                    } else {
                        weekCell.css({width:60,borderTop:0});
                    }
                } else {
                    weekCell.addClass("week-cellRow");
                    var interval = i - 1;
                    var weekStartDate = getWeekStartDate(currWeekDate, interval);
                    if (clType == "day") {
                        weekStartDate = currDate;
                    }
                    var presentDay = weekStartDate.getFullYear() + "/" + getFormattedMonthLength(weekStartDate.getMonth() + 1) + "/" + getFormattedDayLength(weekStartDate.getDate());
                    var nextDay = weekStartDate.getFullYear() + "/" + getFormattedMonthLength(weekStartDate.getMonth() + 1) + "/" + getFormattedDayLength(weekStartDate.getDate() + 1);
                    var prevDay = weekStartDate.getFullYear() + "/" + getFormattedMonthLength(weekStartDate.getMonth() + 1) + "/" + getFormattedDayLength(weekStartDate.getDate() - 1);
                    weekCell.data("data", {'time':defaults.timePeriod[j],'startTime':defaults.timePeriodValue[j],'day':getFormattedDayLength(weekStartDate.getDate()),'month':getFormattedMonthLength(weekStartDate.getMonth() + 1),'year':weekStartDate.getFullYear()});
                    var weekCellHeight = weekCell.height();
                    var weekCellWidth = weekCell.width();
                    var remainEvent = 0;
                    if (j % 2 != 0) {
                        weekCell.css({borderTopStyle:'dashed'});
                    }
                    var eventList = checkDateBetweenInObject(defaults.eventData, presentDay);
                    if (eventList && eventList.length > 0) {
                        var eventsLength = eventList.length;
                        if (!rowBaseEventCache[j]) {
                            rowBaseEventCache[j] = {};
                        }
                        var newEventList = [];
                        var tempCurrDate = new Date();
                        var staticDate = tempCurrDate.getFullYear() + "/" + getFormattedMonthLength(tempCurrDate.getMonth() + 1) + "/" + getFormattedDayLength(tempCurrDate.getDate());
                        var compareTime = staticDate + " " + defaults.timePeriodValue[j] + ":00";
                        var nextDateTime = staticDate + " " + defaults.timePeriodValue[j + 1] + ":00";
                        var prevDateTime = staticDate + " " + defaults.timePeriodValue[j - 1] + ":00";

                        for (var fe = 0; fe < eventsLength; fe++) {
                            if (dateBetween((staticDate + " " + eventList[fe]['startTime']), (staticDate + " " + eventList[fe]['endTime']), compareTime)) {
                                newEventList.push(eventList[fe]);
                            }
                            if (!rowBaseEventCache[j][eventList[fe]['id']]) {
                                rowBaseEventCache[j][eventList[fe]['id']] = eventList[fe];
                            }
                        }
                        eventList = newEventList;
                        var totalAcceptRow = Math.round(weekCellWidth / 50);
                        var cellEventColumn;
                        var newEventsLength = eventList.length;

                        var newCacheEventList = {};

                        for (var col = 0; col < newEventsLength; col++) {
                            newCacheEventList[eventList[col]['id']] = eventList[col]['id'];
                        }
                        var ev = 0;
                        if (rowBaseEventCache[j]) {
                            for (var event in rowBaseEventCache[j]) {
                                if (inObject(rowBaseEventCache[j][event]["id"], newCacheEventList)) {
                                    var isContinuousEvents;
                                    if (j == 0) {
                                        isContinuousEvents = isContinuousEvent(defaults.eventData, nextDateTime, (rowBaseEventCache[j][event] ? rowBaseEventCache[j][event].id : ''), true);
                                    } else if (j == (defaults.timePeriodValue.length - 1)) {
                                        isContinuousEvents = isContinuousEvent(defaults.eventData, prevDateTime, (rowBaseEventCache[j][event] ? rowBaseEventCache[j][event].id : ''), true);
                                    } else {
                                        isContinuousEvents = isContinuousEvent(defaults.eventData, nextDateTime, (rowBaseEventCache[j][event] ? rowBaseEventCache[j][event].id : ''), true);
                                        isContinuousEvents = isContinuousEvent(defaults.eventData, prevDateTime, (rowBaseEventCache[j][event] ? rowBaseEventCache[j][event].id : ''), true);
                                    }
                                    var currentEventCache = rowBaseEventCache[j][event];
//                                    var isAllDayContinuousEvents = isContinuousEvent(defaults.eventData, (i == 1 ? prevDay : nextDay), (currentEventCache ? currentEventCache.id : ''));
//                                    if ((currentEventCache && parseInt(currentEventCache.allDay, 10) > 0) || isAllDayContinuousEvents) {
//                                        cellEventColumn = generateEventCell(currentEventCache, 'cl-eventCellItem cl-eventCellHorizontal', i, false, isAllDayContinuousEvents);
//                                        cellEventColumn.css({width:weekCellWidth - 8});
//                                        cellEventColumn.find("span").css({width:(weekCellWidth - 40)});
//                                        allDayWeekCell = $("<div />").addClass("cl-weekNo");
//                                        allDayWeekCell.append(cellEventColumn);
//                                        if (j==1) {
//                                            allDayContainer.append(allDayWeekCell);
//                                        }
                                    // } else {
                                    cellEventColumn = generateEventCell(currentEventCache, 'cl-eventCellItem cl-eventCellVertical', i, true, true);
                                    cellEventColumn.css({width:(weekCellWidth / eventsLength) - 8});
                                    cellEventColumn.find("span").css({width:(weekCellWidth / eventsLength) - 30});
                                    //}
                                    ev++;
                                } else {
                                    cellEventColumn = generateEventCell(null, "cl-eventCellVertical empty", i, true);
                                    cellEventColumn.css({width:(weekCellWidth / eventsLength) - 8});
                                }
                                weekCell.append(cellEventColumn);
//                                if (ev + 2 > totalAcceptRow) {
//                                    //cellEventColumn.hide();
//                                    //remainEvent += 1;
//                                }
                            }
                        }
                        if (remainEvent > 0) {
                            var addMoreEvent = $("<div />").addClass("cl-verticalMoreEvent").attr("title", "More Event");
                            addMoreEvent.bind("click", function(e) {
                                var modalHtml = $(this).closest(".week-cell").clone(true);
                                if (defaults.plugins.toolTip == "w2lbox") {
                                    var data = modalHtml.data("data");
                                    var presentDate = new Date(data.year, parseInt(data.month, 10), data.day);
                                    var title = getFormattedDay(presentDate);
                                    var toolContent = prepareTooltipBody(modalHtml, presentDate, toolTipW2lBox);
                                    if (!toolTipW2lBox) {
                                        toolTipW2lBox = new w2lbox({
                                            title:title,
                                            closeAction:"hide",
                                            html: toolContent
                                        });
                                    } else {
                                        toolTipW2lBox.setTitle(title);
                                        toolTipW2lBox.setContent(toolContent);
                                        toolTipW2lBox.show();
                                    }
                                } else {
                                    getToolTip(e, modalHtml);
                                }
                                e.preventDefault();
                            });
                            weekCell.append(addMoreEvent);
                        }
                    }
                }
                if (i == (clType == "week" ? 7 : 1)) {
                    weekCell.addClass("cl-last")
                }
                weekNo.append(weekCell);
            }
            if (j == (loopLength - 1)) {
                weekNo.addClass("cl-last");
            }
            weekContainer.append(weekNo);
        }
        setTimeout(cellBind, 200);
    }

    /**
     * Create date container
     */
    function prepareDateContainer() {
        dayContainer.empty();
        var j = 1;
        var loopLength = startingDay > 4 && monthLength >= 30 ? 6 : 5;
        var k = 1;
        var m = 1;
        var prevCounter = startingDay;
        var nextCounter = 0;
        var access = false;
        var cellWidth = getCellWidth();
        var cellHeight = getCellHeight(loopLength);
        var prevMonthLength = getPreviousMonthLength(currMonth, currYear);
        for (j; j <= loopLength; j++) {
            var weekNo = $("<div/>");
            weekNo.addClass("cl-weekNo");
            var i = 1;
            for (i = 1; i <= 7; i++) {
                var weekCell = $("<div/>");
                weekCell.addClass("week-cell");
                weekCell.css({width:cellWidth,height:cellHeight});
                if (j == 1 && m >= (startingDay) + 1) {
                    access = true;
                } else {
                    access = j > 1 && k <= monthLength;
                }
                if (access) {
                    var currentDate = new Date();
                    currDay = currentDate.getDate();
                    if (k == currentDate.getDate() && currMonth == currentDate.getMonth() + 1 && currentDate.getFullYear() == currYear) {
                        weekCell.addClass("cl-active");
                    }
                    var presentDay = currYear + "/" + getFormattedMonthLength(currMonth) + "/" + getFormattedDayLength(k);
                    var nextDay = currYear + "/" + getFormattedMonthLength(currMonth) + "/" + getFormattedDayLength(k + 1);
                    var prevDay = currYear + "/" + getFormattedMonthLength(currMonth) + "/" + getFormattedDayLength(k - 1);
                    weekCell.data("data", {'day':getFormattedDayLength(k),'month':getFormattedMonthLength(currMonth),'year':currYear,'fullDate':presentDay});

                    weekCell.html($("<span/>").addClass("cl-eventName").bind("click",
                            function() {
                                var cellData = $(this).parent().data("data");
                                if (cellData) {
                                    defaults.viewDate = null;
                                    updateProperty(cellData.month, cellData.year, cellData.day);
                                    updateCalenderBody(dayCtl, "day", false);
                                }
                            }).text(k));

                    var weekCellHeight = weekCell.height();
                    var remainEvent = 0;
                    var eventList = checkDateBetweenInObject(defaults.eventData, presentDay);
                    if (eventList && eventList.length > 0) {
                        var totalAcceptRow = Math.round((weekCellHeight - 20) / 20);
                        var cellEventColumn;
                        var eventsLength = eventList.length;
                        if (!rowBaseEventCache[j]) {
                            rowBaseEventCache[j] = {};
                        }
                        var newEventList = {};
                        for (var col = 0; col < eventsLength; col++) {
                            if (!rowBaseEventCache[j][eventList[col]['id']]) {
                                rowBaseEventCache[j][eventList[col]['id']] = eventList[col];
                            }
                            newEventList[eventList[col]['id']] = eventList[col]['id'];
                        }
                        var ev = 0;
                        if (rowBaseEventCache[j]) {
                            for (var event in rowBaseEventCache[j]) {
                                if (inObject(rowBaseEventCache[j][event]["id"], newEventList)) {
                                    var isContinuousEvents = isContinuousEvent(defaults.eventData, (i == 1 ? prevDay : nextDay), (rowBaseEventCache[j][event] ? rowBaseEventCache[j][event].id : ''));
                                    cellEventColumn = generateEventCell(rowBaseEventCache[j][event], 'cl-eventCellItem cl-eventCellHorizontal', i, false, isContinuousEvents);
                                } else {
                                    cellEventColumn = generateEventCell(null, "cl-eventCell empty");
                                }
                                weekCell.append(cellEventColumn);
                                if (ev + 2 > totalAcceptRow) {
                                    cellEventColumn.hide();
                                    remainEvent += 1;
                                }
                                ev++;
                            }
                        }
                        if (remainEvent > 0) {
                            weekCell.append($("<div />").addClass("cl-moreEvent").bind("click",
                                    function(e) {
                                        var modalHtml = $(this).closest(".week-cell").clone(true);
                                        if (defaults.plugins.toolTip == "w2lbox") {
                                            var data = modalHtml.data("data");
                                            var presentDate = new Date(data.year, parseInt(data.month, 10), data.day);
                                            var title = getFormattedDay(presentDate);
                                            var toolContent = prepareTooltipBody(modalHtml, presentDate, toolTipW2lBox);
                                            if (!toolTipW2lBox) {
                                                toolTipW2lBox = new w2lbox({
                                                    title:title,
                                                    closeAction:"hide",
                                                    html: toolContent
                                                });
                                            } else {
                                                toolTipW2lBox.setTitle(title);
                                                toolTipW2lBox.setContent(toolContent);
                                                toolTipW2lBox.show();
                                            }
                                        } else {
                                            getToolTip(e, modalHtml);
                                        }
                                    }).text("+" + remainEvent + " more"));
                        }
                    }
                    k++;
                } else {
                    var isInactive = false;
                    if (k <= monthLength) {
                        prevCounter--;
                        weekCell.text(prevMonthLength - prevCounter);
                        isInactive = true;
                    } else if (j > startingDay) {
                        nextCounter++;
                        weekCell.text(nextCounter);
                        isInactive = true;
                    }
                    if (isInactive) {
                        weekCell.addClass("cl-inActive");
                    }
                }
                m++;

                if (i == 7) {
                    weekCell.addClass("bor");
                }
                if (j == loopLength) {
                    weekCell.addClass("bob");
                }
                weekNo.append(weekCell);
            }
            dayContainer.append(weekNo);
        }
        setTimeout(cellBind, 200);
    }

    var event;
    var modalBody;
    var modalTitle;
    var modalId;

    this.getModal = function() {
        return $("#" + modalId);
    };
    this.setModalTitle = function(value) {
        var modal = this.getModal();
        modal.find(".cl-modalTitle").find("span").empty().html(value);
    };
    this.setModalContent = function(value) {
        var modal = this.getModal();
        modal.find(".cl-modalBody").empty().html(value);
        drag.init(modal, modal.find(".cl-modalTitle"));
        setTimeout(modalRebuild, 200);
    };

    function getModal(value) {
        modalBody = $("<div />").addClass("cl-modalBody");
        modalTitle = $("<div />").addClass("cl-modalTitle").addClass("cl-inb").append("<span />");
        var modZIndex = 1001;
        if (!modalEl) {
            modalEl = $("<div />").css({visibility:'hidden','top':-200000});
            modalId = "cl-modal-" + $(".cl-modal").length;
            modalEl.attr("id", modalId);
            modalEl.addClass("cl-modal");
            modalEl.append(modalTitle).append($("<div />").addClass("cl-modalClose").addClass("cl-inb").html("<span>X</span>").bind("click", function() {
                modalEl.hide(20);
            })).append(modalBody);

            $(document).bind("click.clModal", function(e) {
                var targetEl = $(e.target);
                if (targetEl.parents(".cl-modal").length < 1 && targetEl.parents(".ui-datepicker").length < 1) {
                    modalEl.hide(20);
                }
                if (tooltipEl && tooltipEl.length > 0) {
                    modZIndex = parseInt(modalEl.css("zIndex"), 10);
                    modalEl.css("zIndex", (modZIndex + 1));
                }
            });
            $("body").append(modalEl);
        }
        if (value) {
            modalBody.html(value);
            modalEl.show();
            setTimeout(modalRebuild, 200);
        } else {
            return modalEl;
        }
    }

    function modalRebuild() {
        var bodyWidth = $("body").width();
        var posName = "left";
        var toolTipWidth = modalEl.outerWidth();
        var toolTipHeight = modalEl.outerHeight();
        var leftPosition = event ? event.pageX : 5;
        var topPosition = event ? event.pageY : 5;
        var pos = event ? event.pageX - toolTipWidth / 2 : 5;
        if (pos + toolTipWidth > bodyWidth) {
            posName = "right";
            pos = bodyWidth - leftPosition;
        }
        if (toolTipHeight > topPosition) {
            topPosition = toolTipHeight - (topPosition + 5);
        }
        topPosition = topPosition - toolTipHeight;
        if (topPosition < 5) {
            topPosition = 5;
        }
        if (pos < 5) {
            pos = 5;
        }
        var modZIndex = 1000;
        if (tooltipEl && tooltipEl.length > 0) {
            modZIndex = parseInt(modalEl.css("zIndex"), 10);
        }
        modalEl.removeAttr("style").css({visibility:'visible',top: topPosition,"zIndex":(modZIndex + 1)}).css(posName, pos);
    }

    var tooltipEl;

    function getToolTip(e, text) {
        var data = text.data("data");
        $(".cl-tooltip").remove();
        tooltipEl = $("<div />");
        var presentDate = new Date(data.year, parseInt(data.month, 10), data.day);
        var dateString = getFormattedDay(presentDate);
        tooltipEl.append("<h3>" + dateString + "</h3>");
        tooltipEl.append($("<span class=\"cl-remove\">X</span>").bind("click", function() {
            tooltipEl.remove();
        }));
        drag.init(tooltipEl, tooltipEl.find("h3"));
        var modZIndex = 1000;
        if (modalEl && modalEl.length > 0) {
            modZIndex = parseInt(modalEl.css("zIndex"), 10);
        }
        $(document).bind("click.clToolTip", function(e) {
            if ($(e.target).parents(".cl-tooltip").length < 1) {
                tooltipEl.remove();
            }
            if (modalEl && modalEl.length > 0) {
                modZIndex = parseInt(modalEl.css("zIndex"), 10);
                tooltipEl.css("zIndex", (modZIndex + 1));
            }
        });
        tooltipEl.addClass("cl-tooltip");
        $("body").append(tooltipEl);
        tooltipEl.append(prepareTooltipBody(text, presentDate, tooltipEl)).show();
        var bodyWidth = $("body").width();
        var posName = "left";
        var pos = e.pageX - (tooltipEl.outerWidth() / 2);
        if (pos + tooltipEl.outerWidth() > bodyWidth) {
            posName = "right";
            pos = bodyWidth - e.pageX;
        }
        tooltipEl.removeAttr("style").css({"zIndex":(modZIndex + 1),"top":(e.pageY - tooltipEl.outerHeight() / 2)}).css(posName, pos);
        $(document).bind('keydown.eCalendarTooltip', function(e) {
            if (e.keyCode == 27 && tooltipEl) {
                tooltipEl.remove();
            }
            return true;
        });
    }

    function prepareTooltipBody(text, presentDate, containerEl) {
        var tollTipBodyEl = $("<div class=\"cl-tooltipContent\"></div>");
        if (text.find(".cl-eventCellItem").length > 0) {
            var prevDay = presentDate.getFullYear() + "-" + getFormattedMonthLength(presentDate.getMonth()) + "-" + getFormattedDayLength(presentDate.getDate() - 1);
            var nextDay = presentDate.getFullYear() + "-" + getFormattedMonthLength(presentDate.getMonth()) + "-" + getFormattedDayLength(presentDate.getDate() + 1);
            text.find(".cl-eventCellItem").each(function() {
                var elData = $(this).data("data");
                var isNextContinuousEvents = isContinuousEvent(defaults.eventData, nextDay, (elData ? elData.id : ''));
                var isPrevContinuousEvents = isContinuousEvent(defaults.eventData, prevDay, (elData ? elData.id : ''));
                var cellEventColumn = generateEventCell(elData, 'cl-eventCellItem cl-eventCellHorizontal', 1, false, null, isPrevContinuousEvents, isNextContinuousEvents, true);
                tollTipBodyEl.append(cellEventColumn);
            });
            cellBind(tollTipBodyEl);
        }
        return tollTipBodyEl;
    }

    /**
     * Cell bind event
     */
    function cellBind(element) {
        var conEl = element || clContainer.find(".week-cell:not(.week-head)");
        conEl.bind("click.w2lWeekCell", function(e) {
            var el = $(this);
            var target = $(e.target);
            if (target.hasClass('cl-moreEvent')) {
                return false;
            }
            event = e;
            var data = el.data("data");
            if (target.parents(".cl-eventCellItem").length > 0) {
                data = target.parents(".cl-eventCellItem").data("data");
            } else if (target.hasClass("cl-eventCellItem")) {
                data = target.data("data");
            }
            if (defaults.setModal) {
                defaults.setModal(getModal(), el, data);
            } else {
                defaults.cellClick(el, data);
            }
            if (defaults.listners.cellClick && $.isFunction(defaults.listners.cellClick)) {
                defaults.listners.cellClick(el, data);
            }
        });
//            clContainer.find(".cl-dayContainer .week-cell").mouseover(function(e) {
//                var el = $(this);
//                var title = el.data('title');
//                if (title) {
//                    makeModal(title);
//                }
//            });
//            clContainer(".cl-dayContainer").mouseout(function(e) {
//                if (modalEl) {
//                    modalEl.hide();
//                }
//            });
//        $(document).bind('click.ECalendar', function(e) {
//            var targetEl = $(e.target);
//            if (modalEl && !modalEl.is(":hidden") && !targetEl.hasClass("week-cell") && targetEl.parents(".cl-modal").length < 1
//                    && !targetEl.hasClass("cl-modal") && targetEl.parents(".ui-datepicker").length < 1) {
//                modalEl.hide(20);
//            }
//        });
        $(document).bind('keydown.eCalendar', function(e) {
            if (e.keyCode == 27 && modalEl && !modalEl.is(":hidden")) {
                modalEl.hide(20);
            }
            return true;
        });
    }

    this.hideModal = function() {
        if (modalEl) {
            modalEl.hide(20);
        }
    };

    this.changeDay = function(date) {
        if (!date) {
            throw "Please give date string as format yyyy-mm-dd";
        }
        defaults.viewDate = null;
        var splitDate = date.split("-");
        updateProperty(splitDate[1], splitDate[0], splitDate[2]);
        updateCalenderBody(dayCtl, "day", false);
    };

    this.changeMonth = function(month, year) {
        if (!month && !year) {
            throw "Please give month and year";
        }
        defaults.viewDate = null;
        updateProperty(month, year, 0);
        monthCtl.trigger("click");
    };

    this.dateBetweenObject = function(eventData, presentDay) {
        checkDateBetweenInObject(eventData, presentDay);
    };

    function getNextWeekFirstDate() {
        return new Date(new Date(currDate).setDate(currDate.getDate() - currDate.getDay()));
    }

    /**
     * Init variable
     * @param month
     * @param year
     */
//        function initVar(month, year, day) {
//            if (month && year) {
//                if (day) {
//                    currDate = new Date(year, month, day);
//                } else {
//                    currDate = new Date(year, month);
//                }
//            } else {
//                currDate = new Date();
//            }
//            currDay = currDate.getDate();
//            currMonth = currDate.getMonth();
//            currYear = currDate.getFullYear();
//            nextDate = new Date(currYear, currMonth, 0);
//            currWeekDate = getNextWeekFirstDate();
//        }

    function setContainerWidthHeight() {
        clContainerWidth = defaults.width ? defaults.width : $(defaults.container).width();
        clContainerHeight = defaults.height ? defaults.height : $(defaults.container).outerHeight();
        if (defaults.autoHeight) {
            clContainerHeight = $(window).height();
        }
    }

    function initVar(month, year, day) {
        if (defaults.viewDate) {
            var splitDate = defaults.viewDate.split("-");
            if (splitDate) {
                year = parseInt(splitDate[0], 10);
                month = parseInt(splitDate[1], 10);
                day = parseInt(splitDate[2], 10);
            }
        }
        if (month && year) {
            month = parseInt(month, 10);
            year = parseInt(year, 10);
            currDate = new Date(year, ( month - 1), day);
        } else {
            currDate = new Date();
        }
        populateEventCache = {};
        rowBaseEventCache = {};
        currDay = currDate.getDate();
        currMonth = month ? month : (currDate.getMonth() + 1);
        currYear = currDate.getFullYear();
        nextDate = new Date(currYear, currMonth, 0);
        currWeekDate = getNextWeekFirstDate();
        weekMonth = [];
        setContainerWidthHeight();
    }

    /**
     * All public properties
     */
    this.firstDay = null;
    this.currDay = null;
    this.currMonth = null;
    this.currYear = null;
    this.startingDay = null;
    this.monthLength = null;
    /**
     * Get first day of month
     */
    this.getFirstDay = function() {
        return this.firstDay;
    };
    /**
     * Get event data object
     */
    this.getEventData = function() {
        return this.eventData;
    };
    /**
     * Get monthLength on current month
     */
    this.monthLength = function() {
        return this.monthLength;
    };
    /**
     * Initialize property
     */
    function initProperty() {
        this.firstDay = new Date(currYear, currMonth - 1, 1);
        this.currDay = currDay;
        this.currMonth = currMonth;
        this.currYear = currYear;
        this.startingDay = this.firstDay.getDay();
        this.monthLength = nextDate.getDate();
        startingDay = this.startingDay;
        monthLength = this.monthLength;
    }

    function getQueryDate(type, unChange) {
        var formattedMonth = type && type == "-" ? (currMonth - parseInt(defaults.dataFetchMonthInterval, 10)) : (!unChange ? (currMonth + parseInt(defaults.dataFetchMonthInterval, 10)) : currMonth);
        var formattedYear = currYear;
        if (!unChange) {
            if (formattedMonth > 12) {
                formattedYear += 1;
                formattedMonth = formattedMonth - 12;
            } else if (formattedMonth < 1) {
                formattedYear -= 1;
                formattedMonth = 12 - formattedMonth;
            }
        }
        var formattedMonthLength = defaults.monthLength[formattedMonth - 1];
        if (formattedMonth < 10) {
            formattedMonth = "0" + formattedMonth.toString();
        }
        return formattedYear + "-" + formattedMonth + "-" + (type ? "01" : formattedMonthLength );
    }

    //If Ajax call then use
    function makeAjaxCall(callback) {
        currentQueryDate = getQueryDate(undefined, true);
        ajaxData.fromDate = getQueryDate("-");
        ajaxData.toDate = getQueryDate();
        $.ajax({
            url : defaults.ajaxUrl,
            dataType:'json',
            data :ajaxData,
            success:function(data) {
                defaults.eventData = data;
                if (callback && $.isFunction(callback)) {
                    callback();
                } else {
                    generateHTML();
                }
                if (defaults.dependCalender) {
                    // defaults.dependCalender.init(defaults.eventData);
                }
                if (defaults.ajaxAfterLoad && $.isFunction(defaults.ajaxAfterLoad)) {
                    defaults.ajaxAfterLoad();
                } else {
                    defaults.container.find("#loadingCalender").remove();
                }
            },
            beforeSend:function() {
                if (defaults.ajaxLoading && $.isFunction(defaults.ajaxLoading)) {
                    defaults.ajaxLoading();
                } else {
                    defaults.container.prepend('<div id="loadingCalender" class="cl-loader">Loading...</div>');
                }
            }
        })
    }

    /**
     * initialize the calender
     */
    function initialize(resize) {
        initVar();
        initProperty();
        if (defaults.ajaxUrl && !resize) {
            makeAjaxCall();
        } else {
            generateHTML();
        }
    }

    /**
     * Initialize calender
     */
    this.init = function() {
        initialize();
    };
    /**
     * Trigger calender initialize while window resize
     */
    $(window).bind("resize.calender", function() {
        defaults.viewDate = null;
        recalculate(currMonth, currYear, currDay, false, true);
    });

    /**
     * Call init function
     */
    setTimeout(initialize, 200);
    //initialize();
};
$(function() {
    $.fn.eCalendar = function(configs) {
        return this.each(function() {
            if (typeof configs === 'object') {
                configs.container = $(this);
                return new ECalendar(configs);
            } else {
                $.error('Configuration not found');
            }
        });
    };
});