$(function () {

    var html = "";

    // suppress invalid json warning while loading json file
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    // load json file and generate the tree
    $.getJSON("./data/sample.json", function (json) {

        html = "";
        for(var key in json) {
            generateHtmlForJsonObj(key, json[key]);
        }

        $('#jsonTree').append(html);
        setUIEventsOnTree($('#jsonTree'));
        adjustLayout();
    });

    /**
     * Recursive function that fills up the html variable with branches and nodes.
     *
     * @param key The current key of json object
     * @param jsonObj The current corresponding json object/array for the key
     */
    function generateHtmlForJsonObj(key, jsonObj) {

        if($.isArray(jsonObj)) {

            html += '<li class="branch"><a href="javascript:;">'+key+' '+' ('+jsonObj.length+')</a> \
                <ul class="subTable">';

            var jsonArray = jsonObj;
            var keysArray = getKeysFromJsonArray(jsonArray);

            // append table header
            var headerColumns = "<div class='col-md-1 yellowbg'>&nbsp;</div>";
            for(var i in keysArray) {
                headerColumns += '<div class="col-md-'+(keysArray[i].columnClass)+' nowrap"><b><span class="brackets">{ } </span> '+keysArray[i].key+'</b></div>';
            }
            var header = '<li><div class="row row-eq-height yellowbg">'+ headerColumns + '</div></li>';
            html += header;

            // append table body
            for (var row=0; row<jsonArray.length; row++) {
                html += '<li>' +
                    '<div class="row row-eq-height">' +
                    '<div class="col-md-1 yellowbg"><b>'+(row+1)+'</b></div>';

                for(var col=0; col<keysArray.length; col++) {

                    var arrayItem = jsonArray[row][keysArray[col].key];
                    if(typeof arrayItem == 'object' || $.isArray(arrayItem)) {

                        html += '<div class="col-md-'+keysArray[col].columnClass+'"> \
                            <ul class="subTree table">';

                        generateHtmlForJsonObj(keysArray[col].key, arrayItem);

                        html += '</ul> \
                            </div>';

                    } else {
                        html += '<div class="col-md-'+(keysArray[col].columnClass)+'">' + cleanValue(arrayItem) + '</div>';
                    }
                }
                html += '</div> \
                    </li>';
            }

            html += '</ul> \
                </li>';

        } else if(typeof jsonObj == 'object') {

            html += '<li class="branch nowrap"><a href="javascript:;">'+key+'</a> \
                <ul>';
            for(var key2 in jsonObj) {
                generateHtmlForJsonObj(key2, jsonObj[key2]);
            }
            html += '</ul> \
                </li>';

        } else {
            html += '<li> \
                <div class="row"> \
                    <div class="col-md-6 nowrap"><b><span class="brackets">{ } </span> '+key+'</b></div> \
                    <div class="col-md-6 nowrap">'+cleanValue(jsonObj)+'</div> \
                </div> \
            </li>';
        }
    }

    /**
     * Replace undefined or empty values with whitespace character
     *
     * @param val
     * @returns {string}
     */
    function cleanValue(val) {
        return typeof(val) == 'undefined' || val == '' ? '&nbsp;' : val;
    }

    /**
     * Add open/close icons and set events for them
     *
     * @param tree
     */
    function setUIEventsOnTree(tree) {

        var openedClass = 'glyphicon-chevron-up';
        var closedClass = 'glyphicon-chevron-down';

        //initialize each of the top levels
        tree.addClass("tree");
        tree.find('li > ul').each(function () {
            var branch = $(this).parent(); //li with children ul
            branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
            branch.on('click', function (e) {
                if (this == e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            });
            branch.children().children().toggle();
        });

        //fire event from the dynamically added icon
        $('.tree .branch .indicator').on('click', function () {
            $(this).closest('li').click();
        });

        //fire event to open branch from li text
        $('.tree .branch>a').on('click', function (e) {
            $(this).closest('li').click();
            e.preventDefault();
        });

        // open/close branch from vertical button
        $('.tree .branch ul').on('click', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            if (e.clientX > $(this).offset().left && e.clientX < $(this).offset().left + 20) {
                $(this).parent().click();
            }
        });
    }

    /**
     * Adjust layout so that columns fill the bootstrap 12-column grid
     */
    function adjustLayout() {
        $('.subTable .row').each(function() {
            var divs = $(this).find('> div[class*="col-md-"]');
            if(divs.length > 2) {
                while(sumOfGridColumns(divs) < 12) {
                    incrementGridColumns(divs);
                }
            }
        });
    }

    /**
     * The sum of col-md-* classes in a given row.
     *
     * @param divs
     * @returns {number}
     */
    function sumOfGridColumns(divs) {
        var sum = 0;
        for(var i=0; i<divs.length; i++) {
            var div = $(divs[i]);
            sum += getColumnClassNumber(div);
        }
        return sum;
    }

    /**
     * Increment class no so that col-md-* classes expand to fill layout
     *
     * @param divs
     */
    function incrementGridColumns(divs) {
        for(var i=divs.length; i>1; i--) {
            var div = $(divs[i]);
            var no = getColumnClassNumber(div);
            no += 1;

            div.attr('class', 'col-md-'+no);
        }
    }

    /**
     * Given a div with class="col-md-5", returns 5
     *
     * @param div
     * @returns {number}
     */
    function getColumnClassNumber(div) {
        var className = div.attr('class');
        if(typeof className == 'undefined') {
            return 0;
        }
        if(className.indexOf(" ") !== -1) {
            var arr = className.split(" ");
            className = arr[0];
        }
        var no = className.split("-")[2];
        return Number(no);
    }

    /**
     * For jsonArrays, returns the column headings (e.g. ) and classes (e.g. col-md-4)
     *
     * @param jsonArray
     * @returns {Array}
     */
    function getKeysFromJsonArray(jsonArray) {

        var keysArray = [];

        for (var i=0; i<jsonArray.length; i++) {
            var columnValueMaxLength = 0;
            for (var prop in jsonArray[i]) {

                var arrExisted = $.grep(keysArray, function(item) {
                    return item.key == prop;
                });

                if (jsonArray[i].hasOwnProperty(prop) && arrExisted.length == 0) {
                    keysArray.push({key:prop, maxLength:0});
                }
            }
        }

        // based on max-length of column, we need to assign each column a css class col-md-*
        var totalLength = 0;

        for(var i in keysArray) {

            var key = keysArray[i].key;
            var columnValueMaxLength = 0;

            for(var j in jsonArray) {

                var value = typeof jsonArray[j][key] == 'undefined' ? '' : jsonArray[j][key];

                if(columnValueMaxLength < key.length) {
                    columnValueMaxLength = key.length;
                }
                if(columnValueMaxLength < value.length) {
                    columnValueMaxLength = value.length;
                }
            }
            keysArray[i].maxLength = columnValueMaxLength;
            totalLength += columnValueMaxLength;
        }

        for(var i in keysArray) {
            var percent = keysArray[i].maxLength / totalLength * 100;
            var columnClass = Math.floor(percent * 11 / 100);
            if(columnClass == 0 || keysArray[i].key == "@id" || keysArray[i].key == "id") {
                columnClass = 1;
            }
            keysArray[i].columnClass = columnClass;
        }

        return keysArray;
    }
});

