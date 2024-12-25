import { database, ObjectId } from "@spica-devkit/database";
import * as Bucket from "@spica-devkit/bucket";

const USER_BUCKET = process.env.USER_BUCKET;
const PAST_MATCHES_BUCKET = process.env.PAST_MATCHES_BUCKET;
const CHARGE_BUCKET = process.env.CHARGE_BUCKET;
const GAME_LEAGUE_PARTICIPANTS = process.env.GAME_LEAGUE_PARTICIPANTS;
const DRAW_LOGS = process.env.DRAW_LOGS;
const CONFIGURATION = process.env.CONFIGURATION;
const BUGGED_REWARDS = "616e782f9c4660002dd09ab1";
const MANUALLY_REWARD = "60aa13679835cd002c1c9a1a";
const wordsArr = ["abaza", "abazan", "ag", "a\u011fz\u0131na s\u0131\u00e7ay\u0131m", "ahmak", "allah", "allahs\u0131z", "am", "amar\u0131m", "ambiti", "am biti", "amc\u0131\u011f\u0131", "amc\u0131\u011f\u0131n", "amc\u0131\u011f\u0131n\u0131", "amc\u0131\u011f\u0131n\u0131z\u0131", "amc\u0131k", "amc\u0131k ho\u015faf\u0131", "amc\u0131klama", "amc\u0131kland\u0131", "amcik", "amck", "amckl", "amcklama", "amcklaryla", "amckta", "amcktan", "amcuk", "am\u0131k", "am\u0131na", "am\u0131nako", "am\u0131na koy", "am\u0131na koyar\u0131m", "am\u0131na koyay\u0131m", "am\u0131nakoyim", "am\u0131na koyyim", "am\u0131na s", "am\u0131na sikem", "am\u0131na sokam", "am\u0131n feryad\u0131", "am\u0131n\u0131", "am\u0131n\u0131 s", "am\u0131n oglu", "am\u0131no\u011flu", "am\u0131n o\u011flu", "am\u0131s\u0131na", "am\u0131s\u0131n\u0131", "amina", "amina g", "amina k", "aminako", "aminakoyarim", "amina koyarim", "amina koyay\u0131m", "amina koyayim", "aminakoyim", "aminda", "amindan", "amindayken", "amini", "aminiyarraaniskiim", "aminoglu", "amin oglu", "amiyum", "amk", "amkafa", "amk \u00e7ocu\u011fu", "amlarnzn", "aml\u0131", "amm", "ammak", "ammna", "amn", "amna", "amnda", "amndaki", "amngtn", "amnn", "amona", "amq", "ams\u0131z", "amsiz", "amsz", "amteri", "amugaa", "amu\u011fa", "amuna", "ana", "anaaann", "anal", "analarn", "anam", "anamla", "anan", "anana", "anandan", "anan\u0131", "anan\u0131", "anan\u0131n", "anan\u0131n am", "anan\u0131n am\u0131", "anan\u0131n d\u00f6l\u00fc", "anan\u0131nki", "anan\u0131sikerim", "anan\u0131 sikerim", "anan\u0131sikeyim", "anan\u0131 sikeyim", "anan\u0131z\u0131n", "anan\u0131z\u0131n am", "anani", "ananin", "ananisikerim", "anani sikerim", "ananisikeyim", "anani sikeyim", "anann", "ananz", "anas", "anas\u0131n\u0131", "anas\u0131n\u0131n am", "anas\u0131 orospu", "anasi", "anasinin", "anay", "anayin", "angut", "anneni", "annenin", "annesiz", "anuna", "aptal", "aq", "a.q", "a.q.", "aq.", "ass", "atkafas\u0131", "atm\u0131k", "att\u0131rd\u0131\u011f\u0131m", "attrrm", "auzlu", "avrat", "ayklarmalrmsikerim", "azd\u0131m", "azd\u0131r", "azd\u0131r\u0131c\u0131", "babaannesi ka\u015far", "baban\u0131", "baban\u0131n", "babani", "babas\u0131 pezevenk", "baca\u011f\u0131na s\u0131\u00e7ay\u0131m", "bac\u0131na", "bac\u0131n\u0131", "bac\u0131n\u0131n", "bacini", "bacn", "bacndan", "bacy", "bastard", "basur", "beyinsiz", "b\u0131z\u0131r", "bitch", "biting", "bok", "boka", "bokbok", "bok\u00e7a", "bokhu", "bokkkumu", "boklar", "boktan", "boku", "bokubokuna", "bokum", "bombok", "boner", "bosalmak", "bo\u015falmak", "cenabet", "cibiliyetsiz", "cibilliyetini", "cibilliyetsiz", "cif", "cikar", "cim", "\u00e7\u00fck", "dalaks\u0131z", "dallama", "daltassak", "dalyarak", "dalyarrak", "dangalak", "dassagi", "diktim", "dildo", "dingil", "dingilini", "dinsiz", "dkerim", "domal", "domalan", "domald\u0131", "domald\u0131n", "domal\u0131k", "domal\u0131yor", "domalmak", "domalm\u0131\u015f", "domals\u0131n", "domalt", "domaltarak", "domalt\u0131p", "domalt\u0131r", "domalt\u0131r\u0131m", "domaltip", "domaltmak", "d\u00f6l\u00fc", "d\u00f6nek", "d\u00fcd\u00fck", "eben", "ebeni", "ebenin", "ebeninki", "ebleh", "ecdad\u0131n\u0131", "ecdadini", "embesil", "emi", "fahise", "fahi\u015fe", "feri\u015ftah", "ferre", "fuck", "fucker", "fuckin", "fucking", "gavad", "gavat", "geber", "geberik", "gebermek", "gebermi\u015f", "gebertir", "ger\u0131zekal\u0131", "gerizekal\u0131", "gerizekali", "gerzek", "giberim", "giberler", "gibis", "gibi\u015f", "gibmek", "gibtiler", "goddamn", "godo\u015f", "godumun", "gotelek", "gotlalesi", "gotlu", "gotten", "gotundeki", "gotunden", "gotune", "gotunu", "gotveren", "goyiim", "goyum", "goyuyim", "goyyim", "g\u00f6t", "g\u00f6t deli\u011fi", "g\u00f6telek", "g\u00f6t herif", "g\u00f6tlalesi", "g\u00f6tlek", "g\u00f6to\u011flan\u0131", "g\u00f6t o\u011flan\u0131", "g\u00f6to\u015f", "g\u00f6tten", "g\u00f6t\u00fc", "g\u00f6t\u00fcn", "g\u00f6t\u00fcne", "g\u00f6t\u00fcnekoyim", "g\u00f6t\u00fcne koyim", "g\u00f6t\u00fcn\u00fc", "g\u00f6tveren", "g\u00f6t veren", "g\u00f6t verir", "gtelek", "gtn", "gtnde", "gtnden", "gtne", "gtten", "gtveren", "hasiktir", "hassikome", "hassiktir", "has siktir", "hassittir", "haysiyetsiz", "hayvan herif", "ho\u015faf\u0131", "h\u00f6d\u00fck", "hsktr", "huur", "\u0131bnel\u0131k", "ibina", "ibine", "ibinenin", "ibne", "ibnedir", "ibneleri", "ibnelik", "ibnelri", "ibneni", "ibnenin", "ibnerator", "ibnesi", "idiot", "idiyot", "imansz", "ipne", "iserim", "i\u015ferim", "ito\u011flu it", "kafam girsin", "kafas\u0131z", "kafasiz", "kahpe", "kahpenin", "kahpenin feryad\u0131", "kaka", "kaltak", "kanc\u0131k", "kancik", "kappe", "karhane", "ka\u015far", "kavat", "kavatn", "kaypak", "kayyum", "kerane", "kerhane", "kerhanelerde", "kevase", "keva\u015fe", "kevvase", "koca g\u00f6t", "kodu\u011fmun", "kodu\u011fmunun", "kodumun", "kodumunun", "koduumun", "koyarm", "koyay\u0131m", "koyiim", "koyiiym", "koyim", "koyum", "koyyim", "krar", "kukudaym", "laciye boyad\u0131m", "lavuk", "libo\u015f", "madafaka", "mal", "malafat", "malak", "manyak", "mcik", "meme", "memelerini", "mezveleli", "minaamc\u0131k", "mincikliyim", "mna", "monakkoluyum", "motherfucker", "mudik", "oc", "ocuu", "ocuun", "O\u00c7", "o\u00e7", "o. \u00e7ocu\u011fu", "o\u011flan", "o\u011flanc\u0131", "o\u011flu it", "orosbucocuu", "orospu", "orospucocugu", "orospu cocugu", "orospu \u00e7oc", "orospu\u00e7ocu\u011fu", "orospu \u00e7ocu\u011fu", "orospu \u00e7ocu\u011fudur", "orospu \u00e7ocuklar\u0131", "orospudur", "orospular", "orospunun", "orospunun evlad\u0131", "orospuydu", "orospuyuz", "orostoban", "orostopol", "orrospu", "oruspu", "oruspu\u00e7ocu\u011fu", "oruspu \u00e7ocu\u011fu", "osbir", "ossurduum", "ossurmak", "ossuruk", "osur", "osurduu", "osuruk", "osururum", "otuzbir", "\u00f6k\u00fcz", "\u00f6\u015fex", "patlak zar", "penis", "pezevek", "pezeven", "pezeveng", "pezevengi", "pezevengin evlad\u0131", "pezevenk", "pezo", "pic", "pici", "picler", "pi\u00e7", "pi\u00e7in o\u011flu", "pi\u00e7 kurusu", "pi\u00e7ler", "pipi", "pipi\u015f", "pisliktir", "porno", "pussy", "pu\u015ft", "pu\u015fttur", "rahminde", "revizyonist", "s1kerim", "s1kerm", "s1krm", "sakso", "saksofon", "salaak", "salak", "saxo", "sekis", "serefsiz", "sevgi koyar\u0131m", "sevi\u015felim", "sexs", "s\u0131\u00e7ar\u0131m", "s\u0131\u00e7t\u0131\u011f\u0131m", "s\u0131ecem", "sicarsin", "sie", "sik", "sikdi", "sikdi\u011fim", "sike", "sikecem", "sikem", "siken", "sikenin", "siker", "sikerim", "sikerler", "sikersin", "sikertir", "sikertmek", "sikesen", "sikesicenin", "sikey", "sikeydim", "sikeyim", "sikeym", "siki", "sikicem", "sikici", "sikien", "sikienler", "sikiiim", "sikiiimmm", "sikiim", "sikiir", "sikiirken", "sikik", "sikil", "sikildiini", "sikilesice", "sikilmi", "sikilmie", "sikilmis", "sikilmi\u015f", "sikilsin", "sikim", "sikimde", "sikimden", "sikime", "sikimi", "sikimiin", "sikimin", "sikimle", "sikimsonik", "sikimtrak", "sikin", "sikinde", "sikinden", "sikine", "sikini", "sikip", "sikis", "sikisek", "sikisen", "sikish", "sikismis", "siki\u015f", "siki\u015fen", "siki\u015fme", "sikitiin", "sikiyim", "sikiym", "sikiyorum", "sikkim", "sikko", "sikleri", "sikleriii", "sikli", "sikm", "sikmek", "sikmem", "sikmiler", "sikmisligim", "siksem", "sikseydin", "sikseyidin", "siksin", "siksinbaya", "siksinler", "siksiz", "siksok", "siksz", "sikt", "sikti", "siktigimin", "siktigiminin", "sikti\u011fim", "sikti\u011fimin", "sikti\u011fiminin", "siktii", "siktiim", "siktiimin", "siktiiminin", "siktiler", "siktim", "siktim", "siktimin", "siktiminin", "siktir", "siktir et", "siktirgit", "siktir git", "siktirir", "siktiririm", "siktiriyor", "siktir lan", "siktirolgit", "siktir ol git", "sittimin", "sittir", "skcem", "skecem", "skem", "sker", "skerim", "skerm", "skeyim", "skiim", "skik", "skim", "skime", "skmek", "sksin", "sksn", "sksz", "sktiimin", "sktrr", "skyim", "slaleni", "sokam", "sokar\u0131m", "sokarim", "sokarm", "sokarmkoduumun", "sokay\u0131m", "sokaym", "sokiim", "soktu\u011fumunun", "sokuk", "sokum", "soku\u015f", "sokuyum", "soxum", "sulaleni", "s\u00fclaleni", "s\u00fclalenizi", "s\u00fcrt\u00fck", "\u015ferefsiz", "\u015f\u0131ll\u0131k", "taaklarn", "taaklarna", "tarrakimin", "tasak", "tassak", "ta\u015fak", "ta\u015f\u015fak", "tipini s.k", "tipinizi s.keyim", "tiyniyat", "toplarm", "topsun", "toto\u015f", "vajina", "vajinan\u0131", "veled", "veledizina", "veled i zina", "verdiimin", "weled", "weledizina", "whore", "xikeyim", "yaaraaa", "yalama", "yalar\u0131m", "yalarun", "yaraaam", "yarak", "yaraks\u0131z", "yaraktr", "yaram", "yaraminbasi", "yaramn", "yararmorospunun", "yarra", "yarraaaa", "yarraak", "yarraam", "yarraam\u0131", "yarragi", "yarragimi", "yarragina", "yarragindan", "yarragm", "yarra\u011f", "yarra\u011f\u0131m", "yarra\u011f\u0131m\u0131", "yarraimin", "yarrak", "yarram", "yarramin", "yarraminba\u015f\u0131", "yarramn", "yarran", "yarrana", "yarrrak", "yavak", "yav\u015f", "yav\u015fak", "yav\u015fakt\u0131r", "yavu\u015fak", "y\u0131l\u0131\u015f\u0131k", "yilisik", "yogurtlayam", "yo\u011furtlayam", "yrrak", "z\u0131kk\u0131m\u0131m", "zibidi", "zigsin", "zikeyim", "zikiiim", "zikiim", "zikik", "zikim", "ziksiiin", "ziksiin", "zulliyetini", "zviyetini"]

let db;
export async function replaceAbusiveName() {
    const dateNow = new Date();
    let filterDate = new Date(dateNow.setMinutes(dateNow.getMinutes() - 90))

    const db = await database().catch(err => console.log("ERROR 1", err));
    const userData = await db
        .collection(`bucket_${USER_BUCKET}`)
        .find({ created_at: { $gte: filterDate }, name: { $in: wordsArr } }).toArray()
        .catch(err => console.log("ERROR 2", err));

    for (const user of userData) {
        console.log(`user_id: ${user._id} - name: ${user.name}`)
        let random = Math.floor(Math.random() * 100000) + 1
        await db
            .collection(`bucket_${USER_BUCKET}`)
            .updateOne({ _id: ObjectId(user._id) }, { $set: { name: `Kullanıcı34${random}` } })
            .catch(err => console.log("ERROR 2", err));
    }
}
export async function checkUserFreePlay(req, res) {
    const db = await database();
    const { msisdn } = req.body;

    if (msisdn) {
        const usersCollection = db.collection(`bucket_${USER_BUCKET}`);
        const pastMatchesCollection = db.collection(`bucket_${PAST_MATCHES_BUCKET}`);

        const identityCollection = db.collection(`identity`);

        const identity = await identityCollection
            .findOne({ "attributes.msisdn": msisdn })
            .catch(err => console.log("ERROR 12 ", err));

        if (!identity) {
            // User has no identity, return false
            return false;
        }
        const user = await usersCollection
            .findOne({ identity: identity._id.toString() })
            .catch(err => console.log("ERROR 13 ", err));
        if (!user) {

            return false;
        }
        let userId = user._id;

        let dateFilter = {
            $gte: new Date("2023-10-16T21:00:00Z") // Only consider matches that have ended
        };

        const pastMatchesCount = await pastMatchesCollection.countDocuments({
            $or: [{ user1: userId.toString() }, { user2: userId.toString() }],
            end_time: dateFilter
        });

        return pastMatchesCount > 0; // Return true if there is at least one past match
    } else {
        return res.status(400).send({
            statusCode: 400,
            message: "Missing msisdn parameter",
            error: "Bad Request"
        });
    }

}

// export async function tesxxx(req,res){

//         if (!db) {
//         db = await database();
//     }
//     const bots = db.collection(`bucket_61517461d0398a002e618021`);
//     const users = db.collection(`bucket_605c9480e9960e002c278191`);

//     let bbbbots = await bots.find().toArray();

// bbbbots.forEach(b => {

//     users.insertOne({
//         _id: b._id,
//         name: b.name,
//         avatar_id: b.avatar_id,
//         bot: true
//     })
// })

// console.log(bbbbots);
// return res.status(200).send(200);
// }


export async function identityMigration(req, res) {
    const db = await database().catch(err => console.log("ERROR 1", err));
    await db.collection(`identity`).updateMany(
        {
            identifier: { $nin: ["spica", "serdar", "caglar@polyhagency.com"] }
        },
        [
            {
                $set: {
                    identifier: "$attributes.msisdn"
                }
            }
        ],
        {
            multi: true
        }
    ).catch(err => console.log("ERROR 2", err));

    return 'ok'
}

export async function messageValueMigration(req, res) {
    const db = await database().catch(err => {
        console.log("ERROR 1", err);
        return res.status(500).send(err); // Handle database connection error
    });

    try {
        await db.collection(`bucket_654cd7834f6554002cbd438a`).updateMany(
            {}, // This will match all documents
            [{
                $set: {
                    messages: {
                        $map: {
                            input: "$messages",
                            as: "msg",
                            in: {
                                key: "$$msg.key",
                                value: "$$msg.value",
                                rich_value: "$$msg.value" // Set rich_value to the value of value
                            }
                        }
                    }
                }
            }]
        );
        return res.send('ok'); // Successfully updated
    } catch (err) {
        console.log("ERROR 2", err);
        return res.status(500).send(err); // Handle error during update
    }
}

export async function getChargeData(req, res) {
    const db = await database().catch(err => console.log("ERROR 1", err));
    const chargeCollection = db.collection(`bucket_${CHARGE_BUCKET}`);
    const gameLeagueUsers = db.collection(`bucket_${GAME_LEAGUE_PARTICIPANTS}`);
    const drawLogsCollection = db.collection(`bucket_${DRAW_LOGS}`);
    let msisdnArray = [];
    let msisdnArrayDrawLogs = [];
    let chargeArray = [];
    let dateFilter = {
        $gte: new Date("12-11-2023 21:00:00"),
        $lt: new Date("12-14-2023 12:00:00")
    };
    const users = await gameLeagueUsers.find().toArray();

    users.forEach(x => {
        msisdnArray.push('90' + x.msisdn);
    })
    console.log("msisdnArray: ", msisdnArray.length);
    const chargeData = await chargeCollection.find({
        date: dateFilter,
        status: true,
        msisdn: { $in: msisdnArray }
    }).toArray()

    // console.log("chargeData: ", chargeData.length);

    // chargeData.forEach(x => {
    //     chargeArray.push({
    //         msisdn:x.msisdn.substring(2),
    //         date:x.date,
    //         status:x.status
    //     })
    // })
    const datas = await drawLogsCollection.find({
        date: dateFilter,
    }).toArray();

    // datas.forEach(x => {
    //     msisdnArrayDrawLogs.push('90' + x.msisdn);
    // })


    return res.send(datas);
}

export async function getGameLeagueUsers(req, res) {

    const db = await database().catch(err => console.log("ERROR 1", err));

    const gameLeagueUsers = db.collection(`bucket_${GAME_LEAGUE_PARTICIPANTS}`);

    const users = await gameLeagueUsers.find({

    }).toArray()

    return res.send(users);
}

export async function getGameLeagueSendedData(req, res) {
    const db = await database().catch(err => console.log("ERROR 1", err));
    const drawLogsCollection = db.collection(`bucket_${DRAW_LOGS}`);

    let dateFilter = {
        $gte: new Date("12-11-2023 21:00:00"),
        $lt: new Date("01-17-2024 21:00:00")
    };

    const datas = await drawLogsCollection.find({
        date: dateFilter,
    }).toArray();

    return res.send(datas)

}

export async function chargesData(req, res) {
    const db = await database().catch(err => console.log("ERROR 1", err));
    const chargeCollection = db.collection(`bucket_${CHARGE_BUCKET}`);
    const gameLeagueUsers = db.collection(`bucket_${GAME_LEAGUE_PARTICIPANTS}`);

    let dateFilter = {
        $gte: new Date("12-11-2023 21:00:00"),
        $lt: new Date("01-17-2024 21:00:00")
    };

    const chargeData = await chargeCollection.find({
        date: dateFilter,
        status: true,
    }).toArray();

    // Group data by msisdn and calculate charge count
    const groupedData = chargeData.reduce((result, item) => {
        const msisdn = item.msisdn;

        if (!result[msisdn]) {
            result[msisdn] = {
                msisdn: msisdn,
                charge_count: 1,
            };
        } else {
            result[msisdn].charge_count++;
        }

        return result;
    }, {});

    // Convert the grouped data object into an array
    const finalResult = Object.values(groupedData);

    console.log("finalResult: ", finalResult.length);

    return res.send(finalResult);
}

export async function getUniquePlayer() {
    const db = await database();
    const filter = {
        $lte: new Date("2024-03-31T20:59:00.855Z"),
        $gte: new Date("2024-02-31T21:01:00.855Z"),
    }
    const pastMatches = db.collection(`bucket_${PAST_MATCHES_BUCKET}`);
    const matchesData = await pastMatches.find({
        start_time: filter,
    }).toArray();
    const playerId = [];
    matchesData.forEach(el => {
        if (el.player_type == 1) {
            playerId.push(el.user1)
        }
        else { playerId.push(el.user1, el.user2) }
    })
    const uniquePlayer = [...new Set(playerId)];
    console.log("uniquePlayer", uniquePlayer.length)
    const userIdentity = [];

    await Promise.all(uniquePlayer.map(async (el) => {
        const userbucket = db.collection(`bucket_${USER_BUCKET}`);
        const userData = await userbucket.find({
            _id: ObjectId(el),
        }).toArray();
        userData.forEach(el => {
            userIdentity.push(el.identity)
        })
    }));
    const userMsisdns = [];

    await Promise.all(userIdentity.map(async (el) => {
        const identitesList = await db.collection(`identity`)
        const userMsisdn = await identitesList.find({
            _id: ObjectId(el),
        }).toArray();
        userMsisdn.forEach(el => {
            // db.collection(`bucket_65db9fa58a0920002cce406d`).insertOne({ msisdn: el.attributes.msisdn })

            userMsisdns.push({ msisdn: el.attributes.msisdn })
        })
    }));
    console.log(userMsisdns.length)
    await db.collection(`bucket_65db9fa58a0920002cce406d`).insertMany(userMsisdns)
    // console.log("useridentity", userIdentity.length)

    // console.log("usermsisdns", userMsisdns.length)

    return "ok"
}

export async function getMsisdnsFromBucket() {
    const db = await database();
    const msisdnsBucket = db.collection(`bucket_65db9fa58a0920002cce406d`);
    const uniqueMsisdns = await msisdnsBucket.find({}, { projection: { _id: 0 } }).toArray();
    return uniqueMsisdns
}

export async function patchUsers(req, res) {
    const db = await database();
    const filter = {
        $lte: new Date("2024-05-31T20:59:00.855Z"),
        $gte: new Date("2024-02-31T21:00:00.855Z"),
    }

    const userbucket = db.collection(`bucket_${USER_BUCKET}`);

    await userbucket.updateMany(
        {
            free_play: false,
            bot: false
        },
        {
            $set: {
                free_play: true
            }
        }
    );

    return res.send('ok5');

}
export async function getUniqueCharge() {
    const db = await database();

    const filter = {
        $gte: new Date("2024-03-31T20:59:00.855Z"),
        $lte: new Date("2024-04-30T20:50:00.855Z"),
    }
    const test = await db.collection("bucket_60ab7235c03a2d002eb2f574").find({ date: filter, status: true }).toArray()
    console.log(test.length)
    const rewardHourlyFalse = test.reduce((acc, curr) => {
        const existingItem = acc.find(item => item.msisdn === curr.msisdn);
        if (existingItem) {
            existingItem.count++;
        } else {
            acc.push({ msisdn: curr.msisdn, count: 1 });
        }
        return acc;
    }, []);


    db.collection("bucket_65db9fa58a0920002cce406d").insertMany(rewardHourlyFalse)
    console.log(rewardHourlyFalse.length)
    return "ok"
}
export async function deleteManyTest() {
    const db = await database();
    db.collection("bucket_65db9fa58a0920002cce406d").deleteMany({})
    // Api.deleteMany("65db9fa58a0920002cce406d", {})
    return "ok"
}
export async function getWrongData() {
    const db = await database();
    const test = await db.collection("bucket_60ab7235c03a2d002eb2f574").deleteMany({ status: { $exists: false } })
    console.log(test.length)
    return "ok"

}

export async function findUnmatchedIdentityEntries(req, res) {
    const db = await database();

    const users_collection = db.collection(`bucket_${USER_BUCKET}`);
    const identity_collection = db.collection(`identity`);

    const identities = await identity_collection.find().skip(0).limit(50000).toArray();
    console.log("identities: ", identities.length);
    const identityArray = identities.map(doc => String(doc._id));
    console.log("identityArray: ", identityArray.length);

    const users = await users_collection.find({
        identity: { $in: identityArray }
    }).toArray();

    console.log("users: ", users.length);

    // Extracting IDs of users
    const userIDs = users.map(user => user.identity);

    // Finding IDs in identities but not in userIDs
    const unmatchedIds = identityArray.filter(id => !userIDs.includes(id));

    console.log("Unmatched identities: ", unmatchedIds.length);

    return res.send(unmatchedIds.length);
}

export async function removeSomeIdentity(req, res) {
    const db = await database();

    let dateFrom = new Date("10-01-2023 21:00:00");
    let dateTo = new Date("03-01-2024 21:00:00");
    const dateFilter = { $gte: dateFrom, $lt: dateTo }

    const users_collection = db.collection(`bucket_${USER_BUCKET}`);
    const testData = await users_collection.find({
        available_play_count: 0, total_point: 0, win_count: 0, lose_count: 0, bot: false, created_at: dateFilter
    })
        .skip(100000)
        .limit(100000)
        .toArray().catch(console.error)

    console.log("data: ", testData.length);


    const identyties = [];
    testData.forEach((el) => {
        if (el.identity) {
            identyties.push(ObjectId(el.identity))
        }
    })

    const identyties_collection = db.collection(`identity`);
    identyties_collection.deleteMany({ _id: { $in: identyties } }).catch(console.error);

    return res.status(200).send({ message: 'ok' })
}


export async function getTvpPlusRewardedNewUsers() {
    // console.log(TurkcellAppServers[rewardedUsers[0]._id.game].api_key)
    const rewardedMsisdns = await getTvPlusAllRewardedUsers()
    // console.log(rewardedMsisdns)
    const identityIds = [];
    for (const msisdn of rewardedMsisdns) {
        const identityData = await getIdentityByMsisdn(msisdn)
        // console.log(identityData)
        const { _id, ...notUse } = identityData
        identityIds.push(_id)
    }
    // console.log(rewardedMsisdns)
    console.log(identityIds.length)
    // console.log(data)
    const newUser = [];
    identityIds.forEach(el => {
        if (ObjectId(el) > ObjectId("66c655500000000000000000")) {
            newUser.push(el)
        }

    })
    console.log(newUser.length)
    return "ok"
}
async function getTvPlusAllRewardedUsers() {
    Bucket.initialize({ apikey: "5wky19lo5i7t3d", publicUrl: "https://tcell-admin-3c220.hq.spicaengine.com/api/" });
    const data = await Bucket.data.getAll("66b9fa2f75cec4002c76dbeb", {
        queryParams: {
            filter: {
                game: "4_islem"
            },
            // limit: 5
        }
    });
    const msisdns = [];
    data.forEach(el => {
        const { msisdn, ...test } = el
        msisdns.push(msisdn)
    })
    return msisdns
}

async function getIdentityByMsisdn(msisdn) {
    const db = await database();
    return db.collection('identity').findOne({ "attributes.msisdn": String(msisdn) })
}

export async function findIdentity() {
    const db = await database();
    console.log("Done")
    // const test = await db.collection("identity").countDocuments({ _id: { $lt: ObjectId("651825630000000000000000") } })
    // const test2 = await db.collection("identity").find({ _id: { $lt: ObjectId("651825630000000000000000") } }).limit(3).sort({ _id: -1 }).toArray();
    // console.log("test", test, test2)

    let configuration = await db.collection(`bucket_${CONFIGURATION}`).findOne({ key: "deleted_identity" }).then(res => Number(res.value))
    if (configuration > 200000) return;

    const tset = await db.collection("identity").find({}).skip(200).limit(1000).toArray();
    const idsToDelete = tset.map(doc => doc._id);
    const result = await db.collection("identity").deleteMany({ _id: { $in: idsToDelete } });
    const testtest = await db.collection(`bucket_${USER_BUCKET}`).deleteMany({
        identity: {
            $in: idsToDelete.map(id => id.toString())
        }
    });

    configuration = configuration + 1000;
    db.collection(`bucket_${CONFIGURATION}`).updateOne({ key: "deleted_identity" }, { $set: { value: String(configuration) } })

    console.log("userBucket", testtest.deletedCount)
    console.log("identity", result.deletedCount)

    return "ok"

}

export async function ozikoReport(req, res) {
    const db = await database();
    const filter = {
        $lte: new Date("2024-12-31T20:59:00.855Z"),
        $gte: new Date("2023-12-31T21:01:00.855Z"),
    }
    const pastMatches = db.collection(`bucket_${PAST_MATCHES_BUCKET}`);
    const matchesData = await pastMatches.find({
        start_time: filter,
        user1_is_free: true
    }).toArray();
    const playerId = [];
    matchesData.forEach(el => {
        if (el.player_type == 1) {
            playerId.push(el.user1)
        }
        else { playerId.push(el.user1, el.user2) }
    })
    const uniquePlayer = [...new Set(playerId)];
    return res.send(uniquePlayer.length)
}
export async function buggedUserDataOperation() {
    const db = await database();
    // const db = await Api.useDatabase();
    // const test = await db.collection(`bucket_${BUGGED_REWARD_BUCKET}`).countDocuments({
    //     date: {
    //         $lte: new Date("2024-11-30T21:00:00.855Z"),
    //         $gte: new Date("2024-10-31T21:00:00.855Z"),
    //     },
    // })
    // console.log(test)
    const buggedUsers = await db.collection(`bucket_${BUGGED_REWARDS}`).find({
        date: {
            $lte: new Date("2024-11-30T21:00:00.855Z"),
            $gte: new Date("2024-10-31T21:00:00.855Z"),
        }
    }).toArray();
    // const buggedUsers = await Api.getMany(BUGGED_REWARD_BUCKET, {
    //     date: {
    //         $lte: new Date("2024-11-30T21:00:00.855Z"),
    //         $gte: new Date("2024-10-31T21:00:00.855Z"),
    //     }
    // })
    const insertData = buggedUsers.map(user => ({
        msisdn: user.msisdn,
        charge_date: user.date,
        error_id: user.error_id,
        retry_id: String(user._id),
        error_text: user.user_text,
        is_success: false


    }))
    await db.collection(`bucket_676bea91aeea88002c5ed6b7`).insertMany(insertData)
    // await Api.insertMany("676bdc8dc6f36b002c8ff5c4", insertData)
    return "ok"
}
export async function retrySystemReportOperations() {
    const db = await database();
    const retryData = [];
    // let skip_count = await Api.getOne(CONFIGURATION, { key: "skip_count" }).then(res => Number(res.value));
    // if (skip_count > 15630) return;
    // console.log("skip_count", skip_count)

    const monthlyRetries = await db.collection("bucket_676bea91aeea88002c5ed6b7").find({}).limit(100).toArray();
    monthlyRetries.forEach(retries => {
        retryData.push(updateRetryData(retries.msisdn, retries.retry_id, String(retries._id), retries.charge_date))
    })
    await Promise.all(retryData)
    // skip_count = skip_count + 10;
    // await Api.updateOne(CONFIGURATION, { key: "skip_count" }, { $set: { value: String(skip_count) } });
    return "ok"
}
async function updateRetryData(msisdn, retry_id, doc_id, charge_date) {
    const db = await database();

    const userRetryData = await db.collection(`bucket_${MANUALLY_REWARD}`).find({
        retry_id
    }).toArray();
    if (!userRetryData.length) {
        console.log(doc_id, retry_id)
        return;
    }
    // console.log(retry_id)
    // console.log("userRetryData", userRetryData)
    const diffInMilliseconds = Math.abs(new Date(`${userRetryData[userRetryData.length - 1].created_at}`) - new Date(charge_date));
    const diffInMinutes = Math.ceil(diffInMilliseconds / (1000 * 60));

    await db.collection("bucket_676bea91aeea88002c5ed6b7").updateOne({ _id: ObjectId(doc_id) }, {
        $set: {
            retry_count: userRetryData.length,
            retry_end_date: new Date(`${userRetryData[userRetryData.length - 1].created_at}`),
            is_success: userRetryData[userRetryData.length - 1].process_completed,
            process_time: diffInMinutes
        }
    })
    return;
    // await Api.updateOne("676bdc8dc6f36b002c8ff5c4", { _id: ObjectId(doc_id) }, {
    //     $set: {
    //         retry_count: userRetryData.length,
    //         retry_end_date: new Date(`${userRetryData[userRetryData.length - 1].created_at}`),
    //         is_success: userRetryData[userRetryData.length - 1].process_completed,
    //         process_time: diffInMinutes
    //     }
    // })

}