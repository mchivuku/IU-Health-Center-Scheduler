/**
 * Created by mchivuku on 3/3/15.
 */



$(document).ready(function () {


    $('ul.time-of-day li').on("click", function (event) {
        event.preventDefault();
        $('ul.time-of-day li.active').removeClass('active');
        $(this).addClass('active');
        getAvailableTimes(getProviderId(), getDate(), gettabId());

    });


    $('#providers').change(function () {
        var longMonths = new Array("January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December");
        var month = longMonths.indexOf($('.ui-datepicker-month').text()) + 1;
        if (month < 9)
            month = "0" + month;
        else
            month = month;

        var year = $('.ui-datepicker-year').text();


        getAvailableTimeAndDates(getProviderId(), getDate(), gettabId(), year, month);


    });


    $("#datepicker").datepicker({

        beforeShowDay: function (d) {

            // WEEKEND
            if (d.getDay() == 6 || d.getDay() == 0) return [false, "", "Unavailable"];

            var dmy = d.getFullYear() + "-";
            var month = (d.getMonth() + 1);
            if (d.getMonth() < 9)
                dmy += "0" + month;
            else
                dmy += month;

            dmy += "-";

            if (d.getDate() < 10) dmy += "0";
            dmy += d.getDate();

            if ($.inArray(dmy, availableDates) != -1) {
                return [true, "", "selectDay"];
            } else {
                return [false, "", "Unavailable"];
            }

        },
        minDate: new Date(),
        onSelect: function () {
            getAvailableTimes(getProviderId(), $(this).val(), gettabId());

        },
        onChangeMonthYear: function (year, month, widget) {
            getAvailableDates(year, month);

        }

    });

    update_time_links();

    /* Form post */

    $('#scheduleSubmit').click(function (event) {
        event.preventDefault();

        $('#startTime').val(
            $('#available-times .selected a').attr('title'));

        $('#date').val($('#datepicker').val());
        $('#tabId').val(gettabId());

        $('form#scheduleSave').submit();
    });

});

function getAvailableDates(year, month) {
    availableDates = [];

    $.get('getAvailableDates',
        {
            'providerId': getProviderId(), 'visitType': getVisitType(), 'year': year, facility: getFacility(),
            'month': month, 'firstAvailableProvider': $('#firstAvailableProvider').val()
        }, function (data) {
            refreshDatePicker(data);
        });
}

function refreshDatePicker(dates) {

    $.each(dates, function (index, value) {
        availableDates.push(value);
    });

    $("#datepicker").datepicker("refresh");

}


function update_time_links() {

    $('#available-times').children().on('click', function () {
        $('div.selected').removeClass('selected');
        $(this).addClass('selected');
        var startTime = $(this).children('div.selected a').attr('title');
        saveSelectedTime(startTime)

    });
}

function getProviderId() {
    return $('#providers').val();
}
function gettabId() {
    return $("ul.time-of-day li.active").index() + 1;
}
function getDate() {
    return $('#datepicker').val();
}
function getVisitType() {
    return $('#visitType').val();
}
function getFacility() {
    return $('#facility').val();
}
function getFirstAvailableProvider() {
    console.log($('#firstAvailableProvider').val());
    return $('#firstAvailableProvider').val();

}


function getAvailableTimes(providerId, date, tabId) {
    var params = {
        providerId: providerId,
        visitType: getVisitType(),
        facility: getFacility(),
        firstAvailableProvider: getFirstAvailableProvider(),
        date: date,
        tabId: tabId
    };
    getData(params, 'getAvailableTimes');

}

function getAvailableTimeAndDates(providerId, date, tabId, year, month) {
    var params = {
        providerId: providerId,
        visitType: getVisitType(),
        facility: getFacility(),
        firstAvailableProvider: getFirstAvailableProvider(),
        date: date,
        tabId: tabId
    };
    var get_params_to_send = $.param(params);
    $.get('getAvailableTimes',
        get_params_to_send,
        function (data) {
            if (data.message) {
                $('.available-timeslots').empty().html(data.message);
            }
            else {
                $('.available-timeslots').empty().html(data);
                update_time_links();

            }

            getAvailableDates(year, month);
        });
}


function getData(params, url) {
    var get_params_to_send = $.param(params);
    $.get(url,
        get_params_to_send,
        function (data) {

            if (data.message) {
                $('.available-timeslots').empty().html(data.message);
            }
            else {


                $('.available-timeslots').empty().html(data);

                update_time_links();

            }

        });


}


function saveSelectedTime(startTime) {

    var visitDuration = $('#visitDuration').val();
    var firstAvailableProvider = getFirstAvailableProvider();
    $.get('saveSelectedTime',
        {
            'providerId': getProviderId(),
            'visitType': getVisitType(),
            'facility': getFacility(),
            'firstAvailableProvider': firstAvailableProvider,
            'date': getDate(), 'startTime': startTime, 'visitDuration': visitDuration
        }
    );

}
