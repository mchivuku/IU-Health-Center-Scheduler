<script type="text/javascript">

    function _schedulerSessionTimeoutClock(expire) {
        expire.setSeconds(expire.getSeconds() - 1);
        if (expire.getFullYear() < 2014) {
            parent.location.search = '/clearSession';
            return;
        }
    }

    window.onload = function() {
        var expire = new Date(2014, 0, 1);
        expire.setSeconds(<?php echo SESSION_ACTIVITY_TIME; ?> * 60);
        window.setInterval(
            function() {
                _schedulerSessionTimeoutClock(expire);
            },
            1000
        );
    }

</script>
