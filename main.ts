function empfange10Bit () {
    rs232.comment("vor Aufruf auf Startbit warten")
    empfangeneBits = []
    rs232.comment("Startbit nach einer halben Taktzeit einlesen")
    iPause_ms = input.runningTime() + iTakt_ms * 0.5
    for (let index = 0; index < 10; index++) {
        basic.pause(iPause_ms - input.runningTime())
        rs232.comment("Lichtschranke abfragen")
        empfangeneBits.push(empfange1Bit())
        rs232.comment("einen Takt warten, trifft das nächste Bit in der Mitte")
        iPause_ms += iTakt_ms
    }
    return empfangeneBits
}
function sende10Bit () {
    rs232.comment("Daten (in Variable sendBits) senden")
    iPause_ms = input.runningTime() + iTakt_ms
    rs232.comment("Startbit - Licht an")
    sende1Bit(true)
    for (let Index = 0; Index <= 7; Index++) {
        rs232.comment("7 Datenbits + 1 Paritätsbit")
        sende1Bit(sendBits[Index])
    }
    rs232.comment("Stopbit - Licht aus")
    sende1Bit(false)
}
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    rs232.comment("1 Zeichen empfangen")
    lcd16x2rgb.clearScreen(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
    basic.setLedColor(0x00ff00)
    while (!(empfange1Bit()) && !(input.buttonIsPressed(Button.AB))) {
        rs232.comment("auf Startbit warten (Licht an)")
        basic.pause(10)
    }
    basic.setLedColor(0x0000ff)
    rs232.comment("Daten empfangen")
    array10Bit = empfange10Bit()
    rs232.comment("10 Daten Bits anzeigen als 0110100101")
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 10, rs232.binToString(array10Bit, "0", "1"))
    rs232.comment("1 Startbit=0, 7 Datenbit, 1 Paritätsbit=gerade, 1 Stopbit=1 auswerten, ASCII Code (oder Fehler) zurück geben")
    iAsc = rs232.binToAsc(array10Bit)
    if (rs232.between(iAsc, 32, 127)) {
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 11, 13, iAsc)
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 15, 15, String.fromCharCode(iAsc))
        basic.turnRgbLedOff()
    } else {
        rs232.comment("kein gültiges ASCII Zeichen 32..127 - Fehler anzeigen")
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 7, rs232.fehlerText(iAsc))
        basic.setLedColor(0xff0000)
    }
})
function sende1Bit (p_bit: boolean) {
    if (p_bit) {
        pins.digitalWritePin(DigitalPin.C17, 1)
    } else {
        pins.digitalWritePin(DigitalPin.C17, 0)
    }
    basic.pause(iPause_ms - input.runningTime())
    iPause_ms += iTakt_ms
}
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    basic.showNumber(pins.analogReadPin(AnalogPin.C16))
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    rs232.comment("1 Zeichen senden")
    lcd16x2rgb.clearScreen(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
    basic.setLedColor(0x00ff00)
    sendBits = rs232.chrToBin("K", 0)
    rs232.comment("8 Daten Bits anzeigen als 11010010")
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 1, 10, rs232.binToString(sendBits, "0", "1"))
    basic.setLedColor(0x0000ff)
    rs232.comment("Daten (in Variable sendBits) senden")
    sende10Bit()
    basic.turnRgbLedOff()
})
function empfange1Bit () {
    rs232.comment("hell ist true")
    return pins.analogReadPin(AnalogPin.C16) < 150
}
let iAsc = 0
let array10Bit: boolean[] = []
let sendBits: boolean[] = []
let iPause_ms = 0
let empfangeneBits: boolean[] = []
let iTakt_ms = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
rs232.setPins(DigitalPin.C17, AnalogPin.C16, 150)
rs232.setTakt(400)
iTakt_ms = 400
