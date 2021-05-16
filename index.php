<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>ECalendar - A jQuery Based Event Calendar</title>
    <meta name="keywords" content="jQuery,calendar,event calendar,javascript"/>
    <meta name="description" content="ECalendar - A jQuery Based Event Calendar"/>
    <meta name="author" content="Md.Rajibul Islam"/>
    <link href="ecalendar.css" type="text/css" rel="stylesheet"/>
    <script type="text/javascript" src="jquery-1.6.2.min.js"></script>
    <script type="text/javascript" src="ecalendar.js"></script>
    <script type="text/javascript">
        $(function() {
            $("#example1").eCalendar({
                cellClick:function(el, date) {
                    alert(date)
                    // do what ever you need
                }
            });
            $("#example2").eCalendar({
                ajaxUrl: 'ajax.php',// demo url
                cellClick:function(el, date) {
                    alert(date)
                    // do what ever you need
                }
            });
        });
    </script>
</head>
<body style="padding:20px;">
<h1>ECalendar - A jQuery Based Event Calendar</h1>
<pre>
	
    Author : Md.Rajib-Ul-Islam
    Email : mdrajibul@gmail.com
    Created Date : 20.07.2011
    Version : 0.1
    
</pre>
<pre>
    <h3>Configs are :</h3>
   1. monthLabels : defaults -  ['January', 'February', 'March', 'April','May', 'June', 'July', 'August', 'September','October', 'November', 'December']
   2. weekNames : defaults - ['S','M','T','W','T','F','S'],
   3. minYear :defaults -  1970,
   4. maxYear : defaults -  2050,
   5. ajaxUrl :defaults -  null,
   6. toolTipData:defaults - {},
   7. cellClick: custom event

</pre>
<pre>
   <a href="ecalendar.zip" target="_blank">Download</a>
</pre>
<h3>Example 1</h3>

<p> A simple example of ECalendar </p>
<pre>
<strong>Code: </strong>
<code>
    $("#example1").eCalendar({
    cellClick:function(el, date) {
    $.print(date);
    // do what ever you need
    }
    });
</code>
</pre>
<div id="example1" style="width:500px;height:400px;"></div>

<p> A ajax based example of ECalendar </p>
<pre>
<strong>Code: </strong>
<code>
    $("#example2").eCalendar({
    ajaxUrl: '/commons/calendarTaskJson',// demo url
    cellClick:function(el, date) {
    $.print(date);
    // do what ever you need
    }
    });
</code>
</pre>
<div id="example2" style="width:500px;height:400px;"></div>
</body>
</html>