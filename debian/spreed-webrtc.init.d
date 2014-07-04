#!/bin/sh
### BEGIN INIT INFO
# Provides:          spreed-webrtc
# Required-Start:    $network $local_fs
# Required-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Spreed Speak Freely server
# Description:       WebRTC video conferencing service.
### END INIT INFO

# Author: Lance Cooper <lance@struktur.de>

PATH=/sbin:/usr/sbin:/bin:/usr/bin
DESC='Spreed Speak Freely'
NAME=spreed-webrtc
DAEMON=/usr/sbin/spreed-webrtc-server
SCRIPTNAME=/etc/init.d/$NAME

# Bail out if we're running under Upstart.
if [ "$1" = start ] && which initctl >/dev/null && initctl version | grep -q upstart; then
    exit 1
fi

# Exit if the package is not installed
[ -x $DAEMON ] || exit 0

# Read defaults.
if [ -r /etc/default/$NAME ]; then
    source /etc/default/$NAME
else
    exit 0
fi

# Load the VERBOSE setting and other rcS variables
. /lib/init/vars.sh

# Define LSB log_* functions.
# Depend on lsb-base (>= 3.0-6) to ensure that this file is present.
. /lib/lsb/init-functions

#
# Function that starts the daemon/service
#
do_start()
{
	start-stop-daemon --start \
                      --quiet \
                      --pidfile $WEBRTC_PID \
                      --startas $DAEMON \
                      --test > /dev/null \
	|| return 1

    # Create the run directory.
    test -e $WEBRTC_RUN_DIR || mkdir -p $WEBRTC_RUN_DIR || true
    chown -R $WEBRTC_USER:$WEBRTC_GROUP $WEBRTC_RUN_DIR || true
    chmod 770 $WEBRTC_RUN_DIR || true

    # Set some performance parameters
    ulimit -n $WEBRTC_NOFILE
    export GOMAXPROCS=$WEBRTC_GOMAXPROCS

    start-stop-daemon --start \
                      --quiet \
                      --make-pidfile \
                      --pidfile $WEBRTC_PID \
                      --chuid $WEBRTC_USER \
                      --group $WEBRTC_GROUP \
                      --startas $DAEMON \
                      -- \
                      -c $WEBRTC_CONF \
                      -l $WEBRTC_LOG \
                      $WEBRTC_ARGS \
    || return 2

    return 0
}

#
# Function that stops the daemon/service
#
do_stop()
{
	start-stop-daemon --stop \
                      --quiet \
                      --retry=TERM/30/KILL/5 \
                      --pidfile $WEBRTC_PID \
                      --name $NAME
	RETVAL="$?"
	[ "$RETVAL" = 2 ] && return 2

	rm -f $WEBRTC_PID
	return "$RETVAL"
}

#
# Function that sends a SIGHUP to the daemon/service
#
do_reload() {
    do_stop
    do_start
	return 0
}

case "$1" in
  start)
    [ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC " "$NAME"
    do_start
    case "$?" in
		0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
		2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
	esac
  ;;
  stop)
	[ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
	do_stop
	case "$?" in
		0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
		2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
	esac
	;;
  status)
       status_of_proc "$DAEMON" "$NAME" && exit 0 || exit $?
       ;;
  restart|force-reload)
	log_daemon_msg "Restarting $DESC" "$NAME"
	do_stop
	case "$?" in
	  0|1)
		do_start
		case "$?" in
			0) log_end_msg 0 ;;
			1) log_end_msg 1 ;; # Old process is still running
			*) log_end_msg 1 ;; # Failed to start
		esac
		;;
	  *)
	  	# Failed to stop
		log_end_msg 1
		;;
	esac
	;;
  *)
	echo "Usage: $SCRIPTNAME {start|stop|status|restart|force-reload}" >&2
	exit 3
	;;
esac

:
