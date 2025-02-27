
//% color=#002050 icon="\uf093" block="RS-232" weight=15
namespace rs232
/* 
    https://de.wikipedia.org/wiki/RS-232
    https://calliope-net.github.io/rs232-e41/
    https://calliope-net.github.io/rs232-e41/rs232.png
*/ {

    let n_pinLED: DigitalPin = DigitalPin.C17
    let n_pinFototransistor: AnalogPin = AnalogPin.C16
    let n_valueFototransistor: number = 150
    let n_takt_ms: number = 400
    let n_startBitTime: number = 0.5
    let n_escape: boolean = false // warten auf Startbit beim Empfang abbrechen

    //% group="Pins und Takt (Millisekunden)"
    //% block="Pins: LED %pinLED Fototransistor %pinFototransistor Helligkeit < %valueFototransistor" weight=5
    //% pinLED.defl=DigitalPin.C17 pinFototransistor.defl=AnalogPin.C16 valueFototransistor.defl=150
    export function setPins(pinLED: DigitalPin, pinFototransistor: AnalogPin, valueFototransistor: number) {
        n_pinLED = pinLED
        n_pinFototransistor = pinFototransistor
        n_valueFototransistor = valueFototransistor
    }

    //% group="Pins und Takt (Millisekunden)"
    //% block="Takt: %pTakt_ms ms || startBitTime %startBitTime" weight=4
    //% pTakt_ms.defl=400
    //% startBitTime.defl=0.5
    export function setTakt(pTakt_ms: number, startBitTime = 0.5) {
        n_takt_ms = pTakt_ms
        n_startBitTime = startBitTime
    }



    // ========== group="Senden: 7 Datenbit, 1 Paritätsbit"


    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="sende 1 Bit %bit" weight=9
    export function sende1Bit(bit: boolean) {
        if (bit) {
            pins.digitalWritePin(n_pinLED, 1)
        } else {
            pins.digitalWritePin(n_pinLED, 0)
        }
        // basic.pause(iPause_ms - input.runningTime())
        // iPause_ms += iTakt_ms
    }

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="sende 11 Bit %send8Bits" weight=8
    export function sende11Bit(send8Bit: boolean[]) {
        // Daten (in Variable sendBits) senden
        let iPause_ms = input.runningTime() + n_takt_ms

        sende1Bit(true) // Startbit - Licht an
        basic.pause(iPause_ms - input.runningTime())
        iPause_ms += n_takt_ms

        for (let i = 0; i <= 7; i++) {
            sende1Bit(send8Bit[i]) // 7 Datenbits + 1 Paritätsbit
            basic.pause(iPause_ms - input.runningTime())
            iPause_ms += n_takt_ms
        }
        sende1Bit(false) // 2 Stopbit - Licht aus
        basic.pause(iPause_ms - input.runningTime())
        iPause_ms += n_takt_ms

        sende1Bit(false)
        basic.pause(iPause_ms - input.runningTime())
        iPause_ms += n_takt_ms

    }

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="sende Text %text mit ENTER %mitCR" weight=7
    export function sendeText(text: string, mitCR: boolean) {
        for (let i = 0; i < text.length; i++) {
            sende11Bit(ascToBin(text.charCodeAt(i)))
        }
        if (mitCR)
            sende11Bit(ascToBin(13))
    }

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="sende 1 Zeichen ASCII Code %asc" weight=6
    //% asc.min=32 asc.max=127 asc.defl=13
    export function sendeAsc(asc: number) {
        sende11Bit(ascToBin(asc))
    }



    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="ASCII Zeichen → 8-Bitarray text %text index %index" weight=5
    export function chrToBin(text: string, index: number): boolean[] {
        return ascToBin(text.charCodeAt(index))
    }

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="ASCII Code → 8-Bitarray %ascByte" weight=4
    export function ascToBin(ascByte: number): boolean[] {
        let iParity = 0, bBit: boolean
        let bitArray: boolean[] = []
        for (let i = 0; i < 7; i++) {
            bBit = ascByte % 2 == 0 // gerade Zahl==0 - Bit=true (negative Logik)
            bitArray.push(bBit) // [0]..[6] 7 Bit
            if (bBit)
                iParity++
            ascByte = ascByte >> 1 // um 1 Bit nach rechts schieben
        }
        bitArray.push(iParity % 2 != 0) // [7] das 8. Bit Parity
        return bitArray
    }


    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="ASCII Zeichen → ASCII Code text %text index %index" weight=3
    export function chrToAsc(text: string, index: number): number {
        return text.charCodeAt(index)
    }




    // ========== group="Empfang"

    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="empfange 1 Bit (hell ist true)" weight=9
    export function empfange1Bit() {
        // hell ist true
        return pins.analogReadPin(n_pinFototransistor) < n_valueFototransistor
    }


    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="empfange 10 Bit" weight=8
    export function empfange10Bit(): boolean[] {
        let iPause_ms: number
        let empfangeneBits: boolean[] = []

        while (!empfange1Bit()) { // auf Startbit warten (Licht an)
            iPause_ms = input.runningTime() + n_takt_ms * n_startBitTime // 0.5 oder 0.45
            if (n_escape)
                break
        }
        if (!n_escape) {

            // Startbit nach einer halben Taktzeit einlesen
            //  iPause_ms = input.runningTime() + iTakt_ms * 0.5
            for (let i = 0; i < 10; i++) {
                basic.pause(iPause_ms - input.runningTime())
                empfangeneBits.push(empfange1Bit()) // Lichtschranke abfragen
                iPause_ms += n_takt_ms // einen Takt warten, trifft das nächste Bit in der Mitte
            }
            return empfangeneBits
        }
        else {
            return []
        }
    }

    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="empfange Text bis ENTER" weight=7
    export function empfangeText(): string {
        n_escape = false
        let text = ""
        let iAsc: number
        while (true) {
            iAsc = binToAsc(empfange10Bit())
            if (iAsc == 13) {
                text += String.fromCharCode(iAsc)
                break
            } else if (iAsc == -1) {
                text += "|" + iAsc + "|"
                break
            } else {
                text += ascToChr(iAsc)
            }
        }
        return text
    }


    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="10-Bitarray → ASCII Code %bitArray" weight=4
    export function binToAsc(bitArray: boolean[]): number {
        let iDez = 0, iParity = 0, iFehler = 0
        let iExp = 1
        let bBit: boolean
        if (bitArray.length < 10) { // 10 Bit im Array boolean[]
            iFehler = -1
        }
        else {
            for (let i = 0; i <= 9; i++) {
                bBit = bitArray[i]          // aktuelles Bit lesen (negative Logik)
                if (i == 0 && !bBit) {     // [0] Start Bit false - muss true sein (Licht an-true = logisch 0)
                    iFehler = -2
                    break // for
                }
                else if (i >= 1 && i <= 7) { // [1]..[7] Daten Bits (Licht aus-false = logisch 1)
                    if (!bBit) {
                        iParity++ // Parity zählt (Licht aus-false = logisch 1)
                        iDez += iExp
                    }
                    iExp = iExp << 1 // um 1 Bit nach links schieben entspricht *2
                }
                else if (i == 8) {         // [8] Parity Bit
                    if (!bBit) { // Parity zählt (Licht aus-false = logisch 1)
                        iParity++
                    }
                    if (iParity % 2 != 0) { // ungerade Parität - Parity Error
                        iFehler = -3
                        break // for
                    }
                }
                else if (i == 9 && bBit) { // [9] Stop Bit true - muss false sein (Licht aus)
                    iFehler = -4
                    break // for
                }
            }
        }

        if (iFehler == 0)
            return iDez
        else
            return iFehler // -1 Array<10 | -2 Start | -3 Parity | -4 Stop
    }

    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="ASCII Code → ASCII Zeichen %ascByte 32..127 \\|fehler\\|" weight=2
    export function ascToChr(ascByte: number) {
        if (between(ascByte, 32, 127))
            return String.fromCharCode(ascByte)
        else
            return "|" + ascByte + "|"
    }

    // ========== group="Anzeige"

    //% group="Anzeige"
    //% block="Bitarray → Text %bitArray wahr %s1 falsch %s0" weight=3
    // s1.defl="1" s0.defl="0"
    //% expandableArgumentMode="toggle"
    export function binToString(bitArray: boolean[], s1: string, s0: string): string {
        let s = ""
        for (let bit of bitArray)
            s = s + (bit ? s1 : s0)
        return s
    }

    //% group="Anzeige"
    //% block="Fehler Code → Text %fehlerCode" weight=2
    export function fehlerText(fehlerCode: number): string {
        switch (fehlerCode) {
            case -1: return "<10 Bit"
            case -2: return "Start"
            case -3: return "Parity"
            case -4: return "Stop"
            default: return fehlerCode.toString()
        }
    }



    // ========== group="Funktionen"

    //% group="Funktionen" 
    //% block="// %text" weight=6
    export function comment(text: string): void { }

    //% group="Funktionen"
    //% block="%i0 zwischen %i1 und %i2" weight=4
    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }

} // rs232.ts