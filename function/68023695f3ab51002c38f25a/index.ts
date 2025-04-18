import * as Api from "../../66d865d0a8b3fe002c03c8c8/.build";
const SECRET_KEY = "406bus18l2yiufdq"
const COMMAND_URL = "https://turkcell-4islem-59d9b.hq.spicaengine.com/api/versioncontrol/commands/"
const headers = {
    Authorization: 'apikey ' + SECRET_KEY
}
export async function saveProgress() {

    const diffRes = await htppRequest("diff", { args: [] })
    if (diffRes?.data?.message === "") return "ok";

    const addRes = await htppRequest("add", { args: ["."] })
    if (addRes?.data?.message != "") return "ok";

    const commitRes = await htppRequest("commit", { args: ["-m", "\"Auto save progress\""] })
    if (!commitRes?.data?.commit) return;

    const pushRes = await htppRequest("push", { args: ["origin", "main"] })
    console.debug(`Commit: ${commitRes.data.commit} , Summary: ${JSON.stringify(commitRes.data.summary)} , Repo: ${pushRes?.data?.repo || "CHECK IT"}`)
    return "ok"
}

async function htppRequest(purpose, args) {
    return Api.httpRequest('post', COMMAND_URL + purpose,
        args, headers)
}
