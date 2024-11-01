import Axios from "axios";

export function getBetweenParentheses(str){
    const regex = /\(([^)]+)\)/;
    const match = str.match(regex);

    return match ? match[1] : null;
}

export function extractImdbId(url) {
    const regex = /https:\/\/www\.imdb\.com\/title\/(.*?)\//;
    const match = url.match(regex);
    return match ? match[1] : null; // Returns the extracted ID or null if no match
}

export async function getCinemeta(type, imdbId){
    try {
        const res = await Axios.request({
            url: `https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`,
            method: "get",
        })
        if (!!res) {
            return res.data
        }
    }catch (e) {
        console.log("ERROR getting cinemeta=> ", e)
    }
    return null
}

export async function getSubtitle(type, imdbId){
    try {
        const res = await Axios.request({
            url: `https://opensubtitles-v3.strem.io/subtitles/${type}/${imdbId}.json`,
            method: "get",
        })
        if(!!res){
            return res.data
        }
    }catch (e) {
        console.log("ERROR getting subtitle=> ", e)
    }

    return null
}