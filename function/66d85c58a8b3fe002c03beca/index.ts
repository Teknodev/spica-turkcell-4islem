import * as Api from "../../66d865d0a8b3fe002c03c8c8/.build";

export async function singleplayMatchmaker(req, res) {
    const { userID, userFree } = req.body;
    const duelData = createDuelObject(userID, userFree);
    requestForANewGame(duelData)

    return res.status(200).send({ message: 'Successfull' });
}

function createDuelObject(userID, userFree) {
    const duelArray = {
        user: Api.toObjectId(userID),
        user_ready: true,
        user_ingame: false,
        created_at: new Date(),
        user_is_free: userFree,
        user_life: userFree ? 0 : 3,
        user_points: 0,
        user_is_dead: false
    }
    return duelArray;
}

async function requestForANewGame(data) {
    data["user"] = String(data.user);
    const users = [String(data.user)];

    await Api.httpRequest('post', 'https://vodafone.queue.spicaengine.com/message?topic_id=657310d3f1bac9002c940b22', {
        "referenceNo": String(Date.now()),
        "service": "tcell_4islem",
        "data": data,
        "users": users
    }, {}).catch(err => console.error("Error: ", err));
    return
}

export async function clearSingleServerInfoBucket() {
    let date_1 = new Date();
    date_1.setMinutes(date_1.getMinutes() - 5);

    const db = await Api.useDatabase();


    await db
        .collection(`bucket_66d96438a8b3fe002c04a817`)
        .deleteMany({
            created_at: { $lt: date_1 },
        })
        .catch(e => console.log(e));

    return true;
}