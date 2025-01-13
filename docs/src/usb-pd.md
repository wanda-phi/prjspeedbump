# USB-PD devices

The [FT2232H, FT4232H](ft2232h.md), and [FT232H](ft232h.md) devices have variants with USB-PD support.  They essentially consist of the base device and a USB-PD controller core put together with some super glue.  The USB-PD part is described here.

The devices are:

- FT2233HP: FT2232H with two USB-PD ports
- FT4233HP: FT4232H with two USB-PD ports
- FT2232HP: FT2232H with one USB-PD port
- FT4232HP: FT4232H with one USB-PD port
- FT233HP: FT232H with two USB-PD ports
- FT232HP: FT232H with one USB-PD port

TODO

## EEPROM data format

A 256-word EEPROM is required for the USB-PD part of the device to function.  The second half of the EEPROM is used to store the USB-PD configuration data.

TODO