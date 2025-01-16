# FT-X series

The seventh generation of fixed-function D2xx devices, an upgrade to [FT232R and FT245R](ft232r.md).  There are four kinds of FT-X series devices:

- the FT20xX series, USB to I2C peripherial bridges (effectively a new mode of operation)
- the FT22xX series, USB to FT1248 bridges (based on the [FT1248 mode](ft1248.md) introduced in [FT232H](ft232h.md))
- the FT23xX series, USB to UART bridges (a sequel to FT232R)
- the FT240X, USB to FIFO bridge (a sequel to FT245R)

Note: FT22xX claims to be an "FT1248/SPI bridge".  In reality, it has nothing to do with SPI.  It could at most be charitably described as "SPI fanfic with little regard for canon".

All FT-X series devices are actually the same silicon, differentiated through mode selection in the factory-programmed area of its EEPROM memory and packaging.

Features:

- is a full-speed USB 1.1 peripherial
- single channel D2xx device
- set to one of four base modes depending on factory configuration:
  - FT200X and FT201X: a new [I2C peripherial mode](d2xx-i2cp.md)
  - FT220X and FT221X: FT232H-like [FT1248 mode](ft1248.md)
  - FT230X, FT231X, FT234X: FT232R-like UART mode
  - FT240X: FT245R-like [FIFO mode](fifo.md)
- dynamically-selectable alternate modes include:
  - FT2xxB-like [async bitbang](bitbang.md)
  - FT2232-like [sync bitbang](bitbang.md)
  - FT2xxR-like [CBUS bitbang](bitbang.md)
- 512-byte IN FIFO, 512-byte OUT FIFO
- internal 2048-byte EEPROM
  - pre-programmed factory area in EEPROM
  - in FT1248 and I2C peripherial modes, the EEPROM can be accessed from the business end too
- USB battery charger detection
- 48MHZ internal base clock, generated from an internal 12MHz oscillator
- 3.3V or 5V VCC supply for internal circuitry
- separate 1.8V to 3.3V VCCIO supply for business-end IO
- internal 5V-to-3.3V LDO
- internal 3.3V/5V-to-1.8V LDO
- internal D+ pullup resistor
- internal power-on reset circuit
- required external support circuitry:
  - just the decoupling capacitors

The default VID:PID of the device is `0403:6015`, unless configured otherwise by the EEPROM.  The `bcdDevice` value is `0x1000`.

The devices are:

| device  | package     | business end    | business end pins  |
| ------- | ----------- | --------------- | ------------------ |
| FT200XD | 10-pin DFN  | I2C peripherial | 2×I2C + 1×CBUS     |
| FT201XS | 16-pin SSOP | I2C peripherial | 2×I2C + 6×CBUS     |
| FT201XQ | 16-pin QFN  | I2C peripherial | 2×I2C + 6×CBUS     |
| FT220XS | 16-pin SSOP | 4-bit FT1248    | 7×FT1248 + 1×CBUS  |
| FT220XQ | 16-pin QFN  | 4-bit FT1248    | 7×FT1248 + 1×CBUS  |
| FT221XS | 20-pin SSOP | 8-bit FT1248    | 11×FT1248 + 1×CBUS |
| FT221XQ | 20-pin QFN  | 8-bit FT1248    | 11×FT1248 + 1×CBUS |
| FT230XS | 16-pin SSOP | basic UART      | 4×UART + 4×CBUS    |
| FT230XQ | 16-pin QFN  | basic UART      | 4×UART + 4×CBUS    |
| FT231XS | 20-pin SSOP | full UART       | 8×UART + 4×CBUS    |
| FT231XQ | 20-pin QFN  | full UART       | 8×UART + 4×CBUS    |
| FT234XD | 12-pin DFN  | basic UART      | 4×UART + 1×CBUS    |
| FT240XS | 24-pin SSOP | FIFO            | 13×FIFO + 2×CBUS   |
| FT240XQ | 24-pin QFN  | FIFO            | 13×FIFO + 2×CBUS   |

## Pinout — FT20xX, FT22xX, FT23xX

| QFN20 | SSOP20 | QFN16 | SSOP16 | DFN12 | DFN10 | FT20xX | FT22xX | FT23xX |
| ----- | ------ | ----- | ------ | ----- | ----- | ------ | ------ | ------ |
| 1     | 4      | 2     | 4      | 10    | 8     | SDA    | MIOSI1 | RXD    |
| 2     | 5      | -     | -      | -     | -     | -      | MIOSI7 | RI#    |
| 3     | 6      | 3     | 5      | -     | 9     | GND    | GND    | GND    |
| 4     | 7      | -     | -      | -     | -     | -      | MIOSI5 | DSR#   |
| 5     | 8      | -     | -      | -     | -     | -      | MIOSI6 | DCD#   |
| 6     | 9      | 4     | 6      | 11    | -     | CBUS4  | MIOSI3 | CTS#   |
| 7     | 10     | 5     | 7      | -     | -     | CBUS2  | MISO   | CBUS2  |
| 8     | 11     | 6     | 8      | 12    | 10    | USBDP  | USBDP  | USBDP  |
| 9     | 12     | 7     | 9      | 1     | 1     | USBDM  | USBDM  | USBDM  |
| 10    | 13     | 8     | 10     | 3     | 3     | 3V3OUT | 3V3OUT | 3V3OUT |
| 11    | 14     | 9     | 11     | 2     | 2     | RESET# | RESET# | RESET# |
| 12    | 15     | 10    | 12     | 4     | 4     | VCC    | VCC    | VCC    |
| 13    | 16     | 13    | 13     | 5     | -     | GND    | GND    | GND    |
| 14    | 17     | 11    | 14     | -     | -     | CBUS1  | CS#    | CBUS1  |
| 15    | 18     | 12    | 15     | 6     | 5     | CBUS0  | CLK    | CBUS0  |
| 16    | 19     | 14    | 16     | -     | -     | CBUS3  | CBUS3  | CBUS3  |
| 17    | 20     | 15    | 1      | 7     | -     | CBUS5  | MIOSI0 | TXD    |
| 18    | 1      | -     | -      | -     | -     | -      | MIOSI4 | DTR#   |
| 19    | 2      | 16    | 2      | 8     | 6     | SCL    | MIOSI2 | RTS#   |
| 20    | 3      | 1     | 3      | 9     | 7     | VCCIO  | VCCIO  | VCCIO  |
| [pad] |        | [pad] | -      | [pad] | [pad] | GND    | GND    | GND    |

## Pinout — FT240X

| QFN24 | SSOP24 | FT240X |
| ----- | ------ | ------ |
| 1     | 4      | DATA1  |
| 2     | 5      | DATA7  |
| 3     | 6      | GND    |
| 4     | 7      | DATA5  |
| 5     | 8      | DATA6  |
| 6     | 9      | DATA3  |
| 7     | 10     | SI/WU# |
| 8     | 11     | RD#    |
| 9     | 12     | WR     |
| 10    | 13     | USBDP  |
| 11    | 14     | USBDM  |
| 12    | 15     | 3V3OUT |
| 13    | 16     | RESET# |
| 14    | 17     | VCORE  |
| 15    | 18     | VCC    |
| 16    | 19     | GND    |
| 17    | 20     | TXE#   |
| 18    | 21     | RXF#   |
| 19    | 22     | CBUS6  |
| 20    | 23     | CBUS5  |
| 21    | 24     | DATA0  |
| 22    | 1      | DATA4  |
| 23    | 2      | DATA2  |
| 24    | 3      | VCCIO  |

## CBUS pins

The device has up to 6 CBUS pins.  They can be configured through the EEPROM to do the following functions:

| EEPROM value | valid on pins                                   | function                                 |
| ------------ | ----------------------------------------------- | ---------------------------------------- |
| `0x00`       | all                                             | tristate                                 |
| `0x01`       | all                                             | UART TXLED#                              |
| `0x02`       | all                                             | UART RXLED#                              |
| `0x03`       | all                                             | UART TXRXLED#                            |
| `0x04`       | all                                             | PWREN#                                   |
| `0x05`       | all                                             | SLEEP#                                   |
| `0x06`       | all                                             | const-0 output                           |
| `0x07`       | all                                             | const-1 output                           |
| `0x08`       | all (everything but FT20xX), CBUS[0-3] (FT20xX) | I/O (for CBUS bitbang mode)              |
| `0x09`       | all                                             | UART TXDEN                               |
| `0x0a`       | all                                             | CLK24                                    |
| `0x0b`       | all                                             | CLK12                                    |
| `0x0c`       | all                                             | CLK6                                     |
| `0x0d`       | all                                             | BCD_CHARGER                              |
| `0x0e`       | all                                             | BCD_CHARGER#                             |
| `0x0f`       | all                                             | I2C TXE#                                 |
| `0x10`       | all                                             | I2C RXF#                                 |
| `0x11`       | all                                             | VBUS_SENSE (previously known as PWRSAV#) |
| `0x12`       | all                                             | bitbang WR#                              |
| `0x13`       | all                                             | bitbang RD#                              |
| `0x14`       | all                                             | TIMESTAMP                                |
| `0x15`       | all                                             | KEEP_AWAKE                               |

The two new functions are:

- TIMESTAMP (device output, toggles on every USB SOF frame)
- KEEP_AWAKE (device input, prevents device from entering suspend state when unplugged)

## EEPROM format

The FT-X series has an internal EEPROM of 2048 bytes.  It can be accessed from the USB host side like on previous devices, where it is instead viewed as an array of 1024 16-bit words.  On the FT20xX and FT22xX, it can also be accessed from the I2C/FT1248 side through special requests, where it is viewed as a 2048-byte array.

Note that the vendor calls the EEPROM "MTP memory" on this device.  The difference, if any, is unknown.

The EEPROM format is (viewed as 1024×16-bit words, like from the host): 

- word 0x00:
  - bit 0: battery charge detect: enable
  - bit 1: battery charge detect: force PWREN# low when charger detected
  - bit 2: battery charge detect: disable sleep mode when charger detected
  - bit 3: RS485 echo suppression (FT23xX only)
  - bit 4: use external oscillator (?!? how? unbonded pads?)
  - bit 5: external oscillator feedback resistor enable
  - bit 6: USB suspend VBUS (set if one of CBUS is allocated as VBUS sense)
  - bit 7: enable bind to VCP driver
- word 0x01: idVendor (USB VID)
- word 0x02: idProduct (USB PID)
- word 0x03: bcdDevice (0x1000)
- word 0x04: USB config (goes straight to configuration descriptor)
  - bits 0-7: bmAttributes
    - bit 5: remote wakeup enabled
    - bit 6: self-powered
    - bit 7: always set to 1
  - bits 8-15: bMaxPower (max power in units of 2mA)
- word 0x05: device control
  - bit 2: IO pulldown in suspend
  - bit 3: serial number enabled
  - bit 4: FT1248 clock polarity (CPOL) (FT22xX only)
    - 0: low
    - 1: high
  - bit 5: FT1248 bit order (FT22xX only)
    - 0: MSB
    - 1: LSB
  - bit 6: FT1248 flow control enable (FT22xX only)
  - bit 7: I2C disable schmitt trigger (FT20xX only)
  - bit 8: invert TXD (FT23xX only)
  - bit 9: invert RXD (FT23xX only)
  - bit 10: invert RTS (FT23xX only)
  - bit 11: invert CTS (FT23xX only)
  - bit 12: invert DTR (FT23xX only)
  - bit 13: invert DSR (FT23xX only)
  - bit 14: invert DCD (FT23xX only)
  - bit 15: invert RI (FT23xX only)
- word 0x06:
  - bits 0-1: DBUS drive strength
    - 0: 4mA
    - 1: 8mA
    - 2: 12mA
    - 3: 16mA
  - bit 2: DBUS slow slew rate
  - bit 3: DBUS schmitt trigger
  - bits 4-5: CBUS drive strength
  - bit 6: CBUS slow slew rate
  - bit 7: CBUS schmitt trigger
- word 0x07: manufacturer string pointer
- word 0x08: product description string pointer
- word 0x09: serial number string pointer
- word 0x0a: I2C slave address (FT20xX only)
- word 0x0b: I2C device ID low word (FT20xX only)
- word 0x0c: I2C device ID high word (FT20xX only)
- word 0x0d:
  - bits 0-7: CBUS0 function
  - bits 8-15: CBUS1 function
- word 0x0e:
  - bits 0-7: CBUS2 function
  - bits 8-15: CBUS3 function
- word 0x0f:
  - bits 0-7: CBUS4 function
  - bits 8-15: CBUS5 function
- word 0x10:
  - bits 0-7: CBUS6 function
- words 0x12..0x40: user area (not checksummed)
- words 0x40..0x50: factory configuration area
  - word 0x49:
    - bits 8-15: device type
      - 0: UART (FT23xX)
      - 1: FIFO (FT24xX)
      - 2: FT1248 (FT22xX)
      - 3: I2C (FT20xX)
- words 0x50..0x7f: string area
- word 0x7f: checksum
- word 0x80..0x400: user area (not checksummed)

String pointers are formatted as follows:

- bits 0-7: pointer to descriptor within EEPROM (counted *in bytes*)
- bits 8-15: total length of descriptor in bytes

The string descriptors are stored in ROM with the descriptor header included, as follows:

- word 0: header
  - bits 0-7: total length of descriptor in bytes (includes header)
  - bits 8-15: descriptor type (always 3 — string)
- words 1 and up: string in UTF-16

The checksum can be computed as follows:

```rust
fn checksum(eeprom: &[u16; 0x400]) -> u16 {
    let mut res: u16 = 0xaaaa;
    for pos in 0..0x12 {
        res ^= eeprom[pos];
        res = res.rotate_left(1);
    }
    for pos in 0x40..0x7f { // checksum word is NOT included — we're calculating it
        res ^= eeprom[pos];
        res = res.rotate_left(1);
    }
    res
}
```