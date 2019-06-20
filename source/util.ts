export namespace Util {
    export function log(msg: string) {
        console.log(time() + " - " + msg)
    }

    function time() {
        let date = new Date()
        let time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds();
        return time
    }
}
