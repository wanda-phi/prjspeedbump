# Devices

FTDI has made a great variety of devices.  Here we attempt to categorize all of them.

Note that, at one point, FTDI has spun off its MCU division as a new company, Bridgetek. There are many  device that exist with both FTDI (FTxxx) and Bridgetek (BTxxx) naming and branding.  To simplify things, we just consider all Bridgetek devices to be FTDI devices as well.

Usually, the last letter of a full part name (eg. Q in FT2232HQ) represents the package type (SSOP / QFP / QFN / etc). We usually skip this letter when describing the devices, as it doesn't affect their behavior in any way.

## D2xx devices

D2xx devices are USB peripherial devices that implement the D2xx protocol, originally created for USB—UART bridging. They come in several varieties:

- the "proper" fixed-function D2xx devices implementing the D2xx protocol in hardware
  - FT8U232A, FT232B, FT232R, FT230X, FT231X, FT234X: single-channel USB—UART bridge
  - FT8U245A, FT245B, FT245R, FT240X: single-channel USB—FIFO bridge
  - FT200X, FT201X: single-channel USB—I2C peripherial bridge
  - FT220X, FT221X: single-channel USB-SPI/FT1248 bridge
  - FT2232, FT2232H: dual-channel USB—multiprotocol bridge
  - FT4232H: quad-channel USB—multiprotocol bridge
  - FT232H: single-channel USB-multiprotocol bridge
- preprogrammed MCUs implementing the D2xx protocol in fixed firmware
  - FT4222H: quad-channel USB—SPI/I2C bridge
  - UMFT4222PROG: programmer board for FT4222H (based on FT51A)
  - UMFTPD3A: programmer board for FT260/FT4222H (based on FT51A)
- programmable MCUs with FTDI-provided libraries that can be used to implement the D2xx protocol in firmware
  - FT8U100A: ???-based MCU
  - FT51A: 8051-based MCU
  - FT900 series: FT32-based MCU (custom RISC-like 32-bit Harvard architecture)
  - FT930 series: FT32B-based MCU (a revision of FT32)

D2xx devices come with one or more "channel"s, which are essentially independent bidirectional data pipes. They correspond to USB interfaces with one IN endpoint and one OUT endpoint. On the host side, they can be opened and used independently by distinct applications.

The fixed-function D2xx devices as well as FT4222H can be configured through non-volatile memory — some device types use an external EEPROM for that purpose, while others come with on-chip EEPROM or OTP memory.

Almost all D2xx devices allow the designer to provide custom USB vendor and product IDs (as well as string descriptors), making fully reliable detection impossible. However, once something is known to be a D2xx device, the bcdDevice field of device descriptor can be used to determine its exact type:

| bcdDevice    | default VID:PID | # channels | device                          |
| ------------ | --------------- | ---------- | ------------------------------- |
| 0001         | 0403:8372       | 1          | FT8U100A UART "applet"          |
| 0200         | 0403:6001       | 1          | FT8U232A or FT8U245A            |
| 0400 or 0200 | 0403:6001       | 1          | FT232B or FT245B                |
| 0500         | 0403:6010       | 2          | FT2232C, FT2232D                |
| 0600         | 0403:6001       | 1          | FT232R or FT245R                |
| 0600         | 0403:6049       | 1          | FT232RN or FT245RN              |
| 0700         | 0403:6010       | 2          | FT2232H                         |
| 0800         | 0403:6011       | 4          | FT4232H                         |
| 0900         | 0403:6014       | 1          | FT232H                          |
| 1000         | 0403:6015       | 1          | FT-X series                     |
| 1400         | 0403:601b       | 1          | FT4222 mode 3 (unreleased)      |
| 1500         | 0403:601b       | 2          | FT4222 mode 0 (unreleased)      |
| 1600         | 0403:601b       | 4          | FT4222 mode 1 or 2 (unreleased) |
| 1700         | 0403:601c       | 1          | FT4222H mode 3                  |
| 1800         | 0403:601c       | 2          | FT4222H mode 0                  |
| 1900         | 0403:601c       | 4          | FT4222H mode 1 or 2             |
| 2100         | 0403:0fec       | 1?         | UMFT4222PROG                    |
| 2400         | 0403:6031       | 1          | FT90x (1 channel)               |
| 2400         | 0403:6032       | 2          | FT90x (2 channels)              |
| 2400         | 0403:6033       | 3          | FT90x (3 channels)              |
| 2500         | 0403:6034       | 1          | FT93x (1 channel)               |
| 2500         | 0403:6035       | 2          | FT93x (2 channels)              |
| 2500         | 0403:6036       | 3          | FT93x (3 channels)              |
| 2500         | 0403:6037       | 4          | FT93x (4 channels)              |
| 2500         | 0403:6038       | 5          | FT93x (5 channels)              |
| 2500         | 0403:6039       | 6          | FT93x (6 channels)              |
| 2500         | 0403:603a       | 7          | FT93x (7 channels)              |
| 2700         | 0403:603e       | 1?         | UMFTPD3A                        |
| 2800         | 0403:6040       | 2          | FT2233HP                        |
| 2900         | 0403:6041       | 4          | FT4233HP                        |
| 3000         | 0403:6042       | 2          | FT2232HP                        |
| 3100         | 0403:6043       | 4          | FT4232HP                        |
| 3200         | 0403:6044       | 1          | FT232HP                         |
| 3300         | 0403:6045       | 1          | FT232HP                         |
| 3500         | 0403:6047       | 2          | FT2232HA                        |
| 3600         | 0403:6048       | 4          | FT4232HA                        |

### FT8U232A and FT8U245A

These are the first-generation fixed-function D2xx devices. FT8U232A is a USB—UART bridge, while FT8U245A is a USB—FIFO bridge. They look exactly the same from the software perspective, and in fact may or may not be the same silicon.

They are configured by an optional external 93C46 (64×16-bit word) EEPROM. If no EEPROM is present, or the EEPROM is unprogrammed, the device will use a default configuration.

| device    | package     |
| --------- | ----------- |
| FT8U232AM | 32-pin MQFP |
| FT8U245AM | 32-pin MQFP |

### FT232B and FT245B

These are a second-generation revision of FT8U2xxA. They are largely software-compatible, but introduce a few new features:

- configurable latency timer
- bitbang mode
- serial number descriptor
- support for larger 93C56 (128×16) and 93C66 (256×16) EEPROMs in addition to 93C46

They are mostly, but not completely pin compatible with FT8U2xxA in the QFP packages.

| device  | package               |
| ------- | --------------------- |
| FT232BM | 32-pin LQFP           |
| FT232BL | 32-pin lead-free LQFP |
| FT232BQ | 32-pin QFN            |
| FT245BM | 32-pin LQFP           |
| FT245BL | 32-pin lead-free LQFP |

### FT2232C/D/L

A third-generation D2xx device. This device features two largely-independent channels (called A and B), which can be independently configured through EEPROM in several modes:

- UART (like FT232B)
- FIFO (like FT245B)
- CPU FIFO (new mode, meant for use as a peripherial on an 8051-style MCU bus)
- fast opto-isolated serial (custom serial protocol, optimised for low pin count and speed)

In addition, the device can also dynamically switch either of the two channels into alternate modes:

- async bitbang mode: like FT232B/FT245B
- MPSSE mode: implements a fast controller for SPI, JTAG, and similar protocols (channel A only)
- sync bitbang mode: new, variation of the async bitbang mode
- MCU bus: uses pins of both channels; makes the device capable of controlling an 8051-style MCU bus and driving MCU peripherials

Like FT2xxB, the device can be configured by a 93C46/93C56/93C66 external EEPROM.

| device  | package               | what is         |
| ------- | --------------------- | --------------- |
| FT2232C | 48-pin LQFP           | base version    |
| FT2232L | 48-pin lead-free LQFP | base version    |
| FT2232D | 48-pin lead-free LQFP | revised version |

### FT232R/FT245R

A fourth-generation D2xx device. The FT232R and FT245R are, in fact, the same chip, and it seems that they can be converted into one another via an EEPROM change. They are an enhanced version of FT2xxB, with the following new features:

- internal 32×32-bit EEPROM for configuration (instead of external 93C\*), plus 8×32-bit factory-programmed area with unique per-chip ID
  - whether the device is FT232R or FT245R is stored in the user-programmable area and can be changed, though vendor tools go out of their way not to do so
- internal oscillator
- configurable CBUS pins with multiple functions (FT232R only)
- CBUS GPIO mode (allows putting individual CBUS pins under software control while continuing to use other pins for their normal UART purpose)
- adds the synchronous bitbang mode (ported from FT2232C)

The FT2xxRN is a variant of the device that makes the internal oscillator work with 3.3V VCC.

| device   | package      |
| -------- | ------------ |
| FT232RL  | 28-pin TSSOP |
| FT232RQ  | 32-pin QFN   |
| FT245RL  | 28-pin TSSOP |
| FT245RQ  | 32-pin QFN   |
| FT232RNL | 28-pin TSSOP |
| FT232RNQ | 32-pin QFN   |
| FT245RNL | 28-pin TSSOP |
| FT245RNQ | 32-pin QFN   |


### FT2232H and FT4232H

Fifth-generation D2xx devices. FT2232H and FT4232H are the same silicon, and are differentiated by a fuse programmed in the factory.

FT2232H is an enhanced version of FT2232C, with the following new features:

- USB 2.0 high-speed interface
- max UART speed bumped from 3Mbaud to 12Mbaud
- max FIFO speed bumped from 1MB/s to 8MB/s
- adds new synchronous FIFO submode, which further increases FIFO speed to 40MB/s
- MPSSE mode is available on both channels
- each channel now has 16 pins instead of 13 (additional pins can be used as GPIO in MPSSE mode)

FT4232H is a variant with the following differences:

- four channels (A, B, C, D) instead of two, each of which includes 8 pins instead of 16
- modes requiring more than 8 pins are not supported (FIFO, CPU FIFO, MCU bus)
- fast opto-isolated serial mode is also not supported
- only channels A and B support MPSSE (C and D are limitted to UART and bitbang)

Later on, variants of these devices were made with USB-PD support. They have the same core functionality as the base version, but they require a 93C66 EEPROM to fit the extra configuration required for USB-PD.

| device    | package     | what                          |
| --------- | ----------- | ----------------------------- |
| FT2232HL  | 64-pin LQFP | base FT2232H                  |
| FT2232HQ  | 56-pin VQFN | base FT2232H                  |
| FT4232HL  | 64-pin LQFP | base FT4232H                  |
| FT4232HQ  | 56-pin VQFN | base FT4232H                  |
| FT2233HPQ | 76-pin QFN  | FT2232H with two USB-PD ports |
| FT4233HPQ | 76-pin QFN  | FT4232H with two USB-PD ports |
| FT2232HPQ | 68-pin QFN  | FT2232H with one USB-PD port  |
| FT4232HPQ | 68-pin QFN  | FT4232H with one USB-PD port  |
| FT2232HAQ | 64-pin QFN  | FT2232H automotive version    |
| FT4232HAQ | 64-pin QFN  | FT4232H automotive version    |

### FT232H

A single-channel variant of FT2232H, with some FT232R features merged in. Features include:

- USB 2.0 high-speed interface
- a single channel, with 18 pins
- supports all FT2232H modes except for the MCU bus mode (which would require more than 16 pins)
- adds FT232R-style configurable CBUS pins, as well as the CBUS bitbang mode
- continues to require external EEPROM; only 93C56 and 93C66 are supported
- adds a new FT1248 mode

Like FT2232H and FT4232H, this device also got USB-PD variants later on.

| device   | package     | what                         |
| -------- | ----------- | ---------------------------- |
| FT232HL  | 48-pin LQFP | base FT232H                  |
| FT232HQ  | 48-pin QFN  | base FT232H                  |
| FT233HPQ | 64-pin QFN  | FT232H with two USB-PD ports |
| FT232HPQ | 56-pin QFN  | FT232H with one USB-PD port  |

### FT-X series

A single-channel D2xx device. Essentially an enhanced version of FT232R, with the following changes:

- internal 2048-byte MTP memory for configuration, including some immutable factory pre-programmed data
- the device comes in several variants; the variant is selected by the factory-programmed MTP area and cannot be changed
  - FT200X and FT201X: USB to I2C peripherial bridge
  - FT220X and FT221X: USB to FT1248 / SPI bridge
  - FT230X, FT231X, FT234X: USB to UART bridge (like FT232R)
  - FT240X: USB to FIFO bridge (like FT245R)
- adds battery charger detection

| device  | package     | business end        | business end pins      |
| ------- | ----------- | ------------------- | ---------------------- |
| FT200XD | 10-pin DFN  | I2C peripherial     | 2×I2C + 1×CBUS         |
| FT201XS | 16-pin SSOP | I2C peripherial     | 2×I2C + 6×CBUS         |
| FT201XQ | 16-pin QFN  | I2C peripherial     | 2×I2C + 6×CBUS         |
| FT220XS | 16-pin SSOP | 4-bit FT1248 or SPI | 7×FT1248/SPI + 1×CBUS  |
| FT220XQ | 16-pin QFN  | 4-bit FT1248 or SPI | 7×FT1248/SPI + 1×CBUS  |
| FT221XS | 20-pin SSOP | 8-bit FT1248 or SPI | 11×FT1248/SPI + 1×CBUS |
| FT221XQ | 20-pin QFN  | 8-bit FT1248 or SPI | 11×FT1248/SPI + 1×CBUS |
| FT230XS | 16-pin SSOP | basic UART          | 4×UART + 4×CBUS        |
| FT230XQ | 16-pin QFN  | basic UART          | 4×UART + 4×CBUS        |
| FT231XS | 20-pin SSOP | full UART           | 8×UART + 4×CBUS        |
| FT231XQ | 20-pin QFN  | full UART           | 8×UART + 4×CBUS        |
| FT234XD | 12-pin DFN  | basic UART          | 4×UART + 1×CBUS        |
| FT240XS | 24-pin SSOP | FIFO                | 13×FIFO + 2×CBUS       |
| FT240XQ | 24-pin QFN  | FIFO                | 13×FIFO + 2×CBUS       |

### FT4222H

The FT4222H is a high-speed USB to QSPI/I2C + GPIO bridge. Internally, it is based on an MCU (unknown, but likely FT32).

The device is configured using internal OTP memory.

The device has four channel configurations, selectable by two configuration pins:

| mode | channel count | channel 0                 | channel 1  | channel 2  | channel 3  |
| ---- | ------------- | ------------------------- | ---------- | ---------- | ---------- |
| 0    | 2             | SPIC / SPIP / I2CC / I2CP | GPIO       | -          | -          |
| 1    | 4             | SPIC (CS0)                | SPIC (CS1) | SPIC (CS2) | GPIO       |
| 2    | 4             | SPIC (CS0)                | SPIC (CS1) | SPIC (CS2) | SPIC (CS3) |
| 3    | 1             | SPIC / SPIP / I2CC / I2CP | -          | -          | -          |

The device has four modes, selected at runtime:

- SPIC: SPI controller; depending on channel configuration, can use up to four CS lines, and thus control 4 peripherials; every peripherial is controlled by a dedicated channel
- SPIP: SPI peripherial (not available in modes 1 and 2)
- I2CC: I2C controller (not available in modes 1 and 2)
- I2CP: I2C peripherial (not available in modes 1 and 2)

The device comes in 4 revisions, which differ in firmware version:

| device     | package     | firmware |
| ---------- | ----------- | -------- |
| FT4222HQ-A | 32-pin VQFN | rev A    |
| FT4222HQ-B | 32-pin VQFN | rev B    |
| FT4222HQ-C | 32-pin VQFN | rev C    |
| FT4222HQ-D | 32-pin VQFN | rev D    |

## D3xx devices

D3xx devices are USB super-speed peripherial devices that implement the D3xx protocol. There are several variants:

- FT600 and FT601: USB—FIFO bridge
  - FT600: up to 16-bit FIFO
  - FT601: up to 32-bit FIFO
- FT602: USB—FIFO bridge implementing the UVC protocol

All of these devices are internally based on an FT32-based MCU.

| default VID:PID | device |
| --------------- | ------ |
| 0403:601e       | FT600  |
| 0403:601f       | FT601  |
| TODO            | FT602  |

## FT260

FT260 is a USB—UART/I2C bridge implementing the HID device class. It is internally based on an unknown MCU (FT32? FT51?). It can be configured using internal eFUSE memory or external EEPROM.

| device | default VID:PID | package      |
| ------ | --------------- | ------------ |
| FT260Q | 0403:6030       | 28-pin WQFN  |
| FT260S | 0403:6030       | 28-pin TSSOP |

## FT12 series

FT12 series devices are, essentially, completely customizable USB peripherial devices meant to be controlled by an external MCU. The FT12 acts as a PHY and endpoint FIFO controller, while the MCU is supposed to implement all USB endpoint logic, including control requests.

Note that the internal VID:PID listed in the table is actually presented to the *MCU* as FT12's identification, not to the host. The actual USB VID:PID is provided by the MCU.

| device | max endpoints | MCU interface    | internal VID:PID | package      |
| ------ | ------------- | ---------------- | ---------------- | ------------ |
| FT120T | 6             | MCU parallel bus | none             | 28-pin TSSOP |
| FT121T | 16            | SPI              | 0403:6018        | 16-pin TSSOP |
| FT121Q | 16            | SPI              | 0403:6018        | 16-pin QFN   |
| FT122T | 16            | MCU parallel bus | 0403:6018        | 28-pin TSSOP |
| FT122Q | 16            | MCU parallel bus | 0403:6018        | 28-pin QFN   |

## MCU devices

### FT8U100A

FT8U100A is an MCU based on an unknown 8-bit architecture (8051?). It implements a USB hub, with 1 upstream port and 7 physical downstream ports, as well as virtual downstream ports for internal devices. It also has a variety of peripherials, such as UART, PS/2 keyboard/mouse host, IrDA, I2C controller, and GPIO. It comes with ready-made firmware that can be used to expose these peripherials as USB devices (including SIO UART, the first device in the D2xx family).

| device    | package      |
| --------- | ------------ |
| FT8U100AX | 100-pin PQFP | , |

| VID:PID   | internal device         |
| --------- | ----------------------- |
| 0403:8370 | USB hub                 |
| 0403:8371 | PS/2 keyboard and mouse |
| 0403:8372 | UART (D2xx protocol)    |

TODO: list incomplete

### FT51

FT51 is an 8051-based MCU that has a programmable USB peripherial interface, as well as a USB hub. It is used in the UMFTPD3A and UMFT4222PROG boards. It comes in several variants, all of which are the same silicon and only differ in the number of pins:

| device | package     | GPIO            |
| ------ | ----------- | --------------- |
| FT51AQ | 48-pin QFN  | 16×DIO + 16×AIO |
| FT51AL | 44-pin LQFP | 16×DIO + 16×AIO |
| FT51BQ | 32-pin QFN  | 16×DIO + 8×AIO  |
| FT51CS | 28-pin SSOP | 12×DIO + 8×AIO  |

### FT900 series

FT900 is an MCU based on FTDI's custom FT32 RISC-like architecture. It comes in several variants, all of which are actually the same silicon:

| device | ethernet | CAN | GPIO pins | SD host | SPI peripherial | I2C | I2S | package      |
| ------ | -------- | --- | --------- | ------- | --------------- | --- | --- | ------------ |
| FT900Q | yes      | yes | 66        | yes     | 2               | 2   | yes | 100-pin QFN  |
| FT900L | yes      | yes | 66        | yes     | 2               | 2   | yes | 100-pin LQFP |
| FT901Q | yes      | no  | 66        | yes     | 2               | 2   | yes | 100-pin QFN  |
| FT901L | yes      | no  | 66        | yes     | 2               | 2   | yes | 100-pin LQFP |
| FT902Q | no       | yes | 66        | yes     | 2               | 2   | yes | 100-pin QFN  |
| FT902L | no       | yes | 66        | yes     | 2               | 2   | yes | 100-pin LQFP |
| FT903Q | no       | no  | 66        | yes     | 2               | 2   | yes | 100-pin QFN  |
| FT903L | no       | no  | 66        | yes     | 2               | 2   | yes | 100-pin LQFP |
| FT905Q | yes      | yes | 44        | no      | 1               | 1   | no  | 76-pin QFN   |
| FT905L | yes      | yes | 44        | no      | 1               | 1   | no  | 80-pin LQFP  |
| FT906Q | yes      | no  | 44        | no      | 1               | 1   | no  | 76-pin QFN   |
| FT906L | yes      | no  | 44        | no      | 1               | 1   | no  | 80-pin LQFP  |
| FT907Q | no       | yes | 44        | no      | 1               | 1   | no  | 76-pin QFN   |
| FT907L | no       | yes | 44        | no      | 1               | 1   | no  | 80-pin LQFP  |
| FT908Q | no       | no  | 44        | no      | 1               | 1   | no  | 76-pin QFN   |
| FT908L | no       | no  | 44        | no      | 1               | 1   | no  | 80-pin LQFP  |

FT900 comes with (device-side) libraries that can implement the D2xx protocol in software.

### FT930 series

FT930 is an MCU based on FT32B, a revision of the FT32 architecture used in the FT900 series. It comes in several variants, all of which are actually the same silicon:

| device | DAC | ADC | PWM | SD host | RTC | UART | GPIO | pins       |
| ------ | --- | --- | --- | ------- | --- | ---- | ---- | ---------- |
| FT930Q | ×2  | ×3  | ×8  | yes     | yes | ×4   | 40   | 68-pin QFN |
| FT931Q | ×2  | ×3  | ×4  | yes     | yes | ×2   | 28   | 56-pin QFN |
| FT932Q | ×2  | ×3  | ×4  | yes     | no  | ×2   | 24   | 48-pin QFN |
| FT933Q | no  | ×2  | ×4  | no      | no  | ×2   | 16   | 48-pin QFN |

In addition to the main FT32B core that is advertised in the datasheet, FT930 also contains a secondary MCU (unknown architecture, but likely also FT32). The "hardware D2xx engine" advertised in the datasheet is actually implemented in software on the other MCU core.

### VNC1

VNC1, also known as Vinculum, is an MCU with USB host and peripherial interfaces. It is based on a custom 8-bit Harvard architecture, known as FT8.  It has a cute 32-bit integer numeric coprocessor for complex arithmetic tasks such as "handling the FAT filesystem".

| device | package     |
| ------ | ----------- |
| VNC1L  | 48-pin LQFP |

### VNC2

VNC2, also known as Vinculum-II, is an MCU with USB host and peripherial interfaces. It is based on a custom Harvard 16-bit architecture, known as FT16.

| device   | package     | GPIO |
| -------- | ----------- | ---- |
| VNC2-48L | 48-pin LQFP | 28   |
| VNC2-48Q | 48-pin QFN  | 28   |
| VNC2-32L | 32-pin LQFP | 12   |
| VNC2-32Q | 32-pin QFN  | 12   |

#### FT311 and FT312

FT311 and FT312 are Android Open Accessory host devices. They are USB full-speed hosts that accept a single peripherial that should support the AOA protocol. They will then expose UART or other interface to the Android device.

The device has internal flash memory which stores, among other things, the descriptor strings presented to the Android device. It can be modified via an FTDI null-modem cable and a configuration utility.

Both of these devices are actually just VNC2 chips with preprogrammed firmware.

| device       | package     | interfaces                                                               |
| ------------ | ----------- | ------------------------------------------------------------------------ |
| FT311D-32Q1C | 32-pin QFN  | one of: UART, GPIO, PWM, I2C controller, SPI controller, SPI peripherial |
| FT311D-32L1C | 32-pin LQFP | one of: UART, GPIO, PWM, I2C controller, SPI controller, SPI peripherial |
| FT312D-32Q1C | 32-pin QFN  | UART                                                                     |
| FT312D-32L1C | 32-pin LQFP | UART                                                                     |

## FT313

FT313 is an EHCI controller meant to be connected as a peripherial to 8051-style MCU bus.  It has 24kiB of internal buffer memory and DMA support.

| device  | package     |
| ------- | ----------- |
| FT313HQ | 64-pin QFN  |
| FT313HL | 64-pin LQFP |
| FT313HP | 64-pin TQFP |

## EVE display controllers

EVE (Embedded Video Engine) aka FT8xx aka BT8xx is a series of display controllers.  They are meant to be driven by an external MCU, and provide parallel or LVDS video output (and, in some cases, input), audio output, and a resistive or capacitive touch controller.

### EVE aka FT80x

The first generation of EVE.  Both chips are the same silicon.  It features:

- SPI peripherial or I2C peripherial interface exposing internal RAM and registers, meant to be controlled by the MCU host
- 256kiB of internal RAM
- parallel 18-bit RGB video output, up to 480×272 resolution
- display list based graphics engine driving the video output
  - basic rendering features
  - JPEG decode
  - zlib decompression
  - ROM and RAM fonts
- backlight control
- one-channel PWM audio output, playing PCM audio or predefined sound effects from ROM wave table
- touch controller
  - resistive version: directly controls the touchscreen via analog pins
  - capacitive version: has an I2C controller interface meant to be connected to the capacitive touchscreen

| device | touch interface | package     |
| ------ | --------------- | ----------- |
| FT800Q | resistive       | 48-pin VQFN |
| FT801Q | capacitive      | 48-pin VQFN |

### EVE2 aka FT81x and BT88x

The second generation of EVE.  FT81x has the following differences from FT80x:

- MCU interface is SPI or QSPI peripherial
- 1MiB of internal RAM
- different memory map
- video output supports up to 800×600 resolution
- video output is 24-bit instead of 18-bit (on FT812 and FT813 only)

The BT88x is a smaller variant of EVE2.  It has the following differences from FT81x:

- only 256kiB of internal RAM
- video output resolution is limitted to 131072 pixels total

| device | video output | touch interface | internal RAM | package     |
| ------ | ------------ | --------------- | ------------ | ----------- |
| FT810Q | 18-bit RGB   | resistive       | 1MiB         | 48-pin VQFN |
| FT811Q | 18-bit RGB   | capacitive      | 1MiB         | 48-pin VQFN |
| FT812Q | 24-bit RGB   | resistive       | 1MiB         | 56-pin VQFN |
| FT813Q | 24-bit RGB   | capacitive      | 1MiB         | 56-pin VQFN |
| BT880Q | 18-bit RGB   | resistive       | 256kiB       | 48-pin VQFN |
| BT881Q | 18-bit RGB   | capacitive      | 256kiB       | 48-pin VQFN |
| BT882Q | 24-bit RGB   | resistive       | 256kiB       | 56-pin VQFN |
| BT883Q | 24-bit RGB   | capacitive      | 256kiB       | 56-pin VQFN |

All of the FT81x devices are the same silicon.  FT810 and FT811 are pin-compatible with FT800 and FT801.

Likewise, all BT88x devices are the same silicon.  They are pin-compatible with their corresponding FT81x devices.

### EVE3 aka BT815/BT816

The third generation of EVE.  It has switched to the BT (Bridgetek) device name prefix.  It has the following differences from EVE2:

- added QSPI controller interface meant for connecting an external flash chip with preprogrammed graphics or audio data
- sigma-delta audio output instead of PWM


| device | touch interface | package     |
| ------ | --------------- | ----------- |
| BT815Q | capacitive      | 64-pin VQFN |
| BT816Q | resistive       | 64-pin VQFN |

Both BT815 and BT816 are the same silicon.

### EVE4 aka BT817/BT818

The fourth generation of EVE.  It has the following differences from EVE3:

- video output supports up to 1920×480, 1440×540, or 1280×800 resolution

| device  | touch interface | package     |
| ------- | --------------- | ----------- |
| BT817Q  | capacitive      | 64-pin VQFN |
| BT817AQ | capacitive      | 64-pin VQFN |
| BT818Q  | resistive       | 64-pin VQFN |

BT817A is an automotive variant of BT817.

All EVE4 devices are the same silicon.

### EVE5 aka BT820

The fifth generation of EVE, with major changes.  It has the following features:

- QSPI peripherial interface for the MCU host
- QSPI controller interface for flash
- memory controller for DDR3/DDR3L/LPDDR2 working memory
- SD card host interface
- dual-channel FPD-link video output
  - with backlight control
- dual-channel FPD-link video input
- I2C controller interface for capacitive touch
- audio output through stereo delta-sigma or I2S
- 16 GPIO pins
- display list based graphics engine
  - PNG and JPG decode support
  - deflate decode support
  - ROM and RAM fonts
- render engine for memory-to-memory drawing
  - ASTC decode support

| device | package     |
| ------ | ----------- |
| BT820B | 329-pin BGA |