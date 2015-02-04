/**
 * Created by mchivuku on 1/31/15.
 */
;(function($) {
    $(document).ready(function() {

        IUComm.init( {debug:true} );


        /* Personal Info Accordion */

        function personalInfoAccordion() {

            var personalInfoButton      = $(".personal-info h2");
            var personalInfo            = $(".personal-info > div");

            enquire.register("screen and (max-width:40.0625em)", {

                deferSetup : true,

                match : function() {
                    $(personalInfo).hide();

                    $(personalInfoButton).on("click", function(event) {
                        event.stopImmediatePropagation();
                        $(personalInfo).stop(true, false).slideToggle();
                        $(this).toggleClass("open");
                    });
                },

                unmatch : function() {
                    $(personalInfo).show();
                    $(personalInfoButton).off();
                }

            });
        }

        personalInfoAccordion();

        /* Scheduler */

        function scheduler() {

            var availableTimeslots  = ".available-timeslots";
            var timeOfDay           = ".time-of-day";

            var morning             = ".morning";
            var afternoon           = ".afternoon";

            $(availableTimeslots).before('<ul class="time-of-day"><li class="morning active">Morning</li><li class="afternoon">Afternoon</li></ul>');

            $(availableTimeslots + " " + afternoon).hide();

            $(timeOfDay + " li").on("click", function() {
                if ($(this).hasClass("morning")) {
                    // Remove classes from all list items
                    $(timeOfDay + " li").removeClass("active");

                    // Show appropriate timeslots
                    $(availableTimeslots + " " + morning).show();
                    $(availableTimeslots + " " + afternoon).hide();

                    // Set tab to active
                    $(this).addClass("active");

                } else if ($(this).hasClass("afternoon")) {
                    // Remove classes from all list items
                    $(timeOfDay + " li").removeClass("active");

                    // Show appropriate timeslots
                    $(availableTimeslots + " " + morning).hide();
                    $(availableTimeslots + " " + afternoon).show();

                    // Set tab to active
                    $(this).addClass("active");
                }
            });
        }

        scheduler();


        /* Available Timeslots Selector */

        function availableTimeslots() {
            var individualTimeslots         = ".available-timeslots > div > div";

            $(individualTimeslots).on("click", function() {
                $(this).toggleClass("selected");
            });

            // var availableTimeslots      = ".available-timeslots";
            // // var morningTimeslots        = ".morning div";
            // // var afternoonTimeslots      = ".afternoon div";

            // $(availableTimeslots).on("click", morningTimeslots, afternoonTimeslots, function() {
            //     console.log("click");
            //     $(this).toggleClass("selected");
            // });
        }

        availableTimeslots();

    });
})(jQuery);