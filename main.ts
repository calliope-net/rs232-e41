function fi_10Bit_Auswerten (pab_Bits: any[]) {
    iDez = 0
    iExp = 1
    iParity = 0
    iFehler = 0
    for (let Index = 0; Index <= 9; Index++) {
        bBit = pab_Bits[Index]
        if (Index == 0 && !(bBit)) {
            iFehler = -1
            break;
        } else if (Index >= 1 && Index <= 7) {
            if (bBit) {
                iParity += 1
            } else {
                iDez += iExp
            }
            iExp = iExp * 2
        } else if (Index == 8) {
            if (bBit) {
                iParity += 1
            }
            if (iParity % 2 != 0) {
                iFehler = -8
                break;
            }
        } else if (Index == 9 && bBit) {
            iFehler = -9
            break;
        }
    }
    if (iFehler == 0) {
        return iDez
    } else {
        basic.showNumber(Math.abs(iFehler))
        basic.setLedColor(0xff0000)
        return iFehler
    }
}
function fab_Empfang () {
    ab_empfangene_Bits = []
    iPause_ms = input.runningTime() + iTakt_ms * 0.5
    for (let Index = 0; Index <= 10; Index++) {
        basic.pause(iPause_ms - input.runningTime())
        ab_empfangene_Bits.push(fb_Licht_an())
        iPause_ms += iTakt_ms
    }
    return ab_empfangene_Bits
}
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.setLedColor(0x00ff00)
    while (!(fb_Licht_an())) {
        basic.pause(10)
    }
    basic.setLedColor(0xff0000)
    ab11Bit = fab_Empfang()
    t = ""
    for (let Wert of ab11Bit) {
        if (Wert) {
            t = "" + t + "0"
        } else {
            t = "" + t + "1"
        }
    }
    basic.turnRgbLedOff()
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 15, lcd16x2rgb.lcd16x2_text(t))
    basic.showNumber(fi_10Bit_Auswerten(ab11Bit))
})
function fb_Licht_an () {
    return pins.analogReadPin(AnalogPin.P2) < 150
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    basic.showNumber(pins.analogReadPin(AnalogPin.P2))
})
let t = ""
let ab11Bit: boolean[] = []
let iPause_ms = 0
let ab_empfangene_Bits: boolean[] = []
let bBit: any = null
let iFehler = 0
let iParity = 0
let iExp = 0
let iDez = 0
let iTakt_ms = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
iTakt_ms = 500
