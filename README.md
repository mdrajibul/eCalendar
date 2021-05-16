
# mface-ui-library

A [jQuery](https://github.com/mdrajibul/eCalendar) base event calendar 

## Installation

```bash

git clone https://github.com/mdrajibul/eCalendar.git

```

## Usage 

```html
<link href="ecalendar.css" type="text/css" rel="stylesheet"/>
<script type="text/javascript" src="jquery-1.6.2.min.js"></script>
<script type="text/javascript" src="ecalendar.js"></script>

<div id="example2" style="width:500px;height:400px;"></div>

```

```js

$("#example2").eCalendar({
    ajaxUrl: 'ajax.php',// demo url
    cellClick:function(el, date) {
        alert(date)
        // do what ever you need
    }
});

```

### options

- **monthLabels** : defaults -  ['January', 'February', 'March', 'April','May', 'June', 'July', 'August', 'September','October', 'November', 'December']
- **weekNames** : defaults - ['S','M','T','W','T','F','S'],
- **minYear** : defaults -  1970,
- **maxYear** : defaults -  2050,
- **ajaxUrl** : defaults -  null,
- **toolTipData**: defaults - {},
- **cellClick**: custom event
