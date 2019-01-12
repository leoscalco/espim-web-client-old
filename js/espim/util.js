var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var momentToUTCString = function(date) {
    if (date != null) {
        return "" + (date.unix()*1000);
    }

    return null;
}


var UTCStringtoMoment = function(date) {
    if (date != null) {
        return moment(parseInt(date));
    }

    return null;
}


var timestampToUTC = function(date) {
    var parsedDate = Date.parse(date);
    if (Number.isNaN(parsedDate)) {
        return null;
    } else {
        return parsedDate.toString();
    }
}

var UTCToTimestap = function(date) {
    return moment(Number(date)).format();
}

var cronWeekdaysToNumber = function(cronString) {
    return cronString.replace("MON", "1")
                        .replace("TUE", "2")
                        .replace("WED", "3")
                        .replace("THU", "4")
                        .replace("FRI", "5")
                        .replace("SAT", "6")
                        .replace("SUN", "7");

}

var numberToCronWeekdays = function(cronString) {
    var strings = cronString.split(" ? ");

    return strings[0] + " ? " + strings[1]
                        .replace("1", "MON")
                        .replace("2", "TUE")
                        .replace("3", "WED")
                        .replace("4", "THU")
                        .replace("5", "FRI")
                        .replace("6", "SAT")
                        .replace("7", "SUN");

}

var removeElementsFromArrayById = function(smallerSet, biggerSet) {

    for (var i = 0; i < smallerSet.length; i++) {
        removeFromArrayById(smallerSet[i], biggerSet);
    }

}

var removeFromArrayById = function(element, array) {
    var index;
    for (index = 0; index < array.length; index++) {
        if (element.id == array[index].id) {
            break;
        }
    }
    if (index > -1) {
        array.splice(index, 1);
    }
}

var genereateCronString = function(type, days, h, m) {
    var str = "0 " + m + " " + h + " ? * "; 

    if (type == 'daily') {
        str += "1,2,3,4,5,6,7";
    } else if (type == 'weekly') {
        var firstDay = true;
        for (var i=0; i < days.length; i++) {
            if (days[i]) {
                if (firstDay) {
                    firstDay = false;
                    str += "" + (i+1);
                } else {
                    str += "," + (i+1);
                }
            }

        }
    }

    str += " *";

    return str;
}

var daysByIndex = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

var parseCronString = function(cronStr) {
    var ret = {
        type : 'daily',
        days : [false, false, false, false, false, false, false],
        h : 0,
        m : 0,
    };

    var seg = cronStr.split('*');
    var time = seg[0].split(' ');
    var days = seg[1].split(',');

    ret.h = parseInt(time[2]);
    ret.m = parseInt(time[1]);

    if (seg[1].includes('-') || days.length == 7) {
        ret.type = 'daily';
    } else {
        ret.type = 'weekly'

        for (var i=0; i< days.length; i++) {
            var day = parseInt(days[i]);
            ret.days[day-1] = true;
        }
    }

    return ret;
}