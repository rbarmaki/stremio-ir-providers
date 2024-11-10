import express from 'express'
import cors from "cors"

import Avamovie from "./sources/avamovie.js";
import {getCinemeta, getSubtitle} from "./utils.js";
import Source from "./sources/source.js";
import {errorHandler} from "./errorMiddleware.js";


const addon = express()
addon.use(cors())
addon.use(errorHandler);


// ------------- init providers ------------- :
// avamovie
const AvamovieProvider = new Avamovie(process.env.AVAMOVIE_BASEURL)
AvamovieProvider.login().then((res) => {
    if (res) {
        console.log(`Avamovie is logged in with token: ${AvamovieProvider.token}, user_id: ${AvamovieProvider.userId}`)
    }
})


const ADDON_PREFIX = "ip"

const MANIFEST = {
    id: 'org.mmmohebi.stremioIrProviders',
    version: '1.0.2',
    contactEmail: "mmmohebi@outlook.com",
    description:"https://github.com/MrMohebi/stremio-ir-providers",
    logo:"",
    name: 'Iran Provider',

    catalogs: [
        {
            name: "AvaMovie",
            type: "movie",
            id: "avamovie_movies",
            extra: [
                {
                    name: "search",
                    isRequired: true
                },
            ]
        },
        {
            name: "AvaMovie",
            type: "series",
            id: "avamovie_series",
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
            "types": ["series", "movie"],
            "idPrefixes": [ADDON_PREFIX]
        },
        {
            "name": "stream",
            "types": ["series", "movie"],
            "idPrefixes": [ADDON_PREFIX]
        },
        {
            "name": "subtitles",
            "types": ["series", "movie"],
            "idPrefixes": [ADDON_PREFIX]
        }
    ],
    types: ['movie', "series"],
}

addon.get('/manifest.json', function (req, res) {
    res.send(MANIFEST)
});

addon.get('/catalog/:type/:id/:extraArgs.json', async function (req, res, next) {
    try {
        const args = {
            search: "",
            skip: 0,
        }

        if (!!req.params.extraArgs) {
            for (const item of decodeURIComponent(req.params.extraArgs).split("&")) {
                const [key, val] = item.split("=")
                args[key] = val
            }
        }

        let data = []

        // avamovie Provider
        if (req.params.id.includes('avamovie')) {
            data = await AvamovieProvider.search(args.search)

            // append Provider ID prefix
            for (let i = 0; i < data.length; i++) {
                data[i].id = AvamovieProvider.providerID + data[i].id
            }
        }

        data = data.filter(i => i.type === req.params.type)

        // append addon prefix
        for (let i = 0; i < data.length; i++) {
            data[i].id = ADDON_PREFIX + data[i].id
        }

        res.send({
            "metas": data
        })
    } catch (e) {
        console.log(e);
        res.send({
            "metas": {}
        })
    }
});

addon.get('/meta/:type/:id.json', async function (req, res, next) {
    try {
        let imdbId = ""

        let providerPrefix = ""

        const providerMovieId = req.params.id.split((new Source).idSeparator)[1]

        // avamovie Provider
        if (req.params.id.includes('avamovie')) {
            providerPrefix = AvamovieProvider.providerID
            const movieData = await AvamovieProvider.getMovieData(req.params.type, providerMovieId)
            if (!!movieData) {
                imdbId = AvamovieProvider.imdbID(movieData)
            }
        }

        let meta = {}
        if (imdbId.length > 0) {
            meta = await getCinemeta(req.params.type, imdbId)
        }


        if (meta.hasOwnProperty("meta")) {
            // append addon prefix to series video
            if (req.params.type === "series") {
                for (let i = 0; i < meta.meta.videos.length; i++) {
                    meta.meta.videos[i].id = ADDON_PREFIX + providerPrefix + providerMovieId + (new Source).idSeparator + meta.meta.videos[i].id
                }
            }

            // append addon prefix to movie
            if (req.params.type === "movie") {
                meta.meta.id = ADDON_PREFIX + providerPrefix + providerMovieId + (new Source).idSeparator + meta.meta.id
                meta.meta.behaviorHints.defaultVideoId = meta.meta.id
            }
        } else {
            console.log("meta is empty!")
        }
        return res.send(meta)

    } catch (e) {
        console.log(e);
        res.send({})
    }
});


addon.get('/stream/:type/:id.json', async function (req, res, next) {
    try {
        const providerMovieId = req.params.id.split((new Source).idSeparator)[1]
        const imdbId = req.params.id.split((new Source).idSeparator)[2]

        let streams = []

        if (req.params.id.includes('avamovie')) {
            const movieData = await AvamovieProvider.getMovieData(req.params.type, providerMovieId)
            streams = AvamovieProvider.getLinks(req.params.type, imdbId, movieData)
        }

        return res.send({streams})

    } catch (e) {
        console.log(e);
        res.send({})
    }
});

addon.get('/subtitles/:type/:id/:extraArgs.json', async function (req, res, next) {
    try {
        const args = {
            videoID: "",
            videoSize: 0,
        }

        if (!!req.params.extraArgs) {
            for (const item of decodeURIComponent(req.params.extraArgs).split("&")) {
                const [key, val] = item.split("=")
                args[key] = val
            }
        }

        const imdbId = req.params.id.split((new Source).idSeparator)[2]

        const data = await getSubtitle(req.params.type, imdbId)

        return res.send(data)
    } catch (e) {
        console.log(e);
        res.send({})
    }
});

addon.listen(7000, function () {
    console.log('Add-on Repository URL: http://127.0.0.1:7000/manifest.json');
    return "0.0.0.0"
});



