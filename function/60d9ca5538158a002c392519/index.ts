import { database } from "@spica-devkit/database";
import * as Identity from "@spica-devkit/identity";

var jwt = require("jsonwebtoken");

const MATCHMAKING_BUCKET_ID = process.env.MATCHMAKING_BUCKET_ID;
const USER_BUCKET_ID = process.env.USER_BUCKET_ID;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

let db;

export async function addMatchMaking(req, res) {
    // console.time("addMatchMaking")
    let token = getToken(req.headers.get("authorization"));

    let token_object = tokenVerified(token);

    if (token_object.error) {
        return res.status(400).send({ message: "Token is not verified." });
    }

    let decoded_token = token_object.decoded_token;

    if (!db) db = await database();

    const users_collection = db.collection(`bucket_${USER_BUCKET_ID}`);
    const matchmaking_collection = db.collection(`bucket_${MATCHMAKING_BUCKET_ID}`);

    const { user, prize_user } = req.body;
    console.log("new flow: ", prize_user);
    // console.log("user", user)
    let user_object = await users_collection
        .findOne({ identity: decoded_token._id })
        .catch(err => console.log("ERROR 1", err));
    // console.timeEnd("addMatchMaking")

    if (user_object._id != user) return res.status(400).send({ message: "Invalid operation for current user." });

    // if (user_object.can_play) {
    if (user_object.available_play_count > 0 || user_object.free_play) {
        // console.time("addMatchMaking")


        let current_date = new Date(Date.now()).toISOString();

        await matchmaking_collection.updateOne(
            { user: user },
            {
                $set: {
                    user: user,
                    date: current_date
                }
            },
            { upsert: true }
        )

        let matchmaking_object = await matchmaking_collection
            .findOne({ user: user })
            .catch(err => console.log("ERROR 2", err));
        // console.log("matchmaking_object", matchmaking_object)
        // console.timeEnd("addMatchMaking")
        return res.status(200).send(matchmaking_object);
    }
    return res.status(400).send({ message: "User has no available games" });
    //If last payment confirmation is success or fail, call a new payment confirmation
    //else return the pending confirmation result

}

// -----HELPER FUNCTION-----
function getToken(token) {
    if (token) {
        token = token.split(" ")[1];
    } else {
        token = "";
    }

    return token;
}
function tokenVerified(token) {
    /* -request object
        error: true | false,
        decoded_token: token
     */

    let response_object = {
        error: false
    };

    let decoded = "";

    try {
        decoded = jwt.verify(token, `${JWT_SECRET_KEY}`);

        response_object.decoded_token = decoded;
    } catch (err) {
        response_object.error = true;
    }

    return response_object;
}