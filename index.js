import express from 'express'
import cors from "cors"

import Avamovie from "./sources/avamovie.js";
import {getCinemeta} from "./utils.js";
import Source from "./sources/source.js";


const addon = express()
addon.use(cors())


const ADDON_PREFIX = "ip"

const MANIFEST = {
    id: 'org.mmmohebi.stremioIrProviders',
    version: '0.0.1',

    name: 'Iran Provider',

    catalogs: [
        {
            name:"AvaMovie",
            type:"movie",
            id:"avamovie_movies",
            extra: [
                {
                    name: "search",
                    isRequired: true
                },
            ]
        },
        {
            name:"AvaMovie",
            type:"series",
            id:"avamovie_series",
            extra: [
                {
                    name: "search",
                    isRequired: true
                },
            ]
        }
    ],
    resources: [
        "catalog",
        {
            "name": "meta",
            "types": [ "series", "movie" ],
            "idPrefixes": [ ADDON_PREFIX ]
        },
        {
            "name": "stream",
            "types": [ "series", "movie" ],
            "idPrefixes": [ ADDON_PREFIX ]
        }
    ],
    types: ['movie',"series"],
}

addon.get('/manifest.json', function (req, res) {
    res.send(MANIFEST)
});

addon.get('/catalog/:type/:id/:extraArgs.json', async function (req, res, next) {
    const args = {
        search:"",
        skip:0,
    }

    if(!!req.params.extraArgs){
        for (const item of decodeURIComponent(req.params.extraArgs).split("&")) {
            const [key, val] = item.split("=")
            args[key] = val
        }
    }

    let data = []

    // avamovie Provider
    if(req.params.id.includes('avamovie')){
        const provider = new Avamovie(process.env.AVAMOVIE_BASEURL)
        data = await provider.search(args.search)

        // append Provider ID prefix
        for (let i = 0; i < data.length; i++) {
            data[i].id = provider.providerID + data[i].id
        }
    }

    data = data.filter(i=> i.type === req.params.type)

    // append addon prefix
    for (let i = 0; i < data.length; i++) {
        data[i].id = ADDON_PREFIX + data[i].id
    }


    res.send({
        "metas": data
    })
});

addon.get('/meta/:type/:id.json', async function (req, res, next) {
    let imdbId = ""

    let providerPrefix = ""

    const providerMovieId = req.params.id.split((new Source).idSeparator)[1]

    // avamovie Provider
    if(req.params.id.includes('avamovie')){
        const provider = new Avamovie(process.env.AVAMOVIE_BASEURL)
        providerPrefix = provider.providerID
        const movieData = await provider.getMovieData(req.params.type, providerMovieId)
        if(!!movieData){
            imdbId = provider.imdbID(movieData)
        }
    }

    let meta = {}
    if (imdbId.length > 0){
        meta = await getCinemeta(req.params.type, imdbId)
    }

    // append addon prefix to series video
    if(req.params.type === "series"){
        for (let i = 0; i < meta.meta.videos.length; i++) {
            meta.meta.videos[i].id = ADDON_PREFIX + providerPrefix + providerMovieId + (new Source).idSeparator +  meta.meta.videos[i].id
        }
    }

    // append addon prefix to movie
    if(req.params.type === "movie"){
        meta.meta.id = ADDON_PREFIX + providerPrefix + providerMovieId + (new Source).idSeparator + meta.meta.id
        meta.meta.behaviorHints.defaultVideoId = meta.meta.id
    }

    return res.send(meta)
});


addon.get('/stream/:type/:id.json', async function (req, res, next) {
    const providerMovieId = req.params.id.split((new Source).idSeparator)[1]
    const imdbId = req.params.id.split((new Source).idSeparator)[2]

    let streams = []

    if(req.params.id.includes('avamovie')){
        const provider = new Avamovie(process.env.AVAMOVIE_BASEURL)
        const movieData = await provider.getMovieData(req.params.type, providerMovieId)
        streams = provider.getLinks(req.params.type, imdbId, movieData)
    }

    return res.send({streams})
});


addon.listen(7000, function () {
    console.log('Add-on Repository URL: http://127.0.0.1:7000/manifest.json');
    return "0.0.0.0"
});



