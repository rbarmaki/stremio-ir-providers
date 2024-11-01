
export default class Source {
    idSeparator = "___"
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.providerID = "NOT_SET" + this.idSeparator;
    }

    async search(text){}
    async imdbID(type, id){}
}