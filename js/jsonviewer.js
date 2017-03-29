$(function () {

    var html = "";

    $.fn.extend({
        treed: function (o) {

            var openedClass = 'glyphicon-chevron-up';
            var closedClass = 'glyphicon-chevron-down';

            //initialize each of the top levels
            var tree = $(this);
            tree.addClass("tree");
            tree.find('li > ul').each(function () {
                var branch = $(this).parent(); //li with children ul
                branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
                //branch.addClass('branch');
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

            //fire event to open branch if the li contains an anchor instead of text
            $('.tree .branch>a').on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });

            $('.tree .branch ul').on('click', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                if (e.clientX > $(this).offset().left && e.clientX < $(this).offset().left + 20) {
                    $(this).parent().click();
                }
            });
        }
    });

    // suppress invalid json warning while loading json file
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    $.getJSON("./data/sample.json", function (json) {

        html = "";
        for(var key in json) {
            generateHtmlForJsonObj(key, json[key]);
        }

        $('#tree2').append(html)
            .treed({openedClass:'glyphicon-chevron-up', closedClass:'glyphicon-chevron-down'});

        $('li').show();
    });

    function generateHtmlForJsonObj(key, jsonObj) {

        if($.isArray(jsonObj)) {

            html += '<li class="branch"><a href="javascript:;">'+key+' '+'<span>('+jsonObj.length+')</span></a> \
                <ul>';

            var jsonArray = jsonObj;

            var keysArray = getKeysFromJsonArray(jsonArray);

            var headerColumns = "<div class='col-md-1'></div>";
            var colClass = 0;
            if(keysArray[0].length <=3) {
                colClass = Math.floor(10 / (keysArray.length-1));
            } else {
                colClass = Math.floor(11 / (keysArray.length));
            }

            for(var i in keysArray) {
                headerColumns += '<div class="col-md-'+(keysArray[i].length<=3 ? 1 : colClass)+'"><b><span class="brackets">{ } </span> '+keysArray[i]+'</b></div>';
            }
            var header = '<li><div class="row yellowbg">'+ headerColumns + '</div></li>';

            html += header;

            for (var row=0; row<jsonArray.length; row++) {
                html += '<li>' +
                    '<div class="row">' +
                        '<div class="col-md-1 yellowbg"><b>'+(row+1)+'</b></div>';

                for(var col=0; col<keysArray.length; col++) {

                    var arrayItem = jsonArray[row][keysArray[col]];
                    if(typeof arrayItem == 'object' || $.isArray(arrayItem)) {

                        html += '<div class="col-md-'+colClass+'"> \
                            <ul class="subTree table">';

                        generateHtmlForJsonObj(keysArray[col], arrayItem, true);

                        html += '</ul> \
                            </div>';

                    } else {
                        if(typeof  arrayItem == 'undefined') {
                            arrayItem = '';
                        }
                        html += '<div class="col-md-'+(col==0 ? 1 : colClass)+'">' + arrayItem + '</div>';
                    }
                }
                html += '</div> \
                    </li>';
            }

            html += '</ul>';

            html += '</li>';

        } else if(typeof jsonObj == 'object') {

            html += '<li class="branch"><a href="javascript:;">'+key+'</a> \
                <ul>';

            for(var key2 in jsonObj) {
                generateHtmlForJsonObj(key2, jsonObj[key2], false);
            }

            html += '</ul> \
                </li>';

        } else {
            html += '<li> \
                <div class="row"> \
                    <div class="col-md-6"><b><span class="brackets">{ } </span> '+key+'</b></div> \
                    <div class="col-md-6">'+jsonObj+'</div> \
                </div> \
            </li>';
        }
    }

    /**
     *
     * @param jsonArray
     * @returns {Array}
     */
    function getKeysFromJsonArray(jsonArray) {

        var keysArray = [];

        for (var i=0; i<jsonArray.length; i++) {
            for (var prop in jsonArray[i]) {
                if (jsonArray[i].hasOwnProperty(prop) && keysArray.indexOf(prop) === -1) {
                    keysArray.push(prop);
                }
            }
        }

        return keysArray;
    }
});

