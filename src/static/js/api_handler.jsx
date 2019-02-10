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
            "data": ""
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
        console.log("received jwt_token" + jwt_token);
        console.log('getting user data');

        return "my data"
    }
}

export { ApiHandler };