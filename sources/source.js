
export default class Source {
    idSeparator = "___"
    constructor(baseURL) {
        if(this.constructor === Source) {
            throw new Error("Class is of abstract type and can't be instantiated");
        }
        this.baseURL = baseURL;
        this.providerID = "NOT_SET" + this.idSeparator;
    }

    async search(text){}
    async imdbID(type, id){}
}