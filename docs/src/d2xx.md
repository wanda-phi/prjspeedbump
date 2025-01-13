# D2xx protocol

D2xx is the name of protocol used by most FTDI USB devices.  It was originally made for the UART function of the FT8U100A, and remains quite UART-oriented.  However, FTDI has reused it for all kinds of stream-based interfaces.

## Channels and interfaces

A D2xx device can have one or more channels.  A channel is, at the core, a bidirectional byte-oriented stream of data.

Channels are often identified by single letters, in order (A, B, C, D, ...).

Each channel is exposed as a separate USB interface.  Each interface has two bulk endpoints: IN and OUT.  In addition, a channel also makes use of D2xx-specific control requests on the default config pipe (endpoint 0).

Some devices have an undocumented option to use isochronous endpoints instead of bulk endpoints.  That options is undoubtedly broken in some completely hilarious ways.

## Identifying a D2xx device

Since all D2xx devices can have custom VIDs and PIDs programmed, there is no sure-fire way to identify a USB device as a D2xx device — you need to know what VID:PID you are looking for.  However, there are some predefined VID:PID combinations that will be used by default.  They are listed in the table on the [devices page](devices.md#d2xx-devices).

As you can see, FTDI used to reuse its VID:PID combinations for groups of similar devices for some time, but then decided to just start assigning new IDs for every new device.

Once something is known to be a FTD2xx device, further identification can be obtained from the `bcdDevice` field of USB descriptor.  The `bcdDevice` values are likewise listed on the [devices page](devices.md#d2xx-devices).  It is not clear whether the `bcdDevice` field may be overriden via EEPROM.

Even putting VID:PID and `bcdDevice` together, it is still not always possible to uniquely identify the device.  Usually, one can just live with the uncertainty.  However, there are some more checks that can be done for further identification:

- FT8U2xxA and FT2xxB can be told apart by attempting the `GET_LATENCY_TIMER` request — a failure implies A-series device, while a success implies B-series device
- FT232R and FT245R can be told apart by a field in the internal EEPROM, which the vendor claims to not be modifiable by the user
- likewise, FT-X series devices can be told apart to some extent by another EEPROM field

## Stream protocol

Note: FT2xxR devices have configurable `wMaxPacketSize` field in the bulk endpoint descriptors.  There are devices in the wild where people have programmed the (invalid) value of 0 in that field.  In case a device is encountered with such value, it should be overriden in the driver to 64 bytes.

### IN endpoint

The IN endpoint of a channel is used to transfer byte stream data from the device to the user.  It involves a framing protocol: every packet transferred on the endpoint includes a header with modem and line status.  Packets are always at least 2 bytes long.  The packet format is as follows:

- byte 0: modem status (shows the most recent state of the modem status input pins)
  - bit 0: always 1?
  - bit 1: always 0?
  - bit 2: always 0?
  - bit 3: always 0?
  - TODO: allegedly high-speed devices have 0010 in low bits?
  - bit 4: CTS
  - bit 5: DSR
  - bit 6: RI
  - bit 7: DCD
- byte 1: line status
  - bit 0: data ready (???)
  - bit 1: overrun error (device received data on the business end when there was no more space in IN endpoint FIFO)
  - bit 2: parity error
  - bit 3: framing error
  - bit 4: break interrupt
  - bit 5: TX holding register (???)
  - bit 6: TX (OUT endpoint) FIFO is empty
  - bit 7: FIFO error (???)
- bytes 2 and up (if any): actual stream data

As can be seen, the protocol is very UART-oriented.  The modem and line status bytes are present even for D2xx devices that have nothing to do with UART, though they are mostly dummied out in that case.  The TX FIFO empty bit is, however, generally useful.

TODO: kernel driver alleges that parity/framing errors are always associated with the last byte in the packet. Check this.

To avoid excessive load on the host, the device doesn't always transmit packets on the IN endpoint as soon as data is available.  Instead, the device will send a packet in the following circumstances:

- a full-sized packet has been filled
- a special "event" character has been received (if enabled by driver)
- data is available and the latency timer has expired
  - on FT8U2xxA (and FT8U100A?), the latency timer is always 16ms
  - on newer devices, the default latency timer is 16ms, but it can be configured to any value between 2ms and 255ms
- TODO: line errors / modem status changes too? kernel alleges device will send an update packet every 40ms even with no activity

### OUT endpoint

There are two variants of the protocol with respect to OUT endpoint handling.

The original variant is present on the FT8U100A only.  In this variant, every OUT endpoint packet has to be prefixed with a header.  The packet then has the following format:

- byte 0: header
  - bit 0: must be 1
  - bit 1: must be 0
  - bits 2-7: length of payload (ie. length of packet, not including the header byte)
- bytes 1 and up: actual stream data

Since the header is completely useless, it has been done away with in later devices.  In every device other than FT8U100A, the OUT endpoint is completely headerless and packets contain just the raw stream data.

## Control requests

The protocol includes the following control requests:

| request                    | `bmRequestType` | `bRequest` | `wValue`                  | `wIndex`                    | data             |
| -------------------------- | --------------- | ---------- | ------------------------- | --------------------------- | ---------------- |
| `RESET`                    | `0x40`          | `0x00`     | reset kind                | channel                     | -                |
| `SET_MODEM_CTRL`           | `0x40`          | `0x01`     | DTR + RTS state           | channel                     | -                |
| `SET_FLOW_CTRL`            | `0x40`          | `0x02`     | XON / XOFF chars          | channel + mode              | -                |
| `SET_BAUD_RATE`            | `0x40`          | `0x03`     | divisor low bits          | channel + divisor high bits | -                |
| `SET_DATA_CHARACTERISTICS` | `0x40`          | `0x04`     | data format + break state | channel                     | -                |
| `GET_MODEM_STATUS`         | `0xc0`          | `0x05`     | 0                         | channel                     | 2 bytes          |
| `SET_EVENT_CHAR`           | `0x40`          | `0x06`     | event char + enable       | channel                     | -                |
| `SET_ERROR_CHAR`           | `0x40`          | `0x07`     | error char + enable       | channel                     | -                |
| `SET_LATENCY_TIMER`        | `0x40`          | `0x09`     | latency timer             | channel                     | -                |
| `GET_LATENCY_TIMER`        | `0xc0`          | `0x0a`     | 0                         | channel                     | 1 byte           |
| `SET_BITMODE`              | `0x40`          | `0x0b`     | bit mode + output mask    | channel                     | -                |
| `GET_PIN_STATE`            | `0xc0`          | `0x0c`     | 0                         | channel                     | 1 byte           |
| `VENDOR_CMD_GET`           | `0xc0`          | `0x20`     | request                   | channel                     | up to 0x80 bytes |
| `VENDOR_CMD_SET`           | `0x40`          | `0x21`     | request + data            | channel                     | up to 0x80 bytes |
| `READ_EEPROM`              | `0xc0`          | `0x90`     | 0                         | word address                | 2 bytes          |
| `WRITE_EEPROM`             | `0x40`          | `0x91`     | word value                | word address                | -                |
| `ERASE_EEPROM`             | `0x40`          | `0x92`     | 0                         | 0                           | -                |

Most control requests operate on a channel.  The channel is specified as follows:

- for single-channel devices: channel is 0
- for multi-channel devices: the channel indices start at 1 (ie. channel number in control request is USB interface index + 1)
  - TODO: allegedly, specifying 0 means "all channels"?

The channel is usually stuffed directly into `wIndex`.  However, there are variations to keep you on your toes.

### `RESET`

Resets the device or purges IN/OUT endpoint buffers on device.

- applicable to: all D2xx devices
- `bmRequestType`: `0x40`
- `bRequest`: `0x00`
- `wValue`: kind of reset to perform
  - 0: reset the serial engine
    - purge both IN and OUT endpoints
    - disable event char and set it to `0x0d` (`'\r'`)
    - disable flow control
    - clear DTR and RTS
  - 1: purge OUT endpoint (nuke all buffered data)
  - 2: purge IN endpoint
- `wIndex`: channel

TODO: determine *exactly* what the reset actually resets; the above list is according to the kernel sources.

TODO: libftd2xx seems to always send resets with `wIndex` set to 0; is this a bug?

### `SET_MODEM_CTRL`

Changes the state of DTR and RTS lines.

- applicable to: all D2xx devices (but may be a no-op in non-UART modes)
- `bmRequestType`: `0x40`
- `bRequest`: `0x01`
- `wValue`:
  - bit 0: new DTR value
  - bit 1: new RTS value
  - bit 8: change DTR (if not set, DTR will be unchanged)
  - bit 9: change RTS
- `wIndex`: channel

### `SET_FLOW_CTRL`

Changes hardware flow control mode.

- applicable to: all D2xx devices (but may be a no-op in non-UART modes)
- `bmRequestType`: `0x40`
- `bRequest`: `0x02`
- `wValue`:
  - bits 0-7: XON character
  - bits 8-15: XOFF character
- `wIndex`:
  - bits 0-7: channel
  - bit 8: enable RTS/CTS flow control
  - bit 9: enable DTR/DSR flow control
  - bit 10: enable XON/XOFF flow control

TODO: make double-sure of `wIndex` encoding

TODO: check if XON/XOFF is applicable to eg. FIFO mode

### `SET_BAUD_RATE`

Sets the baud rate, and also the clock for bitbang and MPSSE modes.

- applicable to: all D2xx devices (but may be a no-op on MCU-based ones)
- `bmRequestType`: `0x40`
- `bRequest`: `0x03`
- `wValue`: bits 0-15 of the divisor value
- `wIndex`:
  - for single-channel device:
    - bits 0-1: bits 16-17 of the divisor
  - for multi-channel device:
    - bits 0-7: channel
    - bits 8-9: bits 16-17 of the divisor

The format of the divisor varies depending on the exact device.

#### FT8U100A

For FT8U100A, the divisor is an enum, selecting the baud rate from the following fixed list:

- 0: 300 baud
- 1: 600
- 2: 1200
- 3: 2400
- 4: 4800
- 5: 9600
- 6: 19200
- 7: 38400
- 8: 57600
- 9: 115200

#### FT8U232A, FT8U245A

These devices run on 48MHz base clock.  The base clock is divided by a fractional divisor to obtain the channel clock.  The channel clock is then further divided by 16 to obtain the baud rate.

The divisor is encoded into a 16-bit number as follows:

- bits 0-13: integer part (must be at least 2, except for the special case below)
- bits 14-15: fractional part, encoded
  - 0: .0
  - 1: .5
  - 2: .25
  - 3: .125

There is also a special divisor with dedicated encoding:

- `0x0000` encodes a special divisor of 1 (corresponding to 3000000 baud rate)

#### FT232B, FT245B, FT232R, FT245R, FT2232[CDL], FT-X series

These devices are similar to FT8U2xxA, with minor extensions.  The encoding scheme is backwards-compatible.

The divisor is encoded into a 17-bit number (with top bit overflowing into the `wIndex` field) as follows:

- bits 0-13: integer part (must be at least 2, except for the special cases below)
- bits 14-16: fractional part, encoded
  - 0: .0
  - 1: .5
  - 2: .25
  - 3: .125
  - 4: .375
  - 5: .675
  - 6: .75
  - 7: .875

There are also two special divisors with dedicated encoding:

- `0x0000` encodes a special divisor of 1 (corresponding to 3000000 baud rate)
- `0x0001` encodes a special divisor of 1.5 (corresponding to 2000000 baud rate)

In addition to providing the UART baud rate, the channel clock (not divided by 16) is also used for other modes such as bitbang and MPSSE.

#### FT2232H, FT4232H, FT232H (and all their variants)

These devices are USB high-speed peripherials, and support a higher baud rate and channel clock range.  The base clock of the device is 120MHz.  The divisor encoding is an extension of the one used in FT232B, and is backwards compatible.

The divisor is encoded into an 18-bit number (with top two bits overflowing into the `wIndex` field) as follows:

- bits 0-13: integer part (must be at least 2, except for the special cases below)
- bits 14-16: fractional part, encoded
  - 0: .0
  - 1: .5
  - 2: .25
  - 3: .125
  - 4: .375
  - 5: .675
  - 6: .75
  - 7: .875
- bit 17: divisor and UART mode
  - 0: low-speed, FT232B compatible:
    - base 120MHz clock is pre-divided by 2.5 into a 48MHz clock before being put through the divisor
    - baud rate is channel clock divided by 16
  - 1: high-speed:
    - base 120MHz clock is fed directly into the divisor
    - baud rate is channel clock divided by 10

There are also two special divisors with dedicated encoding:

- `0x00000` or `0x20000` encodes a special divisor of 1 (corresponding to low-speed 3000000 or high-speed 12000000 baud rate, respectively)
- `0x00001` or `0x20001` encodes a special divisor of 1.5 (corresponding to low-speed 2000000 or high-speed 8000000 baud rate, respectively)

In addition to providing the UART baud rate, the channel clock (not divided by 10 or 16) is also used for other modes such as bitbang and MPSSE.

Note that, while the new high-speed divisor mode is usually preferable due to more precision, it cannot represent some of the lowest baud rates (600 baud and below). The low-speed mode should be used for those.

### `SET_DATA_CHARACTERISTICS`

Sets the UART data format and break state.

- applicable to: all D2xx devices (but will be a no-op in non-UART mode)
- `bmRequestType`: `0x40`
- `bRequest`: `0x04`
- `wValue`:
  - bits 0-7: number of data bits (7-8; allegedly FT8U100A can also do 5-6)
  - bits 8-10: parity mode
    - 0: none
    - 1: odd
    - 2: even
    - 3: mark
    - 4: space
  - bits 11-13: stop bits
    - 0: 1 bit
    - 1: 1.5 bits (support status unclear)
    - 2: 2 bits
  - bit 14: transmitter in break state if set
- `wIndex`: channel

### `GET_MODEM_STATUS`

Returns current modem status and line status.  This is the same information that is transmitted in the packet header bytes on the IN endpoint.

- applicable to: all D2xx devices
- `bmRequestType`: `0xc0`
- `bRequest`: `0x05`
- `wValue`: `0`
- `wIndex`: channel
- `wLength`: `2`
- data:
  - byte 0: modem status (shows the most recent state of the modem status input pins)
    - bit 0: always 1?
    - bit 1: always 0?
    - bit 2: always 0?
    - bit 3: always 0?
    - TODO: allegedly high-speed devices have 0010 in low bits?
    - bit 4: CTS
    - bit 5: DSR
    - bit 6: RI
    - bit 7: DCD
  - byte 1: line status
    - bit 0: data ready (???)
    - bit 1: overrun error (device received data on the business end when there was no more space in IN endpoint FIFO)
    - bit 2: parity error
    - bit 3: framing error
    - bit 4: break interrupt
    - bit 5: TX holding register (???)
    - bit 6: TX (OUT endpoint) FIFO is empty
    - bit 7: FIFO error (???)

TODO: allegedly FT8U100A only returns the first byte?

### `SET_EVENT_CHAR`

Sets the special "event" character.  Whenever a matching byte is received on the business end of the device, a packet will be sent on the IN endpoint immediately, instead of waiting for the buffer to fill completely or for the latency timer to expire.  This can be eg. set to `0x0d` (CR) to immediately present received lines to the host.

- applicable to: all D2xx devices
- `bmRequestType`: `0x40`
- `bRequest`: `0x06`
- `wValue`:
  - bits 0-7: event character
  - bit 8: event character enable (if unset, no event character processing is done)
- `wIndex`: channel

### `SET_ERROR_CHAR`

Sets the special "error" character that will be inserted into the receive FIFO in place of parity and framing errors.

- applicable to: all D2xx devices (but will be a no-op in non-UART mode)
- `bmRequestType`: `0x40`
- `bRequest`: `0x07`
- `wValue`:
  - bits 0-7: error character
  - bit 8: error character enable (if unset, parity and framing errors do not insert anything into the FIFO)
- `wIndex`: channel

### `SET_LATENCY_TIMER`

Sets the latency timer (see IN endpoint description).

- applicable to: everything except FT8U100A, FT8U232A, FT8U245A
- `bmRequestType`: `0x40`
- `bRequest`: `0x09`
- `wValue`: latency timer, in units of 1ms (2 to 255)
- `wIndex`: channel

Note: on FT232R and FT245R this command is also used as EEPROM write unlock. The latency timer has to be set to `0x77` to enable EEPROM writes.  Otherwise, the write commands get ignored.

### `GET_LATENCY_TIMER`

Reads back the latency timer (see IN endpoint description).  Also useful for telling FT8U2xxA and FT2xxB apart.

- applicable to: everything except FT8U100A, FT8U232A, FT8U245A
- `bmRequestType`: `0xc0`
- `bRequest`: `0x0a`
- `wValue`: 0
- `wIndex`: channel
- `wLength`: 1
- data: latency timer (1 byte)

### `SET_BITMODE`

Sets a special mode on the channel, overriding whatever base mode it has.

- applicable to: FT232B, FT245B, FT232R, FT245R, FT2232[CDL], FT2232H, FT4232H, FT232H, FT-X series
  - async bitbang: all of the above devices
  - MPSSE: FT2232[CDL] (channel A only), FT2232H, FT4232H (channel A and B only), FT232H
  - sync bitbang: FT232R, FT245R, FT2232[CDL], FT2232H, FT4232H, FT232H, FT-X series
  - MCU host bus: FT2232[CDL], FT2232H
  - fast opto-isolated serial: FT2232[CDL], FT2232H, FT232H
  - CBUS bit-bang: FT232R, FT232H, FT-X series
  - synchronous 245-style FIFO: FT2232H, FT232H
  - FT1248: FT232H maybe?!?
- `bmRequestType`: `0x40`
- `bRequest`: `0x09`
- `wValue`:
  - bits 0-7: depends on mode
    - async and sync bit-bang: mask of which data pins are outputs (0 is input, 1 is output)
    - CBUS bit-bang:
      - bits 0-3: output data
      - bits 4-7: output pin mask (0 is input, 1 is output)
    - others: unused?
  - bits 8-15: mode
    - 0x00: reset to base mode
    - 0x01: [async bit-bang](bitbang.md)
    - 0x02: [MPSSE](mpsse.md)
    - 0x04: [sync bit-bang](bitbang.md)
    - 0x08: [MCU host bus](mcu-bus.md)
    - 0x10: reset [fast opto-isolated serial](opto.md) (?!?!?)
    - 0x20: [CBUS bit-bang](bitbang.md)
    - 0x40: [synchronous 245-style FIFO](fifo.md)
    - 0x80: allegedly [FT1248](ft1248.md) according to libftdi (?!?!?)
- `wIndex`: channel

TODO: figure out the details of this cursed thing

TODO: why are FT1248 and fast opto-isolated serial set both here and in the EEPROM

TODO: CBUS bit-bang has special semantics and can be combined with base mode?!? figure that out

### `GET_PIN_STATE`

Reads current raw state of the channel's DBUS pins.

FTDI calls this request `GET_BITMODE`. However, this naming decision is a crime against catgirlkind, and we shall not respect it.

- applicable to: FT232B, FT245B, FT232R, FT245R, FT2232[CDL], FT2232H, FT4232H, FT232H, FT-X series
- `bmRequestType`: `0xc0`
- `bRequest`: `0x0c`
- `wValue`: 0
- `wIndex`: channel
- `wLength`: 1
- data: pin state

TODO: allegedly this reads CBUS state instead of DBUS state when in CBUS bit-bang mode

### `VENDOR_CMD_GET`

Does a vendor-specific operation with get semantics.  Corresponds to `FT_VendorCmdGet` and `FT_VendorCmdGetEx`.

You may be asking yourself why FTDI saw fit to create a space for vendor-defined requests within its vendor-defined requests space as defined by USB, given that it is the defining vendor in both cases.  The answer is that I have no meowing idea.  However, this seems to be where they stuff a bunch of subcommands specific to their weirder devices.

- applicable to: FT4222H, allegedly UMFTPD3A
- `bmRequestType`: `0xc0`
- `bRequest`: `0x20`
- `wValue`: request type
- `wIndex`: channel (or not, it's vendor-defined after all)
- `wLength`: up to `0x80`

The request set appears to be specific to the exact device.  For the FT4222H request list, see [TODO].

### `VENDOR_CMD_SET`

Does a vendor-specific operation with set semantics.  Corresponds to `FT_VendorCmdSet`.

- applicable to: FT4222H, allegedly UMFTPD3A
- `bmRequestType`: `0x40`
- `bRequest`: `0x21`
- `wValue`:
  - bits 0-7: request type
  - bits 8-15: data, if a single byte of data is transferred
- `wIndex`: channel (or not, it's vendor-defined after all)
- `wLength`: up to `0x80`

If exactly 1 byte is sent to the device, it is put in the high byte of `wValue`, and `wLength` is set to 0.  If more than 1 byte is sent to the device, they are all put in the data payload, and the high byte of `wValue` is unused.

The request set appears to be specific to the exact device.  For the FT4222H request list, see [TODO].

### `READ_EEPROM`

Reads a 16-bit word from the EEPROM.

- applicable to: FT8U100A?, FT8U232A, FT8U245A, FT232B, FT245B, FT232R, FT245R, FT2232[CDL], FT2232H, FT4232H, FT232H, FT-X series
- `bmRequestType`: `0xc0`
- `bRequest`: `0x90`
- `wValue`: 0
- `wIndex`: word address to read; note that the address is counted in 16-bit words, not bytes
- `wLength`: 2
- data: word from EEPROM (little-endian)

The format of the EEPROM depends on the device.  See the documentation for the particular device.

### `WRITE_EEPROM`

Writes a 16-bit word into the EEPROM.

- applicable to: FT8U100A?, FT8U232A, FT8U245A, FT232B, FT245B, FT232R, FT245R, FT2232[CDL], FT2232H, FT4232H, FT232H, FT-X series
- `bmRequestType`: `0x40`
- `bRequest`: `0x91`
- `wValue`: word to write to the EEPROM
- `wIndex`: word address to write; note that the address is counted in 16-bit words, not bytes

Note: on FT232R and FT245R this command is only accepted when the latency timer is set to the magic `0x77` value.

Note that the EEPROM on FT232R and FT245R devices is 32-bit dword oriented, not 16-bit.  This is completely transparent on reads, but is significant for writes: FT2xxR EEPROM must always be written one aligned dword at a time, with the lower-address word written first.

TODO: what about FT-X series?

### `ERASE_EEPROM`

Erases the entire EEPROM.

- applicable to: FT8U100A?, FT8U232A, FT8U245A, FT232B, FT245B, FT2232[CDL], FT2232H, FT4232H, FT232H
- `bmRequestType`: `0x40`
- `bRequest`: `0x92`
- `wValue`: 0
- `wIndex`: 0
