
//% color=#002050 icon="\uf093" block="RS-232" weight=15
namespace rs232
/* 
    https://de.wikipedia.org/wiki/RS-232
    https://calliope-net.github.io/rs232-e41/
    https://calliope-net.github.io/rs232-e41/rs232.png
*/ {



    // ========== group="Senden: 7 Datenbit, 1 Paritätsbit"

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="ASCII Zeichen → 8-Bitarray %text index %index" weight=5
    export function chrToBin(text: string, index: number) {
        return ascToBin(text.charCodeAt(index))
    }

    //% group="Senden: 7 Datenbit, 1 Paritätsbit"
    //% block="ASCII Code → 8-Bitarray %ascByte" weight=4
    export function ascToBin(ascByte: number) {
        let iParity = 0, bBit: boolean
        let bitArray: boolean[]
        for (let index = 0; index < 7; index++) {
            bBit = ascByte % 2 != 0 // ungerade Zahl - Bit=true
            bitArray.push(bBit) // [0]..[6] 7 Bit
            if (bBit)
                iParity++
            ascByte >> 1 // um 1 Bit nach rechts schieben
        }
        bitArray.push(iParity % 2 != 0) // [7] das 8. Bit Parity
        return bitArray
    }


    // ========== group="Empfang"

    //% group="Empfang: 1 Startbit, 7 Datenbit, 1 Paritätsbit, 1 Stopbit"
    //% block="Bitarray → ASCII Code %bitArray (10 Bit)" weight=2
    export function binToAsc(bitArray: boolean[]) {
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



    // ========== group="Anzeige"

    //% group="Anzeige"
    //% block="Bitarray → Text %bitArray wahr %s1 falsch %s0" weight=3
    // s1.defl="1" s0.defl="0"
    //% expandableArgumentMode="toggle"
    export function bin_toString(bitArray: boolean[], s1: string, s0: string): String {
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