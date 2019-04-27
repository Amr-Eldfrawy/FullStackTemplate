// like a class
const ApiHandler = {
    async callSignin(username, password) {
        let response = await fetch('/login', {
            "crossDomain": true,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa(username + ":" + password),
                "cache-control": "no-cache",
            },
            "processData": false,
        })

        if (response.ok) {
            let data = await response.json();
            return {
                status: true,
                jwt_token: data['token']
            }
        }

        return {
            status: false,
            message: 'wrong credentials'
        }

    },
    async callGetCredentials(jwt_token) {
        let response = await fetch('/getCredentials', {
            "crossDomain": true,
            "method": "GET",
            "headers": {
                "x-access-token": jwt_token,
                "cache-control": "no-cache",
            }
        })

        let data = await response.json()

        return data;
    },
    async callAddCredential(jwt_token, email, password) {
        let response = await fetch('/addCredential', {
            "crossDomain": true,
            "method": "POST",
            "headers": {
                "x-access-token": jwt_token,
                "Content-Type": "application/json",
                "cache-control": "no-cache",
            },
            "processData": false,
            "body": JSON.stringify({ email: email, password: password })
        })
        let json = await response.json()

        if (response.ok) {
            return {
                status: true,
                credentials: json.data
            }
        }

        return {
            status: false,
            msg: json.msg
        }
    },
    async callDeleteCredentials(jwt_token, email) {
        let response = await fetch('/deleteCredential', {
            "crossDomain": true,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "x-access-token": jwt_token,
                "cache-control": "no-cache",
            },
            "processData": false,
            "body": JSON.stringify({ email: email })
        })
        let json = await response.json();

        if (response.ok) {
            return {
                status: true,
                credentials: json.data
            }
        }

        return {
            status: false,
            msg: json.msg
        }
    },
    async callEditCredential(jwt_token, old_email, new_email, password) {
        let response = await fetch('/editCredential', {
            "crossDomain": true,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "x-access-token": jwt_token,
                "cache-control": "no-cache",
            },
            "processData": false,
            "body": JSON.stringify({ old_email: old_email, new_email: new_email, password: password })
        })
        let json = await response.json();

        if (response.ok) {
            return {
                status: true,
                credentials: json.data
            }
        }

        return {
            status: false,
            msg: json.msg
        }
    },
    async callLogout(jwt_token) {
        let response = await fetch('/logout', {
            "crossDomain": true,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
                "x-access-token": jwt_token,
            }
        })

        return response.ok
    },
    async callRegister(username, password) {
        let response = await fetch('/register', {
            "crossDomain": true,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
            },
            "processData": false,
            "body": JSON.stringify({ name: username, password: password })
        })
        if (response.ok) {
            return { message: 'An account was created. please sign in' }

        }
        return { message: 'failed to register. either this username is already taken or not whitelisted' }
    }
}

export { ApiHandler };