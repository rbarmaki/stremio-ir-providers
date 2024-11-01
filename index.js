import express from 'express'
import cors from "cors"

import Avamovie from "./sources/avamovie/api.js";

const addon = express()

addon.use(cors())

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
    resources: ['stream', "catalog", "meta"],
    types: ['movie', "catalog"],
    idPrefixes: ['ip']
}

addon.get('/manifest.json', function (req, res) {
    res.send(MANIFEST)
});

addon.get('/catalog/:type/:id/:extraArgs.json', async function (req, res, next) {
    console.log();
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
        const avamovie = new Avamovie('avamovie44.top')
        data = await avamovie.search(args.search)
    }

    data = data.filter(i=> i.type === req.params.type)
    console.log(data);
    console.log(args)
    res.send({
        "metas": data
    })
});


addon.listen(7000, function () {
    console.log('Add-on Repository URL: http://127.0.0.1:7000/manifest.json');
});



