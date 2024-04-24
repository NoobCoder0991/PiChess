const helper_functions = require("./helper_functions")

const db = require("../database/dbmethods")
const chess = require("./chess")

function handleSignUp(app) {

    app.post('/getotp', (req, res) => {
        const requestData = req.body;
        const email = requestData.email
        const username = requestData.username
        let emailSearch = db.findOne('users', { email: email });
        let usernameSearch = db.findOne('users', { username: username })
        if (emailSearch) {
            /**Email exits */
            res.send({ ok: false, message: "An account with this email already exists!" })
            return;
        }
        if (usernameSearch) {
            /**username exists */
            res.send({ ok: false, message: "Sorry! this username is already taken" })
            return;
        }
        let code = helper_functions.generateCode(6);
        console.log("Code", code)
        helper_functions.sendOTP(email, username, code)
            .then(data => {
                console.log("email sent")
                const authToken = helper_functions.generateToken(16);
                const authenticationToken = { token: authToken, startTime: new Date().getTime(), lifeTime: 300000, valid: true }
                app.get(`/signup/auth`, (req, res) => {
                    res.sendFile(
                        path.join(__dirname, "../public/src/HTML_Files/otpauth.html")
                    );
                })
                res.send({ message: "Email has been sent to your email id: " + requestData.email, ok: true, url: `${authToken}` });
                app.post('/auth', (req, res) => {
                    let requestData = req.body;
                    const providedToken = requestData.token;
                    const providedOTP = requestData.otp;
                    if (providedToken == authToken && providedOTP === code && authenticationToken.valid && (new Date().getTime() - authenticationToken.startTime <= authenticationToken.lifeTime)) {
                        const password = helper_functions.generateToken(8);
                        helper_functions.sendAccountDetails(email, username, password)
                            .then((data) => {
                                const users = db.findMany('users', {});
                                const userid = users.length + 1;
                                db.inserOne('users', { userid: userid, email: email, password: password, username: username })
                                let info = {
                                    username: username, email: email, rating: 300, total_games: 0, games_won: 0, games_lost: 0, games_won_as_white: 0, games_won_as_black: 0, games_draw: 0, games: [], title: ""
                                }
                                db.inserOne('game_info', { userid: userid, info: info });
                                res.send({ ok: true, username })
                            })
                            .catch(err => {
                                console.log("Error:", err)
                                res.send({ ok: false, errMessage: "Unknown Error: Error Authenticating Email!" })
                            })


                        authenticationToken.valid = false;
                    }
                    else {

                        if (providedToken != authToken || !authenticationToken.valid) {
                            res.send({ ok: false, errMessage: "Error 401:  Session Expired" })

                        }
                        else if (providedOTP != code) {

                            res.send({ ok: false, errMessage: "Error 403: Wrong OTP" })
                        }
                        else if (new Date().getTime() - authenticationToken.startTime > authenticationToken.lifeTime) {

                            res.send({ ok: false, errMessage: "OTP Expired" })
                        }
                        else {

                            res.send({ ok: false, errMessage: "Error 401:  Session Expired" })
                        }
                        authenticationToken.valid = false;
                    }
                })
            })
            .catch(err => {
                console.error("Error", err)
                res.send({ message: 'Internal server error or invalid Email:', ok: false })
            })

    });



    app.post('/authentication', (req, res) => {
        const requestData = req.body;

        let searchData = db.findOne('users', { email: requestData.email, password: requestData.password });
        if (searchData) {
            let sessionId = helper_functions.generateToken(16);
            req.session.sessionId = sessionId;
            saveUserInfo(requestData.email, sessionId);
            res.send({ ok: true, url: "/play" })
        }
        else {
            res.send({ ok: false })

        }
    })

    app.post('/fetch_info', (req, res) => {
        const sessionId = req.session.sessionId;
        const user = db.findOne('session_tokens', { token: { session_id: sessionId, expired: false } });
        if (user) {
            /**User existe */
            const userid = user.userid;
            const primaryInfo = db.findOne('users', { userid: userid })
            const username = primaryInfo.username, email = primaryInfo.email;
            const userInfo = db.findOne('game_info', { userid: userid }).info;
            userInfo.username = username;
            userInfo.email = email
            userInfo.userid = userid
            res.send({ ok: true, userInfo: userInfo })
        }
        else {
            res.send({ ok: false, errMessage: "Error fetching data from the server! Reload Browser" })
        }
    })
}


function saveUserInfo(email, sessionId) {
    let userData = db.findOne('users', { email: email });

    const obj = {
        "userid": userData.userid, "token": {
            "session_id": sessionId, "expired": false
        }
    }

    // 
    const sessionTokenArray = db.findMany('session_tokens', {});
    sessionTokenArray.push(obj)
    db.inserOne('session_tokens', obj)
}

module.exports = { handleSignUp }