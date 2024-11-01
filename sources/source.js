
export default class Source {
    idSeparator = "___"
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.providerID = "NOT_SET" + this.idSeparator;
    }

    async search(text){}
    async getMovieData(type, id){}
    getMovieLinks(movieData){}
    getSeriesLinks(movieData, imdbId){}
    getLinks(type, imdbId, movieData){}
    imdbID(type, id){}
}