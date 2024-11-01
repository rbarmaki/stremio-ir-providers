import Source from "../source.js";
import Axios from "axios";
import {parse} from "node-html-parser";
import {getBetweenParentheses} from "../utils.js";

export default class Avamovie extends Source{
    constructor(baseURL) {
        super(baseURL)
    }
    async search(text) {
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
        }else {
            return []
        }

    }

}