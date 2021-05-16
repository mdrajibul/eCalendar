/**
 * An advanced calender.
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * <h3>Features </h3>
 * <ul>
 *  <li>Easy plug and play.</li>
 *  <li>Ajax call for populating tooltip.</li>
 * </ul>
 * @param settings
 */
var Calendar = function(settings) {
    /**
     * Default values
     */
    var defaults = {
        monthLabels : ['January', 'February', 'March', 'April','May', 'June', 'July', 'August', 'September','October', 'November', 'December'],
        weekDayName : ['S','M','T','W','T','F','S'],
        minYear : 1970,
        maxYear : 2050,
        showYearMonthControl:false,
        container:null,
        ajaxUrl :null,
        toolTipData:{},
        cellClick:undefined,
        listners:{
            nextClick:undefined,
            previousClick:undefined,
            monthTitleClick:undefined
        }
    };

    /**
     * override default value
     */
    $.extend(true, defaults, settings);
    /**
     * Private property
     */
    var clContainer;
    var tooltipEl;
    var nextCtl;
    var previousCtl;
    var dayContainer;
    var monthTitleCtl;

    var currDate;
    var nextDate;
    var currDay;
    var currMonth;
    var currYear;
    var monthControl;
    var yearControl;
    var startingDay;
    var dateRowLength;
    var monthLength;

    /**
     * InObject utility function
     * @param value
     * @param compareObject
     */
    function inObject(value, compareObject) {
        if (compareObject) {
            for (var keys in compareObject) {
                if (value == keys) {
                    return true;
                }
            }
            return false;
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
                        checkDate = checkDate.replace(/-/g, '/');
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
     * Get Formatted date Utility function
     * @param date
     */
    function getFormattedDate(date) {
        var currDate = date.getDate();
        var curMonth = date.getMonth();
        var currYear = date.getFullYear();
        return defaults.monthLabels[curMonth] + " " + currDate + ", " + currYear
    }

    /**
     * Get Formatted date Utility function
     * @param date
     */
    function getFormattedMonth(date) {
        return defaults.monthLabels[currMonth - 1] + " " + date.getFullYear();
    }

    /**
     * Generate html of calender
     * private
     */
    function generateHTML() {
        clContainer = $("<div/>");
        clContainer.addClass("cl-container");
        clContainer.append(generateHeader());
        $(defaults.container).empty().append(clContainer);
        var clBody = $("<div/>");
        clBody.addClass("cl-body");
        clBody.append(generateWeekRow());
        generateDateRow(clBody);
        clContainer.append(clBody);
        controlEventBind();
    }

    function generateControl(controlClass, text) {
        var panel = $("<div/>");
        panel.addClass("cl-inb").addClass("ctl-" + controlClass.toLowerCase()).addClass("cm-buttonOuter");
        return panel.append($("<div/>").addClass('cm-buttonInner').addClass('cm-button' + controlClass).text(text || ''));
    }

    function setDateTitle() {
        monthTitleCtl.data("titleDate", currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate());
        monthTitleCtl.text(getFormattedMonth(currDate));
    }

    /**
     * Generate header html of calender
     */
    function generateHeader() {
        var i;
        var clHeader = $("<div/>");
        clHeader.addClass("cl-header");

        var clControl = $("<div/>");
        clControl.addClass("cl-controlPanel");

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

        yearControl = $("<select/>");
        yearControl.attr("id", "ctl-year");
        yearControl.attr("name", "ctl-year");
        yearControl.addClass("ctl-select");
        for (i = defaults.minYear; i <= defaults.maxYear; i++) {
            yearControl.append('<option value="' + i + '">' + i + '</option>');
        }
        yearControl.val(currYear);
        clControl.append(yearControl);
        if (defaults.showYearMonthControl) {
            clHeader.append(clControl);
        }
        var switchPanel = $("<div/>");
        switchPanel.addClass("cl-switchPanel");

        var switchInnerPanel = $("<div/>");
        switchInnerPanel.addClass("cl-inb").addClass("cl-switchInnerPanel").css({width:"60%"});

        var switchInnerPanelRight = $("<div/>");
        switchInnerPanelRight.addClass("cl-inb").addClass("cl-switchInnerPanel").css({width:"40%","textAlign":"right"});


        previousCtl = generateControl("Previous", "<").css({'minWidth':30});
        nextCtl = generateControl("Next", ">").addClass("no-rightRadious").addClass("split-divider").css({'minWidth':30});
        monthTitleCtl = $("<div/>").addClass("cl-inb").addClass("cl-monthTitle").css("cursor", "pointer");
        setDateTitle();

        switchPanel.append(switchInnerPanel);
        switchPanel.append(switchInnerPanelRight);
        switchInnerPanel.append(monthTitleCtl);
        switchInnerPanelRight.append(previousCtl);
        switchInnerPanelRight.append(nextCtl);

        clHeader.append(switchPanel);
        return clHeader;
    }

    /**
     * Calendar control event bind
     */
    function controlEventBind() {
        nextCtl.bind("click", function(e) {
            var nMonth = parseInt(monthControl.val(), 10) + 1;
            if (nMonth > 12) {
                nMonth = 1;
            }
            monthControl.val(nMonth);
            if (nMonth == 1) {
                yearControl.val(parseInt(yearControl.val(), 10) + 1);
            }
            var cYear = parseInt(yearControl.val(), 10);
            recalculate(nMonth, cYear);
            if (defaults.listners.nextClick && $.isFunction(defaults.listners.nextClick)) {
                defaults.listners.nextClick(nMonth, cYear);
            }

        });
        previousCtl.bind("click", function(e) {
            var pMonth = parseInt(monthControl.val(), 10) - 1;
            if (pMonth < 1) {
                pMonth = 12;
            }
            monthControl.val(pMonth);
            if (pMonth == 12) {
                yearControl.val(parseInt(yearControl.val(), 10) - 1);
            }
            var cYear = parseInt(yearControl.val(), 10);
            recalculate(pMonth, cYear);
            if (defaults.listners.previousClick && $.isFunction(defaults.listners.previousClick)) {
                defaults.listners.previousClick(pMonth, cYear);
            }
        });
        monthTitleCtl.bind("click", function(e) {
            var titleDate = $(this).data("titleDate");
            if (titleDate) {
                var splitTitleDate = titleDate.split("-");
            }
            var cMonth = parseInt(splitTitleDate[1], 10);
            var cYear = parseInt(splitTitleDate[0], 10);
            recalculate(cMonth, cYear);
            if (defaults.listners.monthTitleClick && $.isFunction(defaults.listners.monthTitleClick)) {
                defaults.listners.monthTitleClick(cMonth, cYear);
            }
        });
        monthControl.bind("change", function(e) {
            var cMonth = parseInt($(this).val(), 10);
            var cYear = parseInt(yearControl.val(), 10);
            recalculate(cMonth, cYear);
        });
        yearControl.bind("change", function(e) {
            var cYear = parseInt($(this).val(), 10);
            var cMonth = parseInt(monthControl.val(), 10);
            recalculate(cMonth, cYear);
        });
    }

    /**
     * Recalculate calender
     * @param pMonth
     * @param cYear
     */
    function recalculate(pMonth, cYear) {
        initVar(pMonth, cYear);
        initProperty();
        if (defaults.ajaxUrl) {
            makeAjaxCall(function() {
                prepareDateContainer();
            });
        } else {
            generateHTML();
        }
        setDateTitle();
    }

    /**
     * Get per date cell width
     */
    function getCellWidth() {
        return Math.round(($(defaults.container).width() / 7) - 2);
    }

    /**
     * Get per date cell height
     */
    function getCellHeight() {
        var containerEl = $(defaults.container);
        var cellHeight = Math.round((containerEl.height() - containerEl.find(".cl-header").height() - containerEl.find(".cl-weekTitle").height() - 34) / dateRowLength);
        if (cellHeight < 20) {
            cellHeight = 20;
        }
        return cellHeight;
    }

    /**
     * Generate week row
     */
    function generateWeekRow() {
        var weekTitle = $("<div/>");
        weekTitle.addClass("cl-weekTitle");
        var i = 0;
        var cellHeight = getCellHeight();
        var cellWidth = getCellWidth();
        for (i = 0; i < 7; i++) {
            var weekCell = $("<div/>");
            weekCell.addClass("week-cell week-head");
            weekCell.css({width:cellWidth,height:cellHeight,'line-height':cellHeight + "px"});
            weekCell.text(defaults.weekDayName[i]);
            if (i == 6) {
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
        dayContainer = $("<div/>");
        dayContainer.addClass("cl-dayContainer");
        clBody.append(dayContainer);
        prepareDateContainer();
    }

    /**
     * Create date container
     */
    function prepareDateContainer() {
        dayContainer.empty();
        var j = 1;
        var k = 1;
        var m = 1;
        var access = false;
        var cellHeight = getCellHeight();
        var cellWidth = getCellWidth();
        for (j; j <= dateRowLength; j++) {
            var weekNo = $("<div/>");
            weekNo.addClass("cl-weekNo");
            var i = 1;
            for (i = 1; i <= 7; i++) {
                var weekCell = $("<div/>");
                weekCell.addClass("week-cell");
                weekCell.css({width:cellWidth,height:cellHeight,'line-height':cellHeight + "px"});
                if (j == 1 && m >= (startingDay + 1)) {
                    access = true;
                } else {
                    access = j > 1 && k <= monthLength;
                }
                if (access) {
                    weekCell.text(k);
                    var currentDate = new Date();
                    currDay = currentDate.getDate();
                    if (k == currentDate.getDate() && currMonth == currDate.getMonth() + 1 && currDate.getFullYear() == currYear) {
                        weekCell.addClass("active");
                    }
                    var formattedDay;
                    var formattedMonth;
                    if (k < 10) {
                        formattedDay = "0" + k;
                    } else {
                        formattedDay = k;
                    }
                    if (currMonth < 10) {
                        formattedMonth = "0" + currMonth;
                    } else {
                        formattedMonth = currMonth;
                    }
                    var presentDay = currYear + "-" + formattedMonth + "-" + formattedDay;
                    weekCell.attr("data-value", presentDay);
                    var dataList = checkDateBetweenInObject(defaults.toolTipData, presentDay);
                    if (dataList && dataList.length > 0) {
                        var title = "";
                        for (var t = 0; t < dataList.length; t++) {
                            title += dataList[t].title + "<br/>";
                        }
                        if (title) {
                            weekCell.data('title', title);
                            weekCell.addClass('tooltip-info');
                        }
                    } else {
                        weekCell.removeClass('tooltip-info');
                    }
                    k++;
                }
                m++;

                if (i == 7) {
                    weekCell.addClass("bor");
                }
                if (j == dateRowLength) {
                    weekCell.addClass("bob");
                }
                weekNo.append(weekCell);
            }
            dayContainer.append(weekNo);
        }
        setTimeout(cellBind, 200);
    }

    /**
     * Cell bind event
     */
    function cellBind() {
        clContainer.find(".cl-dayContainer .week-cell").click(function(e) {
            var el = $(this);
            var data = el.attr("data-value");
            if (defaults.cellClick && $.isFunction(defaults.cellClick)) {
                defaults.cellClick(el, data);
            }
            if (defaults.listners.cellClick && $.isFunction(defaults.listners.cellClick)) {
                defaults.listners.cellClick(el, data);
            }
        });
        clContainer.find(".cl-dayContainer .week-cell").mouseover(function(e) {
            var el = $(this);
            var title = el.data('title');
            if (title) {
                if (!tooltipEl) {
                    tooltipEl = $("<div />");
                    tooltipEl.addClass("cl-tooltip");
                    $("body").append(tooltipEl);
                }
                tooltipEl.show().html(title);
                var bodyWidth = $("body").width();
                var posName = "left";
                var pos = e.pageX;
                if (pos + tooltipEl.outerWidth() > bodyWidth) {
                    posName = "right";
                    pos = bodyWidth - pos;
                }
                tooltipEl.removeAttr("style").css("top", e.pageY).css(posName, pos);
            }
        });
        clContainer.find(".cl-dayContainer").mouseout(function(e) {
            if (tooltipEl) {
                tooltipEl.hide();
            }
        });
    }

    /**
     * Init variable
     * @param month
     * @param year
     */
    function initVar(month, year) {
        if (month && year) {
            month = parseInt(month, 10);
            year = parseInt(year, 10);
            currDate = new Date(year, (month - 1));
        } else {
            currDate = new Date();
        }
        currDay = currDate.getDate();
        currMonth = month ? month : (currDate.getMonth() + 1);
        currYear = currDate.getFullYear();
        nextDate = new Date(currYear, currMonth, 0);
    }

    /**
     * All public properties
     */
    this.firstDay = null;
    this.currDate = null;
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
        dateRowLength = startingDay > 4 && monthLength >= 30 ? 6 : 5;
    }

    //If Ajax call then use
    function makeAjaxCall(callback) {
        var formattedMonth = currMonth;
        if (currMonth < 10) {
            formattedMonth = "0" + currMonth;
        }
        if (!defaults.dependCalender) {
            $.ajax({
                url : defaults.ajaxUrl,
                dataType:'json',
                data :{fromDate:currYear + "-" + formattedMonth + "-01",toDate:currYear + "-" + formattedMonth + "-" + monthLength},
                success:function(data) {
                    defaults.toolTipData = data;
                    if (callback && $.isFunction(callback)) {
                        callback();
                    } else {
                        generateHTML();
                    }
                }
            })
        } else {
            defaults.toolTipData = defaults.dependCalender ? defaults.dependCalender.getEventData() : {};
        }
    }

    /**
     * initialize the calender
     */
    function initialize(eventData) {
        initVar();
        initProperty();
        if (defaults.ajaxUrl) {
            makeAjaxCall();
        } else {
            if (defaults.dependCalender) {
                defaults.toolTipData = defaults.dependCalender.getEventData();
            }
            if (eventData) {
                defaults.toolTipData = eventData;
            }
            generateHTML();
        }
    }

    /**
     * get previous control element
     */
    this.getPreviousCtrl = function() {
        return previousCtl;
    };
    /**
     * get next control element
     */
    this.getNextCtrl = function() {
        return nextCtl;
    };

    /**
     * Initialize calender
     */
    this.init = function(eventData) {
        initialize(eventData);
    };
    $(window).bind("resize.calender", function() {
        initialize();
    });

    /**
     * Call init function
     */
    initialize();
};
$(function() {
    $.fn.eCalender = function(configs) {
        return this.each(function() {
            if (!configs) {
                configs = {};
            }
            if (typeof configs === 'object') {
                configs.container = $(this);
            }
            return new Calendar(configs);
        });
    };
});