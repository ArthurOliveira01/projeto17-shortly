import bcrypt from "bcrypt";
import { db } from "../database/database.js";
import { userSchema, loginSchema } from "../schemas/userSchema.js";
import { v4 as uuid } from "uuid";


export async function signup(req, res){
    const {name, email, password, confirmPassword} = req.body;

    const validation = userSchema.validate(req.body);
    if(validation.error){
        return res.sendStatus(422);
    }

    if(password !== confirmPassword){
        return res.status(422).send('Senhas diferentes');
    }
    try {
        const exists = await db.query(`SELECT * FROM accounts WHERE email = '${email}';`);
        if(exists.rows[0]){
            return res.status(409).send('E-mail já cadastrado');
        }
        const passwordHash = bcrypt.hashSync(password, 10);
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');
        await db.query(`INSERT INTO accounts (name, email, password, createdat) VALUES('${name}', '${email}', '${passwordHash}', '${timestamp}');`);
        return res.status(201).send('Sucesso');
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function signin(req, res){
    const {email, password} = req.body;
    const validation = loginSchema.validate(req.body);
    if(validation.error){
        console.log(validation.error);
        return res.sendStatus(422);
    }
    try {
        const exists = await db.query(`SELECT * FROM accounts WHERE email = '${email}';`);
        if(!exists.rows[0]){
            return res.status(401).send('Esse e-mail não está cadastrado');
        }
        const hash = exists.rows[0].password;
        const compare = bcrypt.compareSync(password, hash);
        if(!compare){
            return res.status(401).send('Senha incorreta');
        }
        const token = uuid();
        const userId = exists.rows[0].id;
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');
        await db.query(`INSERT INTO tokens (token, userId, createdat) VALUES('${token}', '${userId}', '${timestamp}');`);
        const object = {
            token: token
        }
        return res.status(200).send(object);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getinfoUser(req, res){
    const  authorization  = req.headers.authorization;

    if(authorization === undefined){
        return res.sendStatus(401);
    }
    const token = authorization.replace("Bearer ", "");

    try {
        let array = [];
        let totalvisits = 0;
        const exists = await db.query(`SELECT * FROM tokens WHERE token = '${token}';`);
        if(!exists.rows[0]){
            return res.sendStatus(401);
        }
        const userId = exists.rows[0].userid;
        const user = await db.query(`SELECT * FROM accounts WHERE id = '${userId}';`);
        const urls= await db.query(`SELECT * FROM urls WHERE userid = '${userId}';`);
        for(let i = 0; i < urls.rowCount; i++){
            const aux = {
                id: urls.rows[i].id,
			    shortUrl: urls.rows[i].shorten,
			    url: urls.rows[i].url,
			    visitCount: urls.rows[i].visits
            }
            array.push(aux);
            totalvisits += urls.rows[i].visits;
        }
        const object = {
            id: exists.rows[0].id,
            name: user.rows[0].name,
            visitCount: totalvisits, 
            shortenedUrls: array
        }
        return res.status(200).send(object);
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function getRanking(req, res){
    try {
        let users_ids = [];
        let username = []
        const users = await db.query(`SELECT * FROM accounts`);
        for(let i = 0; i < users.rowCount; i++){
            users_ids.push(users.rows[i].id);
            username.push(users.rows[i].name);
        }
        let quantity = [];
        for(let i = 0; i < users_ids.length; i++){
            const urls = await db.query(`SELECT * FROM urls WHERE userid = '${users_ids[i]}';`);
            const total_links = urls.rowCount;
            let totalvisits = 0;
            for(let j = 0; j < total_links; j++){
                totalvisits += urls.rows[j].visits;
            }
            const object = {
                linksCount: total_links,
                visitCount: totalvisits,
                index: i
            }
            quantity.push(object);
        }

        quantity.sort((a, b) => {
            return -a.visitCount + b.visitCount;
        });
        
        let answer = [];
        quantity = quantity.slice(0, 10);
        for(let i = 0; i < quantity.length; i++){
            const object = {
                id: users_ids[quantity[i].index],
                name: username[quantity[i].index],
                linksCount: quantity[i].linksCount,
                visitCount: quantity[i].visitCount
            }
            answer.push(object);
        }
        return res.status(200).send(answer);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}