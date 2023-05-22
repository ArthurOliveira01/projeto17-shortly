import { db } from "../database/database.js";
import { urlSchema } from "../schemas/urlSchema.js";
import { userSchema } from "../schemas/userSchema.js";
import { nanoid } from "nanoid";

export async function postURL(req, res){
    const  authorization  = req.headers.authorization;
    const { url } = req.body;  

    if(authorization === undefined){
        return res.sendStatus(401);
    }

    const validation = urlSchema.validate(url);
    if(validation.error){
        console.log(validation.error.message)
        return res.sendStatus(422);
    }
    const token = authorization.replace("Bearer ", "");
    try {
        const exists = await db.query(`SELECT * FROM tokens WHERE token = '${token}';`);
        if(!exists.rows[0]){
            return res.sendStatus(401);
        }
        const short = nanoid(8);
        const userId = exists.rows[0].userid;
        console.log(exists.rows[0]);
        const insert = await db.query(`INSERT INTO urls (url, shorten, userId, createdat) VALUES('${url}', '${short}', '${userId}', CURRENT_TIME) RETURNING id;`);
        console.log(insert.rows[0]);
        const id = insert.rows[0].id;
        const response = {
            id: id,
            shortUrl: short
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getByIdUrl(req, res){
    const { id } = req.params;
    try {
        const exists = await db.query(`SELECT * FROM urls WHERE id = '${id}';`);
        if(!exists.rows[0]){
            return res.sendStatus(404);
        }
        const ids = exists.rows[0].id;
        const shorten = exists.rows[0].shorten;
        const url = exists.rows[0].url;
        const object = {
            id: ids,
            shortUrl: shorten,
            url: url
        }
        return res.status(200).send(object);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}