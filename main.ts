function fab_Empfang () {
    ab_empfangene_Bits = []
    rs232.comment("Startbit nach einer halben Taktzeit einlesen")
    iPause_ms = input.runningTime() + iTakt_ms * 0.5
    for (let index = 0; index < 10; index++) {
        basic.pause(iPause_ms - input.runningTime())
        rs232.comment("Lichtschranke abfragen")
        ab_empfangene_Bits.push(fb_Licht_an())
        rs232.comment("einen Takt warten, trifft das nächste Bit in der Mitte")
        iPause_ms += iTakt_ms
    }
    return ab_empfangene_Bits
}
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.setLedColor(0x00ff00)
    while (!(fb_Licht_an())) {
        rs232.comment("warten bis Licht an (Startbit)")
        basic.pause(10)
    }
    basic.setLedColor(0x0000ff)
    rs232.comment("Daten empfangen")
    ab10Bit = fab_Empfang()
    basic.turnRgbLedOff()
    lcd16x2rgb.clearScreen(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 10, rs232.bin_toString(ab10Bit, "1", "0"))
    iAsc = rs232.bin_toAsc(ab10Bit)
    if (rs232.between(iAsc, 32, 127)) {
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 11, 13, iAsc)
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 15, 15, String.fromCharCode(iAsc))
    } else {
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 7, rs232.fehlerText(iAsc))
        basic.setLedColor(0xff0000)
    }
})
function fb_Licht_an () {
    return pins.analogReadPin(AnalogPin.P2) < 150
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    basic.showNumber(pins.analogReadPin(AnalogPin.P2))
})
let iAsc = 0
let ab10Bit: boolean[] = []
let iPause_ms = 0
let ab_empfangene_Bits: boolean[] = []
let iTakt_ms = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
iTakt_ms = 500
