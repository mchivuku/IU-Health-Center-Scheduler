/**
 * Created by mchivuku on 5/13/15.
 */


var availableDates = [];

//datepicker should be disabled for weekends and previous date to current dates
function disableDatepicker(d){
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

    if(availableDates!=null){
        if ($.inArray(dmy, availableDates) != -1) {
            return [true, "", "selectDay"];
        } else {
            return [false, "", "Unavailable"];
        }
    }

}
