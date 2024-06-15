#!/system/bin/sh

# disable location indicator in status bar
device_config put privacy location_indicators_enabled false default

# enable tailscale
am broadcast -n com.tailscale.ipn/.IPNReceiver -a com.tailscale.ipn.CONNECT_VPN
