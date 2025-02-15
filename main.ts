input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.setLedColor(0x00ff00)
    while (!(fb_Licht_an())) {
        basic.pause(10)
    }
    basic.setLedColor(0xff0000)
    ab8Bit = []
    iStart_ms = input.runningTime() + iTakt_ms
    iPause_ms = iStart_ms + iTakt_ms * 0.5
    t = ""
    iBitNummer = 0
    for (let Index = 0; Index <= 9; Index++) {
        basic.pause(iPause_ms - input.runningTime())
        ab8Bit.push(fb_Licht_an())
        iPause_ms += iTakt_ms
    }
    for (let Wert of ab8Bit) {
        if (Wert) {
            t = "" + t + "0"
        } else {
            t = "" + t + "1"
        }
    }
    basic.turnRgbLedOff()
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 15, lcd16x2rgb.lcd16x2_text(t))
})
function fb_Licht_an () {
    return pins.analogReadPin(AnalogPin.P2) < 150
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    basic.showNumber(pins.analogReadPin(AnalogPin.P2))
})
let iBitNummer = 0
let t = ""
let iPause_ms = 0
let iStart_ms = 0
let ab8Bit: boolean[] = []
let iTakt_ms = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
iTakt_ms = 500
