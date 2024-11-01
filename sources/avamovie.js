import Source from "./source.js";
import Axios from "axios";
import {parse} from "node-html-parser";
import {extractImdbId, getBetweenParentheses} from "../utils.js";

export default class Avamovie extends Source{
    constructor(baseURL) {
        super(baseURL)
        this.providerID = "avamovie" + this.idSeparator
    }

    async search(text) {
        try {
            const res = await Axios.request({
                url: `https://${this.baseURL}/search/?s=${text}`,
                method: "get",
            })
            if(!!res){
                const parsed = parse(res.data)
                const items = []
                for (const item of parsed.querySelectorAll(".item-movie")) {

                    const movie = {
                        name: item.querySelector('.title_en').innerText,
                        poster: "",
                        type:"movie",
                        link:"",
                        id:"",
                        genres: []
                    }
                    if(!!getBetweenParentheses(item.querySelector('.top').getAttribute('style'))){
                        movie.poster = getBetweenParentheses(item.querySelector('.top').getAttribute('style'))
                    }

                    movie.link = item.getElementsByTagName('a')[0].getAttribute('href')
                    movie.type = movie.link.includes("series") ? "series" : "movie"
                    movie.id = movie.link.split("/").filter(i=>!!i).pop()

                    items.push(movie)

                }
                return items
            }
        }catch (e) {
            console.log("ERROR in getting list from avamovie", e)
        }

        return []

    }

    async getMovieData(type, id){
        let url = `https://${this.baseURL}`
        if(type==="series"){
            url += "/series"
        }
        url += `/${id}`
        try {
            const res = await Axios.request({
                url: url,
                method: "get",
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'cookie': process.env.AVAMOVIE_COOKIE,
                    'pragma': 'no-cache',
                    'priority': 'u=0, i',
                    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                }
            })
            if(!!res){
                return res.data
            }
        }catch (e) {
            console.log("ERROR in getting movie from avamovie", e)
        }

        return null
    }

    getMovieLinks(movieData){
        const parsed = parse(movieData)

        const links = []

        for (const dlSection of parsed.querySelectorAll(".dl-row")) {
            const link = {url:"", title:""}

            link.url = dlSection.querySelector(".link-main").getAttribute("href")

            link.title = dlSection.querySelector('.quality').querySelector("strong").innerText + " - "
            link.title += dlSection.querySelector('.encoder').querySelector(".value").innerText + " - "
            link.title += dlSection.querySelector('.size').querySelector(".value").innerText
            if(dlSection.querySelectorAll(".link-sound").length > 0){
                link.title +=  " - " + "(DUBBED)"
            }

            links.push(link)
        }

        return links

    }

    getSeriesLinks(movieData, imdbId){
        const parsed = parse(movieData)
        const season = "S" + (+imdbId.split(":")[1]).toLocaleString("en-US", {minimumIntegerDigits:2})
        const episode = "E" + (+imdbId.split(":")[2]).toLocaleString("en-US", {minimumIntegerDigits:2})

        const links = []

        for (const item of parsed.querySelectorAll(".dl")) {
            const link = {url:"", title:""}
            link.url = item.querySelector(".main").getAttribute("href")
            if(!!link.url && link.url.includes(season+episode)){
                const url = URL.parse(link.url)
                link.title = url.pathname.split("/").pop()
                links.push(link)
            }
        }

        return links
    }

    getLinks(type, imdbId, movieData){
        if(type === "movie"){
            return this.getMovieLinks(movieData)
        }

        if(type === "series"){
            return this.getSeriesLinks(movieData, imdbId)
        }

    }

    imdbID(movieData){
        return extractImdbId(movieData)
    }

}