import { database, ObjectId } from "@spica-devkit/database";
import * as Identity from "@spica-devkit/identity";
import * as NewTurkcellUserFlow from '../../66fe58b6030b4e002c618a93/.build';

let jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
import axios from 'axios';

const FASTLOGIN_SECRET_KEY = process.env.FASTLOGIN_SECRET_KEY;
const FASTLOGIN_SERVICE_ID = process.env.FASTLOGIN_SERVICE_ID;
const SECRET_API_KEY = process.env.SECRET_API_KEY;
const USER_POLICY = process.env.USER_POLICY;
const PASSWORD_SALT = process.env.PASSWORD_SALT;

const USER_BUCKET_ID = process.env.USER_BUCKET_ID;

let db;

// login
//101981
//cd568afe-7e14-41fe-9c0c-bed8768400c6
export async function login(req, res) {
    if (!db) db = await database().catch(err => console.log("ERROR 1", err));
    const users_collection = db.collection(`bucket_${USER_BUCKET_ID}`);

    const { token } = req.body;
    // console.log("token: ",token);
    // 1-check token is defined
    if (token) {
        // 2-send token to get user information from Turkcell
        //let fastlogin_response = await fastLogin(token).catch(err => console.log("ERROR 1", err));
        let fastlogin_response = await seamlessTokenValidate(token).catch(err => console.log("ERROR 1", err));
        // console.log("fastlogin_response: ",fastlogin_response);

        // 3-if response is error(node fetch send error as data)
        if (isResponseValid(fastlogin_response)) {
            let identifier = getIdentifier(fastlogin_response);
            let password = getPassword(fastlogin_response);
            let msisdn = fastlogin_response.msisdn;
            // Handle new user flow here!!
            // NewTurkcellUserFlow.newUserTcellAdminInsert(msisdn).catch(err => console.log("New User Flow Error!", err));
            // End of flow
            // 4-get identity
            getIdentityToken(identifier, password)
                .then(async data => {
                    // 4a-send response object back
                    let identity_token = data.token;
                    const decodedToken = jwt.decode(identity_token);

                    const user = await users_collection
                        .findOne({ identity: String(decodedToken._id) })
                        .catch(err => console.log("ERROR 2", err));

                    return res.status(200).send({
                        token: identity_token,
                        user: user
                    });
                })
                .catch(async error => {
                    // 4b-send response object back
                    // return res.status(200).send({
                    //     is_registered: false
                    // });

                    const identity_collection = db.collection(`identity`);
                    const user_identity = await identity_collection
                        .findOne({ "attributes.msisdn": msisdn })
                        .catch(err => console.log("ERROR 8", err));

                    if (user_identity) {
                        await identity_collection
                            .updateOne(
                                { _id: user_identity._id },
                                { $set: { identifier: identifier } }
                            )
                            .catch(err => console.log("ERROR 8", err));

                        const user = await users_collection
                            .findOne({ identity: String(user_identity._id) })
                            .catch(err => console.log("ERROR 2", err));

                        getIdentityToken(identifier, password).then(async data => {
                            return res.status(200).send({
                                token: data.token,
                                user: user
                            });
                        });
                    } else {
                        // 4-create an identity
                        //const response = await checkOtherGames(msisdn);//check free play



                        createIdentity(identifier, password, msisdn)
                            .then(async identity_data => {
                                // 5-add this identity to user_bucket
                                let insertedObject = await users_collection
                                    .insertOne({
                                        identity: identity_data.identity_id,
                                        avatar_id: 0,
                                        elo: 0,
                                        created_at: new Date(),
                                        total_point: 0,
                                        weekly_point: 0,
                                        win_count: 0,
                                        lose_count: 0,
                                        total_award: 0,
                                        weekly_award: 0,
                                        available_play_count: 0,
                                        bot: false,
                                        free_play: true,//response
                                        perm_accept: false
                                    })
                                    .catch(error => {
                                        return res.status(400).send({
                                            message:
                                                "Error while adding user to User Bucket (Identity already added).",
                                            error: error
                                        });
                                    });

                                let user = insertedObject.ops[0];

                                getIdentityToken(identifier, password).then(async data => {
                                    return res.status(200).send({
                                        token: data.token,
                                        user: user
                                    });
                                });
                            })
                            .catch(error => {
                                return res
                                    .status(400)
                                    .send({
                                        message: "Error while creating identity",
                                        error: error
                                    });
                            });
                    }
                });
        } else {
            return res.status(400).send({ message: "Fastlogin error", error: fastlogin_response });
        }
    } else {
        return res.status(400).send({ message: "Fastlogin token is not defined." });
    }
}

// register

export async function register(req, res) {
    if (!db) db = await database().catch(err => console.log("ERROR 3", err));
    const { identity, name, avatar_id } = req.body;
    // Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

    // 1-check token && name && url is defined

    const users_collection = db.collection(`bucket_${USER_BUCKET_ID}`);
    if (name) {
        let user = await users_collection
            .findOne({ identity: identity })
            .catch(err => console.log("ERROR 4", err));

        if (user) {
            let userData = await users_collection
                .findOneAndUpdate(
                    { _id: ObjectId(user._id) },
                    {
                        $set: {
                            name: name,
                            avatar_id: avatar_id
                        }
                    }
                )
                .catch(err => console.log("ERROR 5", err));

            return userData.value;
        } else {
            return res.status(400).send({ message: "Can't find the user" });
        }
    } else {
        return res.status(400).send({ message: "Name or url is not defined." });
    }
}

// FASTLOGIN - give token - get all user information
async function fastLogin(token) {
    let body = {
        serviceId: FASTLOGIN_SERVICE_ID,
        secretKey: `${FASTLOGIN_SECRET_KEY}`,
        loginToken: token
    };

    return await fetch("https://fastlogin.com.tr/fastlogin_app/secure/validate.json", {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .catch(err => console.log("ERROR 5", err));
}
async function seamlessTokenValidate(token) {
    let body = {
        serviceId: FASTLOGIN_SERVICE_ID,
        secretKey: `${FASTLOGIN_SECRET_KEY}`,
        token: token
    };
    //console.log("Seamless: ", body);
    return await fetch("https://fastlogin.com.tr/fastlogin_app/secure/validateSeamlessLoginToken.json", {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .catch(err => console.log("ERROR 5", err));
}


export async function testSeamlessTokenValidate(req, res) {
    try {
        let token = "dbe169ca-9ceb-472a-9fcc-fa32203c1a47";// change to test token
        let fastlogin_response = await seamlessTokenValidate(token);
        console.log("fastlogin_response:", fastlogin_response);
    } catch (error) {
        console.error("Error while mocking the token:", error);
    }
    return res.status(200).send({ message: 'ok' });
}
// get identity token(login to spica) with identifier and password
function getIdentityToken(identifier, password) {
    Identity.initialize({ apikey: `${SECRET_API_KEY}` });

    return new Promise(async (resolve, reject) => {
        await Identity.login(identifier, password)
            .then(data => {
                resolve({ token: data });
            })
            .catch(error => {
                //console.log("ERROR! Error occur while getting identity token", error);
                // console.log("ERROR 6", error);
                reject(error);
            });
    });
}

// create identity(register to spica) with identifier and password
function createIdentity(identifier, password, msisdn) {
    Identity.initialize({ apikey: `${SECRET_API_KEY}` });

    return new Promise(async (resolve, reject) => {
        await Identity.insert({
            identifier: identifier,
            password: password,
            policies: [`${USER_POLICY}`],
            attributes: { msisdn }
        })
            .then(identity => {
                resolve({ identity_id: identity._id });
            })
            .catch(error => {
                console.log("ERROR 7", error);
                reject(error);
            });
    });
}

// helper functions
function isResponseValid(response) {
    /* 
    --success message
    {
        "resultStatus": {
            "resultCode": 0,
            "resultName": "SUCCESS",
            "resultMessage": "İşlem başarılıdır.",
            "flowType": "NONE",
            "detailResult": "N/A"
        },
        "msisdn": "5324771739",
        "email": "emre2345@yahoo.com",
        "accountId": "e7d5078a-ae62-4cbf-aab6-78f60dbc2eb8",
        "loginType": "EMAIL_LOGIN",
        "countryIsoCode": "TR",
        "regionCode": "+90",
        "mobileConnectUserInfo": null
    }

    --invalid token
    {
        "resultStatus": {
            "resultCode": 4,
            "resultName": "INVALID_AUTH_TOKEN",
            "resultMessage": "Geçersiz token",
            "flowType": "NONE",
            "detailResult": "N/A"
        },
        "msisdn": null,
        "email": null,
        "accountId": null,
        "loginType": null,
        "countryIsoCode": null,
        "regionCode": null,
        "mobileConnectUserInfo": null
    }
    */

    let is_valid = false;
    if (response.msisdn != null) {
        is_valid = true;
    }
    return is_valid;
    // return true;
}

function getIdentifier(response) {
    let identifier = response.msisdn;

    return identifier;
    // return "abcde";
}

function getPassword(response) {
    let unique_password = PASSWORD_SALT;

    return unique_password;
    // return "abcde";
}

export async function getMyIp(req, res) {
    const test = await fetch("https://api.ipify.org?format=json", {
        method: "get"
    })
        .then(res => res.json())
        .catch(err => console.log("ERROR 5", err));

    console.log("test", test)

    return res.status(200).send({ message: 'ok' })
}

async function checkOtherGames(msisdn) {
    try {
        const response = await axios.post(` https://tcell-admin-3c220.hq.spicaengine.com/api/fn-execute/checkFreePlay `, {
            msisdn
        }, { headers: { 'Content-Type': 'application/json' } });

        return response.data;

    } catch (error) {
        console.error('Error 100:', error);
    }
}