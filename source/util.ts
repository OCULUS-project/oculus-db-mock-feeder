export namespace Util {
    export function log(msg: string) {
        console.log(time() + " - " + msg)
    }

    function time() {
        let date = new Date()
        let time = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2) + ':' + pad(date.getSeconds(), 2) + ':' + pad(date.getMilliseconds(), 3);
        return time
    }

    /** pad number with zeros  until it achieves given size */
    export function pad(input: number, size: number) {
        var s = String(input)
        while (s.length < size) {s = "0" + s;}
        return s;
    }

    /** get random element from collection */
    export function random<E> (collection: E[]): E {
        return collection[Math.floor(Math.random() * collection.length)]
    }
}
