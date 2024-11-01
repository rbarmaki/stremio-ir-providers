
export default class Source {
    constructor(baseURL) {
        if(this.constructor === Source) {
            throw new Error("Class is of abstract type and can't be instantiated");
        }
        this.baseURL = baseURL;
    }

    async search(text){}
}