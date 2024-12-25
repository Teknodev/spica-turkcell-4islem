import { database, ObjectId } from "@spica-devkit/database";
import axios from 'axios'

const MATCHMAKING_BUCKET_ID = process.env.MATCHMAKING_BUCKET_ID;
const DUEL_BUCKET_ID = process.env.DUEL_BUCKET_ID;
const USER_BUCKET_ID = process.env.USER_BUCKET_ID;
const BOT_BUCKET_ID = process.env.BOT_BUCKET_ID;
const SERVERS_INFO = process.env.SERVERS_INFO;

let db;

export async function matchmaker() {
    // DATABASE
    if (!db) {
        db = await database();
    }
    const matchmaking_collection = db.collection(`bucket_${MATCHMAKING_BUCKET_ID}`);
    const duel_collection = db.collection(`bucket_${DUEL_BUCKET_ID}`);
    const users_collection = db.collection(`bucket_${USER_BUCKET_ID}`);
    const bots_collection = db.collection(`bucket_${BOT_BUCKET_ID}`);

    setInterval(async () => {
        let match_making_users = await matchmaking_collection
            .aggregate([
                {
                    $set: {
                        _id: {
                            $toString: "$_id"
                        },
                        user: {
                            $toObjectId: "$user"
                        }
                    }
                },
                {
                    $lookup: {
                        from: `bucket_${USER_BUCKET_ID}`,
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
                },
                {
                    $set: {
                        "user._id": {
                            $toString: "$user._id"
                        }
                    }
                }
            ])
            .toArray()
            .catch(err => console.log("ERROR 1", err));

        // let { matched_with_user, unmatched_with_user } = seperateMatchingsUsers([
        //     ...match_making_users
        // ]);

        // let { matched_with_bots, unmatched_with_bots } = seperateMatchingWithBot([
        //     ...unmatched_with_user
        // ]);

        // // 1 - add mathced users to ->> duel ->> delete from ->> matchmaking bucket
        // let duels_with_user_array = createDuelObjectsWithUser([...matched_with_user]);
        // if (duels_with_user_array.length > 0) {
        //     requestForANewGame(duels_with_user_array[0]);
        //     // await duel_collection.insertMany(duels_with_user_array);
        // }




        // // requestForANewGame(duels_with_user_array[0])


        // let delete_match_with_user_filter = matchedWithUserDeleteFilter([...matched_with_user]);
        // await matchmaking_collection.deleteMany(delete_match_with_user_filter);

        // 2 - get random bot ->> add matched users(matched with bot) to ->> duel ->> delete these users from ->> matchmaking bucket
        // if (match_making_users.length > 0) {
        //     console.log("match_making_users", match_making_users)
        // }
        let randomBot = await bots_collection
            .aggregate([{ $sample: { size: 1 } }])
            .toArray()
            .catch(err => console.log("ERROR", err));

        let bot = await users_collection
            .findOne({ _id: randomBot[0]._id })
            .catch(err => console.log("ERROR 2", err));


        // let duels_with_bots_array = createDuelObjectsWithBot([...matched_with_bots], bot);
        let duels_with_bots_array = createDuelObjectsWithBot([...match_making_users], bot);



        if (duels_with_bots_array.length > 0)
            // if (duels_with_bots_array[0].user1 == "6656deacd0895e002c203229" || duels_with_bots_array[0].user1 == "66586b3ad0895e002c232f8d" || duels_with_bots_array[0].user1 == "665886a2d0895e002c237a4f" || duels_with_bots_array[0].user1 == "665886eed0895e002c237ae0") {
            duels_with_bots_array.forEach(duel => {
                requestForANewGame(duel)
            })
        // requestForANewGame(duels_with_bots_array[0]);

        // } else {
        //     await duel_collection.insertMany(duels_with_bots_array);
        // console.log("duels_with_bots_array", duels_with_bots_array)

        // }



        // let delete_match_with_bot_filter = nonMatchedWithUserDeleteFilter([...matched_with_bots]);
        let delete_match_with_bot_filter = nonMatchedWithUserDeleteFilter([...match_making_users]);

        await matchmaking_collection.deleteMany(
            delete_match_with_bot_filter
        );

        // 3- change (time and) elo of unmatched ->> delete these users from ->> matchmaking bucket ->> insert updated users to ->> matchmaking bucket

        // let delete_unmatch_with_bots_filter = nonMatchedWithUserDeleteFilter([
        //     ...unmatched_with_bots
        // ]);

        /*
        UPDATE (new update method)
        */

        // await matchmaking_collection.updateMany(delete_unmatch_with_bots_filter, {
        //     $inc: { max_elo: 20, min_elo: -20 }
        // });
    }, 5000);
}

// DATA MANIPULATION FUNCTIONS
function createDuelObjectsWithUser(matchmaking_users) {
    let duel_array = [];
    let current_date = new Date();

    for (const matchmaking_user of matchmaking_users) {
        duel_array.push({
            user1: matchmaking_user[0].user._id,
            user2: matchmaking_user[1].user._id,
            user1_ready: false,
            user2_ready: false,
            user1_ingame: false,
            user2_ingame: false,
            created_at: current_date,
            user1_is_free: !!!matchmaking_user[0].user.available_play_count,
            user2_is_free: !!!matchmaking_user[1].user.available_play_count,
            user1_life: !!!matchmaking_user[0].user.available_play_count ? 0 : 3,
            user2_life: !!!matchmaking_user[1].user.available_play_count ? 0 : 3,
            user1_points: 0,
            user2_points: 0,
            duel_type: 0
        });
    }

    return duel_array;
}

function createDuelObjectsWithBot(matchmaking_users, bot) {
    let duel_array = [];
    let current_date = new Date();
    for (const matchmaking_user of matchmaking_users) {
        duel_array.push({
            user1: matchmaking_user.user._id,
            user2: bot._id.toString(),
            user1_ready: false,
            user2_ready: true,
            user1_ingame: false,
            user2_ingame: true,
            created_at: current_date,
            user1_is_free: !!!matchmaking_user.user.available_play_count,
            user2_is_free: false,
            user1_life: !!!matchmaking_user.user.available_play_count ? 0 : 3,
            user2_life: 3,
            user1_points: 0,
            user2_points: 0,
            duel_type: 1
        });
    }

    return duel_array;
}

function matchedWithUserDeleteFilter(matched_with_users) {
    let in_array = [];

    for (const matched_with_user of matched_with_users) {
        in_array.push(ObjectId(matched_with_user[0]._id));
        in_array.push(ObjectId(matched_with_user[1]._id));
    }

    return {
        _id: {
            $in: in_array
        }
    };
}

function nonMatchedWithUserDeleteFilter(matchmaking_users) {
    let in_array = [];

    // use map please

    for (const matchmaking_user of matchmaking_users) {
        in_array.push(ObjectId(matchmaking_user._id));
    }

    return {
        _id: {
            $in: in_array
        }
    };
}

// HELPER FUNCTIONs

function seperateMatchingsUsers(matchmaking_users) {
    let matched = [];
    let unmatched = [];

    // new method
    // --set matched
    for (let matchmaking_user1 of matchmaking_users) {
        // 1-if first user is matched
        if (!inMatched(matchmaking_user1, matched)) {
            for (let matchmaking_user2 of matchmaking_users) {
                // 2-if second user is matched
                if (
                    !inMatched(matchmaking_user2, matched) &&
                    matchmaking_user1._id != matchmaking_user2._id
                ) {
                    if (canMatched(matchmaking_user1, matchmaking_user2)) {
                        // 3-if both user not is matched
                        if (
                            !inMatched(matchmaking_user1, matched) &&
                            !inMatched(matchmaking_user2, matched)
                        ) {
                            matched.push([matchmaking_user1, matchmaking_user2]);
                        }
                    }
                }
            }
        }
    }

    // --set unmatched
    for (let matchmaking_user of matchmaking_users) {
        if (!inMatched(matchmaking_user, matched)) {
            unmatched.push(matchmaking_user);
        }
    }

    return {
        matched_with_user: matched,
        unmatched_with_user: unmatched
    };
}

function seperateMatchingWithBot(matchmaking_users) {
    let matched_with_bots = [];
    let unmatched_with_bots = [];

    // use find

    for (let matchmaking_user of matchmaking_users) {
        let now = new Date();
        let ending_time = new Date(matchmaking_user.date);

        // time passed
        if (ending_time < now) {
            //add with bots array and remove from unmatched users
            matched_with_bots.push(matchmaking_user);
            // matchmaking_users = removeObject(matchmaking_user, matchmaking_users);
        } else {
            unmatched_with_bots.push(matchmaking_user);
        }
    }

    return {
        matched_with_bots: matched_with_bots,
        unmatched_with_bots: unmatched_with_bots
    };
}

function removeObject(object, array) {
    let index = getIndexOfObject(object, array);
    if (index != -1) array.splice(index, 1);

    return array;
}

function getIndexOfObject(object, array) {
    var index = array
        .map(function (item) {
            return item._id;
        })
        .indexOf(object._id);

    return index;
}

//check user is in the already matched array or not
function inMatched(matchmaking_user, matched) {
    let response = false;

    /* user -> array find */
    // or use normal for and break when find it

    for (const match of matched) {
        if (match[0]._id == matchmaking_user._id || match[1]._id == matchmaking_user._id) {
            response = true;
            break;
        }
    }

    return response;
}

function canMatched(matchmaking_user1, matchmaking_user2) {
    let response;

    if (
        matchmaking_user1.min_elo <= matchmaking_user2.user.elo &&
        matchmaking_user2.user.elo <= matchmaking_user1.max_elo
    ) {
        response = true;
    } else {
        response = false;
    }

    return response;
}
async function requestForANewGame(data) {
    // console.log("@requestForANewGame")
    // console.log("data: ", data);
    data["user1"] = String(data.user1);
    data["user2"] = String(data.user2);
    if (!data.user1 || !data.user2) {
        console.error("!data.user1 || !data.user2")
    }
    const users = [String(data.user1)];
    if (data.player_type == 0) {
        users.push(String(data.user2));
    }

    // !TODO should send this request to the message broker
    // https://vodafone.queue.spicaengine.com/message?topic_id=657310d3f1bac9002c940b22
    // https://vodafone-s1-6b082.hq.spicaengine.com/api/fn-execute/new-game-listener
    const requestData = {
        referenceNo: String(Date.now()),
        service: 'tcell_4islem',
        data: data,
        users: users
    };
    axios.post('https://vodafone.queue.spicaengine.com/message?topic_id=657310d3f1bac9002c940b22', requestData)
        .catch(error => {
            console.error('Error:', error);
        });
}

// export async function assignDuel(req, res) {
//     if (!db) db = await database().catch(err => console.log("Error Use Database: ", err));
//     const serverInfocollection = db.collection(`bucket_${SERVERS_INFO}`);

//     const { referenceNo, duelId, duelData, tokens, serverName } = req.body;
//     // console.log(req.body)
//     const isAssigned = await serverInfocollection.findOne({ reference_no: referenceNo });
//     // console.log("isAssigned : ", isAssigned);
//     if (isAssigned) {
//         return res.status(200).send({ canContinue: false })
//     }

//     try {
//         await insertServerInfo(duelData, duelId, tokens, referenceNo, serverName)
//         return res.status(200).send({ canContinue: true })
//     } catch (err) {
//         return res.status(200).send({ canContinue: false })
//     }
// }

// async function insertServerInfo(duelData, duelId, tokens, referenceNo, serverName) {
//     // console.log("inserServerInfo")
//     if (!db) {
//         db = await database();
//     }
//     const insertedObj = {
//         duel_id: duelId,
//         match_server: serverName,
//         user1: duelData["user1"],
//         user1_token: tokens[0],
//         user2: duelData["user2"],
//         user2_token: tokens[1] || "",
//         available_to_user_1: true,
//         available_to_user_2: true,
//         created_at: new Date(),
//         user1_ready: false,
//         user2_ready: tokens[1] ? false : true,
//         reference_no: referenceNo
//     };

//     return db.collection(`bucket_${SERVERS_INFO}`).insertOne(insertedObj).catch(err => console.log(err))
// }