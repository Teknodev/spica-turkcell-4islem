import * as Bucket from "@spica-devkit/bucket";
import { database, ObjectId } from "@spica-devkit/database";

const SECRET_API_KEY = process.env.SECRET_API_KEY;
const DUEL_ANSWERS_BUCKET_ID = process.env.DUEL_ANSWERS_BUCKET_ID;
const DUEL_BUCKET_ID = process.env.DUEL_BUCKET_ID;
const PAST_DUELS_BUCKET_ID = process.env.PAST_DUELS_BUCKET_ID;
const USER_BUCKET_ID = process.env.USER_BUCKET_ID;
const SERVERS_INFO = process.env.SERVERS_INFO;
const OPERATION_KEY = process.env.OPERATION_KEY;

let db, usersCollection;

export async function checkFinishedDuels() {
    if (!db) {
        db = await database();
    }
    Bucket.initialize({ apikey: SECRET_API_KEY });
    usersCollection = db.collection(`bucket_${USER_BUCKET_ID}`);

    const t = new Date();
    t.setSeconds(t.getSeconds() - 130);

    const finishedDuels = await db
        .collection(`bucket_${DUEL_BUCKET_ID}`)
        .aggregate([
            {
                $match: {
                    $and: [{ created_at: { $exists: true } }, { created_at: { $lt: t } }]
                }
            },
            {
                $set: {
                    _id: {
                        $toString: "$_id"
                    },
                    user1: {
                        $toObjectId: "$user1"
                    },
                    user2: {
                        $toObjectId: "$user2"
                    }
                }
            },
            {
                $lookup: {
                    from: `bucket_${USER_BUCKET_ID}`,
                    localField: "user1",
                    foreignField: "_id",
                    as: "user1"
                }
            },
            {
                $unwind: { path: "$user1", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: `bucket_${USER_BUCKET_ID}`,
                    localField: "user2",
                    foreignField: "_id",
                    as: "user2"
                }
            },
            {
                $unwind: { path: "$user2", preserveNullAndEmptyArrays: true }
            },
            {
                $set: {
                    "user1._id": {
                        $toString: "$user1._id"
                    },
                    "user2._id": {
                        $toString: "$user2._id"
                    }
                }
            }
        ])
        .toArray()
        .catch(async e => {
            db = await database();
        });

    if (finishedDuels) {
        for (let duel of finishedDuels) {
            let duelId = duel._id.toString();

            const pastDuel = await db
                .collection(`bucket_${PAST_DUELS_BUCKET_ID}`)
                .find({ duel_id: duelId })
                .toArray();


            if (!pastDuel.length && duel.winner == 0) {
                let user1EarnedAward = 0;
                let user2EarnedAward = 0;

                // if both are winner
                if (duel.user1_points == duel.user2_points) {
                    duel.winner = 3;
                    duel.user1_points += 100;
                    duel.user2_points += 100;

                    duel.user1.win_count += 1;
                    user1EarnedAward += duel.user1_is_free ? 0 : 2;
                    duel.user1.elo += 25;

                    if (!duel.user2.bot) {
                        user2EarnedAward += duel.user2_is_free ? 0 : 2;
                        duel.user2.win_count += 1;
                        duel.user2.elo += 25;
                    }
                }
                // if just user1 is winner
                else if (duel.user1_points > duel.user2_points) {
                    duel.winner = 1;
                    duel.user1_points += 100;
                    duel.user1.win_count += 1;
                    user1EarnedAward += duel.user1_is_free ? 0 : 2;
                    duel.user1.elo += 25;
                    if (!duel.user2.bot) {
                        user2EarnedAward += duel.user2_is_free ? 0 : 1;
                        duel.user2.lose_count += 1;
                        duel.user2.elo = Math.max(duel.user2.elo - 25, 0);
                    }
                }
                // if just user2 is winner
                else if (duel.user1_points < duel.user2_points) {
                    duel.winner = 2;
                    duel.user2_points += 100;

                    if (!duel.user2.bot) {
                        duel.user2.win_count += 1;
                        user2EarnedAward += duel.user2_is_free ? 0 : 2;
                        duel.user2.elo += 25;
                    }
                    duel.user1.lose_count += 1;
                    user1EarnedAward += duel.user1_is_free ? 0 : 1;
                    duel.user1.elo = Math.max(duel.user1.elo - 25, 0);
                }

                await db
                    .collection(`bucket_${PAST_DUELS_BUCKET_ID}`)
                    .insertOne({
                        name: duel.user1.name + " vs " + duel.user2.name,
                        user1: duel.user1._id,
                        user2: duel.user2._id,
                        winner: duel.winner,
                        user1_answers: duel.user1_answers ? duel.user1_answers : [],
                        user2_answers: duel.user2_answers ? duel.user2_answers : [],
                        user1_points: duel.user1_points,
                        user2_points: duel.user2_points,
                        start_time: duel.created_at,
                        end_time: new Date(),
                        duel_type: duel.duel_type,
                        points_earned: duel.user1_points + duel.user2_points,
                        user1_is_free: duel.user1_is_free,
                        user2_is_free: duel.user2_is_free,
                        duel_id: duelId
                    })
                    .catch(err => console.log("ERROR 5", err));

                // Update users point --->
                await usersCollection
                    .findOneAndUpdate(
                        {
                            _id: ObjectId(duel.user1._id)
                        },
                        {
                            $set: {
                                total_point: parseInt(duel.user1.total_point) + duel.user1_points,
                                weekly_point: duel.user1.weekly_point + duel.user1_points,
                                win_count: duel.user1.win_count,
                                lose_count: duel.user1.lose_count,
                                total_award: parseInt(duel.user1.total_award) + user1EarnedAward,
                                weekly_award: (duel.user1.weekly_award || 0) + user1EarnedAward,
                                elo: duel.user1.elo
                            }
                        }
                    )
                    .catch(err => console.log("ERROR 3", err));

                await usersCollection
                    .findOneAndUpdate(
                        {
                            _id: ObjectId(duel.user2._id)
                        },
                        {
                            $set: {
                                total_point: parseInt(duel.user2.total_point) + duel.user2_points,
                                weekly_point: duel.user2.weekly_point + duel.user2_points,
                                win_count: duel.user2.win_count,
                                lose_count: duel.user2.lose_count,
                                total_award: parseInt(duel.user2.total_award) + user2EarnedAward,
                                weekly_award: (duel.user2.weekly_award || 0) + user2EarnedAward,
                                elo: duel.user2.elo
                            }
                        }
                    )
                    .catch(err => console.log("ERROR 4", err));
                // Update users point end <---
            }

            await db
                .collection(`bucket_${DUEL_BUCKET_ID}`)
                .deleteOne({
                    _id: ObjectId(duelId)
                })
                .then(data => { })
                .catch(err => console.log("error while deleteOne _id: ObjectId(duelId)", err));
        }
    }
}

export async function insertPastMatchFromServerMultiplayer(req, res) {
    if (!db) {
        db = await database().catch(err => console.log("ERROR 2", err));
    }
    // console.log("@insertPastMatchFromServer")


    const usersCollection = db.collection(`bucket_${USER_BUCKET_ID}`);
    const pastDuelsCollection = db.collection(`bucket_${PAST_DUELS_BUCKET_ID}`);

    const { duel, key } = req.body;
    // console.log("Duel data: ", duel);
    if (key == OPERATION_KEY) {
        removeServerInfo(duel._id);
        // console.log("duel", duel)
        const user1 = await usersCollection
            .findOne({ _id: ObjectId(duel.user1) })
            .catch(err => console.log("ERROR 15", err));
        const user2 = await usersCollection
            .findOne({ _id: ObjectId(duel.user2) })
            .catch(err => console.log("ERROR 16", err));



        let user1EarnedAward = 0;
        let user2EarnedAward = 0;

        // if both are winner
        if (duel.user1_points == duel.user2_points) {
            duel.winner = 3;
            duel.user1_points += 100;
            duel.user2_points += 100;

            user1.win_count += 1;
            user1EarnedAward += duel.user1_is_free ? 0 : 2;
            user1.elo += 25;

            if (!user2.bot) {
                user2EarnedAward += duel.user2_is_free ? 0 : 2;
                user2.win_count += 1;
                user2.elo += 25;
            }
        }
        // if just user1 is winner
        else if (duel.user1_points > duel.user2_points) {
            duel.winner = 1;
            duel.user1_points += 100;
            user1.win_count += 1;
            user1EarnedAward += duel.user1_is_free ? 0 : 2;
            user1.elo += 25;
            if (!user2.bot) {
                user2EarnedAward += duel.user2_is_free ? 0 : 1;
                user2.lose_count += 1;
                user2.elo = Math.max(user2.elo - 25, 0);
            }
        }
        // if just user2 is winner
        else if (duel.user1_points < duel.user2_points) {
            duel.winner = 2;
            duel.user2_points += 100;

            if (!user2.bot) {
                user2.win_count += 1;
                user2EarnedAward += duel.user2_is_free ? 0 : 2;
                user2.elo += 25;
            }
            user1.lose_count += 1;
            user1EarnedAward += duel.user1_is_free ? 0 : 1;
            user1.elo = Math.max(user1.elo - 25, 0);
        }

        const pastMatch = await pastDuelsCollection
            .insertOne({
                name: user1.name + " vs " + user2.name,
                user1: duel.user1,
                user2: duel.user2,
                winner: duel.winner,
                user1_answers: duel.user1_answers,
                user2_answers: duel.user2_answers || [],
                user1_points: duel.user1_points,
                user2_points: duel.user2_points,
                start_time: ObjectId(duel._id).getTimestamp(),
                end_time: new Date(),
                duel_type: duel.duel_type,
                points_earned: duel.user1_points + duel.user2_points,
                user1_is_free: duel.user1_is_free,
                user2_is_free: duel.user2_is_free,
                duel_id: String(duel._id),
            })
            .catch(err => console.log("ERROR 17", err));

        // Update users point --->
        usersCollection.findOneAndUpdate(
            {
                _id: ObjectId(duel.user1)
            },
            {
                $set: {
                    total_point: parseInt(user1.total_point) + duel.user1_points,
                    weekly_point: user1.weekly_point + duel.user1_points,
                    win_count: user1.win_count,
                    lose_count: user1.lose_count,
                    total_award: parseInt(user1.total_award) + user1EarnedAward,
                    weekly_award: (user1.weekly_award || 0) + user1EarnedAward,
                    elo: user1.elo,
                }
            }
        );
        usersCollection.findOneAndUpdate(
            {
                _id: ObjectId(duel.user2)
            },
            {
                $set: {
                    total_point: parseInt(user2.total_point) + duel.user2_points,
                    weekly_point: user2.weekly_point + duel.user2_points,
                    win_count: user2.win_count,
                    lose_count: user2.lose_count,
                    total_award: parseInt(user2.total_award) + user2EarnedAward,
                    weekly_award: (user2.weekly_award || 0) + user2EarnedAward,
                    elo: user2.elo
                }
            }
        );
        return res.status(200).send({ message: "successful" });
    } else {
        return res.status(400).send({ message: "No access" });
    }
}
async function removeServerInfo(duel_id) {
    if (!db) {
        db = await database().catch(err => console.log("ERROR ", err));
    }

    const serverInfoCollection = db.collection(`bucket_${SERVERS_INFO}`);
    serverInfoCollection
        .deleteOne({
            duel_id: duel_id
        })
        .catch(err => console.log("ERROR removeServerInfo ", err));
}

export async function removeServerInfoExternalMultiplayer(req, res) {
    const { duel, key } = req.body;
    if (key != OPERATION_KEY) {
        return res.status(400).send({ message: "No access" });
    }
    removeServerInfo(String(duel._id));
    return res.status(200).send({ message: "successful" });
}

export async function clearServerInfoBucket() {
    if (!db) {
        db = await database().catch(err => console.log("ERROR ", err));
    }
    let date_1 = new Date();
    date_1.setMinutes(date_1.getMinutes() - 6);

    await db
        .collection(`bucket_${SERVERS_INFO}`)
        .deleteMany({
            created_at: { $lt: date_1 }
        })
        .catch(e => console.log(e));

    return true;
}