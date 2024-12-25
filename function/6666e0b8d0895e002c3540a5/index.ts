import { database, ObjectId } from "@spica-devkit/database";
import * as Api from "../../66d865d0a8b3fe002c03c8c8/.build";

const SERVERS_INFO = process.env.SERVERS_INFO;
const SINGLEPLAY_SERVERS_INFO_BUCKET = process.env.SINGLEPLAY_SERVERS_INFO_BUCKET;

let db;
export async function assignDuel(req, res) {
    // console.time("assignDuel")
    if (!db) db = await database().catch(err => console.log("Error Use Database: ", err));
    const serverInfocollection = db.collection(`bucket_${SERVERS_INFO}`);

    const { referenceNo, duelId, duelData, tokens, serverName } = req.body;
    // console.log(req.body)
    const isAssigned = await serverInfocollection.findOne({ reference_no: referenceNo });

    // console.log("duelData : ", duelData);
    if (isAssigned) {
        // console.timeEnd("assignDuel")
        return res.status(200).send({ canContinue: false })
    }
    if (duelData.user) {
        await singleplayInsertServerInfo(duelData, duelId, tokens, referenceNo, serverName).catch(err => {
                //Duplicate error 
            if (err.code !== 11000) {
                console.error(err);
            }
        });

        return res.status(200).send({ canContinue: true })
    }
    try {
        await insertServerInfo(duelData, duelId, tokens, referenceNo, serverName)
        // console.timeEnd("assignDuel")

        return res.status(200).send({ canContinue: true })
    } catch (err) {
        // console.timeEnd("assignDuel")
        return res.status(200).send({ canContinue: false })
    }
}

async function insertServerInfo(duelData, duelId, tokens, referenceNo, serverName) {
    // console.log("inserServerInfo")
    if (!db) {
        db = await database();
    }
    const insertedObj = {
        duel_id: duelId,
        match_server: serverName,
        user1: duelData["user1"],
        user1_token: tokens[0],
        user2: duelData["user2"],
        user2_token: tokens[1] || "",
        available_to_user_1: true,
        available_to_user_2: true,
        created_at: new Date(),
        user1_ready: false,
        user2_ready: tokens[1] ? false : true,
        reference_no: referenceNo
    };

    return db.collection(`bucket_${SERVERS_INFO}`).insertOne(insertedObj)
}

async function singleplayInsertServerInfo(duelData, duelId, tokens, referenceNo, serverName) {
    const insertedObj = {
        duel_id: duelId,
        match_server: serverName,
        user: duelData["user"],
        user_token: tokens[0],
        created_at: new Date(),
        reference_no: referenceNo
    };
    return Api.insertOneAssignDuels(SINGLEPLAY_SERVERS_INFO_BUCKET, insertedObj)
}