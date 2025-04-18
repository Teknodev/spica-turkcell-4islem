import * as Api from "../../66d865d0a8b3fe002c03c8c8/.build";
const OPERATION_KEY = process.env.OPERATION_KEY;
const USER_BUCKET_ID = process.env.USER_BUCKET_ID;
const PAST_DUELS_BUCKET_ID = process.env.PAST_DUELS_BUCKET_ID;
const SERVERS_INFO = process.env.SERVERS_INFO;

export async function insertPastMatchFromServer(req, res) {
    const db = await Api.useDatabase();

    const usersCollection = db.collection(`bucket_${USER_BUCKET_ID}`);
    const pastDuelsCollection = db.collection(`bucket_${PAST_DUELS_BUCKET_ID}`);

    const { duel, key } = req.body;

    if (key != OPERATION_KEY) return res.status(400).send({ message: "No access" });

    removeServerInfo(duel._id);

    const user = await usersCollection
        .findOne({ _id: Api.toObjectId(duel.user) })
        .catch(err => console.log("ERROR 15", err));
    let userEarnedAward = 0;

    if (duel.user_points >= 350) {
        user.win_count += 1;
        userEarnedAward += duel.user_is_free ? 0 : 2;
    } else {
        user.lose_count += 1;
        userEarnedAward += duel.user_is_free ? 0 : 1;
    }

    await pastDuelsCollection
        .insertOne({
            name: user.name,
            user: duel.user,
            user_answers: duel.user_answers,
            user_points: duel.user_points,
            start_time: Api.toObjectId(duel._id).getTimestamp(),
            end_time: new Date(),
            user_is_free: duel.user_is_free,
            duel_id: String(duel._id),
        })
        .catch(err => console.log("ERROR 17", err));

    // Update user point --->
    usersCollection.findOneAndUpdate(
        {
            _id: Api.toObjectId(duel.user)
        },
        {
            $set: {
                total_point: parseInt(user.total_point) + duel.user_points,
                weekly_point: user.weekly_point + duel.user_points,
                win_count: user.win_count,
                lose_count: user.lose_count,
                total_award: parseInt(user.total_award) + userEarnedAward,
                weekly_award: (user.weekly_award || 0) + userEarnedAward,
            }
        }
    );
    return res.status(200).send({ message: "successful" });
}

async function removeServerInfo(duel_id) {
    const db = await Api.useDatabase();

    const serverInfoCollection = db.collection(`bucket_${SERVERS_INFO}`);
    serverInfoCollection
        .deleteOne({
            duel_id: duel_id
        })
        .catch(err => console.log("ERROR removeServerInfo ", err));
}

export async function removeServerInfoExternal(req, res) {
    const { duel, key } = req.body;
    if (key == OPERATION_KEY) {
        removeServerInfo(String(duel._id));
        return res.status(200).send({ message: "successful" });

    } else {
        return res.status(400).send({ message: "No access" });
    }

}

export async function singlePlayinsertPastMatchAWS(req, res) {
    console.log("singlePlayinsertPastMatch AWS", req.body)
    // if (!db) {
    //     db = await database().catch(err => console.log("ERROR 2", err));
    // }
    const db = await Api.useDatabase();

    const usersCollection = db.collection(`bucket_${USER_BUCKET_ID}`);
    const pastDuelsCollection = db.collection(`bucket_${PAST_DUELS_BUCKET_ID}`);

    const { duel, key } = req.body;

    if (key != OPERATION_KEY) return res.status(400).send({ message: "No access" });

    removeServerInfo(duel._id);
    let userEarnedAward = 0;
    const user = await usersCollection
        .findOne({ _id: Api.toObjectId(duel.user) })
        .catch(err => console.log("ERROR 15", err));;

    if (duel.user_points >= 350) {
        user.win_count += 1;
        userEarnedAward += duel.user_is_free ? 0 : 2;
    } else {
        user.lose_count += 1;
        userEarnedAward += duel.user_is_free ? 0 : 1;
    }


    await pastDuelsCollection
        .insertOne({
            name: user.name,
            user: duel.user,
            user_answers: duel.user_answers,
            user_points: duel.user_points,
            start_time: Api.toObjectId(duel._id).getTimestamp(),
            end_time: new Date(),
            user_is_free: duel.user_is_free,
            duel_id: String(duel._id),
        })
        .catch(err => console.log("ERROR 17", err));

    usersCollection.findOneAndUpdate(
        {
            _id: Api.toObjectId(duel.user)
        },
        {
            $set: {
                total_point: parseInt(user.total_point) + duel.user_points,
                weekly_point: user.weekly_point + duel.user_points,
                win_count: user.win_count,
                lose_count: user.lose_count,
                total_award: parseInt(user.total_award) + userEarnedAward,
                weekly_award: (user.weekly_award || 0) + userEarnedAward,
            }
        }
    );
    return res.status(200).send({ message: "successful" });

}